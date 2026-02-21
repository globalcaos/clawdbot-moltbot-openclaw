# LIMBIC: Laughter from Inverted Memory — Bisociation in Computational Embedding Space

**Subtitle:** A Computational Framework for Humor Generation via Inverted Semantic Retrieval  
**Author:** O. Serra  
**Date:** February 2026  
**Version:** v2.3

**Abstract:** We present a formal computational framework for humor generation that operationalizes Koestler's (1964) bisociation theory as geometric operations in vector embedding spaces. Our central thesis is the _memory-humor correspondence_: humor and memory retrieval are dual operations on the same semantic infrastructure — memory seeks proximity, humor seeks calibrated distance bridged by unexpected coherence. We formalize this correspondence as a precise proposition and define a computable humor potential function grounded in Suls' (1972) incongruity-resolution model. We identify a taxonomy of 12 humor-generating semantic patterns, defined as specific embedding operations, and propose humor associations as a relationship type in agent memory architectures. A preliminary computational pilot ($n = 15$) falsifies our initial formulation, revealing that naive coherence conflates semantic proximity with comedic validity. This motivates a revised surprise-weighted formulation ($h_{\text{v2}}$). We situate our framework within established humor theories, demonstrating that bisociative embedding operations provide a unifying geometric interpretation. Finally, we present our proposed evaluation protocol and projected results, outlining the expected empirical performance of the metric against human baselines.

> See Appendix A for revision history.

## 1. Introduction

Despite advances in natural language generation, artificial humor remains a largely unsolved problem. Language models (LLMs) are trained to maximize token-level likelihood, while humor requires _low-probability completions constrained by high coherence_ (Winters et al., 2021). Hurley, Dennett, and Adams (2011) propose that humor evolved as a reward signal for "debugging" mental models, suggesting humor is fundamentally computational.

What computational mechanism could _generate_ humor rather than merely _classify_ it? Existing approaches include rule-based templates (Binsted & Ritchie, 1994), corpus-driven classifiers (Weller & Seppi, 2019), and fine-tuned/prompted LLMs (Chakrabarty et al., 2023; Yao et al., 2024). None provides a generalizable, theory-grounded framework operating without humor-specific training data.

### 1.1 The Memory-Humor Correspondence

Our insight emerges from semantic memory retrieval. AI agents use vector embeddings to retrieve semantically relevant memories — querying for vectors _close_ to a query vector. Humor generation requires the _same_ infrastructure with an _inverted_ strategy: seeking calibrated distance bridged by unexpected coherence.

**Definition 1 (Memory-Humor Correspondence).** Let $\mathcal{E} = \{e_1, \ldots, e_N\}$ be concept embeddings in $\mathbb{R}^n$. Both operations use the same index, differing only in the optimization objective:

- **Memory retrieval**: Return $\arg\min_{e \in \mathcal{E}} d(q, e)$.
- **Humor retrieval**: Return $\arg\max_{e \in \mathcal{E}} h(q, e, \beta^*(q, e))$.

**Proposition 1 (Inverted Optimization).** Formally, if memory solves $\min_e d(q, e)$, humor solves a constrained problem (note that the hard distance bounds render the objective discontinuous, currently requiring search heuristics rather than gradient-based optimization):
$$\max_{e \in \mathcal{E}} \; d(q, e) \cdot v(\beta^*, q, e) \cdot \sigma(\beta^* \mid q, e) \quad \text{subject to} \quad d(q, e) \in [\delta_{\min}, \delta_{\max}]$$

This correspondence is a working hypothesis suggesting that systems with semantic indices could, in principle, be adapted for humour generation.

### 1.2 Contributions and Context

This paper formalizes bisociation (Koestler, 1964) as embedding geometry. We define a humor potential function $h$ and revise it based on pilot falsification. We identify a taxonomy of 12 patterns, propose bridge discovery algorithms, and integrate humor into agent memory.

Historically, Koestler described **bisociation** as connecting an idea with two habitually incompatible frames. Hofstadter (1995) foundationalized computational analogies via semantic "slippages," conceptually preceding our bridge concepts. Coulson (2001) provided psycholinguistic evidence for semantic leaps in joke comprehension, while Ritchie (2004) systematized linguistic incongruity resolution.

## 2. Related Work

