# Pallet-Scan

*ZED 2i stereo camera system for automated pallet volume measurement.*

---

## Purpose

Measure pallet volumes using stereo vision: `Total Volume - Baseline Volume = Pallet Volume`

## Tech Stack

- Python 3.10 (`~/src/venv3.10`)
- ZED SDK v5.1.0
- CUDA 12.8 (needs TensorRT 10.9 for NEURAL mode)
- Open3D for point cloud processing
- OpenCV for visualization

## Hardware

- MSI Creator 15 laptop
- NVIDIA RTX 3080 (16GB)
- ZED 2i camera (USB 3.0)

## 7-Phase Roadmap

1. ✅ Single camera optimization
2. ⬜ Floor detection & segmentation
3. ⬜ Dual camera setup & calibration
4. ⬜ Depth map fusion
5. ⬜ Volume calculation
6. ⬜ Baseline management
7. ⬜ Production integration

## Active Issues

- TensorRT missing → NEURAL depth mode unavailable
- Advanced stereoscopic algorithm research planned

## Source

`~/src/pallet-scan/`

---

*Last updated: 2026-02-04*
