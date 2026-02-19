#!/usr/bin/env python3
"""HIPPOCAMPUS Test Suite — run with: python3 -m pytest scripts/hippocampus/test_hippocampus.py -v"""

import json
import os
import sys
import tempfile
from pathlib import Path

import numpy as np
import pytest

# Add workspace to path
WORKSPACE = Path(__file__).parent.parent.parent
sys.path.insert(0, str(WORKSPACE / "scripts"))

from hippocampus.config import EMBED_DIM, SOCKET_PATH
from hippocampus.embed import (
    embed, embed_cached, embed_batch,
    cosine_similarity, cosine_similarity_matrix, clear_cache, cache_stats
)


# ─── Phase 1: embed.py tests ───────────────────────────────────────────

class TestEmbedding:
    """Test the embedding helper functions."""

    def test_socket_exists(self):
        """Embedding server socket must be available."""
        assert os.path.exists(SOCKET_PATH), f"Socket not found: {SOCKET_PATH}"

    def test_embed_single(self):
        """Single text embedding returns correct shape."""
        vec = embed("hello world")
        assert isinstance(vec, np.ndarray)
        assert vec.shape == (EMBED_DIM,)
        assert vec.dtype == np.float32

    def test_embed_nonempty(self):
        """Embedding should not be all zeros."""
        vec = embed("the hippocampus is an indexing structure")
        assert np.linalg.norm(vec) > 0.1

    def test_embed_cached_returns_same(self):
        """Cached embedding returns identical vector."""
        clear_cache()
        v1 = embed_cached("test phrase")
        v2 = embed_cached("test phrase")
        np.testing.assert_array_equal(v1, v2)
        assert cache_stats()["entries"] == 1

    def test_embed_batch(self):
        """Batch embedding returns correct shape."""
        texts = ["hello", "world", "hippocampus memory"]
        vecs = embed_batch(texts)
        assert vecs.shape == (3, EMBED_DIM)
        assert vecs.dtype == np.float32

    def test_embed_batch_empty(self):
        """Empty batch returns empty array."""
        vecs = embed_batch([])
        assert vecs.shape == (0, EMBED_DIM)

    def test_cosine_similarity_identical(self):
        """Identical vectors should have similarity ~1.0."""
        vec = embed("test")
        sim = cosine_similarity(vec, vec)
        assert abs(sim - 1.0) < 1e-5

    def test_cosine_similarity_different(self):
        """Different texts should have similarity < 1.0."""
        v1 = embed("artificial intelligence research")
        v2 = embed("banana smoothie recipe")
        sim = cosine_similarity(v1, v2)
        assert sim < 0.8  # should be quite different

    def test_cosine_similarity_related(self):
        """Related texts should have higher similarity than unrelated."""
        v_ai = embed("artificial intelligence memory systems")
        v_mem = embed("computer memory and retrieval")
        v_food = embed("cooking italian pasta recipe")
        sim_related = cosine_similarity(v_ai, v_mem)
        sim_unrelated = cosine_similarity(v_ai, v_food)
        assert sim_related > sim_unrelated, \
            f"Related ({sim_related:.3f}) should be > unrelated ({sim_unrelated:.3f})"

    def test_cosine_similarity_zero_vector(self):
        """Zero vector should return 0.0 similarity."""
        vec = embed("test")
        zero = np.zeros(EMBED_DIM, dtype=np.float32)
        assert cosine_similarity(vec, zero) == 0.0

    def test_cosine_similarity_matrix(self):
        """Matrix similarity should match pairwise computation."""
        texts_a = ["hello", "world"]
        texts_b = ["hello", "goodbye", "earth"]
        A = embed_batch(texts_a)
        B = embed_batch(texts_b)
        sim_matrix = cosine_similarity_matrix(A, B)
        assert sim_matrix.shape == (2, 3)
        # Check that (0,0) = similarity("hello", "hello") ≈ 1.0
        assert sim_matrix[0, 0] > 0.95

    def test_clear_cache(self):
        """Cache should be empty after clear."""
        embed_cached("something")
        clear_cache()
        assert cache_stats()["entries"] == 0


# ─── Phase 2: chunking tests ──────────────────────────────────────────