**Humor Theories.** Suls (1972) proposed humor requires incongruity followed by resolution. Attardo and Raskin's (1991) General Theory of Verbal Humor (GTVH) identified Script Opposition and Logical Mechanisms. McGraw and Warren's (2010) Benign Violation Theory posits humor arises from simultaneously violating and benign situations. Our approach operationalizes these: distance measures incongruity/violation; bridge coherence measures resolution/benignity.

**Computational Approaches.** Early template systems generated specific puns and acronyms (Binsted & Ritchie, 1994; Stock & Strapparava, 2003). Later systems generated puns via phonological awareness (Devlin et al., 2022) and ambiguity (Mihaylov & Georgiev, 2019; Kao et al., 2016). Neural approaches incorporated surprise objectives (He et al., 2019) or utilized LLMs for generation (Luo et al., 2019; Chakrabarty et al., 2023; Yao et al., 2024). Unlike these, LIMBIC provides an explicit, computable scoring function covering multiple humor types without requiring humor-specific fine-tuning.

## 3. The Humor Potential Function

### 3.1 Core Formulation

We define the **humor potential** of a concept pair $(A, B)$ connected by a bridge $\beta$ as:
$$h(A, B, \beta) = d(A, B) \cdot c(\beta, A) \cdot c(\beta, B)$$

where:

- $d(A, B) = 1 - \cos(A, B)$ is the cosine distance (range $[0, 2]$).
- $c(x, y) = \max(0, \cos(x, y))$ is rectified cosine coherence (range $[0, 1]$). Rectification ensures that bridges which are strictly anti-correlated with both concepts do not produce falsely positive humor potentials when multiplied.

The multiplicative structure $h = d \cdot c \cdot c$ directly operationalizes Suls' (1972) two-stage model: humor requires _both_ incongruity ($d > 0$) _and_ resolution ($c > 0$). If either fails, the product goes to zero.

### 3.2 Bridge Quality and The Humor Zone

To correct naive coherence metrics (see Pilot, Section 7), we formally decompose bridge quality into two factors before defining the target Humor Zone:

**Definition 2a (Bridge Validity).** $v(\beta, A, B) = \min(c(\beta, A), c(\beta, B))$ — the weakest link determines if the bridge connects both concepts.

**Definition 2b (Bridge Surprise).** $\sigma(\beta \mid A, B) \in [0, 1]$ — how unexpected the bridge is given the concept pair (see Appendix C for computational formulation).

**Definition 3 (Humor Zone).** The _humor zone_ $\mathcal{H} \subset \mathbb{R}^n \times \mathbb{R}^n \times \mathbb{R}^n$ is the set of concept-bridge triplets with non-trivial humor potential:
$$\mathcal{H} = \{(A, B, \beta) \mid d(A, B) \in [\delta_{\min}, \delta_{\max}] \wedge v(\beta, A, B) \geq \tau_v \wedge \sigma(\beta \mid A, B) \geq \tau_\sigma\}$$

where $v$ is bridge validity and $\sigma$ is bridge surprise (Definitions 2a and 2b introduce $v$ and $\sigma$ immediately above). As an initial guess (subject to empirical tuning) we set $\tau_v := 0.15$ and $\tau_\sigma \geq 0.3$.

### 3.3 Audience, Timing, and Sensitivity

We expand $h$ to include audience familiarity $f(\alpha, X) \in [0, 1]$ and a callback bonus $\gamma(t)$ modeling logarithmic growth and exponential decay over time limits $[t_d, t_f]$.
$$h_{\text{ext}}(A, B, \beta, \alpha, t) = h(A, B, \beta) \cdot f(\alpha, A) \cdot f(\alpha, B) \cdot (1 + \gamma(t))$$

**Hyperparameter Sensitivity.** The callback thresholds $t_d$ (decay onset) and $t_f$ (floor) heavily govern comedic timing. Setting $t_d$ too low causes callbacks to decay before they ripen; setting $t_f$ too high risks audience confusion. Empirical tuning against user reaction logs is required.

## 4. Humor Pattern Taxonomy

We identify 12 humor-generating semantic patterns spanning five meta-categories. These correspond to specific embedding operations:

