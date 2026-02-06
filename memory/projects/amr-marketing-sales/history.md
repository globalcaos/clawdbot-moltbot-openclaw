# AMR Marketing Sales History

*Automated marketing material generation for Autonomous Mobile Robots.*

---

## Purpose

Automatically generate professional marketing materials from CRM data, reducing manual work and ensuring consistency.

---

## Deliverables

| Type | Format | Use Case |
|------|--------|----------|
| Presentations | PowerPoint | Sales meetings, demos |
| Flyers | PDF | Trade shows, handouts |
| White papers | PDF | Technical buyers |

---

## Technology Stack

| Library | Purpose |
|---------|---------|
| python-pptx | PowerPoint generation |
| reportlab | PDF generation |
| jinja2 | Template engine |
| pandas | CRM data handling |

---

## Data Sources

### CRM Exports
- Format: TBD (depends on CRM system)
- Contains: Customer info, product specs, pricing

### Offers Repository
- **Location:** `smb://192.168.0.1/dades/03 Comercial/02 Ofertes/`
- **Domain:** TSERRA.local
- **User:** o.serra
- **Note:** Use PDF versions (unchanged originals)
- **Versions:** Multiple versions indicate amendments

---

## Workflow

1. Export data from CRM
2. Select template (presentation/flyer/white paper)
3. Run generation script
4. Output: Ready-to-use marketing materials

---

## Status

🟡 Paused — In progress but not currently active

---

## Location

Source: `~/src/amr-marketing-sales/`

---

## Connection to SerraVision

This project supports the sales efforts for:
- AGVs (Automated Guided Vehicles)
- AMRs (Autonomous Mobile Robots)
- Other SerraVision.ai products

---

*Last updated: 2026-02-04*
