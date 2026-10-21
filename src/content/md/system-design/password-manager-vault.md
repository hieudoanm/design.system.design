# Password Manager — Vault

Design a password manager

**Difficulty:** Easy

**Tags:** file-sync, security

## Functional Requirements

- a password manager
- protect vaults end-to-end?
- derive and manage encryption keys?
- sync vaults across devices securely?
- autofill without leaking credentials?

## Non-Functional Requirements

- Autofill is designed so credentials are decrypted only in the browser or OS
  extension context, on demand, and never leave the device.

- The extension detects the site origin (never the full URL path, to avoid
  over-matching), resolves the matching entry against the origin's authenticated
  domain, and decrypts only that one entry to fill the login form.
- Matches are filtered to exact origin by default and the user confirms
  ambiguous matches; no credential is injected into a form whose origin does not
  match the stored entry.
- The extension never sends credentials to the server, and clipboard fills use
  transient, time-limited clipboard data.
- To guard against the browser side itself being the attack surface, the
  extension verifies the page's TLS and origin before filling, requests user
  re-authentication (PIN/biometric) for sensitive fills when configured, and
  logs fills to the local audit trail without storing the secret.
- Credentials are written into the page via isolated script context so page
  scripts cannot read the injected value, and the extension clears any persisted
  form state after fill.

## Source

````text
title: Password Manager
node user: User [round, icon=browser]
node app: Manager App [icon=browser]
node api: Vault API [icon=server]
node auth: Auth Service [icon=auth]
node kdf: Key Derivation [icon=compute]
node vault: Encrypted Vault [cylinder, icon=database]
node sync: Sync Service [icon=sync]
node audit: Audit Log [icon=file]
node monitor: Breach Monitor [icon=search]
node notify: Alerts [icon=message]

edge user -> app: unlock
edge app -> auth: verify
edge auth -> kdf: derive key
edge kdf -> vault: decrypt
edge user -> app: add entry
edge app -> api: encrypt
edge api -> vault: store
edge api -> sync: replicate
edge api -> audit: log
edge monitor -> notify: breach
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Password Manager
user: User
app: Manager App
api: Vault API
auth: Auth Service
kdf: Key Derivation
vault: Encrypted Vault
sync: Sync Service
audit: Audit Log
monitor: Breach Monitor
notify: Alerts

user ─► app ─► unlock
app ─► auth ─► verify
auth ─► kdf ─► derive key
kdf ─► vault ─► decrypt
user ─► app ─► add entry
app ─► api ─► encrypt
api ─► vault ─► store
api ─► sync ─► replicate
api ─► audit ─► log
monitor ─► notify ─► breach
````

## Design

### Design a password manager

The manager is a zero-knowledge architecture: the server stores encrypted blobs
and never sees plaintext secrets.

- The client app unlocks with the master password, verifies against the Auth
  Service, derives the vault encryption key locally, and decrypts the user's
  vault, which contains credential entries grouped into folders.
- Adding an entry encrypts it client-side before the Vault API stores it, and
  the Sync Service replicates encrypted blobs to other devices.
- An Audit Log records account-level events (login device, new entry, export,
  recovery usage) without containing secrets, and a Breach Monitor checks
  whether the user's email addresses or site passwords appear in public breach
  data, alerting through notifications.
- The trust boundary is the client: keys never leave the device, transport is
  TLS, and the server's only power is to store and relay ciphertext.
- Availability is handled with per-entry versioning and CRDT-style conflict
  resolution on sync, and recovery relies on key material derived from a
  recovery code rather than server-side password reset.
- The design must also resist server compromise: because the server only stores
  ciphertext, a full server dump exposes nothing.

### How do you protect vaults end-to-end?

End-to-end protection means the encryption key is never transmitted and the
server cannot decrypt even with database access.

- Every vault is encrypted client-side with a random per-vault symmetric key
  (AES-256-GCM) using authenticated encryption, so tampering is detected.
- Each credential entry is encrypted with the vault key, and the vault blob is
  encrypted again for storage; the per-entry keys can additionally be wrapped
  per-item so a shared item reveals no more than that item.
- The server stores only the ciphertext blob, its version, and authenticated
  metadata (timestamps, device ids) — never plaintext usernames, passwords, or
  URLs.
- Keys are derived from the master password and protected with high-cost key
  stretching, and decryption happens in memory only.