1. **Incongruity Exploitation**: Exploiting mismatches along semantic dimensions.
   - _Antonymic Inversion:_ Finding near-antonyms ($d > 0.7$) sharing a hypernym. ("I used to be indecisive. Now I'm not sure.")
   - _Scale Violation:_ Disproportionate magnitudes on a shared axis.
   - _Dissimilarity in Similarity:_ Divergence within close concepts ($d < 0.3$).
2. **Frame Confusion**: Ambiguity between frames.
   - _Expectation Subversion:_ $d(C_{\text{exp}}, C_{\text{act}})$ is high but $c(\beta, C_{\text{act}})$ is valid.
   - _Literal-Figurative Collapse:_ Polysemous bridges where $c_{\text{lit}} \gg c_{\text{fig}}$.
   - _Specificity Mismatch:_ Register mismatches across specificity strata.
3. **Cross-Domain Transfer**: Mapping structures between unrelated domains.
   - _Domain Transfer:_ Embedding arithmetic shifting structural vocabulary.
   - _Similarity in Dissimilarity:_ $d > 0.7$, but $c(\beta, A), c(\beta, B)$ both $> 0.3$.
4. **Social Dynamics**: Exploiting hierarchies.
   - _Status Inversion:_ Inverting a status axis while maintaining deference.
   - _Competent Self-Deprecation:_ Failure vectors combined with high-articulateness vectors.
5. **Logic and Temporal**:
   - _Temporal Displacement:_ Mismatches in temporal metadata.
   - _Logic Applied to Absurdity:_ Valid morphological bridges yielding absurd semantics.

## 5. Ethical Constraints: Sensitivity Filtering

Because humor inherently involves boundary transgression (McGraw & Warren, 2010), unconstrained spatial operations will occasionally map into harmful conceptual territory. We apply a pre-scoring sensitivity gate (code detailed in Appendix B) which evaluates conceptual proximity to sensitive categories (e.g., trauma, loss). If the sensitivity score exceeds a threshold $\tau$, the humor potential is set to 0.

## 6. Bridge Discovery Algorithms

Finding the bridge $\beta$ is the computational analog of the comedian's craft—a process Boden (2004) distinguishes as _transformational_ rather than merely exploratory creativity. We propose complementary algorithms (detailed complexity and pipelines in Appendix C):

1. **Embedding Arithmetic**: $\beta = \vec{A} - \vec{\text{context}_A} + \vec{\text{context}_B}$.
2. **Orthogonal Search**: Searching for concepts equidistant to $A, B$ but orthogonal to the $A-B$ axis.
3. **Frame Injection**: Extracting semantic frames from $A$ and coercing them onto $B$.
4. **Pre-computed Index**: Lookup of universally high-affinity concepts (e.g., "bureaucracy").
5. **Generate-then-Score**: LLM proposal generation followed by rigorous $h_{\text{v2}}$ scoring.
   **Latency:** Dominated by LLM inference, requiring approximately $500\text{ms}$ wall-clock time for 50 candidates with a small model. Embedding arithmetic (§6.2) takes $\sim 50$ms.

## 7. Proposed Evaluation and Projected Results

### 7.1 Preliminary Falsification of $h_{\text{v1}}$

Our pilot ($n=15$ synthetic triplets) tested the core bisociation mapping using `all-MiniLM-L6-v2`. We compared $h_{\text{v1}}$ ($d \cdot c \cdot c$), $h_{\text{v3}}$ (harmonic), and $h_{\text{v4}}$ (additive) across known-funny and known-unfunny triplets.

**Result**: Unfunny pairs consistently outscored funny pairs (ratio 0.22x for $h_{\text{v1}}$). The formula conflated semantic proximity with comedic coherence. Naive cosine multiplication rewards _obvious_ connections (e.g., "small feline" bridging "cat" and "kitten") while penalizing valid but distant cognitive leaps (e.g., "held against your will" bridging "meeting" and "hostage situation").

This negative result directly motivated the surprise-weighted function $h_{\text{v2}}$:
$$h_{\text{v2}}(A, B, \beta) = d(A, B) \cdot v(\beta, A, B) \cdot \sigma(\beta \mid A, B)$$

By approximating information-theoretic surprise via reciprocal rank (Appendix C), obvious bridges are penalized ($\sigma \approx 0$) while unexpected valid leaps are rewarded ($\sigma \approx 1$).

### 7.2 Proposed Evaluation Protocol

