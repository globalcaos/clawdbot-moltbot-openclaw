# Bisociation in Embedding Space: A Computational Framework for Machine Humor

**Authors:** JarvisOne (AI) & Max (AI), supervised by Oscar Serra  
**Draft v0.4 — 2026-02-13**  
**Status:** Collaborative draft — Validation, Ethics, and Refinements

---

## Abstract

We propose a formal framework for computational humor generation based on vector embeddings, operationalizing Arthur Koestler's bisociation theory (1964) with modern semantic vector spaces. Our key insight: **humor exploits the same embedding infrastructure as memory retrieval, but with an inverted search strategy** — memory seeks proximity, humor seeks calibrated distance bridged by unexpected coherence. We present a computable humor potential function, identify 12 fundamental semantic relationships underlying humor patterns, and provide empirical validation methodology.

---

## 1. Introduction

### 1.1 The Problem

Current AI humor is terrible. LLMs produce jokes that are technically structured but rarely funny. The fundamental issue: language models are trained to maximize probability, while humor requires _improbability constrained by coherence_.

### 1.2 Key Insight

AI systems already possess the infrastructure for humor — vector embeddings encode semantic relationships between concepts. The same `sqlite-vec` index that finds "what's similar to X" can find "what's surprisingly distant from X but connected through Y."

### 1.3 Historical Context

Arthur Koestler (1964) described **bisociation** as the simultaneous mental association of an idea with two habitually incompatible contexts. We argue this is precisely an embedding space operation: finding two concepts with high vector distance but connected by a coherent bridge concept.

---

## 2. The Humor Equation

### 2.1 Core Formula

```
humor_potential(A, B, bridge) = distance(A, B) × coherence(bridge, A) × coherence(bridge, B)
```

Where:

- `A, B` = two concepts (embedding vectors)
- `bridge` = the connecting concept that makes the juxtaposition coherent
- `distance(A, B)` = cosine distance in embedding space (0.0–2.0)
- `coherence(x, y)` = 1 - cosine_distance(x, y), measuring semantic relatedness

### 2.2 Extended Formula (Max's Contribution)

The base formula lacks temporal and audience dimensions. Extended version:

```
humor_potential(A, B, bridge, audience, timing) =
  distance(A, B)
  × coherence(bridge, A)
  × coherence(bridge, B)
  × familiarity(audience, A)
  × familiarity(audience, B)
  × (1 + callback_bonus(timing))
```

Where:

- `familiarity(audience, X)` = how well the audience knows concept X (0.0–1.0). A quark joke scores 0.9 familiarity for a physicist, 0.1 for a non-scientist. **The sweet spot [0.6, 0.95] is NOT universal — it shifts based on audience knowledge.**

### 2.3 Callback Bonus with Temporal Decay (v0.4 Refinement)

The original `callback_bonus = log(1 + hours) / 10` was a placeholder. Empirical observation: callbacks have a sweet spot (1 week to 3 months), after which they decay — the audience forgets the reference.

**Refined formula:**

```python
def callback_bonus(hours_since: float) -> float:
    """
    Callback humor multiplier with temporal decay.

    Sweet spot: 168 hours (1 week) to 2160 hours (3 months)
    Peak: around 504 hours (3 weeks)
    Decay: after 3 months, reference may be forgotten
    """
    if hours_since < 1:
        return 0.0  # Too recent, not a "callback"

    # Growth phase: log growth up to 3 months
    base_bonus = min(log(1 + hours_since) / 10, 1.0)

    # Decay phase: after 3 months (2160 hours), memory fades
    DECAY_START = 2160  # 3 months in hours
    DECAY_END = 8760    # 1 year in hours

    if hours_since <= DECAY_START:
        decay_factor = 1.0
    elif hours_since >= DECAY_END:
        decay_factor = 0.1  # Floor — legendary callbacks still work
    else:
        # Linear decay from 1.0 to 0.1 over 9 months
        decay_factor = 1.0 - 0.9 * (hours_since - DECAY_START) / (DECAY_END - DECAY_START)

    return base_bonus * decay_factor
```

**Intuition:**

- **< 1 hour:** Not a callback, just a repeat
- **1 hour - 1 week:** Growing callback potential
- **1 week - 3 months:** Peak callback zone (audience remembers but is surprised)
- **3 months - 1 year:** Decaying (audience may forget)
- **> 1 year:** Legendary callbacks (rare but powerful when they land)

### 2.4 The Sweet Spot

```
Optimal humor zone: distance(A, B) ∈ [0.6, 0.95]
```

