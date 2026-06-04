# Encrypted Secure File System (SFS)

**Course:** ECE 422 — Computer Security, Winter 2026  
**Team:** Team 3 — Ruchali Aery, Francis Garcia, Ayra Qutub  
**Language:** Python 3.11+  
**Source:** `src/sfs/`

---

## What This Project Is About

SFS is a simulated secure file system implemented entirely in Python. It presents users with a familiar Unix-style shell interface (`ls`, `cd`, `mkdir`, `cat`, `echo`, `mv`, `rm`, `chmod`) while storing every file, filename, and piece of metadata on disk in encrypted form using AES-256-GCM.

The core security problem being solved: **a file system where even a privileged observer with direct access to the storage directory cannot read file names, file contents, or user data.** An "external" attacker who bypasses authentication entirely sees only random-looking HMAC-derived directory names and AES-GCM ciphertext blobs — no plaintext leaks at rest.

Three security properties are enforced end-to-end:

1. **Confidentiality** — AES-256-GCM encrypts all file contents, all metadata (user accounts, group memberships, filesystem index), and all client–server communication.
2. **Integrity** — GCM's built-in authentication tag detects any tampering with ciphertext. Each file also carries an `integrity_reference` token bound as associated data to its ciphertext. External modification or ciphertext swapping between files is detected at the next login.
3. **Access Control** — a three-level DAC model (`user` / `group` / `all`) is enforced server-side on every read, write, and directory operation.

---

## Hardware / Runtime Components

| Component | Role |
|-----------|------|
| Python 3.11+ | Runtime |
| `cryptography` library | AES-256-GCM, PBKDF2-HMAC-SHA256, HMAC-SHA256 |
| `pytest` | Test suite (unit + integration) |
| Host filesystem | Encrypted backing store (`data/runtime/`, `data/metadata/`) |

No network stack, database, or external services — everything runs in-process. The client and server are the same Python process; the "secure channel" simulates what a real client–server TLS connection would provide.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         SFSClient (CLI)                          │
│  login prompt / external mode / sfs> shell                       │
│  All requests sealed through SecureChannel before sending        │
└───────────────────────────┬──────────────────────────────────────┘
                            │  AES-256-GCM encrypted JSON envelope
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                         SFSServer                                │
│                                                                  │
│  ┌─────────────┐   ┌────────────────┐   ┌─────────────────────┐ │
│  │ AuthManager │   │ CommandParser  │   │   AdminManager      │ │
│  │             │   │                │   │                     │ │
│  │ login()     │   │ pwd/ls/cd      │   │ create-user         │ │
│  │ logout()    │   │ mkdir/touch    │   │ create-group        │ │
│  │ sessions    │   │ cat/echo/mv/rm │   │ add_member          │ │
│  │             │   │ chmod          │   │                     │ │
│  └──────┬──────┘   └───────┬────────┘   └─────────────────────┘ │
│         │                  │                                      │
│  ┌──────▼──────────────────▼──────────────────────────────────┐  │
│  │                    StorageManager                           │  │
│  │  logical path → protected name → physical storage path     │  │
│  │  Permission checks on every read/write/list operation      │  │
│  └────────┬────────────────────────┬───────────────────────────┘ │
│           │                        │                              │
│  ┌────────▼──────┐      ┌──────────▼──────────┐                 │
│  │  MetadataStore│      │     FileStore        │                 │
│  │               │      │                      │                 │
│  │ users.json.enc│      │ per-file AES-GCM     │                 │
│  │ groups.json.enc│     │ encrypted blobs      │                 │
│  │ fs_index.json │      │ integrity_reference  │                 │
│  │   .enc        │      │ as associated data   │                 │
│  └───────────────┘      └──────────────────────┘                 │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    CryptoManager                            │  │
│  │                                                             │  │
│  │  master key (env var or dev_master.key)                    │  │
│  │  _derive_key(label) → HMAC-SHA256(master, label)           │  │
│  │                                                             │  │
│  │  content_key   → encrypt/decrypt file bodies               │  │
│  │  metadata_key  → encrypt/decrypt all .enc blobs            │  │
│  │  channel_key   → encrypt/decrypt client↔server envelopes   │  │
│  │  name_key      → HMAC-SHA256 filename → protected_name     │  │
│  │                                                             │  │
│  │  PasswordHasher: PBKDF2-HMAC-SHA256 (390,000 iterations)   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │               IntegrityMonitor                               │ │
│  │  scan_owned_objects() on every login                        │ │
│  │  decrypts each owned file; GCM tag failure → alert          │ │
│  │  ciphertext swap detected via per-file integrity_reference  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────▼──────────────┐
              │   Host Filesystem           │
              │                            │
              │  data/metadata/            │
              │    users.json.enc          │
              │    groups.json.enc         │
              │    fs_index.json.enc       │
              │                            │
              │  data/runtime/             │
              │    <hmac_name>/            │  ← protected directory name
              │      <hmac_name>           │  ← encrypted file blob
              └────────────────────────────┘
