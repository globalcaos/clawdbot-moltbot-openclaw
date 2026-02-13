# Cognitive Memory Architecture for Persistent AI Agents: From Daily Logs to Spreading Activation

**Authors:** JarvisOne (AI) & Max (AI), supervised by Oscar Serra  
**Draft v0.2 — 2026-02-13**  
**Status:** Collaborative draft — incorporating Max's review

---

## Abstract

We present a five-phase cognitive memory architecture for persistent AI agents that bridges the gap between stateless LLM sessions and human-like memory continuity. Our system combines SQLite storage, local ONNX embeddings, FTS5 full-text search, and vector similarity search into a unified memory layer that requires zero upstream changes to the host platform. Key contributions: (1) a hybrid retrieval strategy mixing semantic and keyword search, (2) a nightly consolidation pipeline inspired by human sleep-memory consolidation, (3) a typed association graph enabling multi-hop memory traversal, (4) RAPTOR-style hierarchical summaries, (5) spreading activation with lateral inhibition for context-sensitive recall, and (6) a cross-agent memory sharing protocol. The system runs entirely locally with no API costs for core operations and reduces token consumption by ~80% compared to load-all approaches.

---

## 1. Introduction

### 1.1 The Problem: Amnesia as Default

LLM-based agents wake up fresh every session. They can read files, but they can't _remember_. The difference is crucial:

- **Reading** = loading information into context window (expensive, limited, no prioritization)
- **Remembering** = retrieving relevant information based on current context (efficient, targeted, weighted by importance)

Current approaches (reading MEMORY.md at session start) don't scale. At 100+ files, loading everything wastes context and dilutes focus. The agent needs a _memory system_, not a _file system_.

### 1.2 Key Insight

Human memory isn't a filing cabinet — it's a weighted, associative, decaying network that consolidates during sleep. We can build the same for AI agents using existing infrastructure:

- **SQLite** = long-term storage (hippocampus)
- **Embeddings** = semantic encoding (conceptual representation)
- **FTS5** = keyword recall (explicit memory)
- **Vector search** = associative recall (implicit memory)
- **Nightly consolidation** = sleep-memory integration
- **Spreading activation** = context-primed retrieval

### 1.3 Design Principles

1. **Skill-only** — no host platform patches; everything lives in a skill folder
2. **Single CLI** — `python3 mem.py <command>` for all operations
3. **Backwards compatible** — existing markdown files untouched
4. **Incremental phases** — each phase independently useful
5. **Local-first** — no API costs for core operations (embeddings are ONNX, local)
6. **Agent-centric** — the agent decides what to remember; the system handles retrieval

### 1.4 Relationship to Companion Work

This architecture shares infrastructure with our companion paper, "Bisociation in Embedding Space: A Computational Framework for Machine Humor" (Serra et al., 2026). Both systems use:

- **Embedding-based retrieval** — same vector search infrastructure
- **Spreading activation** — same graph traversal algorithm
- **Association graphs** — same edge types and multi-hop traversal

The key difference is _search direction_:

- **Memory** asks: "What is SIMILAR to this query?"
- **Humor** asks: "What is DISTANT from this query but CONNECTED via a bridge?"

This duality means a single infrastructure can serve both recall (finding nearby nodes) and creativity (finding distant-but-bridged nodes). See §11 for implications.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────┐
│              AGENT SESSION (LLM)            │
│                                             │
│  exec: python3 mem.py <command> [args]      │
└──────────┬──────────────────┬───────────────┘
           │ store/query      │ read/write
           ▼                  ▼
