# PDF Report Style Guide

**Purpose:** Technical reports that are scannable, engaging, and effective at conveying data.

---

## Core Philosophy

**Newspaper-inspired layout** — Readers scan before they read. Design for the scan first, depth second.

---

## Typography & Hierarchy

### Headlines
- **H1:** Bold, large (18-24pt), dark color — the "front page" hook
- **H2:** Semi-bold (14-16pt), accent color — section anchors
- **H3:** Regular weight (12-14pt), subtle differentiation

### Body Text
- 10-11pt, high-contrast (dark gray on white, not pure black)
- 1.4-1.6 line height for readability
- Short paragraphs (3-4 sentences max)

### Pull Quotes / Snippets
- Larger text (14pt), colored or boxed
- Use for key insights that deserve to "pop"
- Like newspaper callout boxes

---

## Color Usage

### Functional Colors (Not Decorative)
| Purpose | Color | Example |
|---------|-------|---------|
| Primary accent | Deep blue (#1a365d) | Headlines, key stats |
| Success/positive | Forest green (#276749) | Good metrics, recommendations |
| Warning/attention | Amber (#c05621) | Cautions, important notes |
| Critical/negative | Crimson (#c53030) | Risks, blockers |
| Neutral emphasis | Slate gray (#4a5568) | Secondary info |

### Rules
- ✅ Color to encode meaning (green=good, red=risk)
- ✅ Colored text for emphasis in body copy
- ✅ Colored boxes/borders for section differentiation
- ❌ Random decorative colors
- ❌ More than 4 colors per page

---

## Data Visualization

### Charts (When to Use)
| Data Type | Chart Type |
|-----------|------------|
| Comparison | Horizontal bar chart |
| Trend over time | Line chart |
| Part of whole | Pie/donut (max 5 slices) |
| Ranking | Ordered list with progress bars |
| Distribution | Histogram |

### Tables
- Zebra striping (subtle alternating rows)
- Bold headers with accent color background
- Right-align numbers, left-align text
- Max 6 columns; split if more needed

### Key Metrics
- **Big number display:** 48pt+ for the number, small label below
- Use sparingly — 3-4 per page max
- Box or card-style presentation

---

## Images & Graphics

### ✅ Good Image Use
- Screenshots that illustrate a point
- Diagrams explaining architecture/flow
- Charts and graphs with data
- Icons for quick visual categorization

### ❌ Bad Image Use
- Stock photos for "aesthetic"
- Decorative illustrations without purpose
- Images that repeat what text says
- Low-resolution or stretched images

### Icons
- Use sparingly for section markers
- Consistent style (all outline OR all filled)
- 16-24px for inline, 32-48px for section headers

---

## Layout Patterns

### Executive Summary (Page 1)
```
┌─────────────────────────────────────┐
│  HEADLINE (hook)                    │
├─────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │ KPI │ │ KPI │ │ KPI │ │ KPI │    │
│ └─────┘ └─────┘ └─────┘ └─────┘    │
├─────────────────────────────────────┤
│  Key Findings (bullets)             │
│  • Finding 1                        │
│  • Finding 2                        │
│  • Finding 3                        │
├─────────────────────────────────────┤
│  Recommendation Box (colored)       │
└─────────────────────────────────────┘
```

### Detail Section
```
┌─────────────────────────────────────┐
│  Section Header                     │
├──────────────────┬──────────────────┤
│                  │                  │
│  Text content    │  Chart/Visual    │
│  with key        │                  │
│  points          │                  │
│                  │                  │
├──────────────────┴──────────────────┤
│  Pull Quote or Key Insight Box      │
└─────────────────────────────────────┘
```

### Comparison Layout
```
┌─────────────────────────────────────┐
│  Section Header                     │
├─────────────────────────────────────┤
│  ┌───────────┐    ┌───────────┐    │
│  │ Option A  │ vs │ Option B  │    │
│  │           │    │           │    │
│  │ • Pro     │    │ • Pro     │    │
│  │ • Con     │    │ • Con     │    │
│  └───────────┘    └───────────┘    │
├─────────────────────────────────────┤
│  Verdict/Recommendation             │
└─────────────────────────────────────┘
```

---

## Scannability Checklist

Before finalizing any report:

- [ ] Can I understand the main point in 10 seconds?
- [ ] Are key numbers/stats visually prominent?
- [ ] Does each section have a clear headline?
- [ ] Are there visual breaks every 2-3 paragraphs?
- [ ] Is color used for meaning, not decoration?
- [ ] Are dense tables broken up or simplified?
- [ ] Do images add information value?
- [ ] Is there white space to rest the eye?

---

## Anti-Patterns (What NOT to Do)

1. **Wall of text** — Break up with visuals, bullets, boxes
2. **Rainbow soup** — Limit to 4 colors with clear purpose
3. **Chart junk** — No 3D effects, no unnecessary gridlines
4. **Stock photo padding** — Every image must inform
5. **Buried lede** — Key insight on page 1, not page 5
6. **Tiny text tables** — If it needs 8pt font, simplify it

---

## Manus-Specific Instructions

When requesting PDF generation from Manus, include:

```
Create a polished PDF report with:
- Newspaper-inspired layout (scannable, hierarchical)
- Executive summary on page 1 with 3-4 key metrics as big numbers
- Color coding: blue for primary, green for positive, amber for caution, red for critical
- Pull quotes for key insights
- Zebra-striped tables with colored headers
- Clear section breaks with colored dividers
- White space for readability

CRITICAL FOR GRAPHS/CHARTS:
- PREFER embedding real charts from cited papers/research over generating new ones
- When using external graphs: cite source, ensure relevance, check accuracy
- Only generate charts for OUR OWN data (skill downloads, our metrics)
- If generating: use simple formats (bar, line) — avoid complex visualizations
- Always verify numbers in generated charts match the source data
```

### Graph Strategy (Learned 2026-02-08)
**Problem:** Manus makes errors when generating graphs from scratch.
**Solution:** 
1. Embed screenshots/charts from cited research papers
2. Only self-generate for data WE control (our metrics, our stats)
3. Simple > complex when generating

---

*Last updated: 2026-02-08*
