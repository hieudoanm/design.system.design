# Zoom — Video Conferencing

Design Zoom / a video conferencing service

**Difficulty:** Medium

**Tags:** realtime, video, web-conferencing

## Functional Requirements

- Zoom / a video conferencing service
- route realtime audio/video with low latency (WebRTC / SFU)?
- support large meetings with many participants?
- screen sharing and recording
- handle poor network conditions in a video call?

## Non-Functional Requirements

- Zoom is a realtime media system split into a control plane and a media plane.

- The control plane — signaling server, auth, room service — runs over
  WebSockets.
- It handles SDP offers/answers, ICE candidate exchange, room membership, and
  lifecycle.
- Auth issues short-lived tokens bound to the meeting ID and participant role
  (host, co-host, guest).
- The Room Service persists meeting metadata — host, start time, settings,
  password, recording flag — to a Meeting DB.
- It maintains live participant state in a Session Cache.

The media plane is WebRTC over UDP.

- Each client publishes its audio and video tracks to an SFU media router.
- The SFU selectively forwards them to every other participant.
- Because media never touches the DB, the control plane stays cheap even in huge
  calls.
- Recordings subscribe to the SFU streams.
- A Media Relay bridges SFU regions so a meeting spread across continents stays
  low-latency.

Data models stay small.

- A `meetings` row (id, host, settings, status).
- A `participants` association (meeting, user, joined_at).
- A `sessions` table maps connection IDs to participants.
- Recording metadata references object-storage archives.
- The session cache holds ephemeral signaling state — who has joined, which SFU
  they're on.
- A signaling node restart doesn't drop meetings.

Trade-offs start with topology.

- Mesh is O(n²) and dies beyond ~10 participants.
- MCU mixing saves bandwidth but burns CPU and adds latency.
- An SFU forwards streams unchanged — O(n) at the SFU and the flexible choice.
- Scaling is regional: meetings land on an SFU cluster near their host.
- Cross-region calls bridge through relays.
- Failure handling means participants rejoin and renegotiate after an SFU node
  dies.
- Signaling state is reconstructable from the session cache..
- Media routing is the heart.

- Signaling uses WebRTC's SDP offer/answer over the signaling server.
- ICE (STUN/TURN) punches through NATs.
- Once the peer-to-peer path is established, RTP streams flow over UDP directly
  between the client and an SFU.
- STUN discovers the public address.
- TURN relays when UDP is blocked, at the cost of an extra hop and bandwidth.
- The SFU receives each publisher's stream once and forwards copies to
  subscribers — O(n) total streams per meeting instead of mesh's O(n²).
- The mouth-to-ear budget is typically under 200–400ms.

Low latency is bought with UDP, small RTP packetization, and jitter buffers
sized for the tail, not the average.

- Simulcast lets a publisher send multiple quality layers.
- The SFU forwards the layer matching each subscriber's bandwidth.
- A laptop on WiFi gets 360p while a conference room gets 1080p.
- This happens all without renegotiation.

Congestion control runs continuously on both ends.

- The client estimates available bandwidth from packet arrival (Google
  Congestion Control).
- The SFU reports receiver-side estimates.
- Both adapt send rates within the latency budget.
- Keyframes and FEC are tuned per stream so a single lost packet doesn't freeze
  a participant's video.

Regions matter.

- Each region runs an SFU farm.
- A Media Relay forwards compressed streams between farms with regional loss
  recovery.
- A Tokyo–San Francisco call never hops a single congested path.
- Scaling is horizontal — meetings are pinned to one SFU cluster and clusters
  scale by adding nodes.
- The signaling tier scales independently.
- Failure handling routes around dead SFUs by renegotiating sessions.
- TURN relays cover symmetric NATs..
- Mesh dies past a handful of participants, so large meetings lean on the SFU's
  selective forwarding.

- Rather than sending every participant's full video to everyone, the SFU
  detects active speakers — via audio energy or the publisher's own signaling.
- It forwards only active speakers at full quality.
- Others drop to low quality or audio-only.
- The client renders an active-speaker view instead of a wall of video.
- This is both the UX and the bandwidth win.