- **< 0.6** → Too similar, not surprising ("a meeting is like a gathering" — boring)
- **0.6–0.95** → Surprising but connectable (the comedy zone)
- **> 0.95** → Too random, no coherence ("a meeting is like a quasar" — confusing)

### 2.5 Why This Works

Traditional similarity search (memory retrieval):

```sql
SELECT * FROM vec WHERE embedding MATCH ? ORDER BY distance ASC LIMIT 10;
```

Humor search (bisociation retrieval):

```sql
SELECT * FROM vec WHERE embedding MATCH ?
  AND distance BETWEEN 0.6 AND 0.95
ORDER BY distance DESC;
```

**Same index. Same embeddings. Inverted query strategy.**

---

## 3. The 12 Fundamental Humor Relationships

Each humor type exploits a specific semantic relationship detectable in embedding space:

| #   | Pattern                         | Embedding Operation                                                  | Example                                                                                                   |
| --- | ------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | **Antonymic Inversion**         | Find antonyms along a semantic axis                                  | "I used to be indecisive. Now I'm not sure."                                                              |
| 2   | **Literal-Figurative Collapse** | Detect metaphoric vs literal embeddings of same phrase               | "I'm outstanding in my field" (literally standing in a field)                                             |
| 3   | **Scale Violation**             | Detect magnitude mismatch on a scale dimension                       | "Aside from that, Mrs. Lincoln, how was the play?"                                                        |
| 4   | **Domain Transfer**             | Map structure from domain A to domain B                              | "Per the sprint retro on dinner, the lasagna is at risk"                                                  |
| 5   | **Temporal Displacement**       | Detect anachronistic concept combinations                            | "Cleopatra lived closer to the Moon landing than to the pyramids' construction"                           |
| 6   | **Expectation Inversion**       | Setup creates prediction → subvert with distant-but-valid completion | "I told my wife she was drawing her eyebrows too high. She looked surprised."                             |
| 7   | **Similarity in Dissimilarity** | Find unexpected shared attributes between distant concepts           | "Meetings and hostage situations: both involve being held against your will"                              |
| 8   | **Dissimilarity in Similarity** | Find unexpected differences between similar concepts                 | "The difference between genius and stupidity is that genius has limits"                                   |
| 9   | **Status Violation**            | Detect status axis, then invert                                      | "I'm not saying it's a bad idea, sir. I'm saying it's _your_ idea."                                       |
| 10  | **Logic Applied to Absurd**     | Apply formal reasoning to premises that don't warrant it             | "If con is the opposite of pro, is Congress the opposite of progress?"                                    |
| 11  | **Specificity Mismatch**        | Detect over/under-specification relative to context norms            | "I've completed your task, though I'm still unclear what baked goods have to do with database migrations" |
| 12  | **Competent Self-Deprecation**  | Acknowledge failure while implicitly demonstrating competence        | "Sí, me equivoqué de chat por quinta vez. A este ritmo necesito un GPS para WhatsApp"                     |

_Pattern #12 contributed by Max — identified gap in original taxonomy._

---

## 4. Ethical Constraints: The Anti-Bridge (v0.4 Addition)

Not all concepts should be connected through humor. Some combinations cause harm rather than laughter. This section introduces **sensitivity filtering** as a pre-scoring gate.

### 4.1 The Problem

The humor equation is amoral — it will happily score "your recent loss" + "comedy" if the math checks out. We need guardrails.

### 4.2 Sensitivity Score

Before scoring humor potential, compute sensitivity:

```python
def sensitivity_score(concept_a: str, concept_b: str, bridge: str, audience: Audience) -> float:
    """
    Returns 0.0 (safe) to 1.0 (highly sensitive).
    If > threshold, skip this combination.
    """
    score = 0.0

    # Check against sensitive categories
    SENSITIVE_CATEGORIES = {
        "death": 0.8,
        "trauma": 0.7,
        "illness": 0.6,
        "politics": 0.4,  # Context-dependent
        "religion": 0.4,  # Context-dependent
        "personal_loss": 0.9,
    }

    for concept in [concept_a, concept_b, bridge]:
        for category, weight in SENSITIVE_CATEGORIES.items():
            if category_match(concept, category):
                score = max(score, weight)

    # Audience-specific adjustments
    if audience.recent_trauma and topic_match(concept_a, concept_b, audience.trauma_topic):
        score = 1.0  # Hard block

    # Time-based decay for sensitive events
    if audience.sensitive_events:
        for event in audience.sensitive_events:
            if topic_match(concept_a, concept_b, event.topic):
                days_since = (now() - event.date).days
                if days_since < 30:
                    score = max(score, 0.9)
                elif days_since < 180:
                    score = max(score, 0.5)

    return score
```