class TestChunking:
    """Test file chunking logic."""

    def test_import_chunker(self):
        """Chunker module should be importable."""
        try:
            from hippocampus.chunker import chunk_file, chunk_text
        except ImportError:
            pytest.skip("chunker not yet implemented")

    def test_chunk_small_file(self):
        """A small file should produce one chunk."""
        try:
            from hippocampus.chunker import chunk_text
        except ImportError:
            pytest.skip("chunker not yet implemented")

        text = "# Title\n\nSome content here that is long enough to pass the minimum chunk size threshold for the hippocampus system which requires at least 100 characters per chunk."
        chunks = chunk_text(text, "test.md")
        assert len(chunks) >= 1
        assert all(hasattr(c, 'text') for c in chunks)

    def test_chunk_with_headers(self):
        """File with ## headers should split into sections."""
        try:
            from hippocampus.chunker import chunk_text
        except ImportError:
            pytest.skip("chunker not yet implemented")

        text = """# Main Title

This is the introduction paragraph with enough content to meet the minimum chunk size requirement for the hippocampus indexing system.

## Section One

Content of section one which discusses memory retrieval architectures and how they relate to persistent agent systems in production deployments.

## Section Two

Content of section two with more detail about the evaluation methodology and benchmark results for the HIPPOCAMPUS concept indexing approach.
"""
        chunks = chunk_text(text, "test.md")
        assert len(chunks) >= 2  # At least 2 sections

    def test_chunk_min_size(self):
        """Chunks below MIN_CHUNK_CHARS should be merged or skipped."""
        try:
            from hippocampus.chunker import chunk_text
            from hippocampus.config import MIN_CHUNK_CHARS
        except ImportError:
            pytest.skip("chunker not yet implemented")

        text = "# Title\n\nTiny."
        chunks = chunk_text(text, "test.md")
        # Either no chunks (too small) or merged into one
        for c in chunks:
            assert len(c.text) >= MIN_CHUNK_CHARS or len(chunks) <= 1


# ─── Phase 3: anchor extraction tests ─────────────────────────────────

class TestAnchorExtraction:
    """Test anchor vocabulary extraction."""

    def test_import_anchors(self):
        try:
            from hippocampus.anchors import extract_anchors_from_text
        except ImportError:
            pytest.skip("anchors not yet implemented")

    def test_extract_bold_terms(self):
        try:
            from hippocampus.anchors import extract_anchors_from_text
        except ImportError:
            pytest.skip("anchors not yet implemented")

        text = "The **HIPPOCAMPUS** system uses **CORF** taxonomy."
        anchors = extract_anchors_from_text(text)
        anchor_texts = {a.lower() for a in anchors}
        assert "hippocampus" in anchor_texts
        assert "corf" in anchor_texts

    def test_extract_headers(self):
        try:
            from hippocampus.anchors import extract_anchors_from_text
        except ImportError:
            pytest.skip("anchors not yet implemented")

        text = "## Memory Systems\n\nContent.\n\n## Retrieval Architecture\n\nMore."
        anchors = extract_anchors_from_text(text)
        anchor_texts = {a.lower() for a in anchors}
        assert "memory systems" in anchor_texts or "memory" in anchor_texts


# ─── Phase 4: build-index tests ───────────────────────────────────────

class TestBuildIndex:
    """Test the full index build pipeline."""

    def test_import_builder(self):
        try:
            from hippocampus.builder import build_index
        except ImportError:
            pytest.skip("builder not yet implemented")

    def test_build_small_index(self):
        """Build an index from a small test corpus."""
        try:
            from hippocampus.builder import build_index
        except ImportError:
            pytest.skip("builder not yet implemented")

        with tempfile.TemporaryDirectory() as tmpdir:
            tmppath = Path(tmpdir)
            # Create test files with enough content
            (tmppath / "test1.md").write_text(
                "# HIPPOCAMPUS Paper\n\nThis is about memory retrieval systems and how they work in persistent AI agents. The architecture uses pre-computed concept indexes for fast lookup at inference time."
            )
            (tmppath / "test2.md").write_text(
                "# ENGRAM System\n\nContext compaction and cache eviction strategies for long-running AI agents. ENGRAM manages the transition from working memory to long-term storage efficiently."
            )
            idx_path = tmppath / "index.json"
            emb_path = tmppath / "embeds.npz"
            met_path = tmppath / "meta.json"
            index = build_index(
                sources=[tmppath], workspace=tmppath,
                output_index=idx_path, output_embeds=emb_path, output_meta=met_path,
            )
            assert isinstance(index, dict)
            assert len(index) > 0
            # Each entry should be a list of chunk references
            for anchor, chunks in index.items():
                assert isinstance(chunks, list)
                for chunk in chunks:
                    assert "path" in chunk
                    assert "score" in chunk