Beyond a few hundred, a single SFU isn't enough.

- The standard design is an SFU hierarchy: a primary SFU fans out to sub-SFU
  nodes, each serving a subgroup.
- An audio mixer (or RMC-style router) centrally mixes audio so each subgroup
  receives one composite audio stream.
- This collapses O(n²) audio to O(n).
- Video still flows selectively.
- Breakout rooms run on separate clusters.

Large meetings reserve capacity up front.

- A host scheduling a webinar gets a cluster pinned at start time rather than
  racing for shared capacity at join time.
- Signaling scales horizontally because join/leave is bursty at meeting start.
- The room service pre-allocates slots.
- Layouts (grid, spotlight, gallery) are metadata pushed to clients.
- The SFU only forwards the streams those layouts need.

Trade-offs are capacity versus fidelity.

- Forwarding only active speakers saves bandwidth but needs speaker detection to
  be fast.
- MCU audio mixing saves bandwidth but is compute-heavy and adds a few
  milliseconds.
- Failure handling covers a host dropping (host transfer).
- Rejoin after a network blip resumes the same meeting state from the session
  cache..
- Screen sharing is just another WebRTC video track.

- The client captures the display, encodes it (VP8/VP9/H.264, often AV1 at high
  resolution) as a low-motion stream.
- It publishes the stream to the SFU alongside the camera track.
- The client renders the presenter's screen as a separate surface with the
  presenter's camera overlaid.
- Composition happens on the viewer, keeping the SFU simple.
- Annotation and touch work client-side on the captured stream.

Recording lives in the media plane.

- A recorder joins the meeting as a subscriber that consumes the SFU's streams
  and writes segments to object storage.
- For layouts that mirror what viewers saw, a composite (MCU-style) stage mixes
  the screen, active speaker, and captions into one video.
- Each segment carries a sequence number so reassembly tolerates a dropped
  segment.

Post-processing runs asynchronously.

- Stitch segments, add captions via ASR, generate transcripts and thumbnails.
- Publish the recording with a manifest.
- Transcripts feed search, so a recording is discoverable by spoken content.
- Captions are re-synced to the stitched timeline.
- Recording is encrypted at rest.
- Playback is gated by the same meeting-token mechanism as live, so a recording
  link can't be shared indefinitely.

The trade-off is flexibility versus cost.

- Per-participant recording keeps every source separate and supports arbitrary
  playback layouts.
- It multiplies storage and encode cost.
- Composite recording is cheap and deterministic but fixed at record time.
- Failure handling writes segments with continuity and assembles a manifest at
  the end.
- A mid-call outage loses only the gap.
- Retention and GDPR controls govern storage.
- Latency stays additive because recording subscribes to what viewers already
  receive..
- Network adaptation is per-subscriber and continuous.

- The client runs congestion control (Google Congestion Control / REMB)
  estimating bandwidth from arrival rates.
- It tells the SFU which simulcast layer it can afford.
- When congestion hits, the SFU downgrades to a lower layer, then to audio-only,
  then to audio with reduced bitrate.
- The jitter buffer grows and shrinks to hide variance.
- DTX (silence detection) stops sending audio packets during silence to reclaim
  bandwidth.

Resilience is layered on top.

- Audio gets FEC (RED) so a few lost packets reconstruct seamlessly.
- NACK/RTX retransmits lost video packets up to a latency budget.
- A keyframe request repairs a broken video stream instead of waiting for the
  next I-frame.
- Audio is always prioritized over video.
- The SFU applies the same adaptation when a subscriber's link degrades.

Adaptation is multi-dimensional.

- Resolution drops first, then frame rate, then codec complexity.
- Low-motion scenes tolerate frame-rate cuts that would ruin a full-motion
  share.
- The client also adapts locally, e.g., muting the camera when UDP is blocked
  behind a strict firewall.
- Audio stays on a TURN relay.

The trade-offs are explicit.

- More FEC and retransmission eat bandwidth and latency.
- You spend just enough to keep the call alive and degrade quality rather than
  stall.
