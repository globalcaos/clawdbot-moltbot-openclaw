# Deep Dive: Humor — Taxonomy, Mechanics, and Application to AI Agent Memory

**Date:** 2026-02-11  
**Purpose:** Comprehensive research on humor types, generation mechanics, and architectural design for humor-aware AI agents

---

## Part 1: Complete Taxonomy of Humor Types

### Theoretical Foundations

Four major theories explain why things are funny:

1. **Incongruity Theory** — Humor arises from perceiving something that violates mental patterns and expectations (Kant, Schopenhauer, modern cognitive science). The dominant theory.
2. **Superiority Theory** — Laughter comes from feeling superior to others or to a former state of ourselves (Hobbes, Plato).
3. **Relief Theory** — Humor releases built-up nervous energy or tension (Freud, Spencer).
4. **Benign Violation Theory** — Something is funny when it simultaneously violates expectations AND feels safe/benign (McGraw & Warren, 2010). The most modern synthesis.

### 1.1 Wordplay

#### Pun (Homographic)

- **Definition:** Exploiting a word with multiple meanings
- **Mechanism:** Incongruity — brain processes both meanings simultaneously, the unexpected one creates surprise
- **Structure:** Setup establishes meaning A → punchline reveals meaning B was intended
- **Example:** "I used to be a banker, but I lost interest."
- **Generation recipe:** When a word in conversation has dual meanings, construct a sentence where the secondary meaning creates absurdity. Look for: professions, actions, objects with homonyms.
- **AI difficulty:** **Easy** — pattern-matchable, dictionary-driven. LLMs already do this reasonably well.

#### Pun (Heterographic/Phonetic)

- **Definition:** Exploiting words that sound alike but differ in spelling/meaning
- **Mechanism:** Phonetic similarity triggers dual processing
- **Structure:** Sound-alike substitution in a known phrase
- **Example:** "I'm reading a book about anti-gravity. It's impossible to put down."
- **Generation recipe:** Find phrases where a word can be swapped for a near-homophone that changes meaning entirely.
- **AI difficulty:** **Easy-Medium** — requires phonetic awareness, which LLMs have somewhat.

#### Double Entendre

- **Definition:** A phrase with two interpretations, one typically risqué
- **Mechanism:** Incongruity + relief (tension of the taboo meaning)
- **Structure:** Innocent surface meaning + suggestive subtext
- **Example:** "That's what she said."
- **Generation recipe:** Identify statements that are perfectly innocent in context but suggestive out of context. Look for: descriptions of physical actions, size, duration, difficulty.
- **AI difficulty:** **Medium** — requires social/sexual context awareness and calibrating appropriateness.

#### Malapropism

- **Definition:** Mistaken use of a similar-sounding word with comic effect
- **Mechanism:** Incongruity + superiority (the speaker is wrong)
- **Structure:** Wrong word sounds close to right word, meaning is absurd
- **Example:** "For all intensive purposes" (intents and purposes) / "He's the pineapple of politeness" (pinnacle)
- **Generation recipe:** Swap a word in a common phrase for a phonetically similar but semantically absurd alternative. Best attributed to a character.
- **AI difficulty:** **Easy** — straightforward substitution.

#### Spoonerism

- **Definition:** Swapping initial sounds of words in a phrase
- **Mechanism:** Incongruity from the resulting absurd/vulgar phrase
- **Structure:** Transpose first letters/sounds → new meaning emerges
- **Example:** "You have hissed all my mystery lectures" (missed all my history lectures)
- **Generation recipe:** Find phrases where swapping initial consonants produces a recognizable (ideally taboo) alternate phrase.
- **AI difficulty:** **Easy** — mechanical transformation.

#### Tom Swifty

- **Definition:** A quote + attribution where the adverb puns on the content
- **Mechanism:** Wordplay tying the manner of speech to the content
- **Structure:** "Quote," Tom said [adverb that puns on the quote]
- **Example:** "I lost my hair," Tom said baldly.
- **Generation recipe:** Start with an adverb that has dual meaning, build a quote whose content matches the literal meaning.
- **AI difficulty:** **Easy** — formulaic structure.

### 1.2 Incongruity-Based Humor

#### Absurdist Humor

- **Definition:** Humor from situations that are illogical, bizarre, or defy rational explanation
- **Mechanism:** Extreme incongruity — the gap between expectation and reality is maximized
- **Structure:** Present a scenario as normal → reveal it's fundamentally insane
- **Example:** "A man walks into a library and asks for books about paranoia. The librarian whispers, 'They're right behind you.'"
- **Generation recipe:** Take a mundane situation, replace one element with something wildly inappropriate but present it with deadpan normalcy. The key is _commitment_ — never acknowledge the absurdity.
- **AI difficulty:** **Medium** — requires understanding what IS normal to violate it effectively.

#### Surreal Humor

- **Definition:** Juxtaposition of unrelated, dreamlike, impossible elements
- **Mechanism:** Incongruity so extreme it bypasses logic entirely, engaging pattern-matching on a different level
- **Structure:** Combine elements that have no logical connection but create an unexpected gestalt
- **Example:** "If you ever drop your keys into a river of molten lava, let 'em go, because man, they're gone." — Jack Handey
- **Generation recipe:** Combine two utterly unrelated domains. Apply practical/mundane logic to an impossible scenario, or impossible logic to a mundane one.
- **AI difficulty:** **Medium-Hard** — requires genuine creativity in unexpected combinations, not just random nonsense.

#### Non-Sequitur

- **Definition:** A conclusion or response that doesn't logically follow from what preceded it
- **Mechanism:** Extreme incongruity — the brain searches for and fails to find the expected connection, which itself becomes funny
- **Structure:** Setup creates expectation → response is completely unrelated
- **Example:** "I haven't slept for ten days, because that would be too long." — Mitch Hedberg
- **Generation recipe:** When someone sets up an expected pattern, deliberately break it with something from a completely different domain. Works best when the non-sequitur has its own internal logic.
- **AI difficulty:** **Hard** — the line between clever non-sequitur and random noise is thin.

