"""HIPPOCAMPUS Chunker — Split markdown files into indexed chunks."""

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional
from .config import MIN_CHUNK_CHARS, MAX_CHUNK_CHARS, WORKSPACE, SKIP_DIRS, SKIP_FILES


@dataclass
class Chunk:
    """A chunk of text from a memory file."""
    text: str
    path: str           # Relative path from workspace
    start_line: int     # 1-indexed line number
    source: str         # Source directory (e.g., "memory", "bank")
    heading: str = ""   # Section heading if any


def chunk_file(file_path: Path, workspace: Path = WORKSPACE) -> list[Chunk]:
    """Split a markdown file into chunks by ## headers.
    
    Strategy:
    - Split on ## headers (each section = one chunk)
    - If section > MAX_CHUNK_CHARS, split at paragraph boundaries
    - Chunks below MIN_CHUNK_CHARS are merged with the next section
    - Each chunk carries: path, start_line, source, text, heading
    """
    try:
        content = file_path.read_text(encoding="utf-8", errors="replace")
    except (OSError, UnicodeDecodeError):
        return []
    
    rel_path = str(file_path.relative_to(workspace))
    source = rel_path.split("/")[0]  # "memory", "bank", "docs", etc.
    
    return chunk_text(content, rel_path, source)


def chunk_text(content: str, rel_path: str = "unknown", source: str = "unknown") -> list[Chunk]:
    """Split markdown text into chunks."""
    lines = content.split("\n")
    sections = []
    current_heading = ""
    current_lines = []
    current_start = 1
    
    for i, line in enumerate(lines, 1):
        # Split on ## headers (level 2+)
        if re.match(r'^#{1,3}\s+', line) and current_lines:
            text = "\n".join(current_lines).strip()
            if text:
                sections.append(Chunk(
                    text=text,
                    path=rel_path,
                    start_line=current_start,
                    source=source,
                    heading=current_heading,
                ))
            current_heading = line.lstrip("#").strip()
            current_lines = [line]
            current_start = i
        else:
            if not current_lines and not line.strip():
                continue  # Skip leading empty lines
            current_lines.append(line)
            if not current_heading and re.match(r'^#{1,3}\s+', line):
                current_heading = line.lstrip("#").strip()
    
    # Don't forget the last section
    text = "\n".join(current_lines).strip()
    if text:
        sections.append(Chunk(
            text=text,
            path=rel_path,
            start_line=current_start,
            source=source,
            heading=current_heading,
        ))
    
    # Post-process: merge small chunks, split large ones
    result = []
    for chunk in sections:
        if len(chunk.text) < MIN_CHUNK_CHARS:
            # Merge with previous if exists, otherwise keep
            if result:
                result[-1] = Chunk(
                    text=result[-1].text + "\n\n" + chunk.text,
                    path=result[-1].path,
                    start_line=result[-1].start_line,
                    source=result[-1].source,
                    heading=result[-1].heading,
                )
            else:
                result.append(chunk)
        elif len(chunk.text) > MAX_CHUNK_CHARS:
            # Split at paragraph boundaries
            result.extend(_split_large_chunk(chunk))
        else:
            result.append(chunk)
    
    # Final filter: remove chunks that are still too small (after all merging)
    return [c for c in result if len(c.text) >= MIN_CHUNK_CHARS]


def _split_large_chunk(chunk: Chunk) -> list[Chunk]:
    """Split a large chunk at paragraph boundaries."""
    paragraphs = re.split(r'\n\n+', chunk.text)
    result = []
    current_text = ""
    current_start = chunk.start_line
    
    for para in paragraphs:
        if len(current_text) + len(para) > MAX_CHUNK_CHARS and current_text:
            result.append(Chunk(
                text=current_text.strip(),
                path=chunk.path,
                start_line=current_start,
                source=chunk.source,
                heading=chunk.heading,
            ))
            current_text = para
            current_start = chunk.start_line + chunk.text[:chunk.text.find(para)].count("\n")
        else:
            current_text = current_text + "\n\n" + para if current_text else para
    
    if current_text.strip():
        result.append(Chunk(
            text=current_text.strip(),
            path=chunk.path,
            start_line=current_start,
            source=chunk.source,
            heading=chunk.heading,
        ))
    
    return result


def discover_files(sources: list[Path], skip_dirs: set = SKIP_DIRS, 
                   skip_files: set = SKIP_FILES) -> list[Path]:
    """Discover all .md files in the given source directories."""
    files = []
    for source_dir in sources:
        if not source_dir.exists():
            continue
        for f in sorted(source_dir.rglob("*.md")):
            # Skip excluded directories
            if any(skip in f.parts for skip in skip_dirs):
                continue
            # Skip excluded files
            if f.name in skip_files:
                continue
            # Skip very large files (>500KB)
            if f.stat().st_size > 500_000:
                continue
            files.append(f)
    return files