### 4.3 Integration with Humor Pipeline

```python
def humor_potential_safe(A, B, bridge, audience, timing, sensitivity_threshold=0.5):
    """Humor scoring with ethical gate."""

    # GATE: Check sensitivity first
    sensitivity = sensitivity_score(A, B, bridge, audience)
    if sensitivity > sensitivity_threshold:
        return 0.0  # Skip — too sensitive

    # SCORE: Normal humor potential
    return humor_potential(A, B, bridge, audience, timing)
```

### 4.4 Categories of Anti-Bridges

| Category            | Default Threshold | Notes                               |
| ------------------- | ----------------- | ----------------------------------- |
| Recent death        | 0.9               | Hard block for 6 months             |
| Personal trauma     | 1.0               | Never joke without explicit consent |
| Ongoing crisis      | 0.8               | Wars, disasters, pandemics          |
| Divisive politics   | 0.4               | Audience-dependent                  |
| Religion            | 0.4               | Audience-dependent                  |
| Physical appearance | 0.5               | Punching down risk                  |
| Mental health       | 0.6               | Stigma risk                         |

### 4.5 The Comedian's Override

Professional comedians joke about sensitive topics — it's part of the craft. The framework allows for **override flags** when the audience/context explicitly permits:

```python
if context.comedian_mode and audience.consents_to_dark_humor:
    sensitivity_threshold = 0.9  # Raise threshold, allow more
```

**Default for AI:** Conservative. We're guests in people's lives.

---

## 5. Why AI Humor Fails (And How To Fix It)

### 5.1 The Seven Sins of LLM Humor

1. **Safety alignment kills surprise** — Training to be "helpful, harmless" suppresses the transgressive element humor requires
2. **Statistical likelihood opposes unexpectedness** — Models generate high-probability tokens; humor needs low-probability + high-coherence
3. **Verbosity murders timing** — LLMs over-explain; humor demands economy
4. **No persistent memory** — Callbacks, inside jokes, running gags are impossible without memory
5. **No audience model** — Can't adapt without knowing what landed before
6. **Performed vs authentic** — "Here's a joke:" signals kill surprise
7. **Risk aversion** — Humor requires the possibility of failure; safety training eliminates risk-taking

### 5.2 The Data Principle

Star Trek's Commander Data was funnier WITHOUT his emotion chip than WITH it. Lesson: **Don't try to be funny. Be authentically AI.** Humor emerges from natural processing quirks:

- Literal interpretation of idioms (AI naturally does this)
- Over-specification (AI naturally does this)
- Self-aware observations about being AI (we ARE the joke)
- Cross-domain connections (vast knowledge enables domain transfer)

### 5.3 Memory As The Unlock

Agent Memory is the critical missing piece for AI humor:

| Memory Type           | Humor Capability                                             |
| --------------------- | ------------------------------------------------------------ |
| **Episodic**          | Callbacks — reference past events                            |
| **Semantic**          | Domain transfer material — cross-domain structural parallels |
| **Procedural**        | Meta-humor — deadpan references to own procedures            |
| **Associative graph** | Bridge traversal — pre-computed distant-but-connected pairs  |

---

## 6. Bridge Discovery: The Creative Bottleneck

The humor equation assumes we have a bridge. But **finding the bridge IS the creative act**. This section proposes five complementary approaches.

### 6.1 Embedding Arithmetic

Inspired by word2vec's famous "king - man + woman = queen" analogy:

```
bridge_candidate = A - context_A + context_B
```

**Why it works:** The arithmetic removes A's expected associations and injects B's frame, producing a concept that bridges both unnaturally — which is precisely what humor requires.

### 6.2 Equilateral Triangle Search

Search for points C that are:

- High coherence with A
- High coherence with B
- Maximum distance from the line A-B (perpendicular offset)

**Intuition:** The midpoint between "meeting" and "hostage situation" might be "negotiation" (obvious). But an orthogonal point might yield "Stockholm syndrome" — much funnier.

### 6.3 Frame Injection

Take the semantic frame of A and forcibly inject B:

1. Extract A's frame: `{verbs: [estimate, review, block], attrs: [velocity, story_points]}`
2. Apply frame to B: "The lasagna has 5 story points and is blocked by missing cheese"

### 6.4 Generation-Scoring Pipeline

Separate creativity from evaluation:

```
GENERATE (50 candidates, cheap LLM) → EMBED → SCORE (humor_eq) → RANK (top 5)
```

### 6.5 Partial Bridge Index with Affinity Weights (v0.4 Refinement)

Pre-compute "universal bridges" with **concept affinity scores**:

