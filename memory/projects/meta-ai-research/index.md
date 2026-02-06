# 🔬 Project: Meta-AI Research Agent

**Status:** Active (Cron Job)  
**Created:** 2026-02-05  
**Schedule:** Daily at 04:00  
**Inspired by:** AURORA AI Researcher  

---

## 🎯 Mission

Stay on top of AI developments to maximize time and resources. Primary focus:

1. **Best Open-Source Models** — Find the most performant self-hosted AI we can install
2. **Algorithm Tracking** — Monitor SOTA for specific applications
3. **Project Connections** — Link discoveries to Oscar's active projects

---

## 🔍 Research Domains

### Open-Source LLMs (Priority 1)
| Model | Parameters | Context | License | Local Feasibility |
|-------|------------|---------|---------|-------------------|
| Llama 3.x | 8B-405B | 128k | Meta | ✅ (8B-70B) |
| Mistral/Mixtral | 7B-8x22B | 32k | Apache | ✅ |
| Qwen 2.5 | 0.5B-72B | 128k | Apache | ✅ |
| DeepSeek | 7B-67B | 32k | MIT | ✅ |

*Track: New releases, benchmark scores, fine-tunes, quantization advances*

### Image/Video Generation
- Stable Diffusion 3.x, SDXL
- AnimateDiff, SVD
- ComfyUI workflows
- ControlNet advances

**Application:** Marketing materials, documentation visuals

### 3D Reconstruction (Pallet Scan Project)
- NeRF variants (Instant-NGP, Gaussian Splatting)
- Stereo depth estimation (RAFT-Stereo, CREStereo)
- Monocular depth (Depth Anything, MiDaS)
- Point cloud processing (Open3D, PCL)

**Application:** Pallet dimension scanning, damage detection

### Object Recognition + Optical Flow (SerraVision)
- YOLO variants (v8, v9, v10)
- RT-DETR for real-time transformers
- Optical flow (RAFT, FlowFormer)
- LSTM/Transformer fusion for temporal understanding
- Video object segmentation (SAM 2)

**Application:** Forklift/AGV perception, tracking, prediction

### Audio/Speech
- Whisper variants (faster-whisper, distil-whisper)
- Local TTS (Coqui, Bark, XTTS)
- Voice cloning advances

---

## 📊 Evaluation Criteria (AURORA-style)

For each discovery, evaluate:
- 🔬 **Scientific Novelty** — Is this genuinely new?
- 💰 **Commercial Potential** — Can we monetize or save costs?
- ⚙️ **Automation Feasibility** — Can agents use this?
- 🔗 **Project Relevance** — Links to Oscar's work?

Tags: `#opensource` `#paid` `#breakthrough` `#incremental`

---

## 🔄 Cron Job Spec

```yaml
schedule:
  kind: cron
  expr: "0 4 * * *"  # 04:00 daily
  tz: Europe/Madrid

payload:
  kind: agentTurn
  message: |
    META-AI RESEARCH SCAN
    
    1. Check arXiv cs.AI, cs.CV, cs.LG for last 24h
    2. Check HuggingFace trending models
    3. Check GitHub trending (AI/ML topics)
    4. Check r/LocalLLaMA, r/StableDiffusion for community discoveries
    
    For notable findings:
    - Assess novelty, commercial potential, automation feasibility
    - Link to Oscar's projects (SerraVision, Pallet Scan, Gantry)
    - Note if it could replace/upgrade current tools
    
    Output: Markdown digest to memory/meta-ai/YYYY-MM-DD.md
    
    If breakthrough discovered: Flag for immediate notification

sessionTarget: isolated
```

---

## 📁 Output Structure

```
memory/meta-ai/
├── 2026-02-05.md  # Daily digests
├── 2026-02-06.md
├── breakthroughs.md  # Notable discoveries
└── models-inventory.md  # Current SOTA reference
```

---

## 🎯 Future Evolution

Phase 2: Auto-upgrade agent
- Monitor for models that outperform current stack
- Test in sandbox environment
- Propose upgrades with evidence
- Execute with approval (or auto if low-risk)

---

*"An AI that studies intelligence to enhance intelligence itself."* — AURORA Manifest
