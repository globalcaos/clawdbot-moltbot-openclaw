# Meta-AI Research Consolidated Index

_Last updated: 2026-02-09_

## Purpose

Daily automated scan (04:00 CET) for performant AI models suitable for self-hosting, algorithm tracking, and project-relevant discoveries. Inspired by AURORA AI Researcher.

## Key Findings (Feb 5-9, 2026)

### Object Detection -- The Big Story

- **YOLO26** (Ultralytics, Sept 2025): NMS-free detection, no DFL, ProgLoss, STAL for small targets, MuSGD optimizer. 43% faster on CPU vs YOLOv11/12. Sub-2ms on T4 (nano). Clean INT8/FP16 export. YOLOE-26 enables open-vocabulary detection at runtime. Recommended for all projects (SerraVision, Pallet Scan, Gantry).
- **RF-DETR** (Roboflow): First real-time detector to surpass 60 AP on COCO. NMS-free with deterministic latency (4.52ms on T4). Apache 2.0 for Nano-Large. Outperforms YOLO26 on segmentation. New SOTA.
- **DMS-YOLO**: YOLOv11 variant for aerial/drone small target detection (+7% mAP50).

### Self-Hostable LLMs

- **Qwen3-Coder-Next** (Alibaba): 80B MoE, 3B active. 70.6% SWE-Bench Verified, matches Claude Sonnet 4.5 on coding. Apache 2.0. Runs on RTX 4090/5090.
- **DeepSeek-R1/V3**: 671B MoE. Matches GPT-4o, 96% cheaper per token. Needs multi-GPU.
- **GLM-4.7-Flash** (ZhipuAI): 30B MoE, 3B active. SOTA at size on SWE-bench. "Preserved Thinking" mode for agentic tasks. GGUF available for CPU via Ollama.
- **Step-3.5-Flash-Int4**: New local LLM contender for 128GB+ RAM devices.
- **GLM-5**: Confirmed for February 2026 release.
- **Phi-4-Mini** (Microsoft): 3.8B, edge/embedded deployment.
- **MiniMax-M2.1**: 229B MoE, 10B active. Beats Claude 4.5 on multilingual.

### Vision & Segmentation

- **SAM3** (Meta): Promptable Concept Segmentation -- text-prompt object tracking across video. 0.9B params. Major upgrade from SAM2.
- **Meta SAM2**: Unified image+video segmentation foundation model. Trending on HuggingFace.
- **Apple SHARP**: Single image to 3D Gaussian splat in sub-second. Open source.
- **DeepSeek OCR 2**: 80% fewer visual tokens, beats Gemini 3 Pro on document parsing.
- **GLM-OCR**: 0.9B lightweight multimodal OCR, runs on consumer hardware.

### Robotics & VLA

- **Microsoft Rho-alpha**: VLA+ with tactile sensing. Based on Phi VLM. Bimanual manipulation from natural language. Primary relevance for Gantry Robot Arm.
- **IMLE Policy**: 10x faster than Diffusion Policy for visuomotor learning.
- **MoveIt (ROS)**: Gold standard for manipulation planning.

### Video Generation

- **LTX-2** (Lightricks): First open-source video model with native audio sync. "Stable Diffusion moment" for video.
- **StreamDiffusion**: 91 FPS on RTX 4090.
- **LingBot-World** (Ant Group): 28B open-source world model, alternative to Genie 3.

### 3D Reconstruction

- **PLANING Framework**: Loosely coupled Triangle-Gaussian for streaming 3D. UAV navigation, mesh/NeRF.
- **3D Gaussian Ray Tracing** (arXiv:2602.01057): Improved pallet/object 3D reconstruction from multi-view.

### Image Generation

- **FLUX 2 Pro** (Black Forest Labs): Dominates professional image gen. 16-channel latent space.

### Key Benchmarks (Feb 2026)

| Model            | SWE-Bench     | Notes            |
| ---------------- | ------------- | ---------------- |
| Qwen3-Coder-Next | 70.6%         | 3B active params |
| Claude Opus 4.5  | ~68%          | Reference        |
| DeepSeek-R1      | ~65%          | MIT license      |
| GLM-4.7-Flash    | SOTA for size | 3B active        |

### Strategic Observations

1. MoE efficiency revolution: 3B active params match 70B dense on specialized tasks
2. Chinese labs shipping faster (Qwen, DeepSeek, GLM releasing weekly)
3. Multimodal is table stakes -- every new model handles vision+language
4. Tactile/force sensing emerging in robotics foundation models
5. NMS-free detection is the new standard (YOLO26, RF-DETR)

## YOLO Architecture Comparison Summary

YOLO26 key innovations over predecessors:

- **NMS-Free**: Learned suppression replaces handcrafted post-processing
- **No DFL**: Cleaner ONNX/TensorRT/CoreML/TFLite exports
- **ProgLoss**: Progressive loss balancing (classify first, localize later)
- **STAL**: Small-Target-Aware Label Assignment
- **MuSGD**: LLM-inspired optimizer

| Model            | mAP@50 | Latency (T4) | Edge Ready |
| ---------------- | ------ | ------------ | ---------- |
| YOLO26n          | 37.3%  | 1.2ms        | Excellent  |
| YOLO26s          | 44.9%  | 2.0ms        | Excellent  |
| YOLO26m          | 50.0%  | 4.3ms        | Good       |
| RF-DETR 2x-large | 60+ AP | 4.52ms       | Good       |

Recommended per project:

- **SerraVision**: YOLO26m/l for multi-task (detect+segment), Jetson-optimized
- **Pallet Scan**: YOLO26s + SAM3 for detection + segmentation by description
- **Gantry Robot Arm**: YOLO26n (speed) + pose estimation, feed to MoveIt/VLA

## Immediate Action Items

1. Evaluate YOLO26 and RF-DETR on existing pallet dataset
2. Test SAM3 for open-vocabulary segmentation ("wooden pallet", "cardboard box")
3. Set up Qwen3-Coder-Next via Ollama for local code assistance
4. Test GLM-4.7-Flash GGUF on available hardware
5. Watch GLM-5 release (February 2026)
6. Evaluate Meta SAM2 for Pallet Scan segmentation pipeline
7. Review Rho-alpha papers for Gantry integration patterns

## Source Files

- Daily scans: `../meta-ai/2026-02-05.md` through `2026-02-09.md`
- YOLO comparison: `../meta-ai/yolo-comparison.md`

---

_Consolidated from 5 daily scans + 1 comparison document by Phase 5-6 processing._