- The system monitors per-participant metrics — packet loss, jitter, round-trip
  time, frames-per-second.
- The client can auto-mute video for a weak subscriber and surface a "poor
  connection" hint.
- Scaling is about not coupling adaptation decisions: each subscriber adapts
  independently.
- A single weak link never drags down the meeting.

## Source

````text
title: Zoom Video Conferencing
node client: Client [round, icon=browser]
node signal: Signaling Server [icon=server]
node auth: Auth Service [icon=auth]
node room: Room Service [icon=message]
node sfu: SFU Media Router [icon=compute]
node relay: Media Relay [ellipse, icon=cloud]
node screen: Screen Share [icon=file]
node record: Recording [icon=file]
node notify: Notifications [icon=mail]
node db: Meeting DB [cylinder, icon=database]
node cache: Session Cache [cylinder, icon=cache]

edge client -> auth: login
edge auth -> signal: token
edge client -> signal: join room
edge signal -> room: create / join
edge room -> db: persist
edge client -> sfu: publish media
edge sfu -> client: forward streams
edge sfu -> relay: bridge cross-region
edge client -> screen: share
edge screen -> sfu: video track
edge room -> record: archive
edge room -> notify: status
edge signal -> cache: session
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Zoom Video Conferencing
client: Client
signal: Signaling Server
auth: Auth Service
room: Room Service
sfu: SFU Media Router
relay: Media Relay
screen: Screen Share
record: Recording
notify: Notifications
db: Meeting DB
cache: Session Cache

client ─► auth ─► login
auth ─► signal ─► token
client ─► signal ─► join room
signal ─► room ─► create / join
room ─► db ─► persist
client ─► sfu ─► publish media
sfu ─► client ─► forward streams
sfu ─► relay ─► bridge cross-region
client ─► screen ─► share
screen ─► sfu ─► video track
room ─► record ─► archive
room ─► notify ─► status
signal ─► cache ─► session
````

## Design

### Design Zoom / a video conferencing service

Zoom is a realtime media system split into a control plane and a media plane.

- The control plane — signaling server, auth, room service — runs over
  WebSockets.
- It handles SDP offers/answers, ICE candidate exchange, room membership, and
  lifecycle.
- Auth issues short-lived tokens bound to the meeting ID and participant role
  (host, co-host, guest).
- The Room Service persists meeting metadata — host, start time, settings,
  password, recording flag — to a Meeting DB.
- It maintains live participant state in a Session Cache.

The media plane is WebRTC over UDP.

- Each client publishes its audio and video tracks to an SFU media router.
- The SFU selectively forwards them to every other participant.
- Because media never touches the DB, the control plane stays cheap even in huge
  calls.
- Recordings subscribe to the SFU streams.
- A Media Relay bridges SFU regions so a meeting spread across continents stays
  low-latency.

Data models stay small.

- A `meetings` row (id, host, settings, status).
- A `participants` association (meeting, user, joined_at).
- A `sessions` table maps connection IDs to participants.
- Recording metadata references object-storage archives.
- The session cache holds ephemeral signaling state — who has joined, which SFU
  they're on.
- A signaling node restart doesn't drop meetings.

Trade-offs start with topology.

- Mesh is O(n²) and dies beyond ~10 participants.
- MCU mixing saves bandwidth but burns CPU and adds latency.
- An SFU forwards streams unchanged — O(n) at the SFU and the flexible choice.
- Scaling is regional: meetings land on an SFU cluster near their host.
- Cross-region calls bridge through relays.
- Failure handling means participants rejoin and renegotiate after an SFU node
  dies.
- Signaling state is reconstructable from the session cache.

### How do you route realtime audio/video with low latency (WebRTC / SFU)?

Media routing is the heart.

- Signaling uses WebRTC's SDP offer/answer over the signaling server.
- ICE (STUN/TURN) punches through NATs.
- Once the peer-to-peer path is established, RTP streams flow over UDP directly
  between the client and an SFU.