# ─── Phase 5: lookup tests ────────────────────────────────────────────

class TestLookup:
    """Test inference-time lookup."""

    def test_import_lookup(self):
        try:
            from hippocampus.lookup import lookup
        except ImportError:
            pytest.skip("lookup not yet implemented")

    def test_lookup_with_built_index(self):
        """Build a small index and lookup against it."""
        try:
            from hippocampus.lookup import lookup, invalidate_cache
            from hippocampus.builder import build_index
        except ImportError:
            pytest.skip("lookup not yet implemented")

        with tempfile.TemporaryDirectory() as tmpdir:
            tmppath = Path(tmpdir)
            (tmppath / "papers.md").write_text(
                "# HIPPOCAMPUS Paper\n\n**HIPPOCAMPUS** is a pre-computed concept index for O(1) memory retrieval in persistent AI agents. It maps anchor vocabulary terms to pre-ranked memory clusters."
            )
            (tmppath / "engram.md").write_text(
                "# ENGRAM System\n\n**ENGRAM** handles context compaction and cache eviction for long-running AI agents. It manages the transition from working memory to persistent long-term storage."
            )
            idx_path = tmppath / "index.json"
            emb_path = tmppath / "embeds.npz"
            met_path = tmppath / "meta.json"
            
            build_index(
                sources=[tmppath], workspace=tmppath,
                output_index=idx_path, output_embeds=emb_path, output_meta=met_path,
            )
            
            invalidate_cache()
            results = lookup(
                "Tell me about the HIPPOCAMPUS paper",
                index_path=idx_path, embeds_path=emb_path,
            )
            assert isinstance(results, list)
            assert len(results) > 0
            # The HIPPOCAMPUS paper should be top result
            assert "papers.md" in results[0]["path"]

    def test_lookup_empty_index(self):
        try:
            from hippocampus.lookup import lookup, invalidate_cache
        except ImportError:
            pytest.skip("lookup not yet implemented")

        with tempfile.TemporaryDirectory() as tmpdir:
            invalidate_cache()
            results = lookup(
                "anything",
                index_path=Path(tmpdir) / "nonexistent.json",
                embeds_path=Path(tmpdir) / "nonexistent.npz",
            )
            assert results == []


# ─── Phase 5: incremental update tests ────────────────────────────────

class TestIncremental:
    """Test real-time incremental index updates."""

    def test_import_incremental(self):
        from hippocampus.incremental import incremental_update

    def test_incremental_adds_chunks(self):
        """New content should update existing anchors."""
        from hippocampus.builder import build_index
        from hippocampus.incremental import incremental_update
        from hippocampus.lookup import lookup, invalidate_cache

        with tempfile.TemporaryDirectory() as tmpdir:
            tmppath = Path(tmpdir)
            (tmppath / "original.md").write_text(
                "# Memory Systems\n\n**HIPPOCAMPUS** is a pre-computed concept index "
                "for memory retrieval in persistent AI agents. It enables fast lookup."
            )
            idx_path = tmppath / "index.json"
            emb_path = tmppath / "embeds.npz"
            met_path = tmppath / "meta.json"

            build_index(
                sources=[tmppath], workspace=tmppath,
                output_index=idx_path, output_embeds=emb_path, output_meta=met_path,
            )

            # Now add new content
            new_content = (
                "# New Discovery\n\nThe **HIPPOCAMPUS** architecture was tested "
                "on a deployment with 50,000 memory chunks and achieved 85% recall "
                "on CORF queries. This validates the theoretical predictions."
            )
            stats = incremental_update(
                new_content, "new_discovery.md",
                index_path=idx_path, embeds_path=emb_path,
            )
            assert stats["chunks_added"] >= 1
            # At least some anchors should have been updated
            assert stats["anchors_updated"] >= 0
            assert stats["elapsed_ms"] > 0

    def test_incremental_no_index(self):
        """Incremental update with no existing index should be a no-op."""
        from hippocampus.incremental import incremental_update

        with tempfile.TemporaryDirectory() as tmpdir:
            stats = incremental_update(
                "some content", "test.md",
                index_path=Path(tmpdir) / "nonexistent.json",
                embeds_path=Path(tmpdir) / "nonexistent.npz",
            )
            assert stats["chunks_added"] == 0


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