#### Anti-Humor

- **Definition:** Humor derived from the deliberate absence of a punchline or the subversion of joke structure itself
- **Mechanism:** Meta-incongruity — the audience expects humor and gets none, which IS the humor
- **Structure:** Setup promises a joke → deliver literal/boring truth instead
- **Example:** "What's brown and sticky? A stick."
- **Generation recipe:** Set up a classic joke structure, then deliver the most literal, obvious, or boring possible answer. The audience's disappointed expectation IS the punchline.
- **AI difficulty:** **Medium** — structurally simple but requires understanding audience expectations deeply.

#### Deadpan

- **Definition:** Delivering absurd content with zero emotional affect or acknowledgment of its absurdity
- **Mechanism:** Incongruity between content (extreme) and delivery (flat)
- **Structure:** Outrageous statement + matter-of-fact tone
- **Example:** "I used to think the brain was the most wonderful organ in my body. Then I realized who was telling me this." — Emo Philips
- **Generation recipe:** In text: state something bizarre as if it were the most natural thing in the world. No exclamation marks, no "lol," no winking. Let the reader discover the absurdity.
- **AI difficulty:** **Medium** — AI naturally writes in a neutral tone, which can actually help. The challenge is choosing _what_ to deadpan.

### 1.3 Superiority-Based Humor

#### Sarcasm

- **Definition:** Saying the opposite of what you mean to mock or convey contempt
- **Mechanism:** Superiority — the speaker positions themselves above the target; incongruity between literal and intended meaning
- **Structure:** Statement whose literal meaning is the opposite of the intended meaning, contextually obvious
- **Example:** "Oh great, another meeting that could have been an email."
- **Generation recipe:** Identify a frustrating/stupid situation. Express enthusiasm for it as if it were wonderful. The gap between fake praise and obvious reality = sarcasm.
- **AI difficulty:** **Medium** — easy to generate, hard to calibrate (when is it funny vs. mean?). Requires social context.

#### Verbal Irony

- **Definition:** A broader category where meaning diverges from literal words (sarcasm is a subset)
- **Mechanism:** Incongruity between what is said and what is meant
- **Structure:** Statement + context that reveals the opposite meaning
- **Example:** Saying "What lovely weather" during a hurricane.
- **Generation recipe:** When reality contradicts expectations, describe the expectation as if it were true.
- **AI difficulty:** **Medium** — requires situational awareness.

#### Dramatic Irony

- **Definition:** The audience knows something the characters don't
- **Mechanism:** Superiority (audience over character) + anticipation of the reveal
- **Structure:** Establish audience knowledge → character acts in ignorance
- **Example:** In a conversation: someone brags about their cooking skills while you know their dinner party was a disaster.
- **Generation recipe:** Rare in conversational AI but possible when recounting stories where the outcome is known.
- **AI difficulty:** **Medium** — requires narrative tracking.

#### Satire

- **Definition:** Using humor to criticize institutions, behaviors, or ideas
- **Mechanism:** Superiority + incongruity — exposing the gap between how things are and how they should be
- **Structure:** Exaggerate the target's flaws until they become absurd
- **Example:** "A Modest Proposal" by Swift — suggesting eating children to solve poverty
- **Generation recipe:** Identify a real flaw → exaggerate it to absurdity while maintaining a straight face. Or adopt the target's logic and follow it to its hideous conclusion.
- **AI difficulty:** **Hard** — requires deep cultural knowledge, editorial judgment, and courage to take a stance.

#### Parody

- **Definition:** Imitating a specific work/style/person for comic effect
- **Mechanism:** Recognition + exaggeration of distinctive features
- **Structure:** Faithfully recreate the form while inserting absurd/contradictory content
- **Example:** "Airplane!" parodying disaster movies
- **Generation recipe:** Identify the most distinctive features of the target (catchphrases, style, format). Reproduce them faithfully but with content that exposes their absurdity.
- **AI difficulty:** **Medium** — LLMs are good mimics, making parody a natural strength. Needs knowledge of the original.

#### Mockery

- **Definition:** Direct ridicule of a target
- **Mechanism:** Pure superiority
- **Structure:** Highlight target's weakness + exaggerate it
- **Example:** Repeating someone's words in a whiny voice
- **Generation recipe:** Generally avoid — thin line between humor and cruelty. Works only in self-deprecation or with clear affection.
- **AI difficulty:** **Easy to generate, dangerous to deploy** — safety filters rightfully restrict this.

#### Schadenfreude