- STUN discovers the public address.
- TURN relays when UDP is blocked, at the cost of an extra hop and bandwidth.
- The SFU receives each publisher's stream once and forwards copies to
  subscribers — O(n) total streams per meeting instead of mesh's O(n²).
- The mouth-to-ear budget is typically under 200–400ms.

Low latency is bought with UDP, small RTP packetization, and jitter buffers
sized for the tail, not the average.

- Simulcast lets a publisher send multiple quality layers.
- The SFU forwards the layer matching each subscriber's bandwidth.
- A laptop on WiFi gets 360p while a conference room gets 1080p.
- This happens all without renegotiation.

Congestion control runs continuously on both ends.

- The client estimates available bandwidth from packet arrival (Google
  Congestion Control).
- The SFU reports receiver-side estimates.
- Both adapt send rates within the latency budget.
- Keyframes and FEC are tuned per stream so a single lost packet doesn't freeze
  a participant's video.

Regions matter.

- Each region runs an SFU farm.
- A Media Relay forwards compressed streams between farms with regional loss
  recovery.
- A Tokyo–San Francisco call never hops a single congested path.
- Scaling is horizontal — meetings are pinned to one SFU cluster and clusters
  scale by adding nodes.
- The signaling tier scales independently.
- Failure handling routes around dead SFUs by renegotiating sessions.
- TURN relays cover symmetric NATs.

### How do you support large meetings with many participants?

Mesh dies past a handful of participants, so large meetings lean on the SFU's
selective forwarding.

- Rather than sending every participant's full video to everyone, the SFU
  detects active speakers — via audio energy or the publisher's own signaling.
- It forwards only active speakers at full quality.
- Others drop to low quality or audio-only.
- The client renders an active-speaker view instead of a wall of video.
- This is both the UX and the bandwidth win.

Beyond a few hundred, a single SFU isn't enough.

- The standard design is an SFU hierarchy: a primary SFU fans out to sub-SFU
  nodes, each serving a subgroup.
- An audio mixer (or RMC-style router) centrally mixes audio so each subgroup
  receives one composite audio stream.
- This collapses O(n²) audio to O(n).
- Video still flows selectively.
- Breakout rooms run on separate clusters.

Large meetings reserve capacity up front.

- A host scheduling a webinar gets a cluster pinned at start time rather than
  racing for shared capacity at join time.
- Signaling scales horizontally because join/leave is bursty at meeting start.
- The room service pre-allocates slots.
- Layouts (grid, spotlight, gallery) are metadata pushed to clients.
- The SFU only forwards the streams those layouts need.

Trade-offs are capacity versus fidelity.

- Forwarding only active speakers saves bandwidth but needs speaker detection to
  be fast.
- MCU audio mixing saves bandwidth but is compute-heavy and adds a few
  milliseconds.
- Failure handling covers a host dropping (host transfer).
- Rejoin after a network blip resumes the same meeting state from the session
  cache.

### Design screen sharing and recording

Screen sharing is just another WebRTC video track.

- The client captures the display, encodes it (VP8/VP9/H.264, often AV1 at high
  resolution) as a low-motion stream.
- It publishes the stream to the SFU alongside the camera track.
- The client renders the presenter's screen as a separate surface with the
  presenter's camera overlaid.
- Composition happens on the viewer, keeping the SFU simple.
- Annotation and touch work client-side on the captured stream.

Recording lives in the media plane.

- A recorder joins the meeting as a subscriber that consumes the SFU's streams
  and writes segments to object storage.
- For layouts that mirror what viewers saw, a composite (MCU-style) stage mixes
  the screen, active speaker, and captions into one video.
- Each segment carries a sequence number so reassembly tolerates a dropped
  segment.

Post-processing runs asynchronously.

- Stitch segments, add captions via ASR, generate transcripts and thumbnails.
- Publish the recording with a manifest.
- Transcripts feed search, so a recording is discoverable by spoken content.
- Captions are re-synced to the stitched timeline.
- Recording is encrypted at rest.
- Playback is gated by the same meeting-token mechanism as live, so a recording
  link can't be shared indefinitely.

The trade-off is flexibility versus cost.

- Per-participant recording keeps every source separate and supports arbitrary
  playback layouts.
