# Open-Loop DC Motor Controller with PWM and WS2812 Tachometer

**Course:** ECE 407 — Project 2  
**Team:** Group 0x02 — Francis Garcia (fgarcia) & Raphael Ramos (rramos)  
**Platform:** Raspberry Pi Pico / RP2040  
**Source:** `Project2/Part2/project2/`

---

## What This Project Is About

Project 2 implements an open-loop DC motor speed controller. A 10 kΩ potentiometer is connected to the Pico's ADC. Its analog position is read, mapped to a PWM duty cycle, and sent to a TC1508A / MX1616 H-bridge motor driver that spins a DC fan motor. A 12-pixel WS2812B LED ring provides a real-time tachometer-style display showing speed and direction.

The potentiometer midpoint acts as a direction boundary — no extra buttons needed:
- Left of center → motor reverses (blue/purple LEDs fill counterclockwise)
- Dead zone at center → motor stops (ring off)
- Right of center → motor runs forward (green → yellow → red LEDs fill clockwise)
- Full deflection in either direction → all LEDs flash red

Part 1 was a Wokwi simulation prototype. Part 2 was the physical hardware build.

---

## Hardware Components

| Component | Part | Connection |
|-----------|------|-----------|
| Raspberry Pi Pico | RP2040 MCU | — |
| DC motor | Fan motor | Via H-bridge output |
| TC1508A / MX1616 H-bridge | Motor driver | INA→GP16, INB→GP17 |
| 10 kΩ potentiometer | Speed/direction input | Wiper→GP26 (ADC0) |
| WS2812B 12-pixel RGB ring | Visual tachometer | Data→GP28 |
| External 5V supply | Motor power | H-bridge VIN |

---

## Architecture

```
Potentiometer (GP26)
        │
        ▼
   12-bit ADC (adc_read)
        │  raw 0–4095
        ▼
   read_speed_state()
   ┌─────────────────────────────────┐
   │  raw < 1945  → DIR_REVERSE      │
   │  raw 1945–2150 → DIR_STOP       │
   │  raw > 2150  → DIR_FORWARD      │
   │  maps raw → pwm_level (0–999)   │
   │  maps raw → speed_percent (0–100│
   └───────────┬─────────────────────┘
               │
       ┌───────┴────────────┐
       ▼                    ▼
apply_motor_speed()    update_led_ring()
       │                    │
  INA pin (GPIO)       PIO state machine
  INB pin (PWM)        ws2812.pio (800 kHz)
       │                    │
       ▼                    ▼
 TC1508A H-bridge      WS2812B 12-LED ring
       │
       ▼
   DC fan motor
```

### Key Logic

| Function | Description |
|----------|-------------|
| `read_speed_state()` | Reads ADC, classifies direction, computes `pwm_level` and `speed_percent` |
| `apply_motor_speed()` | Sets INA GPIO and INB PWM level; reversal achieved by toggling INA and inverting INB duty cycle |
| `update_led_ring()` | Maps speed/direction to pixel array; HSV color gradient for smooth color transition |
| `hsv_to_rgb()` | Integer HSV→RGB conversion (hue 0–359, saturation/value 0–255) |
| Main loop | 50 ms sample period: read → apply → display → print |

### PWM Configuration

```
PWM_WRAP   = 999       → 1000-step resolution
PWM_CLKDIV = 125.0     → 125 MHz / 125 / 1000 = 1 kHz PWM frequency
```

Motor direction is controlled with two H-bridge inputs:
- **Forward:** INA = 0, INB = PWM duty
- **Reverse:** INA = 1, INB = `WRAP − duty` (inverts the effective duty)
- **Stop:** INA = 0, INB = 0

---

## Project Components (Source Files)

```
Project2/
├── Part1/
│   ├── README.md            — Wokwi simulation instructions
│   └── ECE_407_Project2_Part1.zip  — Wokwi export
├── Part2/
│   └── project2/
│       ├── main.c           — All firmware: ADC, PWM, motor, LED ring
│       ├── project2.pio     — Custom PIO file (ws2812 variant)
│       ├── ws2812.pio       — WS2812 NZR PIO program
│       └── CMakeLists.txt
└── docs/
    ├── pioasm.md            — PIO assembly reference notes
    ├── TC1508-L298N datasheet
    ├── WS2812B datasheet
    └── circuit_sketch.png   — Hand-drawn wiring diagram
```

---

## Learning Takeaways

- **Open-loop means no feedback.** The PWM duty cycle commands a voltage to the motor; actual speed is not measured. The motor may stall or vary with load and voltage, and the controller cannot correct for it. This is the fundamental limitation of open-loop vs closed-loop (PID) control.
- **ADC dead zones prevent motor jitter near zero.** Without a dead zone around midpoint (raw 1945–2150), small ADC noise would cause the motor to jiggle between forward and reverse when the pot is centered.
- **H-bridge direction requires coordinating two signals.** One pin sets direction (INA), the other drives speed (INB PWM). Sending the wrong combination can shoot-through the bridge (short circuit).
- **HSV color space makes gradient animations trivial.** Mapping speed 0→100% to hue 120→0 (green → yellow → red) is one line of math. Doing the same in RGB is much messier.
- **Prototyping in Wokwi first saved real hardware debugging time.** The Wokwi simulation caught ADC mapping errors and LED wiring issues before physical components were connected.
- **PIO handles WS2812 independently of the CPU.** Once the PIO program is loaded and the FIFO is written, the RP2040 core is free to do other work. No busy-wait bit-banging.

---

## Skills Learned

- RP2040 ADC: `adc_init()`, `adc_gpio_init()`, `adc_select_input()`, `adc_read()`
- RP2040 PWM: `pwm_gpio_to_slice_num()`, `pwm_set_clkdiv()`, `pwm_set_wrap()`, `pwm_set_chan_level()`, `pwm_set_gpio_level()`
- H-bridge motor control (TC1508A / L298N style) — direction + speed via two input pins
- WS2812B driving via PIO (same approach as Project 1)
- HSV → RGB integer conversion for smooth color gradients
- ADC → PWM mapping with dead zones and bidirectional control
- Wokwi circuit simulation and custom chip wiring
- Structured state packing (`speed_state_t` struct) for clean data flow

## Skills Needed to Go Deeper

- Closed-loop (PID) speed control using an encoder or tachometer feedback signal
- Current sensing on the H-bridge for overcurrent/stall detection
- Back-EMF braking vs coast-to-stop on motor shutdown
- DMA-driven ADC sampling for higher resolution speed readings
- Ramp-up / ramp-down speed profiles to reduce inrush current