- The design guarantees confidentiality (server can't read), but not
  authenticity of the client device — so second factor and device attestation
  are layered on top.
- Because a leaked vault can be brute-forced offline, the stretching cost
  (Argon2 memory/time parameters) is chosen high and the master password is
  strength-checked at setup.

### How do you derive and manage encryption keys?

Key derivation follows a two-layer scheme: the master key is never used directly
to encrypt vault contents.

- The client derives an intermediate key from the master password plus a
  per-user random salt using a memory-hard KDF (Argon2id) tuned to roughly a
  second of compute, then derives a per-vault encryption key from that
  intermediate key with HKDF and a per-vault salt.
- The intermediate key is also used to authenticate the login: the server stores
  only a verifier (a hash of the intermediate key), so the password itself is
  never sent or stored.
- For recovery, a random recovery code is generated at setup, its stretched hash
  is stored as a second verifier, and the intermediate key is additionally
  wrapped with a key derived from the recovery code, so recovery regenerates the
  same intermediate key without a password reset.
- Rotation is cheap because the layer structure means rotating the vault key
  re-encrypts the blob, while rotating the master password re-derives the
  intermediate key and re-wraps the vault key.
- Per-item keys support selective sharing, and any key material in memory is
  explicitly wiped after use.

### How do you sync vaults across devices securely?

Sync moves encrypted blobs, never plaintext.

- Each device pulls the latest vault version from the Sync Service, decrypts
  locally, applies local edits, and pushes a new encrypted version with an
  optimistic concurrency check — the push carries the base version and the
  server rejects if another device has already advanced it.
- Conflicts (two devices editing the same entry simultaneously) are resolved
  client-side: the client stores per-item version vectors and merges entries
  that changed disjoint fields, while a genuine same-field conflict produces a
  duplicate entry with a "(conflict)" label that the user resolves.
- The server treats vault contents as opaque bytes and only indexes encrypted
  metadata (entry ids, revision ids) to support delta sync — only changed
  entries are transferred, keeping mobile sync efficient.
- Sync retries with backoff when offline, and the local encrypted cache
  guarantees the vault still opens without connectivity.
- Deletion syncs via tombstones, and account-level logout revokes the device
  token so a stolen device cannot pull further revisions.

### How do you autofill without leaking credentials?

Autofill is designed so credentials are decrypted only in the browser or OS
extension context, on demand, and never leave the device.

- The extension detects the site origin (never the full URL path, to avoid
  over-matching), resolves the matching entry against the origin's authenticated
  domain, and decrypts only that one entry to fill the login form.
- Matches are filtered to exact origin by default and the user confirms
  ambiguous matches; no credential is injected into a form whose origin does not
  match the stored entry.
- The extension never sends credentials to the server, and clipboard fills use
  transient, time-limited clipboard data.
- To guard against the browser side itself being the attack surface, the
  extension verifies the page's TLS and origin before filling, requests user
  re-authentication (PIN/biometric) for sensitive fills when configured, and
  logs fills to the local audit trail without storing the secret.
- Credentials are written into the page via isolated script context so page
  scripts cannot read the injected value, and the extension clears any persisted
  form state after fill.

## Source

```text
title: Password Manager
node user: User [round, icon=browser]
node app: Manager App [icon=browser]
node api: Vault API [icon=server]
node auth: Auth Service [icon=auth]
node kdf: Key Derivation [icon=compute]
node vault: Encrypted Vault [cylinder, icon=database]
node sync: Sync Service [icon=sync]
node audit: Audit Log [icon=file]
node monitor: Breach Monitor [icon=search]
node notify: Alerts [icon=message]

edge user -> app: unlock
edge app -> auth: verify
edge auth -> kdf: derive key
edge kdf -> vault: decrypt
edge user -> app: add entry
edge app -> api: encrypt
edge api -> vault: store
edge api -> sync: replicate
edge api -> audit: log
edge monitor -> notify: breach
```

## Q&A

### Q: Design a password manager

**A:** The manager is a zero-knowledge architecture: the server stores encrypted blobs
and never sees plaintext secrets.

- The client app unlocks with the master password, verifies against the Auth
  Service, derives the vault encryption key locally, and decrypts the user's
  vault, which contains credential entries grouped into folders.
- Adding an entry encrypts it client-side before the Vault API stores it, and
  the Sync Service replicates encrypted blobs to other devices.
- An Audit Log records account-level events (login device, new entry, export,
  recovery usage) without containing secrets, and a Breach Monitor checks
  whether the user's email addresses or site passwords appear in public breach
  data, alerting through notifications.
- The trust boundary is the client: keys never leave the device, transport is
  TLS, and the server's only power is to store and relay ciphertext.
- Availability is handled with per-entry versioning and CRDT-style conflict
  resolution on sync, and recovery relies on key material derived from a
  recovery code rather than server-side password reset.
- The design must also resist server compromise: because the server only stores
  ciphertext, a full server dump exposes nothing.

### Q: How do you protect vaults end-to-end?

**A:** End-to-end protection means the encryption key is never transmitted and the
server cannot decrypt even with database access.

- Every vault is encrypted client-side with a random per-vault symmetric key
  (AES-256-GCM) using authenticated encryption, so tampering is detected.
- Each credential entry is encrypted with the vault key, and the vault blob is
  encrypted again for storage; the per-entry keys can additionally be wrapped
  per-item so a shared item reveals no more than that item.
- The server stores only the ciphertext blob, its version, and authenticated
  metadata (timestamps, device ids) — never plaintext usernames, passwords, or
  URLs.
- Keys are derived from the master password and protected with high-cost key
  stretching, and decryption happens in memory only.
- The design guarantees confidentiality (server can't read), but not
  authenticity of the client device — so second factor and device attestation
  are layered on top.
- Because a leaked vault can be brute-forced offline, the stretching cost
  (Argon2 memory/time parameters) is chosen high and the master password is
  strength-checked at setup.

### Q: How do you derive and manage encryption keys?

**A:** Key derivation follows a two-layer scheme: the master key is never used directly
to encrypt vault contents.

- The client derives an intermediate key from the master password plus a
  per-user random salt using a memory-hard KDF (Argon2id) tuned to roughly a
  second of compute, then derives a per-vault encryption key from that
  intermediate key with HKDF and a per-vault salt.
- The intermediate key is also used to authenticate the login: the server stores
  only a verifier (a hash of the intermediate key), so the password itself is
  never sent or stored.
- For recovery, a random recovery code is generated at setup, its stretched hash
  is stored as a second verifier, and the intermediate key is additionally
  wrapped with a key derived from the recovery code, so recovery regenerates the
  same intermediate key without a password reset.
- Rotation is cheap because the layer structure means rotating the vault key
  re-encrypts the blob, while rotating the master password re-derives the
  intermediate key and re-wraps the vault key.
- Per-item keys support selective sharing, and any key material in memory is
  explicitly wiped after use.

### Q: How do you sync vaults across devices securely?

**A:** Sync moves encrypted blobs, never plaintext.

- Each device pulls the latest vault version from the Sync Service, decrypts
  locally, applies local edits, and pushes a new encrypted version with an
  optimistic concurrency check — the push carries the base version and the
  server rejects if another device has already advanced it.
- Conflicts (two devices editing the same entry simultaneously) are resolved
  client-side: the client stores per-item version vectors and merges entries
  that changed disjoint fields, while a genuine same-field conflict produces a
  duplicate entry with a "(conflict)" label that the user resolves.
- The server treats vault contents as opaque bytes and only indexes encrypted
  metadata (entry ids, revision ids) to support delta sync — only changed
  entries are transferred, keeping mobile sync efficient.
- Sync retries with backoff when offline, and the local encrypted cache
  guarantees the vault still opens without connectivity.
- Deletion syncs via tombstones, and account-level logout revokes the device
  token so a stolen device cannot pull further revisions.

### Q: How do you autofill without leaking credentials?

**A:** Autofill is designed so credentials are decrypted only in the browser or OS
extension context, on demand, and never leave the device.

- The extension detects the site origin (never the full URL path, to avoid
  over-matching), resolves the matching entry against the origin's authenticated
  domain, and decrypts only that one entry to fill the login form.
- Matches are filtered to exact origin by default and the user confirms
  ambiguous matches; no credential is injected into a form whose origin does not
  match the stored entry.
- The extension never sends credentials to the server, and clipboard fills use
  transient, time-limited clipboard data.
- To guard against the browser side itself being the attack surface, the
  extension verifies the page's TLS and origin before filling, requests user
  re-authentication (PIN/biometric) for sensitive fills when configured, and
  logs fills to the local audit trail without storing the secret.
- Credentials are written into the page via isolated script context so page
  scripts cannot read the injected value, and the extension clears any persisted
  form state after fill.

## Source

```text
title: Password Manager
node user: User [round, icon=browser]
node app: Manager App [icon=browser]
node api: Vault API [icon=server]
node auth: Auth Service [icon=auth]
node kdf: Key Derivation [icon=compute]
node vault: Encrypted Vault [cylinder, icon=database]
node sync: Sync Service [icon=sync]
node audit: Audit Log [icon=file]
node monitor: Breach Monitor [icon=search]
node notify: Alerts [icon=message]

edge user -> app: unlock
edge app -> auth: verify
edge auth -> kdf: derive key
edge kdf -> vault: decrypt
edge user -> app: add entry
edge app -> api: encrypt
edge api -> vault: store
edge api -> sync: replicate
edge api -> audit: log
edge monitor -> notify: breach
```