- It multiplies storage and encode cost.
- Composite recording is cheap and deterministic but fixed at record time.
- Failure handling writes segments with continuity and assembles a manifest at
  the end.
- A mid-call outage loses only the gap.
- Retention and GDPR controls govern storage.
- Latency stays additive because recording subscribes to what viewers already
  receive.

### How do you handle poor network conditions in a video call?

Network adaptation is per-subscriber and continuous.

- The client runs congestion control (Google Congestion Control / REMB)
  estimating bandwidth from arrival rates.
- It tells the SFU which simulcast layer it can afford.
- When congestion hits, the SFU downgrades to a lower layer, then to audio-only,
  then to audio with reduced bitrate.
- The jitter buffer grows and shrinks to hide variance.
- DTX (silence detection) stops sending audio packets during silence to reclaim
  bandwidth.

Resilience is layered on top.

- Audio gets FEC (RED) so a few lost packets reconstruct seamlessly.
- NACK/RTX retransmits lost video packets up to a latency budget.
- A keyframe request repairs a broken video stream instead of waiting for the
  next I-frame.
- Audio is always prioritized over video.
- The SFU applies the same adaptation when a subscriber's link degrades.

Adaptation is multi-dimensional.

- Resolution drops first, then frame rate, then codec complexity.
- Low-motion scenes tolerate frame-rate cuts that would ruin a full-motion
  share.
- The client also adapts locally, e.g., muting the camera when UDP is blocked
  behind a strict firewall.
- Audio stays on a TURN relay.

The trade-offs are explicit.

- More FEC and retransmission eat bandwidth and latency.
- You spend just enough to keep the call alive and degrade quality rather than
  stall.
- The system monitors per-participant metrics — packet loss, jitter, round-trip
  time, frames-per-second.
- The client can auto-mute video for a weak subscriber and surface a "poor
  connection" hint.
- Scaling is about not coupling adaptation decisions: each subscriber adapts
  independently.
- A single weak link never drags down the meeting.

## Source

```text
title: Zoom Video Conferencing
node client: Client [round, icon=browser]
node signal: Signaling Server [icon=server]
node auth: Auth Service [icon=auth]
node room: Room Service [icon=message]
node sfu: SFU Media Router [icon=compute]
node relay: Media Relay [ellipse, icon=cloud]
node screen: Screen Share [icon=file]
node record: Recording [icon=file]
node notify: Notifications [icon=mail]
node db: Meeting DB [cylinder, icon=database]
node cache: Session Cache [cylinder, icon=cache]

edge client -> auth: login
edge auth -> signal: token
edge client -> signal: join room
edge signal -> room: create / join
edge room -> db: persist
edge client -> sfu: publish media
edge sfu -> client: forward streams
edge sfu -> relay: bridge cross-region
edge client -> screen: share
edge screen -> sfu: video track
edge room -> record: archive
edge room -> notify: status
edge signal -> cache: session
```

## Q&A

### Q: Design Zoom / a video conferencing service

**A:** Zoom is a realtime media system split into a control plane and a media plane.

- The control plane — signaling server, auth, room service — runs over
  WebSockets.
- It handles SDP offers/answers, ICE candidate exchange, room membership, and
  lifecycle.
- Auth issues short-lived tokens bound to the meeting ID and participant role
  (host, co-host, guest).
- The Room Service persists meeting metadata — host, start time, settings,
  password, recording flag — to a Meeting DB.
- It maintains live participant state in a Session Cache.

The media plane is WebRTC over UDP.

- Each client publishes its audio and video tracks to an SFU media router.
- The SFU selectively forwards them to every other participant.
- Because media never touches the DB, the control plane stays cheap even in huge
  calls.
- Recordings subscribe to the SFU streams.
- A Media Relay bridges SFU regions so a meeting spread across continents stays
  low-latency.

Data models stay small.

- A `meetings` row (id, host, settings, status).
- A `participants` association (meeting, user, joined_at).
- A `sessions` table maps connection IDs to participants.
- Recording metadata references object-storage archives.
- The session cache holds ephemeral signaling state — who has joined, which SFU
  they're on.