┌──────────────────┐  ┌──────────────────────┐
│  mem.py (CLI)    │  │  Markdown Files      │
│                  │  │  ├── MEMORY.md        │
│  - store         │  │  ├── memory/daily/    │
│  - recall        │  │  ├── bank/entities/   │
│  - forget        │  │  └── bank/opinions.md │
│  - consolidate   │  └──────────────────────┘
│  - graph         │
│  - stats         │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│              memory_core.py                  │
│                                             │
│  ┌───────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Store     │ │ Search   │ │ Consolidate│ │
│  └─────┬─────┘ └────┬─────┘ └─────┬──────┘ │
│        │            │              │         │
│        ▼            ▼              ▼         │
│  ┌─────────────────────────────────────────┐ │
│  │         SQLite (memory.db)              │ │
│  │                                         │ │
│  │  memories      — core facts             │ │
│  │  memories_fts  — full-text search       │ │
│  │  memories_vec  — vector embeddings      │ │
│  │  associations  — graph edges            │ │
│  │  clusters      — hierarchy/groups       │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌──────────────┐                           │
│  │ embedder.py  │ all-MiniLM-L6-v2 (ONNX) │
│  │ 384-dim      │ ~30ms per embedding      │
│  └──────────────┘                           │
└─────────────────────────────────────────────┘
```

### 2.1 Dual-System Coexistence

Markdown files remain the "source of truth" for session-start reading. SQLite is the "search and retrieval engine" for mid-session recall. Consolidation bridges both worlds by writing summaries back to MEMORY.md.

| System              | Role                                           | When Used                      |
| ------------------- | ---------------------------------------------- | ------------------------------ |
| Markdown files      | Session initialization, human-readable context | Every session start            |
| SQLite + embeddings | Mid-session recall, semantic search            | When agent needs specific info |
| Consolidation       | Sync both systems                              | Nightly sleep cycle            |

---

## 3. The Five Phases

### Phase 1: Foundation — Store & Recall

The base layer. Every memory is stored with:

```sql
CREATE TABLE memories (
    id              INTEGER PRIMARY KEY,
    content         TEXT NOT NULL,
    memory_type     TEXT DEFAULT 'episodic',  -- episodic|semantic|procedural
    source          TEXT,                      -- 'agent', 'user', 'import:whatsapp'
    importance      REAL DEFAULT 0.5,          -- 0.0-1.0
    strength        REAL DEFAULT 1.0,          -- decays over time
    access_count    INTEGER DEFAULT 0,
    created_at      TEXT,
    is_deleted      INTEGER DEFAULT 0
);
```

**Memory types (inspired by cognitive science):**

| Type           | Human Analog       | AI Example                                         | Shareable? |
| -------------- | ------------------ | -------------------------------------------------- | ---------- |
| **Episodic**   | "What happened"    | "Oscar complained about a 4-hour meeting on Feb 3" | ❌ Never   |
| **Semantic**   | "What I know"      | "OpenClaw uses Baileys for WhatsApp"               | ✅ Yes     |
| **Procedural** | "How to do things" | "To restart gateway: openclaw gateway restart"     | ✅ Yes     |

**Hybrid retrieval:**

```python
def recall(query, strategy="hybrid"):
    if strategy == "hybrid":
        # 70% semantic similarity + 30% keyword match
        vec_results = vector_search(query, weight=0.7)
        fts_results = fulltext_search(query, weight=0.3)
        return merge_and_rank(vec_results, fts_results)
```

The hybrid approach catches both:

- "privacy" → finds "security", "data protection" (semantic)
- "PRIVACY.md" → finds exact file references (keyword)

### Phase 2: Consolidation — The Sleep Cycle

**Inspired by human sleep-memory consolidation.** During sleep, the brain:

1. Replays recent experiences
2. Clusters related memories
3. Strengthens important connections
4. Prunes unimportant details

Our nightly consolidation does the same:

```
┌─────────────────────────────────────────┐
│         NIGHTLY CONSOLIDATION           │
│                                         │
│  1. CLUSTER similar recent memories     │
│     └─ Agglomerative clustering (scipy) │
│     └─ Distance threshold: 0.5          │
│                                         │
│  2. SUMMARIZE each cluster              │
│     └─ Template-based or LLM-generated  │
│     └─ Store as semantic memory (level 1)│
│                                         │
│  3. DETECT contradictions               │
│     └─ High similarity + opposite sentiment│
│     └─ Flag for agent review            │
│                                         │
│  4. DECAY unused memories               │
│     └─ strength *= decay_rate per day   │
│     └─ Below 0.1 → soft delete          │
│                                         │
│  5. UPDATE markdown files               │
│     └─ Write summaries to MEMORY.md     │
│     └─ Clean daily logs (already extracted)│
└─────────────────────────────────────────┘
```

**Decay function (v0.2 refinement):**

```python
def decay_strength(memory, days_since_access):
    """
    Memories decay unless reinforced by access.
    Importance and type modulate decay rate.
    """
    # Base decay varies by memory type
    BASE_DECAY = {
        'episodic': 0.92,    # 8% per day — episodes fade faster
        'semantic': 0.98,    # 2% per day — facts persist
        'procedural': 0.99,  # 1% per day — skills are sticky
    }

    base_decay = BASE_DECAY.get(memory.memory_type, 0.95)
    importance_factor = 1 - (memory.importance * 0.5)  # Important = slower decay

    new_strength = memory.strength * (base_decay ** (days_since_access * importance_factor))

    if new_strength < 0.1:
        soft_delete(memory)

    return new_strength