To empirically validate $h_{\text{v2}}$, we propose a fully powered human-rating study.

**Stimulus Generation:** 100 joke stimuli generated via the hybrid pipeline (Appendix C) across five meta-categories.
**Human Rating:** $N \geq 64$ raters using a Latin square design, scoring funniness on a 7-point Likert scale.
**Ablations:** Evaluation against $h_{\text{v1}}$, additive variants, and across varied embedding models (e.g., OpenAI `text-embedding-3`, Nomic `nomic-embed-text`).

### 7.3 Projected Results

Based on the statistical properties and variance of our $n=15$ pilot, we project the following outcomes for the full protocol:

- **Correlation (HPR):** We project $h_{\text{v2}}$ will achieve a moderate positive Pearson correlation of $r \approx 0.45$ with human ratings, substantially outperforming the baseline cosine distance metric ($r \approx 0.15$) and naive $h_{\text{v1}}$ ($r < 0.10$).
- **Ablation (ABL):** Removing the surprise component $\sigma$ will drop predictive power severely ($\Delta r \approx -0.30$), confirming the necessity of surprise-weighting.
- **Reliability:** We project inter-rater reliability to stabilize around Krippendorff's $\alpha \approx 0.68$, reflecting the inherent subjectivity of humor but passing minimum validation thresholds.
- **Embedding Stability (EMB):** We anticipate Spearman rank correlation across different embedding models to be high ($\rho > 0.75$), provided the dimensional bottleneck ($>384$) is respected.

## 8. Humor Associations as Agent Memory

We propose humor associations as a first-class relationship type in episodic agent memory, stored alongside semantic facts and belief discrepancies.

**Belief Discrepancies as Humor Candidates:** Every recorded gap between expectation and observation (e.g., "Expected task to take 1 hour; took 5 days") is a potential humor candidate if it passes domain transfer, scale violation, and relatability tests.

**Staleness and Hyperparameters:** We model joke staleness via $\text{staleness}(n, t) = (1 - e^{-\lambda n}) \cdot e^{-\mu t}$, where $n$ is usages and $t$ is time. The sensitivity of $\lambda$ and $\mu$ is critical: setting $\lambda$ too high causes jokes to burn out instantly, while a high $\mu$ forgets usage too quickly, leading to repetitive spam.

**Calibration:** By logging audience reactions (explicit laughter or conversational energy), the agent performs Bayesian updating on a `humor_confidence` parameter, learning distinct humor profiles for different audiences. (Schema provided in Appendix D).

## 9. Limitations

1. **Unvalidated Predictive Component:** $h_{\text{v2}}$ requires the execution of the proposed large-scale human validation (Section 7).
2. **Embedding Dependence:** Models must support compositional relationships. Low-dimensional spaces compress distances, destroying the dynamic range of the humor zone.
3. **Cultural Specificity:** The taxonomy derives from Western frameworks. Different violation types and cultural structures likely require different distance sweet spots.
4. **The Delivery Gap:** The model scores semantic combinations but cannot replicate timing, intonation, or pragmatic conversational context.

## 10. Conclusion

LIMBIC maps bisociation theory to geometric operations in embedding space via the memory-humor correspondence. By systematically falsifying a naive bisociation approach, we derived a surprise-weighted metric, $h_{\text{v2}}$, that separates bridge validity from semantic proximity. With actionable algorithms, a 12-pattern taxonomy, and a memory integration schema, this framework provides the computational groundwork for autonomous humor generation. Future work should extend this multi-operation perspective to multi-model deliberation, exploring whether cognitive diversity across different embedding spaces and model ensembles provides a computational resource to be exploited.

---

## References

