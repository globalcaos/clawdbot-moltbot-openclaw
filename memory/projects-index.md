# Oscar's Projects Index

*Imported from ~/src and ~/Documents on 2026-02-01*

---

## Active Projects Overview

| Project | Location | Type | Status |
|---------|----------|------|--------|
| **pallet-scan** | `~/src/pallet-scan/` | Computer Vision | Active |
| **aurora-ai-researcher** | `~/src/aurora-ai-researcher/` | AI Research Agent | Initial Setup |
| **amr-marketing-sales** | `~/src/amr-marketing-sales/` | Document Automation | In Progress |
| **book-translation** | `~/Documents/Origin of the Universe*/` | Literary | Active |
| **workshop-legalization** | `~/Documents/Workshop/` | Legal/Admin | Active |
| **audio-transcript** | `~/src/audio-transcript/` | Audio Processing | Unknown |
| **R project** | `~/src/R/` | Unknown | Uses claude memory |

---

## Shared Infrastructure

All projects use a shared Claude memory system with symlinks:

```
~/src/claude_memory/        ← Shared behavioral rules (CLAUDE.md, etc.)
~/src/.claude_global/       ← Shared tools (cmd_display.py wrapper)
```

Each project symlinks to these:
- `project/claude_memory → ~/src/claude_memory/`
- `project/.claude → ~/src/.claude_global/`

---

## 1. pallet-scan

**Purpose:** ZED 2i stereo camera system for automated pallet volume measurement

**Tech Stack:**
- Python 3.10 (`~/src/venv3.10`)
- ZED SDK v5.1.0
- CUDA 12.8 (needs TensorRT 10.9 for NEURAL mode)
- Open3D for point cloud processing
- OpenCV for visualization

**Hardware:**
- MSI Creator 15 laptop
- NVIDIA RTX 3080 (16GB)
- ZED 2i camera (USB 3.0)

**Core Concept:**
```
Total Volume - Baseline Volume = Pallet Volume
```

**Active Issues:**
- TensorRT missing → NEURAL depth mode unavailable
- Advanced stereoscopic algorithm research planned

**7-Phase Roadmap:**
1. ✅ Single camera optimization
2. ⬜ Floor detection & segmentation
3. ⬜ Dual camera setup & calibration
4. ⬜ Depth map fusion
5. ⬜ Volume calculation
6. ⬜ Baseline management
7. ⬜ Production integration

---

## 2. aurora-ai-researcher

**Purpose:** AI Knowledge & News Symbiosis Agent for tracking AI research

See: `memory/aurora-ai-researcher/SUMMARY.md`

---

## 3. amr-marketing-sales

**Purpose:** Automated generation of marketing materials for AMR (Autonomous Mobile Robots)

**Deliverables:**
- PowerPoint presentations from CRM data
- Marketing flyers
- Technical white papers

**Tech Stack:**
- python-pptx: PowerPoint generation
- reportlab: PDF generation
- jinja2: Template engine
- pandas: CRM data handling

**Data Sources:**
- CRM exports (format TBD)
- Offers repository: `smb://192.168.0.1/dades/03 Comercial/02 Ofertes/`
  - Use PDF versions (unchanged)
  - Multiple versions = amendments

---

## 4. Origin of the Universe (Book Translation)

**Purpose:** Translate sister Zeneida's children's fantasy/sci-fi book from Spanish to English

**Book:** "Akumi y Arish en el Origen del Universo"
**Target:** Ages 8-10, 4th-5th grade vocabulary

**Progress:**
- ✅ Chapter 1: "The Leaves That Did Not Fall"
- ✅ Chapter 2: "The True Story"
- ✅ Chapter 3: "The Grandfather Who Wasn't There"
- ✅ Chapter 4: "Beyond the Stars"
- ✅ Chapter 5: "Paradise Island"
- ✅ Chapter 6: "The Conversation They Didn't Hear"
- ✅ Chapter 7: "The Important Day"

**Key Characters:**
- Akumi (11yo sister) — green pendant, cold powers
- Arish (9yo brother) — blue pendant, heat powers
- Grandmother Gwendal — former Galactic Confederation agent
- Grandfather Martin — exists in another dimension

**Fantasy Elements:**
- Merkaba (ship), Yahyel race, Galactic Confederation
- Havona (center of multiverse), Paradise Island
- Nephilim, AION (the Constructor), Felixfénix

**Style Guide:**
- Simple vocabulary (9-year-old level)
- Em-dash (—) for dialogue
- Preserve suspense, wonder, warmth
- HTML format with specific CSS classes

---

## 5. Workshop Legalization (Mas Mestre)

**Purpose:** Legal project to regularize unpermitted workshop in Olivella

**Language:** Catalan/Spanish

**Key Points:**
- Oscar is PROMOTOR (not constructor)
- Involves urban planning documentation
- Worker regularization (Ukrainian workers)
- ⚠️ DO NOT read `POUM Olivella.pdf` (crashes system) — use `.txt` version

---

## Shared Python Environment

**Location:** `~/src/venv3.10`

Shared by multiple projects:
- pallet-scan
- amr-marketing-sales
- aurora-ai-researcher (planned)

---

## Key Learnings from Claude Memory

### Meta-Lessons

1. **Code enforcement > Documentation** — If rules keep being violated, enforce with code (hooks, configs)

2. **Copy working code first** — Don't rebuild from scratch when a working reference exists

3. **Structure IS logic in XML/SVG** — Can't refactor declarative formats freely

### AI Comparison for Second Opinions

| AI | Quality | Best For |
|----|---------|----------|
| **ChatGPT** | 9/10 | Legal, technical, strategic analysis |
| **Gemini** | 7/10 | Quick reviews, summaries |
| **Grok** | 3/10 | Nothing important |

### Command Security Levels

🟢 SAFE → Read-only (auto-approved)
🔵 LOW → Project files (auto-approved)
🟡 MEDIUM → Config changes, pip install
🟠 HIGH → sudo, git push
🔴 CRITICAL → rm -rf, data loss risk

---

## File Locations Reference

| Resource | Path |
|----------|------|
| Python venv | `~/src/venv3.10` |
| Shared Claude memory | `~/src/claude_memory/` |
| Shared Claude tools | `~/src/.claude_global/` |
| ZED SDK docs | `~/src/pallet-scan/docs/` |
| Offers repository | `smb://192.168.0.1/dades/03 Comercial/02 Ofertes/` |
| Book translation | `~/Documents/Origin of the Universe (Zeneida Serra)/` |
| Workshop docs | `~/Documents/Workshop/` |