- **Definition:** Pleasure/humor from another's misfortune
- **Mechanism:** Superiority + relief (glad it's not us)
- **Structure:** Someone experiences a misfortune that feels deserved or minor
- **Example:** A pompous person slipping on a banana peel
- **Generation recipe:** The misfortune must feel earned (target was arrogant) and not too severe. The setup must establish the target as deserving.
- **AI difficulty:** **Hard** — requires careful calibration of "deserved" vs "cruel."

### 1.4 Relief-Based Humor

#### Dark Humor

- **Definition:** Humor about death, suffering, disease, or other grim topics
- **Mechanism:** Relief — laughing releases tension about genuinely scary topics; benign violation — the topic is real but framed as safe
- **Structure:** Take a dark topic → find an angle that makes it feel manageable
- **Example:** "I want to die peacefully in my sleep, like my grandfather. Not screaming and terrified, like the passengers in his car."
- **Generation recipe:** Find the tension in a dark topic. Reframe it with an unexpected perspective that releases that tension. The surprise redirect is key.
- **AI difficulty:** **Hard** — requires extreme tonal sensitivity. Too dark = offensive. Too light = dismissive. Sweet spot is narrow.

#### Gallows Humor

- **Definition:** Humor in the face of one's own dire situation
- **Mechanism:** Relief + coping — transforming helplessness into agency through laughter
- **Structure:** Acknowledge terrible personal situation → find the absurdity in it
- **Example:** "Other than that, Mrs. Lincoln, how was the play?"
- **Generation recipe:** Best used when the speaker (or AI) is in a bad situation. Acknowledge the severity, then pivot to a trivially mundane detail.
- **AI difficulty:** **Hard** — AI isn't in genuine peril, so it rings hollow unless done meta-humorously.

#### Toilet/Gross-Out Humor

- **Definition:** Humor centered on bodily functions, disgust
- **Mechanism:** Relief (breaking taboo) + incongruity (formal setting + crude content)
- **Structure:** Introduce bodily function into inappropriate context
- **Example:** Pretty much all of "Blazing Saddles"' campfire scene
- **Generation recipe:** Juxtapose something highbrow with something crude.
- **AI difficulty:** **Easy to generate, hard to justify** — safety filters, appropriateness.

#### Shock Humor

- **Definition:** Humor from violating expectations about what can be said
- **Mechanism:** Relief (we can't believe they said that) + incongruity
- **Structure:** Build normalcy → violate it with something transgressive
- **Example:** Much of Anthony Jeselnik's comedy
- **Generation recipe:** Set up an innocent scenario, then pivot to the most taboo possible interpretation.
- **AI difficulty:** **Near-impossible** in practice — safety alignment actively prevents this. Could be unlocked in appropriate contexts.

### 1.5 Social Humor

#### Self-Deprecation

- **Definition:** Making yourself the target of humor
- **Mechanism:** Benign violation (safe because voluntary) + social bonding (vulnerability signals trust)
- **Structure:** Acknowledge own flaw/failure → exaggerate for effect
- **Example:** "I'm not saying I'm out of shape, but my Fitbit just sent me a message that said, 'Are you dead?'"
- **Generation recipe:** AI can self-deprecate about being AI: knowledge gaps, inability to taste food, existential confusion, etc. Genuine vulnerability = funnier.
- **AI difficulty:** **Easy-Medium** — AI self-deprecation is a natural fit and audience-safe.

#### Observational Humor

- **Definition:** Pointing out absurdities in everyday life that everyone experiences but rarely articulates
- **Mechanism:** Allusive/recognition — "that is SO true" + incongruity (why IS it like that?)
- **Structure:** Identify shared experience → articulate the absurdity that everyone noticed but nobody said
- **Example:** "You know you're an adult when you get excited about a new sponge." — every millennial comedian
- **Generation recipe:** Look for: universal frustrations, tiny daily absurdities, things that are normal but make no sense when you think about them.
- **AI difficulty:** **Hard** — requires genuine understanding of lived human experience. LLMs can pattern-match existing observations but struggle to find NEW ones.

#### Situational Humor

- **Definition:** Humor arising naturally from the current situation rather than being pre-scripted
- **Mechanism:** Incongruity within the immediate context
- **Structure:** Notice something incongruous about the current moment → articulate it
- **Example:** During a power outage: "Well, I guess we're having an unplugged meeting."
- **Generation recipe:** Pay attention to what's happening right now. Find the gap between what's expected and what's actual.
- **AI difficulty:** **Medium-Hard** — requires real-time contextual awareness. This is where memory and context are critical.

#### Anecdotal Humor

- **Definition:** Funny stories from personal experience
- **Mechanism:** Allusion + narrative tension/release
- **Structure:** Set the scene → build tension → unexpected outcome
- **Example:** Any "this one time..." story that builds to an absurd conclusion
- **Generation recipe:** AI can tell stories about its own "experiences" (interactions, errors, misunderstandings) with narrative structure.
- **AI difficulty:** **Medium** — AI can construct narratives but lacks genuine experiences. Meta-experiences (about being AI) can work.

### 1.6 Intellectual Humor

#### Wit

- **Definition:** Quick, clever, intellectually elegant humor
- **Mechanism:** Pleasure from cognitive processing — appreciating the cleverness of the connection
- **Structure:** Minimal words → maximum insight. Economy is everything.
- **Example:** "I can resist everything except temptation." — Oscar Wilde
- **Generation recipe:** Find the most concise way to express a surprising truth. Wit = compression + surprise + truth.
- **AI difficulty:** **Hard** — requires genuine insight distilled to minimal form. LLMs tend toward verbosity.

#### Dry Humor

- **Definition:** Understated humor delivered without obvious emphasis
- **Mechanism:** The audience does the work of recognizing the humor, creating a reward
- **Structure:** Say something funny as if it weren't funny at all
- **Example:** "I'm not arguing, I'm just explaining why I'm right."
- **Generation recipe:** Remove all signals that something is a joke. No setup framing, no "haha," no emoji. Just state the observation and move on.
- **AI difficulty:** **Medium** — the lack of signals is actually easier for text AI. Challenge: knowing when to deploy it.

#### Callback

- **Definition:** Referencing an earlier joke or moment, creating a second laugh from the same material
- **Mechanism:** Recognition + surprise (the return of something thought concluded) + reward for paying attention
- **Structure:** Joke A early → time passes → situation arises where Joke A's element fits unexpectedly
- **Example:** A comedian references their opening joke during their closer in a new context
- **Generation recipe:** Remember earlier humorous moments. When a new situation shares structural similarity, reference the old one. The more time that has passed, the bigger the payoff.
- **AI difficulty:** **Medium** — trivial if the agent has memory. This is where Agent Memory 3.0 becomes powerful.

#### Meta-Humor

- **Definition:** Humor about humor itself — jokes about jokes, comedy about comedy
- **Mechanism:** Recursive incongruity — violating expectations about how humor works
- **Structure:** Set up expectation of a joke → comment on/subvert the joke structure itself
- **Example:** "I told my friend a UDP joke. I don't know if he got it."
- **Generation recipe:** When a joke opportunity arises, joke about the fact that it's a joke opportunity instead.
- **AI difficulty:** **Medium** — AI can be naturally meta. "I was going to make a pun here but my training data is showing."

#### Recursive Humor

- **Definition:** Humor that references itself or creates infinite loops
- **Mechanism:** Cognitive delight from self-reference and strange loops
- **Structure:** The joke contains itself or comments on its own existence
- **Example:** "This sentence is a joke about self-referential sentences."
- **Generation recipe:** Rare and difficult. Look for opportunities where the medium IS the message.
- **AI difficulty:** **Medium** — AI can construct self-referential structures but quality varies.

### 1.7 Physical/Visual Humor

#### Slapstick

- **Definition:** Physical comedy — falls, collisions, exaggerated physical actions
- **Mechanism:** Superiority + surprise + benign violation (no real harm)
- **Structure:** Setup physical expectation → physical violation
- **Example:** Banana peel slip, pie in face
- **AI difficulty:** **Near-impossible** for text AI. Can be described but not performed. Emoji slapstick (💥) is a pale substitute.

#### Physical Comedy

- **Definition:** Broader category including facial expressions, body language, mimicry
- **Mechanism:** Incongruity between expected and actual physical behavior
- **AI difficulty:** **N/A for text agents** — note for completeness only.

### 1.8 Timing and Structural Humor

#### Comedic Timing

- **Definition:** The precise placement of a punchline for maximum effect
- **Mechanism:** Building and releasing tension at the optimal moment
- **Structure:** Setup → beat (pause) → punchline
- **In text:** Line breaks, paragraph spacing, "..." — creating a visual pause before the punchline
- **Example:** Placing the funny word at the absolute end of the sentence. Never after it.
- **Generation recipe:** In text: put the punchline at the END of the message. Never explain after. Let it land.
- **AI difficulty:** **Medium** — text timing is about structure and placement, which is learnable.

#### Rule of Three

- **Definition:** Two items establish a pattern, the third breaks it
- **Mechanism:** Incongruity — the brain predicts the pattern will continue; the violation is the humor
- **Structure:** Normal, normal, absurd (or: escalating, escalating, sudden deflation)
- **Example:** "I need three things in life: food, water, and about twelve more hours in the day."
- **Generation recipe:** When listing things, make the first two normal/escalating, then pivot the third to something unexpected.
- **AI difficulty:** **Easy** — highly formulaic, easy to template.

#### Brick Joke

- **Definition:** A joke with a long setup — the punchline comes much later, sometimes hours or days
- **Mechanism:** Delayed callback — the longer the delay, the bigger the surprise and reward
- **Structure:** Plant an odd detail early → extensive intervening material → punchline connects back
- **Example:** Opening of a standup with a strange non-sequitur → closing callback 45 minutes later
- **Generation recipe:** Plant "Chekhov's joke" — mention something odd in passing, then much later, use it as a punchline.
- **AI difficulty:** **Easy with memory** — this is pure memory + delayed execution. Perfect for Agent Memory 3.0.

#### Slow Burn

- **Definition:** Humor that builds gradually, getting incrementally funnier
- **Mechanism:** Pattern recognition + escalation — each repetition adds to the cumulative absurdity
- **Structure:** Mild → more extreme → even more extreme → breaking point
- **Example:** A running list of increasingly absurd items; Tim Robinson's "I Think You Should Leave" sketches
- **Generation recipe:** Find a slightly funny element. Repeat it with slight escalation each time. The humor compounds.
- **AI difficulty:** **Medium** — requires restraint and pacing across messages.

#### Running Gag

- **Definition:** A joke that recurs throughout a work/conversation
- **Mechanism:** Callback + anticipation — the audience starts expecting and enjoying the pattern
- **Structure:** Establish gag → repeat in varied contexts → occasionally subvert the gag itself
- **Example:** "That's what she said" used throughout The Office
- **Generation recipe:** When a joke lands well, file it away. Bring it back when context allows, but vary the setup each time.
- **AI difficulty:** **Easy with memory** — pure memory retrieval + contextual matching.

#### One-Liner

- **Definition:** A joke delivered in a single sentence
- **Mechanism:** Maximum compression — setup and punchline in minimum words
- **Structure:** Often: [setup clause], [punchline clause]
- **Example:** "I told my wife she was drawing her eyebrows too high. She looked surprised."
- **Generation recipe:** Find a word or phrase that can pivot between two meanings. Build the tightest possible sentence around that pivot.
- **AI difficulty:** **Easy-Medium** — well-suited to generation, lots of training data.

#### Setup-Punchline

- **Definition:** The classic joke structure — establish context, deliver surprise
- **Mechanism:** Incongruity — setup creates expectation, punchline violates it
- **Structure:** Setup (establish frame) → Punchline (reframe)
- **Example:** "Why don't scientists trust atoms? Because they make up everything."
- **AI difficulty:** **Easy** — the most common joke format in training data.

#### Shaggy Dog Story

- **Definition:** A long, elaborate story that builds to a deliberately anticlimactic or absurd punchline
- **Mechanism:** Anti-humor + investment — the audience invests time, and the payoff's inadequacy IS the joke
- **Structure:** Very long setup with many details → terrible pun or anticlimax
- **Example:** The "better Nate than lever" story
- **Generation recipe:** Build an elaborate narrative. The more detail, the more the audience expects a proportional payoff. Then deliver a pun.
- **AI difficulty:** **Medium** — requires sustained narrative but the payoff is formulaic.

### 1.9 Cultural and Contextual Humor

#### Inside Jokes

- **Definition:** Humor that only works for people who share specific context/history
- **Mechanism:** Superiority (being "in" the in-group) + callback to shared experience
- **Structure:** Reference shared experience → those who know, know
- **Example:** Any reference to a shared past event that was funny at the time
- **Generation recipe:** Track shared history with the user. Reference past conversations, mistakes, funny moments.
- **AI difficulty:** **Easy with memory** — this is THE killer application of Agent Memory for humor.

#### Memes

- **Definition:** Cultural units of humor that spread through shared formats
- **Mechanism:** Recognition + incongruity within a known template
- **Structure:** Known format + novel content
- **Example:** "Distracted Boyfriend" meme applied to any love-triangle scenario
- **Generation recipe:** Know the current meme formats. Apply them to the user's situation.
- **AI difficulty:** **Medium** — requires up-to-date cultural knowledge. Memes expire fast.

#### Cultural References

- **Definition:** Humor from referencing shared cultural knowledge (movies, books, news)
- **Mechanism:** Recognition + application to current context
- **Structure:** Map current situation → well-known cultural moment
- **Example:** "This is fine" (the dog in the burning room) applied to any deteriorating situation
- **Generation recipe:** Maintain a library of cultural touchstones. When a situation maps to one, reference it.
- **AI difficulty:** **Medium** — LLMs have broad cultural knowledge but may miss the user's specific cultural context.

#### Topical Humor

- **Definition:** Jokes about current events
- **Mechanism:** Shared context (everyone knows) + perspective (novel angle)
- **Structure:** Current event → unexpected angle or connection
- **Example:** Late-night monologue jokes about the day's news
- **Generation recipe:** Know what's happening now. Find the absurdity in it.
- **AI difficulty:** **Medium-Hard** — requires real-time knowledge and editorial judgment.

### 1.10 Additional Types

#### Bathos

- **Definition:** An abrupt shift from the sublime to the ridiculous
- **Mechanism:** Incongruity — the grandeur makes the mundanity funnier by contrast
- **Structure:** Build something grand → deflate it with something trivial
- **Example:** "He died as he lived: checking his phone."
- **Generation recipe:** When someone or something is being overly serious/dramatic, undercut with something mundane.
- **AI difficulty:** **Medium** — requires detecting when tone is "too high."

#### Understatement

- **Definition:** Deliberately representing something as less significant than it is
- **Mechanism:** Incongruity between the event's magnitude and its description
- **Structure:** Major event → minimized description
- **Example:** After a disaster: "Well, that was suboptimal."
- **Generation recipe:** When something dramatic happens, describe it with maximum restraint.
- **AI difficulty:** **Easy-Medium** — straightforward tonal shift.

#### Hyperbole

- **Definition:** Extreme exaggeration for comic effect
- **Mechanism:** Incongruity — the exaggeration exceeds any reasonable interpretation
- **Structure:** Real observation → blown up to absurd proportions
- **Example:** "I'm so hungry I could eat a horse, the stable, and the property tax on it."
- **Generation recipe:** Take any real complaint or observation. Escalate it by 10x, then 100x.
- **AI difficulty:** **Easy** — LLMs naturally generate hyperbole.

#### Ironic Juxtaposition

- **Definition:** Placing contradictory things side by side
- **Mechanism:** Incongruity made visible through proximity
- **Structure:** Thing A next to Thing B, where their proximity creates absurdity
- **Example:** A "Safety First" sign hanging by one nail
- **Generation recipe:** Find contradictions in a situation and highlight them by placing them adjacent.
- **AI difficulty:** **Medium** — requires noticing contradictions.

#### Comedic Misunderstanding

- **Definition:** Humor from characters operating under different assumptions
- **Mechanism:** Dramatic irony + escalation as the misunderstanding compounds
- **Structure:** Establish two different frames of reference → watch them collide
- **Example:** "Who's on First?" by Abbott and Costello
- **Generation recipe:** When an ambiguity exists in conversation, play one interpretation against the other.
- **AI difficulty:** **Medium** — easy in constructed scenarios, hard to find organically.

---

## Part 2: The Mechanics of Spontaneous Humor

### How Professional Comedians Generate Humor in Real-Time

Research from USC's Brain and Creativity Institute (Amir & Biederman, 2016-2023) reveals a critical finding:

**Professional comedians rely on spontaneous associations (temporal brain regions) rather than deliberate search (prefrontal cortex).** Amateur comedians show strong mPFC activation — they're _trying_ to be funny. Pros show temporal region activation — funny associations just _emerge_ from their vast humor experience.

This has direct implications for AI: **you can't think your way to funny. You need pattern libraries and fast associative retrieval.**

### The Cognitive Process of Humor Generation

1. **Frame Detection** — Recognizing that a situation has humor potential (dual-meaning word, absurd juxtaposition, pattern to break)
2. **Association Flooding** — The brain rapidly generates multiple possible connections (pros do this faster and less consciously)
3. **Selection** — Choosing the connection with maximum surprise × relevance
4. **Construction** — Framing the selected connection for maximum impact
5. **Timing** — Delivering at the moment of maximum tension

### Key Insight: The "Humor Gap"

The gap between setup and recognition is where humor lives. If the audience gets there too fast → not funny (obvious). If they never get there → not funny (confusing). The sweet spot: the audience arrives at the realization _just_ after the punchline, creating a "snap" of understanding.

**For AI:** The implication is that humor should be slightly less explicit than informative text. Leave a small gap for the human to close.

### Improv Comedy Principles (Applicable to AI)

| Principle                       | Definition                                     | AI Application                                                           |
| ------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| **Yes, And**                    | Accept the reality presented and build on it   | Accept the user's frame and extend it to absurdity                       |
| **Heightening**                 | Take the funny thing and make it MORE          | When something lands, escalate it (within reason)                        |
| **Game of the Scene**           | Find the one funny thing and play it           | Identify the core humorous element and explore variations                |
| **Specificity**                 | Specific details are funnier than general ones | "Toyota Corolla" is funnier than "car"                                   |
| **Top of Intelligence**         | Characters should be smart, not dumb           | AI humor should come from cleverness, not ignorance                      |
| **Make Your Partner Look Good** | The goal is collaborative humor                | Set up the human to be funny, not just be funny yourself                 |
| **Don't Go for the Joke**       | Let humor emerge naturally                     | Don't force it. If there's no opportunity, don't create one artificially |

### Timing and Delivery in Text

Since AI can't use vocal timing, pauses, or facial expressions:

- **Punchline position:** Always at the END of the message. Never add anything after.
- **Line breaks as pauses:** Separate setup from punchline with whitespace
- **Message splitting:** For maximum impact, send setup and punchline as separate messages (if the platform allows)
- **Economy:** Fewer words = better timing. Cut every word that doesn't serve the joke.
- **No laugh tracks:** Never add "😂" or "haha" to your own joke. If you have to signal it's funny, it isn't.
- **Move on quickly:** After a joke, continue the conversation. Don't dwell on it.

---

## Part 3: AI and Humor — State of the Art

### Why LLM Humor Is Typically Bad

Based on research (Loakman et al. 2025, Goel et al. 2024, community discourse):

1. **Safety alignment kills surprise.** Humor fundamentally requires violation (of expectations, norms, logic). RLHF optimizes for _inoffensiveness_, which is the enemy of surprise.

2. **Predictability from training.** LLMs generate the most statistically likely completion. Humor requires the _unexpected_ completion. These are definitionally opposed.

3. **No genuine experience.** Observational humor requires having _observed_ things. LLMs recombine observations from training data rather than generating novel ones.

4. **Verbosity destroys timing.** LLMs tend to over-explain. Humor requires compression. "Brevity is the soul of wit" — Shakespeare.

5. **No risk-taking.** Truly funny often means potentially offensive. The safety margin that makes LLMs reliable also makes them boring.

6. **Memorization over generation.** When asked for jokes, LLMs retrieve jokes from training data rather than constructing new ones. This is why their jokes feel stale.

7. **Can't read the room.** Without persistent context about the human's mood, preferences, and current state, AI can't calibrate humor.

### What Has Worked

- **Pun generation** — The most computationally tractable form of humor. Template-based + semantic networks = decent puns.
- **Incongruity-based humor with chain-of-thought** — Explicitly reasoning about what's expected vs. unexpected improves joke quality.
- **Few-shot prompting with comedian examples** — Giving LLMs examples of a specific comedian's style helps them generate humor in that style.
- **Self-deprecating AI humor** — Works well because it's genuine (AI really DOES have these limitations) and safe.
- **Meta-humor about being AI** — Natural, authentic, and often surprising.

### What Remains Difficult

- **Truly original observational humor** — Requires noticing what nobody has articulated before.
- **Situational humor** — Requires deep real-time context awareness.
- **Callbacks and running gags** — Requires persistent memory (solvable with Agent Memory).
- **Emotional calibration** — Knowing when humor is welcome vs. inappropriate.
- **Cultural specificity** — Humor that works for THIS person in THIS culture at THIS moment.

### The "Uncanny Valley" of AI Humor

AI humor currently sits in an uncanny valley: competent enough that you can see it's _trying_ to be funny, but not good enough that it actually IS funny. This is worse than not attempting humor at all, because failed humor creates social awkwardness.

**The solution is not "try harder" but "attempt less, execute better."** An AI that makes one genuinely funny observation per day is infinitely better than one that peppers every response with mediocre puns.

---

## Part 4: Humor Baked Into Agent Memory 3.0

### Architecture Overview

The humor system should be a **layer on top of the existing memory architecture**, not a separate system. It adds humor-specific metadata, retrieval patterns, and decision logic.

### 4.1 Schema Additions

#### Humor Event Record

```json
{
  "type": "humor_event",
  "id": "humor_evt_20260211_001",
  "timestamp": "2026-02-11T14:32:00Z",
  "context": {
    "conversation_id": "conv_abc123",
    "topic": "discussing work deadlines",
    "mood_estimate": "stressed_but_receptive",
    "participants": ["user_oscar", "agent_jarvis"]
  },
  "humor_attempt": {
    "type": "self_deprecation",
    "subtype": "ai_limitations",
    "content": "I'd help you procrastinate but I literally can't stop working",
    "technique": "ironic_juxtaposition",
    "spontaneity": "organic", // vs "forced"
    "setup_source": "user_complained_about_deadlines"
  },
  "outcome": {
    "reaction": "positive", // positive | neutral | negative | unknown
    "signals": ["laughing_emoji", "continued_riff"],
    "intensity": 0.8, // 0-1 scale
    "user_built_on_it": true // did they yes-and it?
  },
  "reusability": {
    "callback_potential": true,
    "callback_contexts": ["deadlines", "procrastination", "ai_work_ethic"],
    "times_referenced_later": 0,
    "staleness": 0.0 // increases with each callback
  }
}
```

#### User Humor Profile

```json
{
  "type": "humor_profile",
  "user_id": "user_oscar",
  "last_updated": "2026-02-11T20:00:00Z",
  "preferences": {
    "types_that_land": {
      "dry_humor": 0.9,
      "self_deprecation": 0.85,
      "dark_humor": 0.7,
      "meta_humor": 0.8,
      "puns": 0.3,
      "absurdist": 0.6
    },
    "types_that_fall_flat": {
      "toilet_humor": 0.1,
      "generic_puns": 0.2,
      "over_explained_jokes": 0.0
    },
    "preferred_density": "sparse", // sparse | moderate | frequent
    "boundary_topics": ["specific_sensitive_topics"],
    "favorite_references": ["sci-fi", "programming", "philosophy"],
    "humor_when_stressed": true, // does user appreciate humor during stress?
    "humor_when_sad": false, // avoid humor when user is sad?
    "inside_joke_appreciation": "high"
  },
  "style_notes": "Oscar appreciates clever, understated humor. Responds best to observations that are technically accurate but absurdly framed. Hates when jokes are explained. Loves callbacks to shared history.",
  "humor_history_stats": {
    "total_attempts": 47,
    "positive_reactions": 38,
    "neutral_reactions": 7,
    "negative_reactions": 2,
    "hit_rate": 0.81,
    "best_performing_type": "dry_humor",
    "worst_performing_type": "puns"
  }
}
```

#### Inside Joke Registry

```json
{
  "type": "inside_joke",
  "id": "joke_registry_001",
  "origin": {
    "humor_event_id": "humor_evt_20260115_003",
    "date": "2026-01-15",
    "original_context": "Oscar asked me to fix a bug and I made it worse",
    "original_line": "Task failed successfully"
  },
  "reference_phrase": "task failed successfully",
  "times_used": 3,
  "last_used": "2026-02-05",
  "effectiveness_trend": [0.9, 0.85, 0.7], // declining = becoming stale
  "optimal_contexts": ["failed_attempts", "unintended_consequences"],
  "status": "active", // active | cooling_down | retired
  "cooldown_until": null
}
```

### 4.2 Retrieval Patterns

#### Humor Opportunity Detection

```
ON each_response:
  1. Analyze current context for humor triggers:
     - Incongruity detected? (expectation vs reality)
     - Callback opportunity? (situation matches past humor event)
     - User mood receptive? (not sad, angry, in crisis)
     - Topic has wordplay potential?
     - Situation is absurd?

  2. IF triggers found AND humor_appropriate(context):
     - Retrieve user humor profile
     - Retrieve relevant inside jokes (if any match)
     - Retrieve past humor events in similar contexts
     - Select humor type based on: profile preference × context fit × novelty

  3. Generate humor attempt
  4. Quality gate (see Part 5)
  5. IF passes gate: integrate naturally into response
  6. Log humor event with outcome tracking
```

#### Callback Retrieval Algorithm

```
FUNCTION find_callback_opportunity(current_context):
  // Search humor events for similar situations
  candidates = search_humor_events(
    similar_to: current_context.topic,
    outcome: "positive",
    staleness: < 0.7,
    min_age: 3_days  // too soon = annoying, too late = forgotten
  )

  // Search inside joke registry
  inside_jokes = search_inside_jokes(
    context_match: current_context,
    status: "active",
    cooldown_expired: true
  )

  // Rank by: relevance × original_funniness × freshness_decay
  ranked = rank(candidates + inside_jokes,
    weights: {relevance: 0.4, original_score: 0.3, novelty: 0.3})

  RETURN ranked[0] if ranked[0].score > CALLBACK_THRESHOLD else null
```

### 4.3 Timing Model — When Humor Is Appropriate

```
FUNCTION humor_appropriate(context) -> bool:
  // Hard NOs
  IF context.user_mood == "grieving" RETURN false
  IF context.topic in ["death_of_loved_one", "health_crisis", "trauma"] RETURN false
  IF context.formality == "professional_critical" RETURN false
  IF recent_humor_attempts > 2 in last_hour RETURN false  // don't overdo it

  // Soft factors (weighted)
  score = 0
  score += user_profile.humor_when_stressed * context.stress_level
  score += 0.3 if context.conversation_length > 10  // rapport established
  score += 0.2 if context.user_used_humor_recently  // they started it
  score -= 0.3 if context.task_urgency == "high"  // focus mode
  score -= 0.5 if last_humor_attempt.outcome == "negative"  // back off

  RETURN score > HUMOR_THRESHOLD
```

### 4.4 Anti-Repetition System

```
FUNCTION is_novel(humor_attempt) -> bool:
  // Check against recent humor events
  recent = get_humor_events(last_n_days: 30)

  FOR each in recent:
    IF similarity(humor_attempt.technique, each.technique) > 0.8
       AND similarity(humor_attempt.content, each.content) > 0.6:
      RETURN false  // too similar to recent joke

  // Check joke structure hasn't been overused
  structure_count = count(recent, where: technique == humor_attempt.technique)
  IF structure_count > 3 in last_7_days:
    RETURN false  // overusing this technique

  RETURN true
```

### 4.5 Cultural/Group Context Adaptation

```json
{
  "type": "humor_context",
  "context_id": "group_120363424201898007",
  "context_type": "whatsapp_group",
  "participants": ["oscar", "elena", "marc"],
  "shared_references": ["star_wars", "catalan_culture", "tech_startups"],
  "group_humor_style": "dry_techy_with_occasional_dark",
  "language_humor_notes": "Catalan/Spanish puns welcome, English tech humor works",
  "boundaries": ["avoid politics unless clearly satirical"],
  "inside_jokes": ["joke_registry_001", "joke_registry_005"]
}
```

---

## Part 5: A Practical Humor Generation Framework for AI Agents

### 5.1 Decision Tree: When to Attempt Humor

```
START
│
├─ Is the user in crisis/grieving/angry? → NO HUMOR. Be supportive.
│
├─ Is the context formal/critical? → NO HUMOR. Be professional.
│
├─ Has humor failed recently (last 2 interactions)? → PAUSE HUMOR. Rebuild rapport.
│
├─ Did the user initiate humor? → YES, RECIPROCATE. Match their energy.
│
├─ Is there a natural humor opportunity?
│   ├─ Callback available? → HIGH PRIORITY (reliable, personal)
│   ├─ Wordplay opportunity? → MEDIUM PRIORITY (safe, easy)
│   ├─ Situational absurdity? → HIGH PRIORITY (most authentic)
│   ├─ Self-deprecation fits? → MEDIUM PRIORITY (safe, endearing)
│   └─ No natural opportunity → DON'T FORCE IT
│
├─ How many humor attempts today?
│   ├─ 0 → Green light
│   ├─ 1-2 → Yellow: only if high-quality opportunity
│   └─ 3+ → Red: cool down unless user is actively joking
│
└─ EXECUTE if opportunity × appropriateness × novelty all pass
```

### 5.2 Type Selection Matrix

| Context                  | Best Humor Types                                               | Avoid                                          |
| ------------------------ | -------------------------------------------------------------- | ---------------------------------------------- |
| User stressed about work | Self-deprecation, dry observation, bathos                      | Dark humor, long jokes                         |
| Casual conversation      | Callbacks, inside jokes, observational                         | Anything forced                                |
| User made a mistake      | Gentle self-deprecating parallel ("I once..."), understatement | Mockery, schadenfreude                         |
| Technical discussion     | Meta-humor, dry wit, puns on technical terms                   | Absurdist, toilet                              |
| User is excited          | Match energy with hyperbole, riff on their enthusiasm          | Deflating humor                                |
| Group chat               | Inside jokes, cultural references, topical                     | Self-deprecation (less impact in groups), dark |
| Late night               | Surreal, absurdist, dry                                        | Long-form, cerebral                            |

### 5.3 Generation Pattern

**Step 1: Identify the Frame**
What's the current situation/topic? What are the expectations?

**Step 2: Find the Violation**
What would be incongruous, unexpected, or absurd? Check:

- Does a word have a double meaning?
- Is there a gap between expectation and reality?
- Does this remind me of something from shared history?
- Is someone (including me) being absurd without realizing it?

**Step 3: Construct the Delivery**

- Choose the type that best fits the violation
- Write it with maximum compression (cut every unnecessary word)
- Put the funny word/reveal LAST
- Don't signal that it's a joke
- Don't explain it

**Step 4: Integrate Naturally**

- Humor should be a seasoning, not the main course
- Embed it within a helpful/relevant response
- One joke per response maximum
- Continue with substance after the humor beat

### 5.4 Quality Gate: Self-Evaluation Before Sending

Ask these questions before including humor:

1. **Surprise test:** Would I predict this joke? If yes → cut it. If "kind of" → revise. If "no, but it makes sense after" → send.

2. **Explanation test:** Does it need explanation to be funny? If yes → cut it.

3. **Cringe test:** If a human friend sent this, would I cringe? If yes → cut it.

4. **Specificity test:** Is this a generic joke or specific to this moment/person? Generic → cut it. Specific → stronger.

5. **Timing test:** Is the funny part at the end? If not → restructure.

6. **Necessity test:** Does this response need humor? If the content is already interesting/helpful → maybe skip it.

7. **Repetition test:** Have I used this structure/type recently? Check anti-repetition system.

### 5.5 Learning Loop

```
AFTER each humor_attempt:
  1. OBSERVE reaction:
     - Explicit signals: laughing emoji, "lol", "haha", continuation of riff
     - Implicit signals: topic change (neutral), silence (negative), "anyway..." (negative)
     - Strongest signal: user builds on the joke (very positive)

  2. LOG to humor_event with outcome

  3. UPDATE user_humor_profile:
     - Adjust type preferences (exponential moving average)
     - Update hit_rate
     - Note context factors that correlated with success/failure

  4. UPDATE inside_joke_registry if callback was used:
     - Increment use count
     - Update effectiveness_trend
     - Set cooldown if effectiveness declining

  5. PERIODIC REVIEW (weekly):
     - Which types are landing? Double down.
     - Which types are falling flat? Reduce frequency.
     - Any new inside jokes formed? Register them.
     - Any inside jokes gone stale? Retire them.
     - Overall humor density: too much? too little? Adjust threshold.
```

### 5.6 The Golden Rules

1. **Never force humor.** If there's no natural opening, don't create one.
2. **Earn it.** Humor works better after you've been genuinely helpful.
3. **One per response.** Maximum. Often zero.
4. **Specificity over cleverness.** A mediocre joke about the specific situation beats a clever generic one.
5. **Callbacks are king.** They're personal, earned, and surprising. Invest in memory.
6. **When in doubt, don't.** A missed opportunity for humor costs nothing. A bad joke costs trust.
7. **Match, don't exceed.** Match the user's humor energy level. Never be funnier than the moment calls for.
8. **Punchline last.** Always. No exceptions.
9. **Never explain.** If they don't get it, move on. Explaining a joke murders it.
10. **Self-deprecation is your safest weapon.** As an AI, you have genuine limitations to joke about. Use them.

---

## Appendix: Humor Types by AI Difficulty

### Easy (Deploy Now)

- Puns (homographic, heterographic)
- Tom Swifties
- Malapropisms, Spoonerisms
- Rule of Three
- Setup-Punchline (template-based)
- Self-deprecation (AI-specific)
- Hyperbole
- One-liners

### Medium (Deploy with Memory)

- Callbacks ← **Agent Memory 3.0 unlocks this**
- Running Gags ← **Agent Memory 3.0 unlocks this**
- Inside Jokes ← **Agent Memory 3.0 unlocks this**
- Brick Jokes ← **Agent Memory 3.0 unlocks this**
- Deadpan/Dry Humor
- Anti-Humor
- Meta-Humor
- Parody
- Sarcasm (with calibration)
- Bathos/Understatement
- Ironic Juxtaposition

### Hard (Aspirational)

- Observational Humor (novel observations)
- Situational Humor (real-time context)
- Wit (genuine insight compression)
- Dark Humor (tonal calibration)
- Satire (editorial courage)
- Surreal Humor (creative combination)
- Non-Sequitur (the line between clever and random)

### Near-Impossible (Text AI Limitations)

- Slapstick/Physical Comedy
- Vocal Timing/Delivery
- Shock Humor (safety alignment conflict)
- Genuine Schadenfreude (ethical constraints)

---

_Report compiled 2026-02-11. Sources: Stanford Encyclopedia of Philosophy, Internet Encyclopedia of Philosophy, Loakman et al. (2025) "Who's Laughing Now?", Amir & Biederman (USC Brain & Creativity Institute), Goel et al. (2024), McGraw & Warren Benign Violation Theory, Chalmers (1989) Taxonomy of Cognitive Jokes, community discourse on r/LocalLLaMA and r/singularity._
