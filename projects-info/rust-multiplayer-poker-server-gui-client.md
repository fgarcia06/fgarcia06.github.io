# Rust Multiplayer Poker — Server + GUI Client (ECE 421 Project 3)

## What the Project Is

A fully networked, multiplayer poker application written entirely in Rust. Players connect to a headless TCP server through a desktop GUI client. The server manages authentication, game state, and three poker variants; the client renders the game and handles all player interaction through an `egui`-based graphical interface. Persistent player stats and game history are stored in MongoDB.

This was an academic project (ECE 421) built in multiple parts, culminating in Part 3 — the full GUI client + server integration.

---

## Project Components

### 1. `server/` crate — `dealer`

| File | Role |
|---|---|
| `main.rs` | Entry point. Starts TCP listener on `:8080`, dispatches JSON commands to handlers, spawns async game tasks. |
| `comms.rs` | Per-client thread handler, `send_to_client`, `broadcast_message`, `broadcast_to_game_players`, `send_to_player_by_id`. |
| `db.rs` | All MongoDB operations: `init_db`, `init_game_state`, `update_game_state_field`, `update_game_results`, `handle_stats`, `get_user_stats`, `handle_spectate_command`. |
| `user_info.rs` | `handle_registration` and `handle_login` — JSON-in, string-out async functions. |
| `deck.rs` | `Card`, `Suit`, `Deck` (shuffled 52-card), and a complete `rank_poker_hand` evaluator covering all hand ranks from High Card to Royal Flush. |
| `five_card_draw.rs` | `Player` and `PokerGame` structs; Five Card Draw game logic. |
| `five_card_game.rs` | `run_five_card_game` — async game loop for Five Card Draw. |
| `seven_card_stud.rs` | Seven Card Stud logic (mixed face-up/face-down dealing, progressive betting rounds). |
| `seven_card_game.rs` | `run_seven_card_game` — async game loop for Seven Card Stud. |
| `texas_holdem.rs` | Texas Hold'em logic (hole cards, community cards, blinds). |
| `texas_game.rs` | `run_texas_game` — async game loop for Texas Hold'em. |

**Key global state (via `OnceLock`):**
- `NUM_PLAYERS` — set at server startup from CLI prompt.
- `GAME_VARIANT` — `"5card"`, `"7card"`, or `"texas"`, set at startup.
- `GAME_PLAYERS` — `Arc<Mutex<HashMap<username, SocketAddr>>>`, built as players send `"ready"`.

---

### 2. `player/` crate — GUI Client

| File | Role |
|---|---|
| `main.rs` | Entire client: `PlayerApp` state machine, all `egui` screens, TCP networking threads. |

**Application states (`AppState`):**

```
Auth → Ready → InGame
           ↓       ↓
         Stats  Spectator
```

**Screen breakdown:**

| Screen | What it does |
|---|---|
| `Auth` | Login / Register with username, password, server IP. One-shot TCP connection per attempt. |
| `Ready` | Lobby waiting room. Sends `"ready"` command to join the game. Links to Stats / Spectator. |
| `InGame` | Renders cards, community cards, pot, bets. Provides bet input (`check=0`, `fold=-1`) and card-swap UI. |
| `Stats` | Shows all usernames; search bar fetches per-user stats (wins, losses, games played, money won/lost). |
| `Spectator` | Polls server every 2 seconds via `"spectate"` command; renders full live game state read-only. |

**Networking model:**
- Auth attempts: one-shot `TcpStream` per button click, response written to `Arc<Mutex<String>>`.
- Post-login: persistent background `thread::spawn` loop with two `mpsc` channels — `ui_to_net_tx` (UI sends commands) and `net_to_ui_rx` (server pushes state updates). Non-blocking reads with `100ms` sleep.

---

## Architecture

```
┌────────────────────────────────────────────────┐
│                  CLIENT (egui)                 │
│  Auth Screen → Ready Screen → InGame Screen    │
│        ↕                ↕              ↕       │
│   one-shot TCP    mpsc channels   mpsc channels│
└────────────┬───────────────────────────────────┘
             │ TCP :8080  (JSON messages)
┌────────────▼───────────────────────────────────┐
│               SERVER (tokio + std::thread)     │
│  main loop: TcpListener (non-blocking)         │
│    ├── per-client thread (comms.rs)            │
│    │     reads/writes TcpStream                │
│    │     forwards via mpsc to main loop        │
│    └── main loop dispatches commands:          │
│          register / login → user_info.rs       │
│          ready → GAME_PLAYERS, spawns game     │
│          bet / swap → MongoDB update           │
│          stats / get_user_stats → db.rs        │
│          spectate → db.rs (game state doc)     │
│                                                │
│  Game tasks (tokio::spawn):                   │
│    run_five_card_game / run_seven_card_game    │
│    run_texas_game                              │
│      └── uses deck.rs for cards + evaluation  │
│      └── broadcasts JSON state to players     │
│      └── polls MongoDB for bet/swap turns     │
└────────────────────┬───────────────────────────┘
                     │
              ┌──────▼──────┐
              │   MongoDB   │
              │  dealer db  │
              │  players    │  ← auth, stats, bet/swap turns
              │  games      │  ← live game state (spectate)
              │  lobbies    │
              │  history    │  ← completed game records
              └─────────────┘
```

