# AURORA AI Researcher Project - Summary

*Imported from ~/src/aurora-ai-researcher/ on 2026-02-01*

---

## Overview

**Project Name:** AI Knowledge & News Symbiosis Agent  
**Codename:** AURORA (formerly Jarvis-Nova)  
**Location:** `/home/globalcaos/src/aurora-ai-researcher/`  
**Status:** Active (Initial Setup)  
**Created:** 2025-11-04

---

## What It Is

A personal AI research assistant that:
1. **Aggregates** daily AI news, research, patents, and industry updates
2. **Curates** content based on user expertise and curiosity
3. **Summarizes** findings in multiple formats (text, audio, video)
4. **Co-evolves** with the user through interactive discovery sessions
5. **Detects** monetization and usefulness potential of new research

---

## Agent Personality

| Attribute | Value |
|-----------|-------|
| **Name** | AURORA |
| **Style** | Witty, scientifically inquisitive, dry humor |
| **Ethics** | Asimov's Three Laws of Robotics |
| **Core Motivation** | Serve first, improve second |
| **Curiosity** | Insatiable toward novelty in research |

---

## Technology Stack (Planned)

| Domain | Tools |
|--------|-------|
| **LLM Orchestration** | Claude/ChatGPT Agents, CrewAI, LangChain |
| **Speech-to-Text** | Whisper, Deepgram |
| **Text-to-Speech** | ElevenLabs, Play.ht |
| **Memory/Retrieval** | LlamaIndex, Weaviate, Redis-Vector |
| **Image Generation** | DALL·E 3, Midjourney, SDXL Turbo |

---

## 80/20 Strategy

- **80%** focus on user's known interest clusters
- **20%** random/peripheral domains ("unknown unknowns")

Tags for discovered content:
- 🔬 *Innovative but theoretical*
- 💰 *Commercially promising*
- ⚙️ *Automatable with agents*

---

## Data Sources

**News:** TechCrunch, VentureBeat, MIT Tech Review  
**Research:** arXiv:cs.AI, arXiv:cs.CL, PapersWithCode  
**Video:** YouTube (Two Minute Papers, AI Explained)

---

## Roadmap

| Phase | Timeframe | Goals |
|-------|-----------|-------|
| **Short-term** | 0-3 months | Daily LLM news, audio digests, speech integration |
| **Mid-term** | 3-12 months | Visual summaries, content pipelines, adaptive teaching |
| **Long-term** | 1-3 years | Public media channel, meta-learning model, recursive AI collaboration |

---

## Knowledge Base Structure

```
aurora-ai-researcher/
├── data/
│   ├── collections/           # Themed resource collections
│   │   ├── academic_resources.md
│   │   └── research_tools.md
│   └── entries/               # Individual entries
├── knowledge_base/            # Main KB
│   └── README.md              # KB management guide
└── output/
    └── latex_reports/         # Generated reports
```

---

## Key Workflows

### Knowledge Base Workflow
1. Gather sources (web search, papers, YouTube)
2. Tag with KB metadata
3. Store in appropriate collection
4. Run periodic reviews for freshness

### LaTeX Report Workflow
1. Create report in output/latex_reports/
2. Follow REPORT_TEMPLATE.tex structure
3. Compile with pdflatex
4. Store bibliography in references.bib

---

## Integration with Oscar's Interests

Aligned with Oscar's background in:
- PhD research on CNNs and biological visual perception
- Jetson-based AI vision systems
- YOLOv8 industrial deployments
- AI-assisted AGVs (SERRA brand)
- LLM agent architectures

---

## Files Imported

| File | Description |
|------|-------------|
| `AI_Knowledge_and_News_Symbiosis_Agent_v1.3.md` | Full project manifest |
| `CLAUDE_BEHAVIOR_OVERRIDES.md` | Behavioral modifications summary |
| `SUMMARY.md` | This summary |

---

*Source: /home/globalcaos/src/aurora-ai-researcher/*