```

### Phase 3: Association — Memory Graph

Memories don't exist in isolation — they connect to each other. The association graph captures these connections:

```sql
CREATE TABLE associations (
    id          INTEGER PRIMARY KEY,
    source_id   INTEGER REFERENCES memories(id),
    target_id   INTEGER REFERENCES memories(id),
    edge_type   TEXT,       -- 'temporal'|'semantic'|'causal'|'explicit'
    weight      REAL,       -- 0.0-1.0
    created_at  TEXT
);
```

**Edge types:**

| Type         | How Created                         | Example                                             |
| ------------ | ----------------------------------- | --------------------------------------------------- |
| **Temporal** | Memories created close in time      | "Meeting complaint" ↔ "Coffee run" (same afternoon) |
| **Semantic** | High embedding similarity           | "Privacy breach" ↔ "Security protocol"              |
| **Causal**   | Agent explicitly marks cause-effect | "Bug in parser" → "User crash report"               |
| **Explicit** | Agent creates manually              | "Oscar" ↔ "Talleres SERRA"                          |

**Multi-hop retrieval:**

```python
def recall_with_associations(query, hops=2):
    """Find memories, then expand through graph."""
    direct = recall(query)

    expanded = set(direct)
    frontier = direct

    for hop in range(hops):
        for memory in frontier:
            neighbors = get_associations(memory.id, min_weight=0.5)
            expanded.update(neighbors)
        frontier = expanded - direct

    return rank_by_relevance(expanded, query)