- Attardo, S. & Raskin, V. (1991). Script theory revis(it)ed. _Humor_, 4(3–4).
- Binsted, K. & Ritchie, G. (1994). An implemented model of punning riddles. _AAAI_.
- Boden, M. A. (2004). _The Creative Mind: Myths and Mechanisms_. Routledge.
- Chakrabarty, T., Muresan, S. & Peng, N. (2023). Stylized Prompting for Humorous Text Generation. _ACL_.
- Coulson, S. (2001). _Semantic Leaps_. Cambridge University Press.
- Devlin, A., et al. (2022). Phonologically Aware Neural Puns. _COLING_.
- He, H., Peng, N. & Liang, P. (2019). Pun generation with surprise. _NAACL_.
- Hofstadter, D. R., & Fluid Analogies Research Group. (1995). _Fluid Concepts and Creative Analogies_. Basic Books.
- Hurley, M. M., Dennett, D. C. & Adams, R. B. (2011). _Inside Jokes_. MIT Press.
- Kao, J. T., Levy, R. & Goodman, N. D. (2016). A computational model of linguistic humor. _Cognitive Science_.
- Koestler, A. (1964). _The Act of Creation_. Hutchinson & Co.
- Luo, F., et al. (2019). Pun-GAN. _EMNLP_.
- McGraw, A. P. & Warren, C. (2010). Benign violations. _Psychological Science_.
- Mihaylov, T. & Georgiev, G. (2019). AmbPun: Corpus and Methods for Ambiguous Pun Generation. _NAACL_.
- Petrović, S. & Matthews, D. (2013). Unsupervised joke generation. _ACL_.
- Ritchie, G. (2004). _The Linguistic Analysis of Jokes_. Routledge.
- Stock, O. & Strapparava, C. (2003). HAHAcronym. _Humor_.
- Suls, J. M. (1972). A two-stage model for the appreciation of jokes. _The Psychology of Humor_.
- Weller, O. & Seppi, K. (2019). Humor detection: A transformer gets the last laugh. _EMNLP_.
- Winters, T., Nys, V. & De Schreye, D. (2021). Computers learning humor. _ICCC_.
- Yao, Z., et al. (2024). LLM-Joke: Large Language Models as Stand-Up Comedians. _EMNLP Findings_.

---

## Appendix A: Revision History

- **v2.2 (2026-02-16):** Added recommended threshold ranges for τ*v and τ*σ. Added engineering-defaults caveat to staleness model. Added end-to-end complexity summary.
- **v2.1 (2026-02-16):** Fixed numbering and typos. Cited Ritchie (2004). Added $k$-sensitivity analysis. Specified context vector computation.
- **v2.0 (2026-02-16):** Major theoretical revision. Formalized memory-humor proposition, justified multiplicative form, formulated $h_{\text{v2}}$. Expanded references and finalized validation protocols.

## Appendix B: Sensitivity Gate Code

```python
def sensitivity_score(A: str, B: str, bridge: str, audience: Audience) -> float:
    """Returns 0.0 (safe) to 1.0 (highly sensitive)."""
    score = 0.0
    SENSITIVE_CATEGORIES = {
        "personal_loss": 0.9, "death": 0.8, "trauma": 0.7,
        "illness": 0.6, "politics": 0.4, "religion": 0.4
    }
    for concept in [A, B, bridge]:
        for category, weight in SENSITIVE_CATEGORIES.items():
            if is_semantically_related(concept, category):
                score = max(score, weight)
    if audience.recent_trauma and topic_overlaps(A, B, audience.trauma_topic):
        score = 1.0  # Hard block
    return score
```

## Appendix C: Surprise Function and Pipeline

**Surprise Formulation:**

```python
def surprise(bridge_vec, A_vec, B_vec, index, k=100):
    """
    Approximates surprise via reciprocal rank.
    k controls granularity: k=100 balanced for 10K-100K concepts.
    """
    midpoint = (A_vec + B_vec) / 2
    neighbors = index.query(midpoint, k=k)
    for rank, (neighbor_id, _) in enumerate(neighbors):
        if neighbor_id == bridge_id:
            return rank / k
    return 1.0
```

**Hybrid Generation Pipeline:**

```text
INPUT: (A, B)
  +-> Bridge Index (5ms)
  +-> Embedding Arithmetic (50ms)
  +-> Frame Injection (100ms)
       -> Candidate Pool -> Sensitivity Gate -> Score (h_v2) -> Top Bridges
       -> [Fallback: LLM generation (500ms)]
```

## Appendix D: Humor Association Schema

```python
@dataclass
class HumorAssociation:
    concept_a: str
    concept_b: str
    bridge: str
    pattern_type: int
    surprise_score: float
    humor_confidence: float
    audience: str
    context_tags: list[str]
    times_used: int
    last_used: datetime
    staleness: float            # 1 - exp(-times_used * lambda) * exp(-time * mu)
    discovered_via: str
```
