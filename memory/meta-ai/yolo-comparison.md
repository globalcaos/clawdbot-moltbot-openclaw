# YOLO Architecture Comparison — Living Document

**Last Updated:** 2026-02-05
**Maintained by:** JarvisOne (Meta-AI Research Cron)

---

## Why YOLO26 is Special

YOLO26 (September 2025, Ultralytics) represents a paradigm shift in the YOLO family. Here's what makes it different:

### 🎯 Key Architectural Innovations

| Feature | What It Does | Why It Matters |
|---------|--------------|----------------|
| **NMS-Free Inference** | Native end-to-end detection without Non-Maximum Suppression | Eliminates post-processing latency, simplifies deployment |
| **No DFL (Distribution Focal Loss)** | Simplified bounding box regression | Faster exports, better hardware compatibility (ONNX, TensorRT, CoreML) |
| **ProgLoss** | Progressive loss balancing during training | More stable convergence, better small object detection |
| **STAL** | Small-Target-Aware Label Assignment | Dramatically improves detection of small objects |
| **MuSGD Optimizer** | Hybrid of SGD + Muon (from LLM training) | Faster, more stable training convergence |

### 🔬 How NMS-Free Works

Traditional YOLO:
```
Image → CNN → Many Predictions → NMS Post-Processing → Final Boxes
                                      ↑
                            (Slow, tunable IoU threshold)
```

YOLO26:
```
Image → CNN → Learned Suppression → Final Boxes
                    ↑
        (End-to-end, no hyperparameters)
```

The model learns to output non-overlapping predictions directly, eliminating the handcrafted NMS step.

### 🧮 ProgLoss (Progressive Loss Balancing)

Instead of fixed loss weights throughout training:
- **Early training:** Emphasize classification (what is it?)
- **Mid training:** Balance classification + localization
- **Late training:** Emphasize localization (where exactly?)

This mimics how humans learn — first recognize, then refine position.

### 🎯 STAL (Small-Target-Aware Label Assignment)

Previous YOLO versions struggled with small objects because:
1. Small objects produce weak feature activations
2. Standard label assignment underweights them

STAL:
- Dynamically adjusts positive sample assignment based on object size
- Larger assignment radius for small objects
- More anchor points assigned to small targets

---

## Benchmark Comparison Table

| Model | mAP@50 | mAP@50-95 | Params | FLOPs | Latency (T4) | Edge Ready |
|-------|--------|-----------|--------|-------|--------------|------------|
| **YOLO26n** | 37.3% | — | 2.6M | 6.5G | 1.2ms | ⭐⭐⭐⭐⭐ |
| **YOLO26s** | 44.9% | — | 9.1M | 21.5G | 2.0ms | ⭐⭐⭐⭐⭐ |
| **YOLO26m** | 50.0% | — | 20.1M | 67.1G | 4.3ms | ⭐⭐⭐⭐ |
| **YOLO26l** | 52.8% | — | 43.6M | 155.4G | 7.2ms | ⭐⭐⭐ |
| YOLO11m | 51.5% | 37.2% | 20.1M | 68.0G | 4.7ms | ⭐⭐⭐⭐ |
| YOLOv10m | 51.1% | 38.0% | 15.4M | 59.1G | 4.9ms | ⭐⭐⭐⭐ |
| YOLOv8m | 50.2% | 36.9% | 25.9M | 78.9G | 5.3ms | ⭐⭐⭐ |
| YOLOv12m | 52.5% | 39.1% | 20.2M | 67.5G | 5.5ms* | ⭐⭐⭐ |
| RT-DETR-M | 54.7% | — | — | — | 4.5ms | ⭐⭐⭐ |

*YOLOv12 still uses NMS post-processing

### Key Observations

1. **YOLO26 matches accuracy with less latency** — NMS removal shows real gains
2. **Smaller models now viable** — YOLO26n at 1.2ms opens IoT/wearable use cases
3. **RT-DETR competition** — Transformer-based detection catching up, but heavier
4. **Edge deployment winner** — YOLO26 explicitly optimized for Jetson Orin/Nano

---

## Task Support Comparison

| Model | Detection | Segmentation | Pose | OBB | Classification |
|-------|-----------|--------------|------|-----|----------------|
| **YOLO26** | ✅ | ✅ | ✅ | ✅ | ✅ |
| YOLO11 | ✅ | ✅ | ✅ | ✅ | ✅ |
| YOLOv10 | ✅ | ❌ | ❌ | ❌ | ✅ |
| YOLOv8 | ✅ | ✅ | ✅ | ✅ | ✅ |
| RT-DETR | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Export Format Comparison

| Model | ONNX | TensorRT | CoreML | TFLite | OpenVINO | Edge TPU |
|-------|------|----------|--------|--------|----------|----------|
| **YOLO26** | ✅ Clean | ✅ Optimized | ✅ | ✅ INT8 | ✅ | ✅ |
| YOLO11 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| YOLOv12 | ⚠️ DFL issues | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |

YOLO26's removal of DFL makes exports significantly cleaner across all platforms.

---

## Historical Evolution

```
YOLOv1 (2016) → Single-pass detection revolution
    ↓
YOLOv3 (2018) → Multi-scale, Darknet-53
    ↓
YOLOv5 (2020) → PyTorch era, Ultralytics takes over
    ↓
YOLOv8 (2023) → Anchor-free, decoupled head
    ↓
YOLO11 (2024) → Efficiency focus, 22% fewer params than v8
    ↓
YOLOv12/v13 (2024-2025) → Attention mechanisms, still NMS-based
    ↓
YOLO26 (Sept 2025) → NMS-free, ProgLoss, STAL, MuSGD
```

---

## Relevance to Oscar's Projects

### SerraVision.ai
- **Recommended:** YOLO26m or YOLO26l
- **Why:** Multi-task (detect + segment), Jetson-optimized
- **Upgrade path:** Retrain existing YOLOv8 weights → YOLO26

### Pallet Scan
- **Recommended:** YOLO26s + SAM3
- **Why:** YOLO26 for detection, SAM3 for segmentation by description
- **Combo:** "Detect boxes → Segment 'wooden pallet' → Measure"

### Gantry Robot Arm
- **Recommended:** YOLO26n (speed) + pose estimation
- **Why:** Real-time object + pose for manipulation planning
- **Integration:** Feed to MoveIt / VLA model

---

## Sources

1. [YOLO26 Paper (arXiv:2509.25164)](https://arxiv.org/abs/2509.25164)
2. [YOLO Evolution Benchmark (arXiv:2411.00201)](https://arxiv.org/abs/2411.00201)
3. [Ultralytics Model Comparison Hub](https://docs.ultralytics.com/compare/)
4. [Roboflow Best Object Detection 2025](https://blog.roboflow.com/best-object-detection-models/)

---

*This document is maintained by the Meta-AI Research cron job. Updates occur during each scan.*