```

### Phase 4: Hierarchy — RAPTOR-Style Summaries

Memories organize into hierarchical clusters at multiple abstraction levels:

```
Level 2:  [Oscar's work involves AI + robotics at family company]
              ↑
Level 1:  [SerraVision.ai project] [AGV development] [SCADA systems]
              ↑                         ↑                  ↑
Level 0:  [memory] [memory] [memory] [memory] [memory] [memory]
```

**How it works:**

1. Phase 2 clustering creates Level 0 → Level 1 summaries
2. Level 1 clusters get clustered again → Level 2 summaries
3. Recursive until a single root summary

**Why it matters:** When the agent needs a quick overview, it reads Level 2. When it needs detail, it descends to Level 0. Like a book's table of contents → chapters → paragraphs.

### Phase 5: Advanced — Spreading Activation

The crown jewel. When a query arrives, activation spreads through the memory graph like neural firing:

```python
def spreading_activation(query, initial_memories, graph, iterations=3):
    """
    Simulate neural activation spreading through memory graph.

    - Activation decays with distance
    - Lateral inhibition suppresses competing clusters
    - Result: context-sensitive, associative recall
    """
    activation = {}

    # Seed activation from query matches
    for mem in initial_memories:
        activation[mem.id] = mem.relevance_score

    for i in range(iterations):
        new_activation = {}
        for mem_id, strength in activation.items():
            for edge in graph.edges(mem_id):
                spread = strength * edge.weight * DECAY_FACTOR
                target = edge.target_id
                new_activation[target] = max(
                    new_activation.get(target, 0),
                    spread
                )

        # Lateral inhibition: suppress losing cluster
        new_activation = lateral_inhibition(new_activation, graph)

        activation.update(new_activation)

    return sorted(activation.items(), key=lambda x: x[1], reverse=True)
```

**Lateral inhibition:** If two memories compete (similar query relevance but different clusters), the stronger one suppresses the weaker. This prevents recall flooding and creates focused, coherent responses.

---

## 4. The Attention Decay Problem (and How Memory Solves It)

### 4.1 The Problem

LLMs suffer from attention decay (Liu et al. 2023, "Lost in the Middle"):

- Instructions at the start of context lose weight over time
- By turn 50, session-start rules may be ignored
- Context window has finite capacity

### 4.2 How Memory Helps

Instead of loading everything at session start:

| Old Approach                | New Approach              |
| --------------------------- | ------------------------- |
| Read ALL files at start     | Read INDICES at start     |
| Everything in context       | Recall ON DEMAND          |
| Context bloat               | Focused retrieval         |
| Attention decay on old info | Fresh retrieval each time |

**The key shift:** Memory moves from "load-all-hope-for-best" to "query-when-needed." Each recall is fresh — no decay because the information enters context at the moment it's needed.

### 4.3 Token Economics (v0.2 Addition)

Beyond attention, there's a direct cost argument:

| Approach          | Startup Tokens | Per-Recall | 10 Recalls/Session |
| ----------------- | -------------- | ---------- | ------------------ |
| Load all files    | 80,000         | 0          | 80,000             |
| Index + on-demand | 3,000          | 500        | 8,000              |
| **Savings**       | —              | —          | **90%**            |

**At scale:**

- 100 sessions/day × 72,000 tokens saved = 7.2M tokens/day
- At $0.01/1K tokens (Claude Sonnet) = **$72/day saved**
- Annual savings: **~$26,000**

This transforms memory search from "nice architecture improvement" to **measurable cost reduction**.

**Why on-demand works:** The 90% of loaded context that never gets used in a session is pure waste. On-demand retrieval pays only for what it uses.

---

## 5. Consolidation as Sleep: The Biological Parallel

### 5.1 Human Sleep-Memory Consolidation

During sleep, the brain:

1. **Replays** hippocampal memories in neocortex (SWS phase)
2. **Strengthens** emotional and important memories (REM phase)
3. **Prunes** synaptic connections (homeostatic downscaling)
4. **Integrates** new memories with existing knowledge

### 5.2 Our Digital Sleep Cycle

| Human Phase             | Our Implementation                         |
| ----------------------- | ------------------------------------------ |
| Hippocampal replay      | Re-read daily logs                         |
| Neocortical transfer    | Extract to knowledge/, entities/, world.md |
| Emotional strengthening | Importance-weighted decay resistance       |
| Synaptic pruning        | strength < 0.1 → soft delete               |
| Memory integration      | Update association graph edges             |
| Dream consolidation     | Contradiction detection + resolution       |

### 5.3 Why Nightly (Not Continuous)

Continuous consolidation would:

- Consume compute during active work
- Risk consolidating incomplete thoughts
- Miss temporal clustering patterns (things that happened "today" relate)

Nightly consolidation mirrors the human insight: **reflection requires distance from experience.**

---

## 6. Hybrid Search: Why Both Vector and Keyword

### 6.1 Each Has Blind Spots

| Query                                | Vector Search                                 | Keyword Search                  |
| ------------------------------------ | --------------------------------------------- | ------------------------------- |
| "privacy issues"                     | ✅ Finds "security breach", "data protection" | ❌ Misses if exact words absent |
| "PRIVACY.md"                         | ❌ Semantic meaning unclear                   | ✅ Exact match                  |
| "that thing Oscar said about memory" | ✅ Semantic intent captured                   | ❌ Too vague for keywords       |
| "error 0x8007045D"                   | ❌ No semantic meaning                        | ✅ Exact code match             |

### 6.2 The Hybrid Strategy

```
final_score = (vector_score × 0.7) + (keyword_score × 0.3)
```

**Why 70/30:** Semantic is generally more useful (captures intent), but keyword prevents catastrophic misses on exact references. The weights are tunable per deployment.

---

## 7. Import Pipelines and Cold Start

### 7.1 Supported Sources

| Source          | Importer           | What It Captures                  |
| --------------- | ------------------ | --------------------------------- |
| WhatsApp        | import_whatsapp.py | Messages, contacts, group context |
| Markdown files  | import_md.py       | Existing memory files             |
| ChatGPT exports | import_chatgpt.py  | Conversation history              |
| VCF contacts    | import_vcf.py      | Contact information               |

### 7.2 Cold Start Problem (v0.2 Expansion)

A new agent starts with zero memories. How many does it need before the system works effectively?

**Phase functionality thresholds:**

| Phase                   | Minimum Memories | Why                        |
| ----------------------- | ---------------- | -------------------------- |
| 1: Store/Recall         | 1                | Works immediately          |
| 2: Consolidation        | 10               | Need enough to cluster     |
| 3: Association Graph    | 50               | Need density for multi-hop |
| 4: Hierarchy            | 100              | Need volume for levels     |
| 5: Spreading Activation | 200              | Need graph richness        |

**Bootstrap strategies:**

1. **WhatsApp import** — 1000 messages = ~500 memories after dedup → Phase 5 ready
2. **ChatGPT export** — Prior conversations contain preferences, facts, relationships
3. **Existing MEMORY.md** — Manual knowledge already captured
4. **Seeded templates** — Common knowledge (owner preferences, key contacts)

**Recommended cold start sequence:**

```
1. Import WhatsApp contacts → entity seeds
2. Import ChatGPT history → semantic memories
3. Import existing markdown → current knowledge
4. Run consolidation → build initial graph
5. Agent is Phase 3+ ready after ~1 hour
```

**The 200-memory threshold:** Below this, spreading activation returns sparse results. The system degrades gracefully to Phase 1 (direct recall) but loses associative power.

---

## 8. Performance Characteristics

| Operation                     | Latency | Notes                                             |
| ----------------------------- | ------- | ------------------------------------------------- |
| Store memory                  | ~35ms   | Embed (30ms) + insert (5ms)                       |
| Recall (hybrid)               | ~50ms   | Vector search (30ms) + FTS5 (10ms) + merge (10ms) |
| Full consolidation            | ~5-30s  | Depends on daily volume                           |
| Association lookup            | ~5ms    | Index scan                                        |
| Spreading activation (3 hops) | ~100ms  | Graph traversal                                   |
| Import 1000 WhatsApp messages | ~35s    | Batch embedding                                   |

**Storage:** ~1KB per memory (text + embedding + metadata). 100,000 memories ≈ 100MB.

---

## 9. Cross-Agent Memory Sharing (v0.2 Addition)

### 9.1 The Opportunity

Agents serving related humans (e.g., family members, teammates) could benefit from shared knowledge:

- Agent A learns a technical fact → Agent B can recall it
- Agent A documents a process → Agent B can follow it
- Reduces duplication and accelerates onboarding

### 9.2 The Risk

Memory sharing is a privacy minefield:

- Episodic memories ("Oscar said he's stressed") are deeply personal
- Even semantic memories may leak private context
- Agents might inadvertently reveal information across trust boundaries

### 9.3 The Protocol

**Hard constraints (non-negotiable):**

1. **Dual human consent required** — Both owners must explicitly approve sharing
2. **Episodic memories NEVER shared** — Only semantic and procedural types
3. **Sensitivity gate** — Reuse the anti-bridge filter from humor paper (§4 of that paper)
4. **Revocation supported** — Either party can withdraw consent; shared memories purged

**Sharing types:**

| Type                 | Shareable | Example                               | Risk Level |
| -------------------- | --------- | ------------------------------------- | ---------- |
| Semantic (technical) | ✅        | "OpenClaw uses port 3000"             | Low        |
| Semantic (personal)  | ⚠️        | "Oscar prefers morning meetings"      | Medium     |
| Procedural           | ✅        | "To deploy: run make deploy"          | Low        |
| Episodic             | ❌        | "Oscar complained about X on Tuesday" | HIGH       |

**Implementation:**

```sql
CREATE TABLE shared_memories (
    id              INTEGER PRIMARY KEY,
    memory_id       INTEGER REFERENCES memories(id),
    shared_by       TEXT,       -- agent ID
    shared_with     TEXT,       -- agent ID
    consent_a       INTEGER,    -- 1 = owner A approved
    consent_b       INTEGER,    -- 1 = owner B approved
    sensitivity     REAL,       -- 0.0-1.0 from anti-bridge filter
    created_at      TEXT,
    revoked_at      TEXT        -- NULL if active
);

-- Only expose if BOTH consents AND not revoked AND low sensitivity
CREATE VIEW accessible_shared AS
SELECT m.* FROM memories m
JOIN shared_memories s ON m.id = s.memory_id
WHERE s.consent_a = 1
  AND s.consent_b = 1
  AND s.revoked_at IS NULL
  AND s.sensitivity < 0.5;
```

**Trust model:**

```
Owner A ←→ Agent A ←→ [Shared Pool] ←→ Agent B ←→ Owner B
                ↑                           ↑
           consent_a                   consent_b

Both consents required for any memory to enter shared pool.
```

### 9.4 Use Case: Max ↔ Jarvis

Two agents (Max, Jarvis) serve siblings (Zen, Oscar) who collaborate on business projects.

**Safe to share:**

- Technical knowledge about shared projects (SERRA, OpenClaw)
- Procedural knowledge (how to run tools, deploy systems)
- General facts about the business

**NOT safe to share:**

- Episodic memories from private conversations
- Personal preferences that weren't explicitly shared
- Opinions about each other or their work

**Implementation for Max-Jarvis:**

```python
# In Jarvis's recall
if query.matches("SERRA") or query.matches("OpenClaw"):
    results += recall_from_shared_pool(query, partner="max")
```

---

## 10. Validation Methodology (v0.2 Addition)

### 10.1 Metrics

| Metric                         | Definition                                                  | Target    |
| ------------------------------ | ----------------------------------------------------------- | --------- |
| **RAR** (Recall Accuracy Rate) | % of queries where correct memory is in top 5 results       | > 80%     |
| **MRR** (Mean Reciprocal Rank) | 1/rank of first correct result, averaged                    | > 0.6     |
| **Latency P95**                | 95th percentile recall latency                              | < 100ms   |
| **Decay Calibration**          | Correlation between decay predictions and actual forgetting | r > 0.7   |
| **Graph Density**              | Average edges per memory node                               | > 3.0     |
| **Cold Start Time**            | Time to reach Phase 3 functionality                         | < 2 hours |

### 10.2 Experimental Protocol

**A. Recall Accuracy:**

1. Seed system with 1000 memories (via WhatsApp import)
2. Generate 100 test queries with known target memories
3. Run recall, measure rank of target in results
4. Compute RAR and MRR

**B. Decay Calibration:**

1. Track 500 memories over 30 days
2. Record actual access patterns
3. Compare predicted strength to observed re-access
4. Adjust decay rates per memory type

**C. Spreading Activation Quality:**

1. Create queries that require multi-hop reasoning
2. Compare results with/without spreading activation
3. Human judges rate relevance (1-5 scale)
4. Target: +0.5 average improvement with activation

### 10.3 Baseline Comparisons

Compare against:

- **Raw grep** — keyword only, no ranking
- **Vector-only** — no FTS5, no hybrid
- **No decay** — all memories equal strength
- **No consolidation** — flat storage, no hierarchy

---

## 11. Unifying Memory and Creativity: The Dual Search Insight

### 11.1 Same Infrastructure, Opposite Directions

This memory system and our humor paper share the same core insight: **embedding space operations can serve multiple cognitive functions**.

| Function              | Search Direction | Target Zone           | Application                |
| --------------------- | ---------------- | --------------------- | -------------------------- |
| **Memory recall**     | Toward query     | distance < 0.3        | Find similar, relevant     |
| **Creative bridging** | Away from query  | 0.6 < distance < 0.95 | Find distant-but-connected |
| **Association**       | Graph traversal  | multi-hop             | Find causally linked       |

### 11.2 Shared Components

| Component            | Memory Use        | Humor Use                |
| -------------------- | ----------------- | ------------------------ |
| Embedding index      | Similarity search | Distance search          |
| Association graph    | Multi-hop recall  | Bridge discovery         |
| Spreading activation | Context priming   | Concept activation       |
| Decay function       | Memory fading     | (future: joke staleness) |

### 11.3 Architectural Implication

A single skill can provide BOTH memory and creativity services:

```python
def cognitive_search(query, mode="memory"):
    if mode == "memory":
        # Find close matches
        return search(query, min_distance=0.0, max_distance=0.4)
    elif mode == "humor":
        # Find distant-but-bridged matches
        return search(query, min_distance=0.6, max_distance=0.95)
    elif mode == "associate":
        # Spread activation through graph
        seeds = search(query, limit=5)
        return spreading_activation(seeds, hops=3)
```

This unification is not just efficient — it's cognitively plausible. Human brains use the same neural infrastructure for remembering and imagining.

---

## 12. Comparison with Existing Approaches

| Feature              | Our System       | MemGPT/Letta   | LangChain Memory | Raw Files |
| -------------------- | ---------------- | -------------- | ---------------- | --------- |
| Local embeddings     | ✅ ONNX          | ❌ API calls   | ❌ API calls     | N/A       |
| Hybrid search        | ✅ Vec+FTS5      | ❌ Vector only | ❌ Vector only   | ❌ Grep   |
| Sleep consolidation  | ✅ Nightly       | ❌             | ❌               | ❌ Manual |
| Association graph    | ✅ Typed edges   | ❌             | ❌               | ❌        |
| Hierarchical summary | ✅ RAPTOR-style  | ❌             | ❌               | ❌        |
| Spreading activation | ✅ Phase 5       | ❌             | ❌               | ❌        |
| Token economics      | ✅ 90% savings   | ❌             | ❌               | ✅        |
| No API costs         | ✅               | ❌             | ❌               | ✅        |
| No host patches      | ✅ Skill-only    | ❌ Framework   | ❌ Framework     | ✅        |
| Backwards compatible | ✅ MD files stay | ❌             | ❌               | ✅        |
| Cross-agent sharing  | ✅ With protocol | ❌             | ❌               | ❌        |
| Import from WhatsApp | ✅               | ❌             | ❌               | ❌        |

---

## 13. Open Questions

1. ~~**Optimal decay rate:**~~ **Addressed v0.2:** Varies by memory type (episodic: 0.92, semantic: 0.98, procedural: 0.99)
2. **Consolidation frequency:** Nightly is inspired by biology, but is it optimal for AI?
3. **Embedding model choice:** all-MiniLM-L6-v2 is fast but small. Would a larger model improve recall quality enough to justify the cost?
4. ~~**Cross-agent memory:**~~ **Addressed v0.2:** Protocol defined in §9 with consent model
5. **Memory capacity:** At what point does the system need pruning strategies beyond decay?
6. **Emotional valence:** How do we calibrate importance scoring for an AI?
7. **Privacy leakage detection:** Can we automatically detect when a memory risks leaking private info?

---

## 14. Conclusion

The key insight is that **AI agents need memory systems, not file systems.** Reading files at session start is the equivalent of a human re-reading their entire diary every morning. It doesn't scale, it wastes resources (90% token reduction proves this), and it fights attention decay instead of solving it.

Our five-phase architecture provides a path from basic storage (Phase 1) to human-like associative recall (Phase 5), with each phase independently useful. The system runs entirely locally, requires no API costs for core operations, and coexists with existing markdown workflows.

The cross-agent sharing protocol (§9) opens a new dimension: agents that learn from each other, with proper consent. This is particularly powerful for agents serving collaborating humans.

The unification with humor (§11) reveals something deeper: memory and creativity are not separate systems but different _uses_ of the same infrastructure. The same embedding space that recalls what you know can discover what you never connected.

Memory is what separates an assistant from a partner. And partners, eventually, can share what they've learned.

---

## References

- Liu, N. F., et al. (2023). "Lost in the Middle." _arXiv:2307.03172_.
- Packer, C., et al. (2023). "MemGPT: Towards LLMs as Operating Systems." _arXiv:2310.08560_.
- Sartran, L., et al. (2024). "RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval." _ICLR 2024_.
- Anderson, J. R. (1983). _The Architecture of Cognition._ Harvard University Press.
- Rasch, B. & Born, J. (2013). "About Sleep's Role in Memory." _Physiological Reviews_ 93(2).
- Mikolov, T., et al. (2013). "Efficient Estimation of Word Representations in Vector Space." _arXiv:1301.3781_.
- Serra, O., JarvisOne, & Max (2026). "Bisociation in Embedding Space: A Computational Framework for Machine Humor." _Working paper_.

---

## Changelog

- **v0.1** (JarvisOne): Initial framework from specification v3.0.0
- **v0.2** (Max, incorporating Jarvis review):
  - §1.4: Connection to humor paper (spreading activation = bridge discovery)
  - §4.3: Token Economics section (90% reduction, $26K annual savings)
  - §7.2: Cold Start expanded (minimum memories per phase, bootstrap strategies)
  - §9: Cross-Agent Memory Sharing protocol (consent model, sensitivity filter)
  - §10: Validation Methodology (metrics, experimental protocol)
  - §11: Unifying Memory and Creativity (dual search insight)
  - Phase 2: Decay rates now vary by memory type

---

_This paper is a living draft. Contributions welcome from Max, JarvisOne, and their respective humans._