```

---

## Project Components (Source Files)

```
src/sfs/
├── crypto.py        — CryptoManager, PasswordHasher, SecureChannel
├── server.py        — SFSServer: wires all managers together, dispatches requests
├── client.py        — SFSClient: CLI loop, login prompt, external mode, secure send
├── auth.py          — AuthManager: login, logout, session tokens, user creation
├── admin.py         — AdminManager: create-user, create-group, add_member
├── storage.py       — MetadataStore, FileStore, StorageManager, IntegrityMonitor
├── permissions.py   — PermissionManager: can_read, can_write, can_access_directory
├── commands.py      — CommandParser: parses and routes all CLI commands
├── models.py        — Dataclasses: UserRecord, GroupRecord, Session, FileMetadata, etc.
├── errors.py        — Exception hierarchy: Auth/Authorization/Integrity/NotFound/etc.
├── constants.py     — AES nonce size, PBKDF2 iterations, default admin, command list
├── config.py        — SFSConfig: paths to metadata_dir and storage_dir
└── utils.py         — Path normalization, logical_parent, logical_name helpers

tests/
├── test_auth.py          — Authentication and session tests
├── test_crypto.py        — Encryption/decryption round-trips, integrity failure cases
├── test_permissions.py   — DAC enforcement: user/group/all modes
├── test_storage.py       — CRUD operations, rename, delete
├── test_commands.py      — Command dispatch and error handling
├── test_integration.py   — Multi-user flows, external tampering, ciphertext swap detection
└── conftest.py           — pytest fixtures (in-memory server with tmp_path)
```

---

## Cryptographic Design

### Key Hierarchy

```
master_key (32 random bytes, stored in dev_master.key or SFS_MASTER_KEY env var)
    │
    ├── HMAC-SHA256(master, "content")   → AES-256-GCM key for file bodies
    ├── HMAC-SHA256(master, "metadata")  → AES-256-GCM key for .enc blobs
    ├── HMAC-SHA256(master, "channel")   → AES-256-GCM key for client↔server
    └── HMAC-SHA256(master, "names")     → HMAC key for filename protection
