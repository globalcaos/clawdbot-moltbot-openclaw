# Restarting OpenClaw on Linux

**ID:** 6983cc2d-6508-8396-af98-7377fa0928cb
**Created:** 2026-02-04T22:46:27

---

## You

my installed openclaw just got stuck. how can I restart it?

---

## ChatGPT

Assuming you're running **OpenClaw on Linux** (which is the common case), "restart" just means **stop the stuck process and launch it again**. Here are the clean, escalating options—use the first that works.

---

## 1️⃣ Kill OpenClaw from a terminal (recommended)

Open a terminal and run:

```bash
pkill -f openclaw
```

or, if that doesn't catch it:

```bash
ps aux | grep -i claw
```

Find the PID, then:

```bash
kill -9 <PID>
```

After that, restart it the same way you usually do, e.g.:

```bash
./openclaw
```

or

```bash
./OpenClaw.AppImage
```

---

## 2️⃣ Kill it via System Monitor (GUI)

1. Open **System Monitor**
2. Look for:
   - `openclaw`
   - `claw`
   - `OpenClaw`
3. Select it → **End Process** or **Kill Process**
4. Relaunch OpenClaw

---

## 3️⃣ If it's totally frozen and won't die

Use the kernel "magic key" sequence (safe, immediate):

Hold **Alt + SysRq (Print Screen)** and type slowly:

```
R E I S U B
```

This reboots cleanly if the system is hard-locked.  
(Only needed if even `kill -9` fails.)

---

## 4️⃣ If OpenClaw keeps freezing on startup

Clear its config/cache (common fix):

```bash
rm -rf ~/.config/openclaw
rm -rf ~/.local/share/openclaw
```

Then restart it.

---

## Quick sanity check (optional)

Run it from terminal to see errors:

```bash
./openclaw 2>&1 | tee openclaw.log
```

This will usually reveal missing libs, OpenGL issues, or audio hangs.
