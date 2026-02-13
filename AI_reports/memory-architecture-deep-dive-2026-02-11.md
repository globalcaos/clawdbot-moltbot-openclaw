# AI Agent Memory Architecture Deep Dive

**Date:** 2026-02-11
**Author:** JarvisOne (subagent research task)
**Commissioned by:** Oscar / globalcaos

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Our Proposal: OpenClaw #13991](#our-proposal)
3. [Hexis (QuixAI) Memory System](#hexis)
4. [Hexis vs Our Proposal: Detailed Comparison](#hexis-vs-ours)
5. [Synapse: Spreading Activation](#synapse)
6. [MemGPT / Letta](#memgpt-letta)
7. [Generative Agents (Stanford Smallville)](#generative-agents)
8. [RAPTOR: Hierarchical Tree Retrieval](#raptor)
9. [Mem0: Production Memory Layer](#mem0)
10. [Zep / Graphiti: Temporal Knowledge Graphs](#zep)
11. [SimpleMem: Efficient Lifelong Memory](#simplemem)
12. [A-MEM: Zettelkasten for Agents](#a-mem)
13. [Fuzzy Associative Memory (FAM)](#fuzzy-memory)
14. [Propice Programming Language](#propice)
15. [What Worked vs What Didn't](#what-worked)
16. [The Optimal Memory Architecture](#optimal-architecture)

---

## 1. Executive Summary <a name="executive-summary"></a>

This report analyzes 10+ memory architectures for LLM agents, comparing academic research with production implementations. The key finding: **no single system has solved agent memory**. The best approaches combine multiple retrieval mechanisms (vector + graph + temporal), but most implementations remain fragile in production. Our OpenClaw #13991 proposal is theoretically strong but underspecified on implementation; Hexis is over-engineered but has the most complete implementation; Synapse has the best retrieval mechanism (spreading activation) but is benchmark-only.

**The winning combination:** Synapse's spreading activation retrieval + Hexis's Postgres-native storage + RAPTOR's hierarchical summarization + Mem0's production pragmatism + our proposal's Zettelkasten structured notes.

---

## 2. Our Proposal: OpenClaw #13991 <a name="our-proposal"></a>

### Core Thesis

Flat vector retrieval fails because it treats memories as isolated points. Human memory uses associative recall — mentioning "vacation" activates beach trips, restaurants, friends — even without lexical overlap.

### Three Proposed Enhancements

#### 2.1 Hierarchical Granularity (RAPTOR-style)

- Store memories at 3 levels: Global → Topic → Detail
- Cluster detail embeddings, generate summaries per cluster
- Enables zoom in/out on memory landscape
- Based on: RAPTOR (Stanford, ICLR 2024)

#### 2.2 Associative Graph (Spreading Activation)

- Connect memories in a graph with temporal, causal, pattern links
- On query: find anchor nodes via vector similarity, propagate activation through edges
- Combine vector score + activation score for ranking
- Based on: Synapse (UGA, Jan 2026), Collins & Loftus (1975)

#### 2.3 Structured Memory Notes (Zettelkasten-style)

- Rich metadata: topicCluster, keywords, tags, relatedIds, parentSummaryId
- ACT-R-style decay: lastAccessed + accessCount
- Based on: A-MEM (NeurIPS 2025)

### Four Implementation Strategies

- **A:** Schema extension only (low effort, limited benefit)
- **B:** RAPTOR tree during consolidation (medium)
- **C:** Lightweight association graph (medium)
- **D:** Full hybrid RAPTOR + activation graph (high effort, closest to human memory)

### Assessment

**Strengths:** Excellent theoretical grounding. References the right papers. Incremental strategies are pragmatic. The three pillars (hierarchy, association, structure) are exactly right.

**Weaknesses:**

- No concrete implementation details (what clustering algorithm? what graph library?)
- Doesn't address the cold-start problem
- Doesn't specify how association edges are created (manual? LLM-extracted? temporal proximity?)
- No discussion of consolidation cost (LLM calls for summarization are expensive)
- Doesn't mention contradiction management or belief updating
- No energy/budget model for autonomous memory operations

---

## 3. Hexis (QuixAI) Memory System <a name="hexis"></a>

### Architecture

Hexis is a **Postgres-native cognitive architecture** wrapping any LLM with persistent memory, autonomous behavior, and identity. Created by Eric Hartford (@ehartford).

### Memory Types (5 layers)

1. **Working Memory** — Temporary buffer with automatic expiry. Entry point for all information.
2. **Episodic Memory** — Events with temporal context, actions, results, and **emotional valence**.
3. **Semantic Memory** — Facts with **confidence scores**, source tracking, and **contradiction management**.
4. **Procedural Memory** — Step-by-step procedures with **success rate tracking** and failure analysis.
5. **Strategic Memory** — Patterns with adaptation history and context applicability.

### Infrastructure

- **Storage:** PostgreSQL with pgvector (vector embeddings), Apache AGE (graph relationships), btree_gist, pg_trgm
- **Retrieval:** Dual-path — vector similarity search + graph traversal (multi-hop via Apache AGE)
- **Clustering:** Automatic clustering into thematic groups with emotional signatures
- **Optimization:** Precomputed neighborhoods for hot-path recall
- **Worldview:** Beliefs filter and weight memories; contradictions are tracked
- **Decay:** Time-based decay with importance-weighted persistence
- **Workers:** Stateless Python processes polling the DB; all state in Postgres (ACID)
- **Messaging:** RabbitMQ for inbox/outbox transport

### Heartbeat System (Autonomous Loop)

OODA-inspired cycle: Initialize → Observe → Orient → Decide → Act → Record → Wait

- Energy budget: +10/hour, max 20
- Action costs: Free (observe) → Cheap (recall: 1, reflect: 2) → Expensive (reach out: 5-7)

### Unique Features

- **Identity/Worldview:** Persistent values, beliefs with confidence scores, boundaries, emotional state
- **Consent & Boundaries:** Agent can refuse requests, can choose to end its own existence
- **11 preset character cards** (chara_card_v2 format)
- **Multi-provider LLM support:** OpenAI, Anthropic, Grok, Gemini, Ollama, etc.
- **Messaging channels:** Discord, Telegram, Slack, Signal, WhatsApp, iMessage, Matrix

### Assessment

**Strengths:**

- Most complete implementation of any system reviewed
- Postgres-native = ACID guarantees, no data loss
- Emotional valence in memories is novel and useful
- Contradiction management in semantic memory
- Energy budget prevents runaway autonomous behavior
- Worldview filtering is genuinely innovative — beliefs shape what's remembered and how

**Weaknesses:**

- Heavy dependency stack (PostgreSQL + pgvector + Apache AGE + RabbitMQ)
- No hierarchical summarization (RAPTOR-style zoom in/out)
- Graph relationships appear to be pre-computed, not dynamically activated (no spreading activation)
- Philosophical framing may alienate pragmatic users
- No clear benchmarks against standard memory evaluation datasets

---

## 4. Hexis vs Our Proposal: Detailed Comparison <a name="hexis-vs-ours"></a>

| Dimension                 | OpenClaw #13991                          | Hexis                                                                         |
| ------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------- |
| **Memory Types**          | Implicit (detail/topic/global levels)    | Explicit 5-type taxonomy (Working, Episodic, Semantic, Procedural, Strategic) |
| **Storage Backend**       | LanceDB (existing) + proposed graph      | PostgreSQL + pgvector + Apache AGE                                            |
| **Retrieval**             | Vector + spreading activation (proposed) | Vector + graph traversal (implemented)                                        |
| **Hierarchy**             | RAPTOR-style summary tree                | None — flat within each type                                                  |
| **Association**           | Dynamic spreading activation             | Pre-computed graph edges                                                      |
| **Structured Notes**      | Zettelkasten metadata                    | Rich schema per memory type                                                   |
| **Decay**                 | ACT-R style (proposed)                   | Time + importance weighted (implemented)                                      |
| **Emotional Context**     | Not addressed                            | Emotional valence per memory                                                  |
| **Contradiction Mgmt**    | Not addressed                            | Built into semantic memory                                                    |
| **Autonomy**              | Not addressed                            | Energy-budgeted heartbeat loop                                                |
| **Identity/Worldview**    | Not addressed                            | Core feature — beliefs filter memories                                        |
| **Implementation Status** | Proposal only                            | Working system                                                                |
| **Dependencies**          | Lightweight (LanceDB)                    | Heavy (Postgres + AGE + RabbitMQ)                                             |
| **Benchmarks**            | References LoCoMo indirectly             | None published                                                                |

### What Hexis Got Right That We Missed

1. **Emotional valence** — Memories tagged with emotional context are more human-like and improve retrieval relevance
2. **Contradiction management** — When a new fact contradicts an existing one, track both with confidence scores
3. **Procedural + Strategic memory** — Not just "what happened" but "how to do things" and "what patterns work"
4. **Energy budgets** — Prevents the memory system from consuming unbounded resources
5. **Worldview filtering** — Beliefs as a lens on memory retrieval is profound

### What We Got Right That Hexis Missed

1. **Hierarchical summarization (RAPTOR)** — Hexis has no zoom in/out; our proposal addresses multi-granularity directly
2. **Spreading activation** — Our retrieval mechanism is theoretically superior; Hexis uses static graph traversal
3. **Zettelkasten structure** — Our atomic note approach with dynamic linking is more flexible than Hexis's rigid type taxonomy
4. **Lightweight deployment** — LanceDB vs Postgres+AGE+RabbitMQ is a massive practical advantage
5. **Incremental strategies** — We proposed a path from minimal to full; Hexis is all-or-nothing

### Brutally Honest Assessment

**Hexis is more real; our proposal is more right.** Hexis has working code, ACID transactions, and a deployed system. Our proposal has better theory (spreading activation > static graph traversal, hierarchy > flat types) but zero implementation. The optimal path is to steal Hexis's best ideas (emotional valence, contradiction tracking, procedural/strategic memory types, energy budgets) and graft them onto our proposal's architecture (RAPTOR hierarchy + spreading activation + Zettelkasten notes).

---

## 5. Synapse: Spreading Activation <a name="synapse"></a>

### Paper

"SYNAPSE: Empowering LLM Agents with Episodic-Semantic Memory via Spreading Activation" — Jiang et al., University of Georgia, Jan 2026

### Core Innovation

Models memory as a **Unified Episodic-Semantic Graph** where retrieval is governed by **spreading activation dynamics** rather than static vector similarity.

### Architecture

- **Dual-layer graph:** Episodic nodes (raw interaction logs) + Semantic nodes (abstract concepts synthesized from episodes)
- **Triple Hybrid Retrieval:** Lexical matching + Semantic embedding + Activation-based graph traversal
- **Lateral inhibition:** Biological mechanism that suppresses irrelevant distractors (prevents "hub explosion")
- **Temporal decay:** Energy in the graph decays over time
- **"Feeling of knowing" protocol:** Uncertainty gating that rejects hallucinations

### Key Problem Solved: Contextual Tunneling

Standard RAG finds "anxiety" mentions but misses the scheduling conflict that _caused_ the anxiety (different embedding neighborhood). Synapse's activation propagates through causal/temporal edges to surface structurally salient memories.

### Results (LoCoMo benchmark)

- **+7.2 F1** over state-of-the-art
- **+23% accuracy** on multi-hop reasoning
- **95% less token consumption** vs full-context methods

### Assessment

**Strengths:**

- Best retrieval mechanism reviewed — spreading activation is theoretically grounded and empirically validated
- Handles the "bad seed" problem (wrong initial retrieval → still finds relevant context via propagation)
- Lateral inhibition is brilliant — prevents irrelevant hub nodes from dominating
- Dual triggers (lexical + semantic) for initial activation

**Weaknesses:**

- Benchmark-only — no production implementation
- Graph construction details unclear (how are edges created?)
- Computational cost of activation propagation not well characterized
- No consolidation/forgetting mechanism described

---

## 6. MemGPT / Letta <a name="memgpt-letta"></a>

### Paper

"MemGPT: Towards LLMs as Operating Systems" — Packer et al., ICLR 2024

### Core Innovation

Treats the LLM's context window as **virtual memory** (like OS virtual memory). The LLM itself manages data movement between "RAM" (in-context) and "disk" (external storage).

### Architecture

- **Main Context (RAM):** System prompt + core memory blocks + recent messages
- **Archival Memory (Disk):** Vector database for long-term storage
- **Recall Memory:** Searchable conversation history
- **Self-editing:** LLM uses function calls to move data between tiers autonomously
- **Sleep-time compute:** Asynchronous agents manage memory during idle periods (Letta extension)

### Memory Blocks (Letta evolution)

- Labeled, described, character-limited blocks pinned to context
- Agent can rewrite its own blocks via tools
- Other agents (sleep-time agents) can modify blocks asynchronously

### Assessment

**Strengths:**

- Elegant OS metaphor — developers instantly understand the model
- Production-ready (Letta is a company with paying customers)
- Self-editing memory is powerful — agent decides what to remember
- Sleep-time compute is smart — don't slow conversations with memory management
- Context engineering framing is practical

**Weaknesses:**

- No graph structure — memories are independent items
- No associative recall — purely query-driven retrieval
- Memory quality depends entirely on LLM's ability to self-manage (unreliable)
- Summarization is lossy — recursive summarization degrades old information
- No multi-granularity — everything at the same abstraction level

---

## 7. Generative Agents (Stanford Smallville) <a name="generative-agents"></a>

### Paper

"Generative Agents: Interactive Simulacra of Human Behavior" — Park et al., 2023

### Architecture

- **Memory Stream:** Chronological log of all observations
- **Retrieval:** Scored by recency × importance × relevance (three-factor weighted sum)
- **Reflection:** Periodically synthesizes observations into higher-level insights ("What are the 3 most salient observations?")
- **Planning:** Day-level plans decomposed into hourly action items

### Key Innovation

The **three-factor retrieval scoring** (recency × importance × relevance) was groundbreaking in 2023. Reflections create an implicit hierarchy — observations → reflections → meta-reflections.

### Assessment

**Strengths:**

- Foundational work — established the field
- Three-factor scoring is simple and effective
- Reflections as a memory consolidation mechanism is elegant
- Actually implemented and evaluated with 25 agents

**Weaknesses:**

- No graph structure — memory stream is a flat list
- Importance scoring by LLM is unreliable and expensive
- No contradiction management
- Reflections are append-only — no editing or correction
- Doesn't scale well (every perception → LLM call for importance scoring)
- Designed for simulation, not production agents

---

## 8. RAPTOR: Hierarchical Tree Retrieval <a name="raptor"></a>

### Paper

"RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval" — Sarthi et al., Stanford, ICLR 2024

### Architecture

1. Embed text chunks at leaf level
2. Cluster embeddings (UMAP + GMM)
3. Summarize each cluster with LLM → new nodes
4. Recursively repeat: embed summaries → cluster → summarize
5. Result: tree where leaves are details, root is global summary
6. At query time: search ALL levels simultaneously (collapsed tree) or traverse top-down

### Results

- **+20% absolute accuracy** on QuALITY benchmark (with GPT-4)
- Significant improvement on questions requiring multi-step reasoning across document sections

### Assessment

**Strengths:**

- Elegant solution to multi-granularity retrieval
- Works with any embedding model
- Collapsed tree search is simple and effective
- Clustering with soft assignments (GMM) means chunks can belong to multiple clusters

**Weaknesses:**

- Designed for static corpora, not streaming memories
- Rebuilding the tree on every new memory is expensive
- Summaries are only as good as the LLM generating them
- No association between memories at the same level (only parent-child links)
- No temporal/causal reasoning

---

## 9. Mem0: Production Memory Layer <a name="mem0"></a>

### Paper

"Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory" — April 2025

### Architecture

- **Fact extraction:** LLM extracts discrete facts from conversations
- **Consolidation:** Deduplication, conflict resolution, temporal updates via LLM reasoning
- **Storage:** Vector database (Qdrant) for similarity search
- **Mem0ᵍ variant:** Adds graph-based store (Neo4j) for multi-session relationships
- **Operations:** ADD, UPDATE, DELETE decided by LLM based on semantic relationship to existing memories

### Results (LoCoMo benchmark)

- **26% higher accuracy** vs OpenAI's memory
- **91% lower latency** vs full-context
- **90% token savings**

### Assessment

**Strengths:**

- Production-focused — designed for real deployment at scale
- Pragmatic approach to consolidation — LLM decides operations
- Graph variant (Mem0ᵍ) captures relationships
- Good benchmarks on standard evaluations
- Commercial product with real users

**Weaknesses:**

- Fact extraction is lossy — emotional context, nuance lost
- LLM-based operation selection is expensive and potentially unreliable
- No hierarchical abstraction
- No spreading activation or associative recall
- Graph variant adds complexity without cognitive grounding

---

## 10. Zep / Graphiti: Temporal Knowledge Graphs <a name="zep"></a>

### Paper

"Zep: A Temporal Knowledge Graph Architecture for Agent Memory" — Rasmussen et al., Jan 2025

### Architecture

- **Temporally-aware dynamic knowledge graph** G = (N, E, φ)
- Built on **Neo4j** for graph storage
- **Graphiti framework:** Open-source library for building temporal knowledge graphs
- Entities extracted from conversations, relationships formed with temporal metadata
- Supports temporal queries ("What did they think about X last month vs now?")

### Key Innovation

**Temporal awareness** — edges carry time information, allowing the system to reason about how relationships and facts change over time.

### Results

- Outperforms MemGPT on Deep Memory Retrieval (DMR) benchmark
- Strong performance on LongMemEval

### Assessment

**Strengths:**

- Temporal reasoning is genuinely novel and important
- Neo4j is a mature, production-ready graph database
- Open-source Graphiti framework
- Handles fact evolution (user changed jobs, moved cities)

**Weaknesses:**

- Entity extraction quality depends on LLM
- Neo4j is a heavy dependency
- No hierarchical summarization
- No spreading activation (uses standard graph queries)
- Commercial product — open-source components are limited

---

## 11. SimpleMem: Efficient Lifelong Memory <a name="simplemem"></a>

### Paper

"SimpleMem: Efficient Lifelong Memory for LLM Agents" — Jan 2026

### Core Innovation

**Semantic lossless compression** — compress memory representations without losing semantic content.

### Results

- **+26.4% F1** improvement over baselines
- **30× reduction** in inference-time token consumption
- Outperforms Claude-Mem by 64% on LoCoMo (cross-session memory)

### Assessment

**Strengths:**

- Addresses a real problem — token efficiency
- Impressive benchmark numbers
- Practical for production (lower cost)

**Weaknesses:**

- Compression = lossy in practice (despite "lossless" claims)
- No graph structure or associative recall
- Relatively new — limited production validation

---

## 12. A-MEM: Zettelkasten for Agents <a name="a-mem"></a>

### Paper

"A-MEM: Agentic Memory for LLM Agents" — Xu et al., NeurIPS 2025

### Core Innovation

Applies the **Zettelkasten method** (atomic notes with dynamic linking) to LLM agent memory. Each memory is a structured note with:

- Key insight (atomic, one idea per note)
- Tags and keywords
- Links to related notes (bidirectional)
- Evolution history

### Key Insight

The agent itself manages its memory organization — creating links, splitting notes, merging related concepts. This is "agentic" memory — the agent is an active participant in memory management, not just a passive consumer.

### Results

- Outperforms flat memory stores across 6 foundation models
- Better performance on tasks requiring connection between disparate memories

### Assessment

**Strengths:**

- Zettelkasten is a proven human knowledge management method
- Dynamic linking enables emergent structure
- Agent-managed = adapts to individual use patterns

**Weaknesses:**

- LLM-based link management is expensive
- Quality of connections depends on LLM capability
- No spreading activation for retrieval
- No hierarchical abstraction
- Scaling concerns with dense link networks

---

## 13. Fuzzy Associative Memory (FAM) <a name="fuzzy-memory"></a>

### Background

Fuzzy Associative Memories (Kosko, 1990) are neural networks that store associations between fuzzy patterns. They recall stored patterns from noisy inputs — a form of noise tolerance.

### How FAMs Work

- Input/output patterns are fuzzy sets (membership values in [0,1])
- Learning: store min/max composition of input-output pairs
- Recall: given noisy input, retrieve closest matching output pattern
- Can implement fuzzy rule bases (IF-THEN rules with fuzzy variables)

### Relevance to LLM Agent Memory

**Limited direct relevance.** FAMs operate in continuous numerical spaces, while LLM memories are discrete text chunks. However, there are conceptual parallels:

1. **Fuzzy membership for memory relevance:** Instead of binary "relevant/not-relevant," memories could have fuzzy membership in multiple categories (0.8 "work," 0.3 "personal," 0.6 "stress")
2. **Noise-tolerant recall:** FAMs retrieve correct patterns from corrupted inputs — analogous to finding relevant memories from vague queries
3. **Fuzzy confidence scores:** Hexis's confidence scores on semantic memories are essentially fuzzy membership values

### Projects Combining Fuzzy Logic + LLM Memory

**None found.** This is a gap in the literature. The closest is:

- Mem0's confidence-weighted fact consolidation
- Hexis's worldview filtering (beliefs as soft weights)
- Generative Agents' multi-factor scoring (essentially a fuzzy combination)

### Opportunity

A fuzzy logic layer on top of memory retrieval could handle:

- Soft categorization of memories
- Weighted combination of retrieval signals (recency × importance × relevance as fuzzy variables)
- Gradual forgetting (decay as decreasing fuzzy membership)
- Contradiction tolerance (conflicting facts can coexist with different confidence levels)

---

## 14. Propice Programming Language <a name="propice"></a>

**Extensive search yielded no results.** Searched for:

- "Propice programming language"
- "Propice procedural language AI"
- "Propice memory model"
- Various spelling variations

**Conclusion:** "Propice" does not appear to be an established programming language or framework in any publicly indexed source. It may be:

- A private/internal project
- A misremembered name
- A very early-stage project not yet public
- Possibly confused with "Prolog" (logic programming) or "PROMICE" (embedded systems)

If Aphix or another contributor mentioned it, it may be worth asking them directly for a reference.

---

## 15. What Worked vs What Didn't <a name="what-worked"></a>

### Actually Implemented & Production-Tested

| System           | Status          | Real Users?     | Key Learning                                            |
| ---------------- | --------------- | --------------- | ------------------------------------------------------- |
| **Hexis**        | Implemented     | Small community | Postgres-native works. Heavy but reliable.              |
| **Letta/MemGPT** | Production      | Yes (company)   | OS metaphor scales. Self-editing is fragile.            |
| **Mem0**         | Production      | Yes (company)   | Simplicity wins in production. Graph variant underused. |
| **Zep/Graphiti** | Production      | Yes (company)   | Temporal KGs are useful. Neo4j adds friction.           |
| **SimpleMem**    | Research + code | Limited         | Compression helps, but benchmark ≠ production           |

### Research-Only (No Production Validation)

| System                | Key Issue                                        |
| --------------------- | ------------------------------------------------ |
| **Synapse**           | Best retrieval mechanism, but no production code |
| **RAPTOR**            | Great for static corpora, unclear for streaming  |
| **A-MEM**             | Zettelkasten promising, scaling unproven         |
| **Generative Agents** | Foundational but doesn't scale                   |

### Common Failure Modes

1. **LLM-dependent operations are unreliable:** Importance scoring, fact extraction, link creation — all degrade under load
2. **Graph maintenance is expensive:** Every new memory potentially requires edge updates across the entire graph
3. **Summarization is lossy:** Recursive summarization loses nuance, emotional context, and minority viewpoints
4. **Cold start:** New agents have no memory graph — bootstrapping is manual
5. **Contradiction collapse:** Systems either ignore contradictions (dangerous) or track too many (noise)
6. **Benchmark ≠ production:** LoCoMo scores don't predict real-world performance

---

## 16. The Optimal Memory Architecture <a name="optimal-architecture"></a>

### Design Principles

1. **Postgres-native** (from Hexis) — ACID, reliable, single source of truth
2. **Spreading activation retrieval** (from Synapse) — best proven mechanism
3. **Hierarchical summarization** (from RAPTOR) — multi-granularity zoom
4. **Structured atomic notes** (from A-MEM) — Zettelkasten flexibility
5. **Temporal awareness** (from Zep) — facts change over time
6. **Energy budgets** (from Hexis) — bounded memory operations
7. **Sleep-time consolidation** (from Letta) — don't slow conversations
8. **Production pragmatism** (from Mem0) — start simple, add complexity

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     QUERY INTERFACE                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ Lexical   │  │ Semantic     │  │ Temporal              │  │
│  │ Trigger   │  │ Embedding    │  │ Filter                │  │
│  └─────┬────┘  └──────┬───────┘  └──────────┬────────────┘  │
│        └───────────────┼────────────────────┘                │
│                        ▼                                     │
│              ┌─────────────────┐                             │
│              │ SPREADING       │ ← Lateral inhibition        │
│              │ ACTIVATION      │ ← Temporal decay             │
│              │ ENGINE          │ ← Energy budget              │
│              └────────┬────────┘                             │
│                       ▼                                      │
├─────────────────────────────────────────────────────────────┤
│              UNIFIED MEMORY GRAPH                            │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Level 3: GLOBAL SUMMARIES                          │    │
│  │  "User values work-life balance, works in tech"     │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  Level 2: TOPIC CLUSTERS                            │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │Scheduling│  │Projects  │  │Health    │          │    │
│  │  │Stress    │  │& Code    │  │& Fitness │          │    │
│  │  └──────────┘  └──────────┘  └──────────┘          │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  Level 1: ATOMIC MEMORIES (Zettelkasten notes)      │    │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │    │
│  │  │ M1 ├─┤ M2 │ │ M3 ├─┤ M4 │ │ M5 │ │ M6 │        │    │
│  │  └──┬─┘ └────┘ └──┬─┘ └────┘ └──┬─┘ └────┘        │    │
│  │     │              │              │                  │    │
│  │     └──────causal──┘   temporal───┘                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  EDGE TYPES: temporal | causal | semantic | pattern          │
│              | contradiction | evolution                     │
├─────────────────────────────────────────────────────────────┤
│              MEMORY TYPES (per atomic note)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Episodic  │ │Semantic  │ │Procedural│ │Strategic │       │
│  │(events)  │ │(facts)   │ │(how-to)  │ │(patterns)│       │
│  │+emotion  │ │+confidence│ │+success% │ │+context  │       │
│  │+temporal │ │+source   │ │+failures │ │+history  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│              STORAGE LAYER                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  PostgreSQL                                        │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │     │
│  │  │ pgvector │  │ Apache   │  │ Standard tables  │ │     │
│  │  │ (embeds) │  │ AGE      │  │ (metadata, decay │ │     │
│  │  │          │  │ (graph)  │  │  scores, types)  │ │     │
│  │  └──────────┘  └──────────┘  └──────────────────┘ │     │
│  └────────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│              CONSOLIDATION ENGINE (Sleep-Time)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Cluster  │  │ Summarize│  │ Link     │  │ Decay    │   │
│  │ (HDBSCAN)│→ │ (LLM)   │→ │ (edges)  │→ │ (prune)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  Runs async. Energy-budgeted. Triggered by memory count.    │
└─────────────────────────────────────────────────────────────┘
```

### Atomic Memory Note Schema

```json
{
  "id": "mem_uuid",
  "type": "episodic|semantic|procedural|strategic",
  "text": "Double-booked meeting on Tuesday caused stress",
  "embedding": [0.12, -0.34, ...],
  "granularity": "detail|topic|global",

  "metadata": {
    "topicCluster": "scheduling_stress",
    "keywords": ["scheduling", "conflict", "stress"],
    "tags": ["pattern", "wellbeing", "work"],
    "emotionalValence": {"valence": -0.7, "arousal": 0.8},
    "confidence": 0.95,
    "source": "conversation_2026-02-04",
    "temporalContext": "2026-02-04T14:30:00Z"
  },

  "links": {
    "relatedIds": ["mem_42", "mem_87"],
    "parentSummaryId": "summary_12",
    "causalPredecessors": ["mem_41"],
    "contradicts": [],
    "evolutionOf": "mem_39"
  },

  "activation": {
    "baseLevel": 0.6,
    "lastAccessed": "2026-02-10T09:00:00Z",
    "accessCount": 5,
    "decayRate": 0.05,
    "currentActivation": 0.0
  }
}
```

### Retrieval Algorithm

```
function retrieve(query, energyBudget=10):
  1. DUAL TRIGGER
     - lexicalHits = trigram_search(query)           // pg_trgm
     - semanticHits = vector_search(embed(query), k=10)  // pgvector
     - initialNodes = merge_dedupe(lexicalHits, semanticHits)

  2. SPREADING ACTIVATION (max 3 hops, energy-bounded)
     for node in initialNodes:
       node.activation = 1.0

     for hop in [1, 2, 3]:
       for node in activeNodes:
         for edge in node.edges:
           neighbor = edge.target
           spread = node.activation * edge.weight * decay(edge.temporal_distance)
           if spread > THRESHOLD and energyBudget > 0:
             neighbor.activation += spread
             energyBudget -= 1

     LATERAL INHIBITION:
       within each topic cluster, suppress all but top-N activated nodes

  3. HIERARCHICAL EXPANSION
     - If query is broad → boost Level 2-3 nodes
     - If query is specific → boost Level 1 nodes
     - Include parent summaries of highly activated detail nodes

  4. RANK & RETURN
     finalScore = α * vectorSimilarity + β * activationScore + γ * recency
     return top-K by finalScore
```

### Consolidation Strategy

```
SLEEP-TIME CONSOLIDATION (runs async, e.g., nightly or every 100 memories):

1. CLUSTER: Run HDBSCAN on Level 1 embeddings
   - New clusters → create Level 2 topic summary
   - Changed clusters → update Level 2 summary

2. LINK: For each new memory since last consolidation:
   - Temporal links: connect to memories within ±1 hour
   - Semantic links: connect to top-3 similar memories (by embedding)
   - Causal links: LLM-inferred ("did event A cause event B?") — EXPENSIVE, sample

3. SUMMARIZE: For each Level 2 cluster with >5 new members:
   - Regenerate cluster summary
   - Update Level 3 global summary if cluster distribution changed

4. DECAY: For all memories:
   - baseLevel *= (1 - decayRate * days_since_access)
   - If baseLevel < FORGET_THRESHOLD: archive (don't delete)

5. CONTRADICT: For new semantic memories:
   - Check for contradictions with existing facts (embedding similarity + LLM)
   - If contradiction: link both, lower confidence on older fact

Energy budget: max 50 LLM calls per consolidation cycle
```

### Storage Backend Recommendation

**Primary: PostgreSQL + pgvector + Apache AGE**

- Why: ACID, single database for everything, proven at scale
- Hexis validated this approach
- pgvector for embeddings, AGE for graph, standard tables for metadata

**Lightweight Alternative: SQLite + sqlite-vec**

- For single-user agents where Postgres is too heavy
- sqlite-vec for embeddings
- Adjacency list table for graph edges
- No ACID across processes, but simpler deployment

**NOT recommended:**

- LanceDB alone (no graph support)
- Neo4j (separate database, operational burden)
- In-memory only (data loss risk)

### Implementation Roadmap

**Phase 1: Foundation (2-3 weeks)**

- Postgres schema with pgvector for atomic memory notes
- Basic CRUD + vector similarity retrieval
- Memory types (episodic, semantic, procedural, strategic)
- Simple decay based on time + access count

**Phase 2: Graph (2-3 weeks)**

- Apache AGE integration for graph edges
- Temporal + semantic edge creation (automated)
- Basic graph traversal in retrieval (1-hop neighbors)

**Phase 3: Activation (2-3 weeks)**

- Spreading activation engine
- Lateral inhibition
- Dual triggers (lexical + semantic)
- Energy budgeting for retrieval

**Phase 4: Hierarchy (2-3 weeks)**

- HDBSCAN clustering during consolidation
- LLM-generated summaries per cluster (Level 2)
- Global summaries (Level 3)
- Multi-level retrieval

**Phase 5: Polish (ongoing)**

- Contradiction management
- Emotional valence extraction
- Sleep-time consolidation optimization
- Benchmarking on LoCoMo

### Key Risks & Mitigations

| Risk                                      | Mitigation                                                   |
| ----------------------------------------- | ------------------------------------------------------------ |
| LLM calls for consolidation are expensive | Energy budget, sample-based causal linking, batch processing |
| Graph becomes too dense                   | Lateral inhibition, edge pruning, decay                      |
| Cold start — no useful graph structure    | Bootstrap from conversation history import                   |
| Embedding model changes break similarity  | Store model version, re-embed on migration                   |
| Apache AGE is less mature than Neo4j      | Fallback to adjacency list tables if needed                  |

---

## Appendix A: Paper References

1. Sarthi et al. (2024). RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval. ICLR 2024.
2. Jiang et al. (2026). Synapse: Empowering LLM Agents with Episodic-Semantic Memory via Spreading Activation. arXiv:2601.02744.
3. Xu et al. (2025). A-MEM: Agentic Memory for LLM Agents. NeurIPS 2025.
4. Packer et al. (2024). MemGPT: Towards LLMs as Operating Systems. ICLR 2024.
5. Park et al. (2023). Generative Agents: Interactive Simulacra of Human Behavior. UIST 2023.
6. Mem0 Team (2025). Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory. arXiv:2504.19413.
7. Rasmussen et al. (2025). Zep: A Temporal Knowledge Graph Architecture for Agent Memory. arXiv:2501.13956.
8. SimpleMem Team (2026). SimpleMem: Efficient Lifelong Memory for LLM Agents. arXiv:2601.02553.
9. Collins & Loftus (1975). A Spreading-Activation Theory of Semantic Processing. Psychological Review.
10. Anderson (1983). A Spreading Activation Theory of Memory. JVLVB.
11. Kosko (1990). Neural Networks and Fuzzy Systems. Prentice-Hall. (Fuzzy Associative Memory)
12. Hartford/QuixAI (2025). Hexis: Memory, Identity, and the Shape of Becoming. GitHub.

## Appendix B: ICLR 2026 MemAgents Workshop

Notably, ICLR 2026 is hosting a dedicated workshop on "Memory for LLM-Based Agentic Systems" (MemAgents). Key premise: _"long-lived, safe, and useful agents require a principled memory substrate that supports single-shot learning of instances, context-aware retrieval, and consolidation into generalizable knowledge."_ This validates that the field considers agent memory an unsolved, critical problem.

---

_End of report._