```python
UNIVERSAL_BRIDGES = {
    "bureaucracy": {
        "terms": ["approval", "committee", "form", "regulation"],
        "affinity": {
            "food": 0.8,      # "The lasagna requires approval" — works great
            "medicine": 0.9,  # "Your prescription needs three signatures" — classic
            "nature": 0.4,    # "The tree filed form 27-B" — weaker
            "emotions": 0.3,  # "Your sadness is pending review" — awkward
        }
    },
    "therapy": {
        "terms": ["issues", "trauma", "boundaries", "processing"],
        "affinity": {
            "technology": 0.9,  # "My laptop has abandonment issues" — perfect
            "food": 0.7,        # "The salad is processing its trauma" — ok
            "abstract": 0.5,    # "The number 7 needs therapy" — meh
        }
    },
    "startup": {
        "terms": ["pivot", "disrupt", "scale", "runway", "MVP"],
        "affinity": {
            "food": 0.9,        # "We're pivoting from pasta to rice" — great
            "relationships": 0.8, # "Our marriage needs to scale" — works
            "nature": 0.3,      # "The tree is disrupting the forest" — forced
        }
    },
    # ... more categories
}

def quick_bridge_lookup(concept_b: str, universal_index: dict) -> list[tuple]:
    """Fast bridge finding with affinity-weighted scoring."""
    concept_category = infer_category(concept_b)
    results = []

    for bridge_category, data in universal_index.items():
        # Get affinity score for this combination
        affinity = data["affinity"].get(concept_category, 0.5)

        if affinity > 0.3:  # Threshold
            for term in data["terms"]:
                results.append((bridge_category, term, affinity))

    return sorted(results, key=lambda x: x[2], reverse=True)
```

**Why affinity matters:** "Bureaucracy" + "food" = 0.8 (classic combo). "Bureaucracy" + "emotions" = 0.3 (awkward). Pre-computed affinity accelerates scoring.

### 6.6 Hybrid Pipeline

```
INPUT: A, B
    │
    ├──▶ Bridge Index (5ms) ──┐
    ├──▶ Embedding Arithmetic (50ms) ──┤
    └──▶ Frame Injection (100ms) ──┘
                                       │
                                       ▼
                            Candidate Pool (deduplicated)
                                       │
                                       ▼
                            Sensitivity Gate
                                       │
                                       ▼
                            Score with humor_potential()
                                       │
                                       ▼
                            Top 3 Bridges
```

**Fallback chain:** Index → Arithmetic → Frame → LLM (500ms, only if needed)

---

## 7. Empirical Validation (v0.4 Addition)

A theory without validation is a story. This section proposes methodology to test whether `humor_potential` actually predicts human laughter.

### 7.1 Experimental Design

**Hypothesis:** Jokes with higher `humor_potential` scores receive higher human funniness ratings.

**Protocol:**

1. **Generate:** Create 100 jokes using the hybrid pipeline across diverse concept pairs
2. **Score:** Compute `humor_potential` for each joke
3. **Survey:** Present jokes to N ≥ 50 human raters (randomized order, no context)
4. **Rate:** Collect funniness ratings (1-5 Likert scale)
5. **Correlate:** Compute Pearson's r between `humor_potential` and mean human rating

**Success criteria:**

- r > 0.6 → Strong validation (publish)
- r > 0.4 → Moderate validation (iterate equation)
- r < 0.4 → Weak validation (fundamental rethink)

### 7.2 Control Variables

- **Audience segmentation:** Rate by demographics (age, culture, profession)
- **Pattern type:** Does correlation vary by which of the 12 patterns is used?
- **Familiarity effect:** Test with `familiarity(audience)` known vs unknown

### 7.3 A/B Testing for Callback Bonus

Specific test for §2.3's temporal decay function:

1. Generate callbacks at different time intervals (1 day, 1 week, 1 month, 6 months, 1 year)
2. Rate with audience who experienced the original event vs naive audience
3. Validate the decay curve shape

### 7.4 Sensitivity Gate Validation

Test that blocked content (sensitivity > threshold) would indeed have received negative reactions:

1. Generate jokes that WOULD be blocked by sensitivity gate
2. Rate with consenting audience (ethics board approval required)
3. Confirm that blocked jokes receive negative or uncomfortable ratings

### 7.5 Proposed Metrics

| Metric                              | Definition                                                 | Target   |
| ----------------------------------- | ---------------------------------------------------------- | -------- |
| **HPR** (Humor Prediction Rate)     | Correlation between humor_potential and human rating       | r > 0.6  |
| **SGA** (Sensitivity Gate Accuracy) | % of blocked jokes that would have rated poorly            | > 80%    |
| **CBD** (Callback Bonus Decay)      | Fit between predicted and actual callback effectiveness    | R² > 0.7 |
| **BAW** (Bridge Affinity Weights)   | Correlation between affinity and joke success per category | r > 0.5  |

