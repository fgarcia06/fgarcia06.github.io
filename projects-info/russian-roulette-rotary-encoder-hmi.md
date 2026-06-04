# Russian Roulette — Rotary Encoder HMI with WS2812 LED Ring

**Course:** ECE 407 — Project 1  
**Team:** Group 0x02 — Francis Garcia (fgarcia) & Raphael Ramos (rramos)  
**Platform:** Raspberry Pi Pico / RP2040  
**Source:** `Project1/russian_roulette/`

---

## What This Project Is About

Project 1 is a human-machine interface (HMI) built entirely on the RP2040. The theme is a 6-chamber Russian roulette game. A mechanical rotary encoder is the only input device. A 12-LED WS2812B ring is the primary display. A second RGB LED built into the encoder knob provides status color feedback.

The game works like this:
- **Idle** — ring breathes blue, waiting for the player to press the encoder button.
- **Arming** — player spins the encoder to load randomness (spin energy) into the PRNG seed. Faster spinning raises the energy level; the ring and knob LED shift from green to yellow to red.
- **Ready** — encoder rotation moves a selection cursor around the 6 chambers. Unused chambers glow dim blue; the selected chamber highlights white. Pressing the button fires the selected chamber.
- **Reveal** — a spinner animation plays, then the result is shown. A safe chamber flashes green and increments the streak. The zap chamber flashes red and triggers game-over.
- **Game Over** — the streak count is shown as lit chamber pairs; the knob pulses red. Auto-returns to idle after 3 seconds. A long press on the button resets at any time.

---

## Hardware Components

| Component | Connection |
|-----------|-----------|
| Raspberry Pi Pico | Main MCU |
| Rotary Encoder (24-step quadrature, with RGB LED and push switch) | A→GP13, B→GP14, SW→GP17, RGB→GP18/19/20 |
| WS2812B 12-LED RGB Ring | Data→GP16, VCC→3.3V |
| Debug Probe Pico | SWD debugging via OpenOCD |
| 220Ω resistors | Current limiting for encoder RGB LED |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    RP2040 (main loop)                │
│                                                      │
│  ┌──────────────┐    ┌──────────────────────────┐   │
│  │ Encoder Read │    │  Game State Machine       │   │
│  │ (GPIO poll)  │    │  ST_IDLE                  │   │
│  │              │───▶│  ST_ARMING                │   │
│  │ Quadrature   │    │  ST_READY                 │   │
│  │ table decode │    │  ST_REVEAL                │   │
│  │ enc_step()   │    │  ST_GAMEOVER              │   │
│  └──────────────┘    └────────────┬─────────────┘   │
│                                   │                  │
│  ┌──────────────┐    ┌────────────▼─────────────┐   │
│  │ Button Debounce│  │  PRNG (xorshift32)        │   │
│  │ short/long   │   │  seeded by time_us_64()   │   │
│  │ press detect │   │  + spin_energy            │   │
│  └──────────────┘   └────────────┬──────────────┘   │
│                                  │                   │
│  ┌───────────────────────────────▼───────────────┐  │
│  │              PIO State Machine (pio0, sm0)     │  │
│  │              ws2812.pio — 800 kHz NZR protocol │  │
│  └───────────────────────────────────────────────┘  │
│                          │                           │
└──────────────────────────│───────────────────────────┘
                           │ single GPIO (GP16)
                    ┌──────▼──────┐
                    │  WS2812B    │
                    │  12-LED ring│
                    └─────────────┘
```

### Key Modules

| Module | Description |
|--------|-------------|
| `enc_step()` | 4×4 quadrature transition table returns +1 (CW), −1 (CCW), or 0 |
| `xorshift32()` | Fast 32-bit PRNG; state mixed with `time_us_64()` + spin energy on arm |
| `game_lock_spin_and_ready()` | Finalizes PRNG seed and picks a random `zap_chamber` |
| `draw_ready()` | Renders chamber state to pixel buffer; calls `ws2812_show_pixels()` |
| `ws2812_program_init_local()` | Loads WS2812 PIO program, sets clock divider for 800 kHz |
| Button handler | 20 ms debounce edge detection; distinguishes short (<800 ms) vs long (>1 s) press |
| Arming animation | Non-blocking timer-based spinner; speed proportional to `spin_energy` |
| Idle breathe | Non-blocking breathing animation using `time_us_64()` delta |

---

## Project Components (Source Files)

```
Project1/
├── russian_roulette/
│   ├── russian_roulette.c   — All game logic, encoder decode, LED draw, main loop
│   ├── ws2812.pio           — PIO assembly for WS2812 NZR bit-banging
│   ├── CMakeLists.txt
│   └── pico_sdk_import.cmake
└── docs/
    ├── GDB HOWTO.md         — OpenOCD + GDB setup instructions
    └── PEL12T datasheet     — Rotary encoder with switch and illuminated shaft
```

---

## Learning Takeaways

- **PIO is essential for timing-critical protocols.** The WS2812 requires 800 kHz NZR signaling with ±150 ns tolerances. Bit-banging from the CPU is unreliable at this frequency; the PIO state machine handles it deterministically without CPU involvement.
- **Quadrature decoding needs a transition table, not if-else chains.** The 4×4 state table for (prev_AB, curr_AB) cleanly handles all 16 transitions, including invalid/bounce states, in a single array lookup.
- **PRNG seeding matters for game feel.** A fixed seed means the same bullet chamber every time. Seeding with real elapsed time plus user-controlled spin energy introduces genuine entropy.
- **Non-blocking animation requires thinking in timestamps, not `sleep_ms`.** All animations (breathe, spinner, debounce) track `time_us_64()` deltas so the main loop never stalls.
- **Button debounce and long-press detection can be done in software** with just two timestamps and a flag — no external hardware needed.
- **GDB over SWD is indispensable for embedded state machine debugging.** Being able to inspect `st`, `zap_chamber`, `selected_chamber`, and `used_mask` live avoids hours of guessing.
- **Common-anode RGB LED logic is inverted.** Writing `gpio_put(pin, 0)` turns the LED ON; writing `1` turns it OFF. Easy to get backwards.

---

## Skills Learned

- RP2040 PIO: writing `.pio` programs, loading them, configuring clock dividers, TX FIFO push
- WS2812B NZR protocol (GRB byte order, 800 kHz timing, 80 µs reset)
- Quadrature encoder decoding (state table approach)
- Software PRNG (xorshift32, seed mixing)
- Non-blocking firmware loop design with `time_us_64()` deltas
- State machine design in C (`enum` + `switch` / function-per-state)
- Hardware debounce logic in software
- OpenOCD + GDB live debugging on RP2040

## Skills Needed to Go Deeper

- Interrupt-driven encoder reading (avoids missing pulses at high spin speed)
- DMA-driven WS2812 updates (removes blocking `sleep_us(80)` reset)
- Persistent high score storage in Pico flash
- RTOS task decomposition (separate encoder, display, and game logic tasks)
