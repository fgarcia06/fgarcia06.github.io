# Voice-Controlled Fan — TensorFlow Lite Micro + INMP441 + Motor on RP2040

**Course:** ECE 407 — Project 3  
**Team:** Group 0x02 — Francis Garcia (fgarcia) & Raphael Ramos (rramos)  
**Platform:** Raspberry Pi Pico / RP2040  
**Source:** `Project3/Part1/` and `Project3/Part2/`

---

## What This Project Is About

Project 3 integrates a pre-trained speech recognition model onto the RP2040 to voice-control a DC fan. Saying **"yes"** turns the fan on; saying **"no"** turns it off. The potentiometer from Project 2 continues to set motor speed and direction when the fan is enabled. A 12-LED WS2812B ring shows system state. The INMP441 MEMS microphone provides live audio input.

The project is split into two parts:

**Part 1 — Bring-Up:** Connect the upstream `ECE407_pico-wake-word` / `micro_speech` TensorFlow Lite Micro pipeline to the INMP441 microphone. Use only the onboard LED as output to verify that audio capture and speech inference work before adding any motor hardware.

**Part 2 — Full Integration:** Replace the onboard LED output with real motor and LED ring control. Add a command threshold, cooldown timer, and repeated-trigger suppression to make voice control usable and stable.

---

## Hardware Components

| Component | Connection | Purpose |
|-----------|-----------|---------|
| Raspberry Pi Pico | — | Main MCU (RP2040) |
| INMP441 MEMS microphone | SCK→GP10, WS→GP11, SD→GP12, L/R→GND | I2S digital audio input |
| DC fan motor | Via H-bridge | Motor output |
| TC1508A H-bridge | DIR→GP16, PWM→GP17 | Motor drive |
| 10 kΩ potentiometer | Wiper→GP26 (ADC0) | Speed and direction input |
| WS2812B 12-LED ring | Data→GP28 | Visual status feedback |
| Debug Probe Pico | SWD | Debugging |

---

## Architecture

```
INMP441 Microphone
  │  I2S (SCK/WS/SD)
  ▼
PIO State Machine (inmp441.pio)
  │  32-bit I2S frames at 16 kHz
  ▼
DMA Ring Buffer (continuous, double-buffered)
  │  mono int32 PCM samples
  ▼
micro_speech audio provider (main_functions.cpp)
  │  512-sample slices → 30 ms mel spectrogram windows
  ▼
TensorFlow Lite Micro Interpreter
  │  pre-trained wake-word model (yes / no / unknown / silence)
  ▼
recognize_commands.cpp
  │  score averaging, new-command detection
  ▼
command_responder.cc
  │  calls voice_fan_control_handle_command()
  ▼
voice_fan_control.c
  ├── threshold filter (score ≥ 170 for "yes", ≥ 145 for "no")
  ├── cooldown gate (1800 ms between accepted commands)
  └── command_logic.c  ──►  motor_control.c  (PWM + H-bridge)
                       └──►  led_ring.c       (WS2812B PIO)

Potentiometer (GP26 ADC) ──► motor_control_read_speed_state()
```

### State Machine (command_logic)

```
LISTENING ──── "yes" (score ≥ 170) ────► FAN_ON
LISTENING ──── "no"  (score ≥ 145) ────► FAN_OFF (no-op, already off)
FAN_ON    ──── "no"  (score ≥ 145) ────► FAN_OFF
FAN_ON    ──── "yes" (score ≥ 170) ────► no-op (already on)
              └── cooldown: 1800 ms before next accepted command
```

LED ring states:
- **Listening:** steady dim pattern
- **Command accepted:** brief flash (700 ms)
- **Motor active:** tachometer fill matching speed (reused from Project 2)

---

## Project Components (Source Files)