**Communication protocol:** All messages are JSON strings, fixed-padded to a 2048-byte buffer with null bytes used as terminators.

**Concurrency model:**
- Server: `std::thread` per client + `tokio::spawn` for async game loops.
- Shared mutable state protected by `Arc<Mutex<...>>`.
- Game turn synchronization uses MongoDB as a polling bus — server writes `"bet_turn": true` to a player's document, polls until `"bet_turn": false`, meaning the client has written their bet back.

---

## Poker Variants

| Variant | Cards | Betting Rounds | Special Mechanic |
|---|---|---|---|
| Five Card Draw | 5 private | 2 | Card swap phase |
| Seven Card Stud | 7 (3 down, 4 up) | 5 | Face-up cards visible to all; face-down hidden |
| Texas Hold'em | 2 hole + 5 community | 4 (pre-flop, flop, turn, river) | Small/big blinds; shared community cards |

**Betting actions:** Check (0), Call, Raise, Fold (−1).

---

## Learning Takeaways

### Rust-Specific Concepts
- **Ownership and borrowing across threads** — `Arc<Mutex<T>>` for shared state; understanding when to clone vs. reference.
- **`OnceLock`** for safe global initialization of server config without runtime overhead.
- **`mpsc` channels** as the backbone for thread communication — decoupling network I/O from business logic.
- **Non-blocking I/O** with `ErrorKind::WouldBlock` — manually managing a poll loop instead of relying on async for the std-thread parts.
- **`tokio` async runtime** for database operations and game loops, mixed with `std::thread` for TCP connection handling.
- **Pattern matching on enums** (`HandRank`, `AppState`, `Mode`) as a clean way to model finite state machines.
- **`serde_json`** for serialization/deserialization as the entire client-server protocol layer.

### Systems / Networking Concepts
- **TCP as a message bus** — framing messages in a fixed-size buffer, using null bytes as delimiters.
- **Client-server architecture** — clear separation between stateless client display and stateful server logic.
- **Threaded vs. async concurrency** trade-offs — `std::thread` for long-lived I/O loops vs. `tokio::spawn` for async DB tasks.
- **Shared mutable state** in a concurrent server — identifying what needs a mutex vs. what can be immutable.
- **Polling vs. push** — using MongoDB as a turn-notification mechanism (a practical workaround when you don't have a proper signaling channel into the async game loop).

### Database Concepts
- **MongoDB with Rust** (`mongodb` crate) — connecting, querying with BSON `doc!` macros, cursors, `find_one`, `update_one`, `$inc`/`$set` operators.
- **Document-oriented modeling** — storing game state as a single live document (`_id: 1`) that gets overwritten in place.
- **Separating concerns across collections** — `players`, `games`, `lobbies`, `history` each serving a distinct role.

### GUI / Frontend Concepts
- **`egui`/`eframe` immediate mode GUI** — the entire UI re-renders every frame; state drives appearance, not the other way around.
- **Thread-safe UI updates** — `Arc<Mutex<String>>` bridging a background network thread to the render loop.
- **State machine UI** — `AppState` enum controlling which screen renders, with clean transitions on server responses.
- **Separating network I/O from rendering** — background thread owns the `TcpStream`; UI thread only reads from a channel.

### Game Logic Concepts
- **Poker hand evaluation** — frequency maps, sorting, and pattern matching to correctly rank all hand types including edge cases (wheel straight, ace-low).
- **Turn-based game design** — coordinating whose turn it is across a network with unreliable timing.
- **Card visibility rules** — Seven Card Stud's face-up/face-down mechanic mapped directly to what each client renders.

---

## Skills Learned and Needed

### Skills Demonstrated
- Rust systems programming (ownership, lifetimes, traits, enums, pattern matching)
- Async Rust with `tokio`
- TCP socket programming (server + client)
- JSON-based protocol design
- MongoDB integration from Rust
- `egui` immediate-mode GUI development
- Multi-threaded application design with `Arc<Mutex<T>>` and `mpsc`
- Unit testing async Rust code (`#[tokio::test]`)
- Poker hand evaluation algorithm

### Skills Needed to Go Further
- **TLS / secure transport** — passwords are sent in plaintext over TCP
- **Password hashing** — stored and compared in plain text; needs `bcrypt` or `argon2`
- **Proper framing protocol** — fixed 2048-byte buffers are fragile; length-prefixed frames or newline delimiters would be more robust
- **Async throughout** — mixing `std::thread` and `tokio` adds complexity; a fully async server with `tokio::net::TcpListener` would be cleaner
- **Error handling discipline** — many `.unwrap()` calls that would panic in production
- **Reconnection logic** — client has no recovery path if the TCP connection drops mid-game
- **UI polish** — `egui` layout is functional but minimal; card rendering as actual card visuals rather than text strings
