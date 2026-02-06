# 🤖 Project: Gantry Robot Arm

**Status:** Planning  
**Created:** 2026-02-05  
**Owner:** Oscar Serra  

---

## 🎯 Vision

A workshop gantry system with a robotic arm, controlled by JarvisOne, capable of:
- **Welding** — Automated or assisted welding operations
- **3D Printing** — Large-format additive manufacturing
- **Helping Hand** — Real-time assistance during manual work (Iron Man style)
- **Safety Monitoring** — Fire detection, accident prevention, intruder alerts

---

## 🏗️ Current State

**Physical Infrastructure:**
- ✅ Two parallel H-beams already installed in workshop
- ⬜ Gantry carriage system
- ⬜ Robotic arm mount
- ⬜ End effectors (welder, print head, gripper)

**Control System:**
- ⬜ Motion controller (likely SIEMENS or custom)
- ⬜ JarvisOne integration API
- ⬜ Real-time feedback loop

**Vision System:**
- ⬜ Cameras (stereo for depth?)
- ⬜ Fire/smoke detection model
- ⬜ Object/human detection for safety
- ⬜ Precision positioning feedback

---

## 📐 Technical Considerations

### Gantry Design
- H-beam span: TBD (measure)
- Travel requirements: X, Y, Z axes
- Payload capacity needed for arm + tools
- Speed vs precision tradeoffs

### Robot Arm Options
| Option | Reach | Payload | Price Range | Notes |
|--------|-------|---------|-------------|-------|
| DIY 6-axis | Variable | 2-5kg | €500-2000 | Full control, learning curve |
| UR3e/UR5e | 500-850mm | 3-5kg | €20k-30k | Industrial, collaborative |
| Dobot CR series | 600-1300mm | 3-10kg | €10k-20k | Good mid-range |
| AR4 (Annin) | 610mm | 3kg | €3k DIY | Open source, great community |

### Vision Hardware
- Stereo cameras for depth (Intel RealSense, ZED)
- Thermal camera for fire detection
- Wide-angle for workspace monitoring

### Integration with SerraVision
- Reuse YOLOv8 training pipeline
- Add fire/smoke detection classes
- Real-time inference on Jetson or local GPU

---

## 🔗 Related Projects

- **SerraVision.ai** — Object detection, could add fire/intruder detection
- **Pallet Scan** — 3D reconstruction techniques applicable here
- **AGV Systems** — Motion control experience transfers

---

## 📋 Next Steps

1. [ ] Measure H-beam dimensions and spacing
2. [ ] Research gantry carriage designs (linear rails, V-wheels)
3. [ ] Evaluate robot arm options (AR4 looks promising for DIY)
4. [ ] Design camera mounting strategy
5. [ ] Spec out control hardware (Raspberry Pi + motor drivers? Industrial PLC?)

---

## 💡 Ideas

- **Modular end effectors** — Quick-change system for welder/printer/gripper
- **Teach mode** — Guide arm manually, record positions
- **Voice control** — "Jarvis, hold this here"
- **AR overlay** — Project work instructions onto surface

---

*This is the foundation for Iron Man's workshop assistant. Let's build it.*