```
Project3/
├── Part1/
│   ├── src/
│   │   ├── main.cpp              — USB serial init, setup/loop call
│   │   ├── main_functions.cpp    — TFLite setup, audio slice, inference loop
│   │   ├── command_responder.cc  — Receives recognized command, toggles LED
│   │   └── recognize_commands.cpp/h — Score averaging, new-command detection
│   ├── inmp441.pio               — PIO I2S program for INMP441
│   └── CMakeLists.txt
├── Part2/
│   ├── src/
│   │   ├── main.cpp              — Entry point, interleaves loop() + voice_fan_control_tick()
│   │   ├── main_functions.cpp    — TFLite inference loop (unchanged from Part 1)
│   │   ├── command_responder.cc  — Routes command to voice_fan_control_handle_command()
│   │   ├── recognize_commands.cpp/h
│   │   ├── voice_fan_control.c/h — Top-level glue: init, tick, handle_command
│   │   ├── command_logic.c/h     — Motor enable/disable with cooldown
│   │   ├── motor_control.c/h     — ADC read, PWM apply (from Project 2)
│   │   ├── led_ring.c/h          — WS2812 state display
│   │   └── system_state.h        — Shared state enum
│   ├── inmp441.pio
│   ├── ws2812.pio
│   └── CMakeLists.txt
├── docs/
│   ├── PROJECT3_REPORT.md
│   ├── INMP441.pdf               — Microphone datasheet
│   ├── WS2812B.pdf
│   ├── TC1508-L298N datasheet
│   └── rp2040-datasheet.pdf
└── ECE407_pico-wake-word/        — Upstream TFLite Micro project (speech model)
```

---

## Key Implementation Details

### Audio Capture (PIO + DMA)
The INMP441 outputs I2S — a synchronous serial audio protocol. The RP2040 has no hardware I2S peripheral, so a PIO program generates the clock (`SCK`) and word-select (`WS`) signals and samples the data line (`SD`). DMA moves completed 32-bit frames from the PIO RX FIFO into a ring buffer without CPU intervention, so audio capture never stalls the inference loop.

### TensorFlow Lite Micro Integration
The `micro_speech` pipeline (from the upstream wake-word project) expects a `GetAudioSamples()` function that returns 16 kHz PCM data. The integration work was wiring the INMP441 PIO/DMA path to fill that buffer. The model, interpreter, and feature extraction were used unchanged.

### Command Filtering (Why It Matters)
The speech model runs continuously and scores every 30 ms window. Without filtering, weak or spurious detections would toggle the motor erratically. Three layers of filtering were added:
1. **Score threshold** — ignore weak detections below a minimum confidence
2. **New-command gate** — ignore repeated detections of the same command
3. **Cooldown timer** — block any new command for 1800 ms after an accepted one

### Mixed C / C++ Codebase
The TFLite runtime and audio provider are C++. The motor, LED, and control logic are plain C. The `extern "C"` linkage declaration in `main.cpp` bridges the two.

---

## Learning Takeaways

- **Prove the hardest path first.** Part 1 isolated audio capture + speech inference before adding motor hardware. This made Part 2 integration straightforward because only one unknown was introduced at a time.
- **ML model output is noisy — treat it as a sensor, not a switch.** The model scores every window regardless of whether a word was spoken. Without thresholding and cooldown, any background noise near the target frequency triggers false commands.
- **Reusing upstream code correctly means understanding its interface, not its internals.** The integration didn't require understanding TFLite internals — only which callback functions to implement (`GetAudioSamples`, `RespondToCommand`).
- **DMA ring buffers decouple capture from processing.** Audio arrives at hardware speed (16 kHz); inference runs at its own pace. The ring buffer absorbs the timing mismatch without dropping samples.
- **Voice is a good coarse control; manual input is better for fine control.** "yes/no" maps naturally to on/off state changes. Using voice to set a continuous motor speed would have been unreliable. The potentiometer handles fine speed control much better.
- **Mixed C/C++ in embedded firmware is common but requires explicit `extern "C"` guards.** C++ mangles function names; the C files need unmangled symbols.
- **Cooldown timers are essential UX.** Without a cooldown, a single spoken "yes" could produce 5–10 accepted triggers in rapid succession from the sliding inference window.

---

## Skills Learned

- TensorFlow Lite Micro: model loading, interpreter setup, input/output tensor management
- Wake-word / keyword spotting pipeline (mel spectrogram → CNN inference → command scoring)
- PIO-based I2S audio capture (custom `.pio` program for INMP441)
- DMA ring buffer for continuous audio streaming
- Mixed C/C++ embedded firmware with `extern "C"` linkage
- Command debouncing and cooldown logic for noisy ML model output
- System integration across multiple subsystems (audio, ML, motor, LED, ADC)
- Incremental hardware bring-up strategy (Part 1 → Part 2)

## Skills Needed to Go Deeper

- Training or fine-tuning a wake-word model (Python, TensorFlow, dataset collection)
- Understanding mel spectrogram feature extraction and MFCC
- Quantization-aware training and INT8 model deployment
- Continuous audio streaming with double-buffered DMA (ping-pong)
- RTOS task isolation (audio capture, inference, and control in separate tasks)
- Custom wake words beyond the stock "yes/no" vocabulary