- A signaling node restart doesn't drop meetings.

Trade-offs start with topology.

- Mesh is O(n²) and dies beyond ~10 participants.
- MCU mixing saves bandwidth but burns CPU and adds latency.
- An SFU forwards streams unchanged — O(n) at the SFU and the flexible choice.
- Scaling is regional: meetings land on an SFU cluster near their host.
- Cross-region calls bridge through relays.
- Failure handling means participants rejoin and renegotiate after an SFU node
  dies.
- Signaling state is reconstructable from the session cache.

### Q: How do you route realtime audio/video with low latency (WebRTC / SFU)?

**A:** Media routing is the heart.

- Signaling uses WebRTC's SDP offer/answer over the signaling server.
- ICE (STUN/TURN) punches through NATs.
- Once the peer-to-peer path is established, RTP streams flow over UDP directly
  between the client and an SFU.
- STUN discovers the public address.
- TURN relays when UDP is blocked, at the cost of an extra hop and bandwidth.
- The SFU receives each publisher's stream once and forwards copies to
  subscribers — O(n) total streams per meeting instead of mesh's O(n²).
- The mouth-to-ear budget is typically under 200–400ms.

Low latency is bought with UDP, small RTP packetization, and jitter buffers
sized for the tail, not the average.

- Simulcast lets a publisher send multiple quality layers.
- The SFU forwards the layer matching each subscriber's bandwidth.
- A laptop on WiFi gets 360p while a conference room gets 1080p.
- This happens all without renegotiation.

Congestion control runs continuously on both ends.

- The client estimates available bandwidth from packet arrival (Google
  Congestion Control).
- The SFU reports receiver-side estimates.
- Both adapt send rates within the latency budget.
- Keyframes and FEC are tuned per stream so a single lost packet doesn't freeze
  a participant's video.

Regions matter.

- Each region runs an SFU farm.
- A Media Relay forwards compressed streams between farms with regional loss
  recovery.
- A Tokyo–San Francisco call never hops a single congested path.
- Scaling is horizontal — meetings are pinned to one SFU cluster and clusters
  scale by adding nodes.
- The signaling tier scales independently.
- Failure handling routes around dead SFUs by renegotiating sessions.
- TURN relays cover symmetric NATs.

### Q: How do you support large meetings with many participants?

**A:** Mesh dies past a handful of participants, so large meetings lean on the SFU's
selective forwarding.

- Rather than sending every participant's full video to everyone, the SFU
  detects active speakers — via audio energy or the publisher's own signaling.
- It forwards only active speakers at full quality.
- Others drop to low quality or audio-only.
- The client renders an active-speaker view instead of a wall of video.
- This is both the UX and the bandwidth win.

Beyond a few hundred, a single SFU isn't enough.

- The standard design is an SFU hierarchy: a primary SFU fans out to sub-SFU
  nodes, each serving a subgroup.
- An audio mixer (or RMC-style router) centrally mixes audio so each subgroup
  receives one composite audio stream.
- This collapses O(n²) audio to O(n).
- Video still flows selectively.
- Breakout rooms run on separate clusters.

Large meetings reserve capacity up front.

- A host scheduling a webinar gets a cluster pinned at start time rather than
  racing for shared capacity at join time.
- Signaling scales horizontally because join/leave is bursty at meeting start.
- The room service pre-allocates slots.
- Layouts (grid, spotlight, gallery) are metadata pushed to clients.
- The SFU only forwards the streams those layouts need.

Trade-offs are capacity versus fidelity.

- Forwarding only active speakers saves bandwidth but needs speaker detection to
  be fast.
- MCU audio mixing saves bandwidth but is compute-heavy and adds a few
  milliseconds.
- Failure handling covers a host dropping (host transfer).
- Rejoin after a network blip resumes the same meeting state from the session
  cache.

### Q: Design screen sharing and recording

**A:** Screen sharing is just another WebRTC video track.

- The client captures the display, encodes it (VP8/VP9/H.264, often AV1 at high
  resolution) as a low-motion stream.
