# Paper → Commit Map

Maps git commits to their corresponding research papers.
Papers live at `~/Documents/AI_reports/Papers/` (versioned PDFs) and `docs/papers/` (stable markdown).

---

## HIPPOCAMPUS — Pre-Computed Concept Index for O(1) Memory Retrieval

**Paper:** `docs/papers/hippocampus.md`
**PDF:** `~/Documents/AI_reports/Papers/concept_index_HIPPOCAMPUS/`

| Commit      | Description                                                                     |
| ----------- | ------------------------------------------------------------------------------- |
| `b7e530d15` | [HIPPOCAMPUS] Implementation — 7 modules, 27/27 tests passing                   |
| `20316343e` | [HIPPOCAMPUS] Paper v1.0 — Pre-Computed Concept Index for O(1) Memory Retrieval |

---

## ENGRAM — Context Compaction

**Paper:** `docs/papers/engram.md` (if exists)
**PDF:** `~/Documents/AI_reports/Papers/context_compaction_ENGRAM/`

| Commit      | Description                                                                               |
| ----------- | ----------------------------------------------------------------------------------------- |
| `6b93ad9ea` | feat: Phase 8 — unified cognitive architecture integration (ENGRAM+CORTEX+LIMBIC+SYNAPSE) |
| `242b1485e` | feat: update all skills, add cognitive memory CLI (mem.py), token-panel, chatgpt-exporter |

---

## CORTEX — Persistent Agent Identity

**Paper:** `docs/papers/cortex.md` (if exists)
**PDF:** `~/Documents/AI_reports/Papers/agent_memory_CORTEX/`

| Commit      | Description                                                                               |
| ----------- | ----------------------------------------------------------------------------------------- |
| `6b93ad9ea` | feat: Phase 8 — unified cognitive architecture integration (ENGRAM+CORTEX+LIMBIC+SYNAPSE) |

---

## LIMBIC — Humor in Embedding Space

**Paper:** `docs/papers/limbic.md` (if exists)
**PDF:** `~/Documents/AI_reports/Papers/humor_embeddings_LIMBIC/`

| Commit      | Description                                                                               |
| ----------- | ----------------------------------------------------------------------------------------- |
| `6b93ad9ea` | feat: Phase 8 — unified cognitive architecture integration (ENGRAM+CORTEX+LIMBIC+SYNAPSE) |

---

## SYNAPSE — Multi-Model Debate

**Paper:** `docs/papers/synapse.md` (if exists)
**PDF:** `~/Documents/AI_reports/Papers/multi_model_debate_SYNAPSE/`

| Commit      | Description                                                                               |
| ----------- | ----------------------------------------------------------------------------------------- |
| `6b93ad9ea` | feat: Phase 8 — unified cognitive architecture integration (ENGRAM+CORTEX+LIMBIC+SYNAPSE) |

---

## TRACE — Event Store with Temporal Retrieval

**Paper:** (not yet published as standalone)

| Commit      | Description                                                    |
| ----------- | -------------------------------------------------------------- |
| `547622ed5` | feat(trace): add index module with clean exports               |
| `4d168e1e4` | feat(trace): Phase 3 — per-turn retrieval from event store     |
| `b216e300a` | feat(trace): Phase 2 — pointer manifests for compacted events  |
| `967d763f4` | feat(trace): Phase 1 — Task State extraction during compaction |
| `18c8f081a` | feat(trace): Phase 0 — event store with FTS5 indexing          |

---

## Memory Bench — Benchmark Suite

**Paper:** (contributes to ENGRAM/CORTEX evaluation)

| Commit      | Description                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `1427fa0ac` | chore(memory-bench): rename to memory-bench-pioneer for ClawHub publish                         |
| `a2d2be108` | test(memory-bench): add unit tests for IR metrics, bootstrap CI, and test set validation        |
| `47ecef576` | feat(memory-bench): inter-rater reliability, input validation, longitudinal tracking, schema v2 |
| `6a4d6fe39` | feat(memory-bench): LLM-as-judge, ablation, nDCG/MAP/CI, standard test set                      |
| `95f48669c` | feat: add memory-bench skill for anonymized benchmark collection and PR submission              |

---

## OpenClaw Integration (cross-paper)

| Commit      | Description                              | Papers                          |
| ----------- | ---------------------------------------- | ------------------------------- |
| `6b93ad9ea` | Phase 8 — unified cognitive architecture | ENGRAM, CORTEX, LIMBIC, SYNAPSE |

---

_Convention: New commits should use `[PAPER_NAME]` prefix (e.g., `[HIPPOCAMPUS] fix: ...`) to make this mapping automatic._
_Updated: 2026-02-19_
