# Piano LED Device

*Universal learning tool that sits on piano keys.*

---

## Status
🟡 Conceptual

## Concept

An LED strip device that:
1. Sits above/behind piano keys (non-destructive)
2. Lights up to show which keys to press
3. Syncs with learning software/MIDI
4. Works on any piano (acoustic or digital)

## Target Market

- Self-learners
- Music students
- Piano teachers
- Hobbyists returning to piano

## Technical Requirements

### Hardware
- LED strip (addressable RGB, e.g., WS2812B)
- Microcontroller (ESP32 for WiFi/Bluetooth)
- Power supply
- Mounting mechanism (clips? magnets? weighted base?)

### Software
- MIDI input parsing
- Song library
- Speed control
- Practice modes (hands separate, loop sections)

### Challenges
- Universal fit across different piano sizes
- Key width variations
- Accurate alignment
- Response latency

## Competitive Landscape

Research needed:
- [ ] Existing piano learning devices
- [ ] Patent landscape
- [ ] Price points

## Prototyping Plan

1. Test LED strip with ESP32
2. Create mounting prototype
3. Build basic MIDI sync
4. Test on Oscar's piano
5. Iterate on feedback

## Resources Available

- Creality Ender-3 for mounting brackets
- Electronics components
- Programming skills

---

*Created: 2026-02-04*