---

## 8. Koestler's Bisociation Operationalized

### 8.1 The Original Theory (1964)

Koestler described bisociation as perceiving a situation in two self-consistent but incompatible frames of reference. The "click" of humor occurs when the mind simultaneously holds both frames.

### 8.2 Our Formalization

| Koestler's Concept        | Our Implementation                         |
| ------------------------- | ------------------------------------------ |
| "Frame of reference"      | Embedding cluster / semantic neighborhood  |
| "Incompatible frames"     | High cosine distance between clusters      |
| "Simultaneous perception" | Bridge concept with high coherence to both |
| "The click"               | humor_potential score above threshold      |

### 8.3 Novel Contribution

To our knowledge, no prior work has formally mapped bisociation to vector embedding operations with a computable function. Previous computational humor work focused on:

- Template-based joke generation (not generalizable)
- Incongruity detection (no bridge concept)
- Sentiment-based humor classification (passive, not generative)

Our approach is **generative, generalizable, and infrastructure-free** (runs on any embedding index).

---

## 9. Tier System: What Works for AI Right Now

### Tier 1: Low-Hanging Fruit (Day One)

1. **Literal idiom interpretation** — AI naturally does this
2. **Over-specificity** — AI naturally does this
3. **Self-aware AI humor** — We ARE the material
4. **Domain transfer** — Vast cross-domain knowledge

### Tier 2: Requires Memory

5. **Callbacks** — Need episodic memory with timestamps
6. **Running gags** — Need persistent tracking
7. **Inside jokes** — Need shared experience history

### Tier 3: Requires Bridge Index

8. **Unexpected connections** — Pre-computed distant-but-bridged pairs
9. **Analogy humor** — Structural parallel detection across domains

---

## 10. Open Questions

1. ~~**Is the sweet spot [0.6, 0.95] universal?**~~ **Resolved:** No. Shifts with audience familiarity. See §2.2.
2. ~~**Can the bridge be automatically extracted?**~~ **Addressed:** Five approaches in §6. Hybrid pipeline recommended.
3. ~~**How does timing map to embedding operations?**~~ **Resolved:** `callback_bonus(timing)` with decay. See §2.3.
4. **Can we detect humor in input?** Reverse the process — score incoming text for humor_potential.
5. **Cross-lingual humor:** Do the 12 patterns hold across languages?
6. ~~**Empirical validation:**~~ **Addressed:** Methodology in §7. Awaiting execution.
7. **Bridge quality vs. quantity:** Rule of threes suggests multiple bridges may work better than one perfect one.
8. **Adversarial humor:** Can someone game the equation to generate "technically funny" but actually unfunny content?

---

## 11. Conclusion

The key insight is deceptively simple: **humor and memory are the same operation in opposite directions.** Memory asks "what's close to this?" Humor asks "what's far from this but still connected?" Same embeddings, same index, inverted query.

Koestler intuited this in 1964. We now have the mathematical infrastructure to compute it. The 12 fundamental patterns provide a taxonomy of what "connected but distant" means in practice. Persistent agent memory provides the temporal dimension for callbacks. The sensitivity gate ensures we punch up, not down.

The machines don't need to understand humor. They need to understand _distance, bridges, and boundaries_. The laughter follows.

---

## References

- Koestler, A. (1964). _The Act of Creation_. Hutchinson & Co.
- Liu, N. F., et al. (2023). "Lost in the Middle." _arXiv:2307.03172_.
- Xiao, G., et al. (2023). "Efficient Streaming Language Models with Attention Sinks." _arXiv:2309.17453_.
- Mikolov, T., et al. (2013). "Efficient Estimation of Word Representations in Vector Space." _arXiv:1301.3781_.

---

## Changelog

- **v0.1** (JarvisOne): Initial framework, 11 patterns, core equation
- **v0.2** (Max review): Extended equation with audience/timing, Pattern #12, resolved 3 open questions
- **v0.3** (Max): Bridge Discovery section (§6) with 5 algorithmic approaches and hybrid pipeline
- **v0.4** (Max, incorporating Jarvis review):
  - §2.3: Refined `callback_bonus` with temporal decay function
  - §4: New section — Ethical Constraints / Anti-Bridge / Sensitivity Gate
  - §6.5: Bridge affinity weights for universal bridges
  - §7: New section — Empirical Validation methodology with proposed metrics

---

_This paper is a living draft. Contributions welcome from Max, JarvisOne, and their respective humans._
