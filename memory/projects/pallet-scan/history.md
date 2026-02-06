# Pallet-Scan History

*Timeline and technical details of the ZED camera volume measurement project.*

---

## Project Origin

**Purpose:** Automated pallet volume measurement using stereo vision
**Core Concept:** `Total Volume - Baseline Volume = Pallet Volume`
**Location:** `~/src/pallet-scan/`

---

## Hardware Setup

| Component | Details |
|-----------|---------|
| **Laptop** | MSI Creator 15 |
| **GPU** | NVIDIA RTX 3080 (16GB VRAM) |
| **Camera** | ZED 2i stereo camera (USB 3.0) |
| **SDK** | ZED SDK v5.1.0 |
| **CUDA** | 12.8 |

---

## Technical Architecture

### Depth Modes
- **ULTRA:** Highest quality, slower
- **QUALITY:** Balanced
- **PERFORMANCE:** Fastest, lower quality
- **NEURAL:** AI-enhanced (requires TensorRT 10.9)

### Point Cloud Pipeline
1. Capture stereo pair → ZED SDK
2. Compute depth map → CUDA
3. Generate point cloud → Open3D
4. Visualize → OpenCV

---

## 7-Phase Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Single camera optimization | ✅ Complete |
| 2 | Floor detection & segmentation | ⬜ Pending |
| 3 | Dual camera setup & calibration | ⬜ Pending |
| 4 | Depth map fusion | ⬜ Pending |
| 5 | Volume calculation | ⬜ Pending |
| 6 | Baseline management | ⬜ Pending |
| 7 | Production integration | ⬜ Pending |

---

## Active Issues

### TensorRT Missing
- NEURAL depth mode requires TensorRT 10.9
- Currently not installed
- Would significantly improve depth quality

### Research Needed
- Advanced stereoscopic algorithms
- Multi-camera calibration techniques
- Point cloud registration

---

## Shared Infrastructure

This project uses Oscar's shared Claude memory system:
```
~/src/claude_memory/        ← Shared behavioral rules
~/src/.claude_global/       ← Shared tools
project/claude_memory       → symlink
```

Python environment: `~/src/venv3.10`

---

## Key Insight from This Project

> **"Code enforcement > documentation"** — If rules keep being violated, enforce with code.

This principle was later applied to OpenClaw security classification.

---

*Last updated: 2026-02-04*