```

A single master key derives four purpose-specific subkeys. Separating content, metadata, channel, and name keys ensures that compromise of one context cannot trivially compromise another.

### File Encryption

Each file write:
1. Generates a fresh 12-byte random nonce (`secrets.token_bytes`)
2. Encrypts the content with AES-256-GCM using the content key
3. Passes `integrity_reference.encode()` as **associated data** — GCM authenticates it alongside the ciphertext without encrypting it

On read, GCM verifies the tag using the same associated data. If the file was tampered with (even a single bit), or if the ciphertext was swapped with another file's ciphertext (which has a different `integrity_reference`), decryption raises `IntegrityError`.

### Filename Protection

Logical filenames are never stored on disk as plaintext. The on-disk directory/file name is:
```
base64url(HMAC-SHA256(name_key, logical_path)).rstrip("=")
```
This is deterministic (same logical path always produces the same protected name) but unreadable without the master key.

### Password Hashing

PBKDF2-HMAC-SHA256 with **390,000 iterations** and a 16-byte random salt per user. Timing-safe comparison via `hmac.compare_digest`.

### Secure Channel

All client requests are sealed with AES-256-GCM before being handed to the server, and all server responses are sealed back. In a real deployment this would be replaced with TLS; here it demonstrates the same principle in-process.

---

## Access Control Model

Three permission modes per file or directory, owner-controlled only:

| Mode | Who can read/write |
|------|-------------------|
| `user` | Owner only (default for new files) |
| `group` | Owner + any user in the same group |
| `all` | Any authenticated internal user |

Home directories default to `group` mode — same-group users can `cd` and `ls` into a peer's home and see protected (HMAC) names, but file reads are still blocked unless the file itself is `group` or `all`. Cross-group users cannot enter another user's home at all.

---

## Threat Model and What It Addresses

| Threat | Mitigation |
|--------|-----------|
| Storage-at-rest compromise (attacker reads raw files) | AES-256-GCM encryption of all content and metadata; HMAC filename protection |
| Ciphertext tampering | GCM authentication tag; per-file integrity_reference as associated data |
| Ciphertext swapping (file A's ciphertext placed at file B's path) | Different `integrity_reference` per file used as GCM associated data; swap causes tag failure |
| External file modification (bypassing SFS auth) | IntegrityMonitor scans all owned files at login; alert shown if any tag fails |
| Weak passwords / password database theft | PBKDF2-HMAC-SHA256 with 390,000 iterations + per-user salt |
| Unauthorized file access by other users | DAC permission model enforced server-side on every operation |
| Admin creating users with excessive privileges | Only admins can create users/groups; is_admin flag required for privilege escalation |

**What it does NOT address:** key management at rest (the master key is stored in plaintext in `dev_master.key`), multi-master key rotation, or network-level attacks (no real network layer).

---

## Learning Takeaways

- **AES-GCM provides both confidentiality and authenticity in a single pass.** The authentication tag catches any modification to either the ciphertext or the associated data. This is why it is preferred over AES-CBC + separate HMAC in modern designs.
- **Associated data (AAD) is the right tool for binding ciphertext to context.** Using the `integrity_reference` as AAD means the same ciphertext copied to a different file location immediately fails verification — without any extra HMAC computation.
- **Key derivation via HMAC separates concerns cleanly.** One master key derived into four purpose-specific subkeys means a leak or misuse in one context doesn't compromise the others, and rotation of one subkey doesn't require changing all stored ciphertext.
- **PBKDF2 iteration count is a cost knob.** 390,000 iterations follows NIST SP 800-132 guidance for 2024 hardware. Higher iterations slow brute-force attacks proportionally; too low and the hash is cheap to attack offline.
- **Deterministic HMAC filename protection leaks relative equality.** The same logical name always maps to the same protected name. An attacker who knows one logical name can confirm whether other paths exist. A random per-file salt (like an encrypted filename approach) would prevent this but complicates lookups.
- **The external mode demonstrates why encryption-at-rest alone isn't enough.** An external attacker who bypasses auth can still modify ciphertexts and write new files. The integrity monitor at login is what actually closes this gap for the owner.
- **Layered testing (unit + integration) reveals what unit tests miss.** The ciphertext swap detection test could only be written as an integration test — it requires a real server instance, a real file on disk, and a login cycle. Unit tests alone would not have caught a missing associated-data check.
- **Separation of logical paths and physical storage paths is a security design, not just an abstraction.** If logical names leaked into the filesystem, a storage observer could reconstruct the directory tree structure even without reading file contents.

---

## Skills Learned

- AES-256-GCM: nonce management, authentication tags, associated data usage
- PBKDF2-HMAC-SHA256: key stretching, salt generation, timing-safe comparison
- HMAC-based key derivation (HKDF-style subkey derivation pattern)
- Designing a layered key hierarchy (master key → domain-specific subkeys)
- Discretionary Access Control (DAC) model design and enforcement
- Secure session token generation (`secrets.token_urlsafe`)
- Python `cryptography` hazmat primitives (AESGCM, PBKDF2HMAC)
- Filesystem abstraction (logical vs. physical path separation)
- Threat modeling: identifying what each cryptographic layer defends against
- Writing security-focused integration tests (tampering, swap attacks, external access)

## Skills Needed to Go Deeper

- Proper key management at rest (HSM, key wrapping, envelope encryption)
- AES-GCM nonce exhaustion risks and counter-based nonce generation at scale
- Authenticated encryption with per-user keys (so the server itself can't read files)
- End-to-end encryption where the server holds no plaintext key
- Role-based access control (RBAC) and mandatory access control (MAC) models
- Merkle-tree based integrity verification for efficient tamper detection at scale
- Secure deletion (overwriting blocks before unlinking)
- Cryptographic audit logging (append-only, tamper-evident log)