- It publishes the stream to the SFU alongside the camera track.
- The client renders the presenter's screen as a separate surface with the
  presenter's camera overlaid.
- Composition happens on the viewer, keeping the SFU simple.
- Annotation and touch work client-side on the captured stream.

Recording lives in the media plane.

- A recorder joins the meeting as a subscriber that consumes the SFU's streams
  and writes segments to object storage.
- For layouts that mirror what viewers saw, a composite (MCU-style) stage mixes
  the screen, active speaker, and captions into one video.
- Each segment carries a sequence number so reassembly tolerates a dropped
  segment.

Post-processing runs asynchronously.

- Stitch segments, add captions via ASR, generate transcripts and thumbnails.
- Publish the recording with a manifest.
- Transcripts feed search, so a recording is discoverable by spoken content.
- Captions are re-synced to the stitched timeline.
- Recording is encrypted at rest.
- Playback is gated by the same meeting-token mechanism as live, so a recording
  link can't be shared indefinitely.

The trade-off is flexibility versus cost.

- Per-participant recording keeps every source separate and supports arbitrary
  playback layouts.
- It multiplies storage and encode cost.
- Composite recording is cheap and deterministic but fixed at record time.
- Failure handling writes segments with continuity and assembles a manifest at
  the end.
- A mid-call outage loses only the gap.
- Retention and GDPR controls govern storage.
- Latency stays additive because recording subscribes to what viewers already
  receive.

### Q: How do you handle poor network conditions in a video call?

**A:** Network adaptation is per-subscriber and continuous.

- The client runs congestion control (Google Congestion Control / REMB)
  estimating bandwidth from arrival rates.
- It tells the SFU which simulcast layer it can afford.
- When congestion hits, the SFU downgrades to a lower layer, then to audio-only,
  then to audio with reduced bitrate.
- The jitter buffer grows and shrinks to hide variance.
- DTX (silence detection) stops sending audio packets during silence to reclaim
  bandwidth.

Resilience is layered on top.

- Audio gets FEC (RED) so a few lost packets reconstruct seamlessly.
- NACK/RTX retransmits lost video packets up to a latency budget.
- A keyframe request repairs a broken video stream instead of waiting for the
  next I-frame.
- Audio is always prioritized over video.
- The SFU applies the same adaptation when a subscriber's link degrades.

Adaptation is multi-dimensional.

- Resolution drops first, then frame rate, then codec complexity.
- Low-motion scenes tolerate frame-rate cuts that would ruin a full-motion
  share.
- The client also adapts locally, e.g., muting the camera when UDP is blocked
  behind a strict firewall.
- Audio stays on a TURN relay.

The trade-offs are explicit.

- More FEC and retransmission eat bandwidth and latency.
- You spend just enough to keep the call alive and degrade quality rather than
  stall.
- The system monitors per-participant metrics — packet loss, jitter, round-trip
  time, frames-per-second.
- The client can auto-mute video for a weak subscriber and surface a "poor
  connection" hint.
- Scaling is about not coupling adaptation decisions: each subscriber adapts
  independently.
- A single weak link never drags down the meeting.

## Source

```text
title: Zoom Video Conferencing
node client: Client [round, icon=browser]
node signal: Signaling Server [icon=server]
node auth: Auth Service [icon=auth]
node room: Room Service [icon=message]
node sfu: SFU Media Router [icon=compute]
node relay: Media Relay [ellipse, icon=cloud]
node screen: Screen Share [icon=file]
node record: Recording [icon=file]
node notify: Notifications [icon=mail]
node db: Meeting DB [cylinder, icon=database]
node cache: Session Cache [cylinder, icon=cache]

edge client -> auth: login
edge auth -> signal: token
edge client -> signal: join room
edge signal -> room: create / join
edge room -> db: persist
edge client -> sfu: publish media
edge sfu -> client: forward streams
edge sfu -> relay: bridge cross-region
edge client -> screen: share
edge screen -> sfu: video track
edge room -> record: archive
edge room -> notify: status
edge signal -> cache: session
```
