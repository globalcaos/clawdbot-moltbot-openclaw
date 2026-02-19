"""HIPPOCAMPUS Anchor Extraction — Extract concept vocabulary from corpus."""

import re
from collections import Counter
from pathlib import Path
from .config import MIN_ANCHOR_DF, MAX_ANCHORS, ANCHOR_DENYLIST, WORKSPACE
from .chunker import Chunk


# Common English stopwords (not exhaustive, just the most common)
STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "can", "this", "that", "these",
    "those", "it", "its", "not", "no", "if", "then", "than", "when",
    "while", "as", "so", "very", "just", "also", "about", "into", "over",
    "after", "before", "between", "through", "during", "each", "all",
    "both", "few", "more", "most", "other", "some", "such", "only",
    "same", "than", "too", "any", "up", "out", "new", "now", "way",
    "we", "our", "you", "your", "they", "them", "he", "she", "his",
    "her", "my", "me", "us", "i", "what", "which", "who", "how",
    "where", "there", "here", "one", "two", "many", "much", "well",
}


def extract_anchors_from_text(text: str) -> list[str]:
    """Extract anchor terms from a single text.
    
    Sources:
    - **bold terms** (multi-word, highest quality)
    - ## headers (multi-word)
    - ALLCAPS words (acronyms like HIPPOCAMPUS, CORF, ENGRAM)
    """
    anchors = set()
    
    # 1. Bold terms: **term** (max 60 chars to avoid email subjects)
    for match in re.finditer(r'\*\*([^*]+)\*\*', text):
        term = match.group(1).strip()
        if 2 < len(term) <= 60 and term.lower() not in STOPWORDS:
            anchors.add(term.lower())
    
    # 2. Headers: ## Title or ### Title (max 60 chars)
    for match in re.finditer(r'^#{1,3}\s+(.+)$', text, re.MULTILINE):
        heading = match.group(1).strip()
        # Clean markdown artifacts
        heading = re.sub(r'[*_`#]', '', heading).strip()
        if 2 < len(heading) <= 60 and heading.lower() not in STOPWORDS:
            anchors.add(heading.lower())
    
    # 3. ALLCAPS words (acronyms, 3+ chars)
    for match in re.finditer(r'\b([A-Z]{3,})\b', text):
        term = match.group(1)
        if term.lower() not in STOPWORDS:
            anchors.add(term.lower())
    
    return list(anchors)


def extract_anchors_from_chunks(chunks: list[Chunk]) -> list[str]:
    """Extract anchor vocabulary from a corpus of chunks.
    
    Strategy:
    1. Collect per-text anchors (bold, headers, acronyms)
    2. Add high-TF-IDF single words (document frequency >= MIN_ANCHOR_DF)
    3. Filter by denylist
    4. Cap at MAX_ANCHORS
    """
    # Per-text extraction
    all_anchors = set()
    for chunk in chunks:
        all_anchors.update(extract_anchors_from_text(chunk.text))
    
    # High-frequency meaningful words across chunks
    word_doc_freq = Counter()
    for chunk in chunks:
        words = set(re.findall(r'\b[a-z]{4,}\b', chunk.text.lower()))
        words -= STOPWORDS
        word_doc_freq.update(words)
    
    # Add words that appear in multiple documents
    for word, freq in word_doc_freq.items():
        if freq >= MIN_ANCHOR_DF and word not in STOPWORDS:
            all_anchors.add(word)
    
    # Also extract entity names from bank/entities/ filenames
    entities_dir = WORKSPACE / "bank" / "entities"
    if entities_dir.exists():
        for f in entities_dir.glob("*.md"):
            name = f.stem.replace("_", " ").replace("-", " ").lower()
            if len(name) > 2:
                all_anchors.add(name)
    
    # Filter denylist
    all_anchors -= {a.lower() for a in ANCHOR_DENYLIST}
    
    # Cap at MAX_ANCHORS (prefer multi-word anchors, then by length)
    anchors = sorted(all_anchors, key=lambda a: (-(' ' in a), -len(a)))
    return anchors[:MAX_ANCHORS]
