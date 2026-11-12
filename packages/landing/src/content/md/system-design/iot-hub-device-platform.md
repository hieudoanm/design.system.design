# IoT Hub — Device Platform

Design an IoT device platform

**Difficulty:** Easy

**Tags:** iot, monitoring

## Functional Requirements

- an IoT device platform
- ingest telemetry from millions of devices?
- process rules in real time?
- send commands back to devices?
- manage device state and firmware updates?

## Non-Functional Requirements

- The platform connects physical devices to the cloud through a hub.

- Devices talk to an Edge Gateway (MQTT/CoAP/HTTPS) which authenticates each
  device, then publish telemetry to the IoT Hub.
- The hub funnels messages into an Ingestion Pipeline — a partitioned, durable
  queue — so the platform absorbs bursty and variable-rate device traffic.
- Two consumers run in parallel: a Rules Engine evaluates streaming rules in
  real time (thresholds, alerts, commands), and a persister writes raw telemetry
  to a Time-series Store for historical querying.
- The Device Registry is the system of record for device identity, capabilities,
  and desired state; the Command Service delivers downlinks (configuration,
  control commands, firmware updates) back through the edge gateway to the
  device.
- Dashboards query the hub and time-series store for live and historical views,
  and Alerting pages ops on rule hits.

The core tensions are scale, device heterogeneity, and reliability.

- Scale: millions of devices, billions of messages.
- Device heterogeneity: protocols, flaky connectivity, NAT.
- Reliability of both uplink and downlink.
- Partitioning by device id keeps a device's messages ordered while the pipeline
  scales horizontally, and the registry acts as the glue for all command and
  state flows..
- Ingestion is designed for write throughput and burst tolerance.

- Devices open a persistent MQTT connection (or batched HTTPS) to an edge
  gateway, which authenticates via device credentials and validates schema
  before forwarding messages to the hub.
- The hub writes each message to a partitioned message bus (Kafka-like) keyed by
  device id, giving per-device ordering while spreading load across partitions;
  consumers then batch-write to the time-series store, dramatically cutting
  write amplification compared to one write per message.
- Inbound rate is metered per device and per hub — a misbehaving device or a
  firmware bug that spams telemetry is throttled or quarantined without harming
  neighbors.
- Edge gateways add a local buffer so devices survive brief network outages and
  reconnect with backoff.
- To handle cold starts and firmware rollouts that spike traffic, the pipeline
  autoscales partition consumers and the time-series store shards by time +
  device so hot partitions don't collapse a node.
- Delivery is at-least-once; dedup by message id happens at the rules and
  storage layers..
- Rules run on the streaming path between ingestion and storage, so they see each
  telemetry message with minimal latency.

- The Rules Engine evaluates a compiled rule set — a rule is a predicate over
  message fields plus a target action (alert, command, or aggregate) — and
  supports windowed state such as "temperature above 80°C for 5 consecutive
  readings" using a per-device window store.
- Rules are compiled into the engine's execution graph rather than interpreted
  per message, and rules that only need recent history are evaluated from a
  short-lived in-memory state while rules needing longer windows query a bounded
  state store keyed by device.
- To keep evaluation correct under partitioning, all of a device's messages
  route to the same partition so its window state is consistent; rebalancing
  redistributes partitions, not windows in flight.
- Rule changes are versioned and pushed to the engine hot-reload, and there is
  an explicit kill switch per rule.
- Alerting dedups by device and rule with a cooldown so a sustained fault pages
  once rather than hundreds of times, and rule hits are logged with the exact
  telemetry that triggered them for troubleshooting..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: IoT Hub
device: Device
gateway: Edge Gateway
hub: IoT Hub
ingest: Ingestion Pipeline
rules: Rules Engine
store: Time-series Store
command: Command Service
registry: Device Registry
alert: Alerting
dash: Dashboard

device ─► gateway ─► telemetry
gateway ─► hub ─► publish
hub ─► ingest ─► buffer
ingest ─► rules ─► evaluate
ingest ─► store ─► persist
rules ─► alert ─► trigger
dash ─► hub ─► query
hub ─► command ─► downlink
command ─► gateway ─► relay
gateway ─► device ─► control
hub ─► registry ─► register
```

## Design

### Design an IoT device platform

The platform connects physical devices to the cloud through a hub.

- Devices talk to an Edge Gateway (MQTT/CoAP/HTTPS) which authenticates each
  device, then publish telemetry to the IoT Hub.
- The hub funnels messages into an Ingestion Pipeline — a partitioned, durable
  queue — so the platform absorbs bursty and variable-rate device traffic.
- Two consumers run in parallel: a Rules Engine evaluates streaming rules in
  real time (thresholds, alerts, commands), and a persister writes raw telemetry
  to a Time-series Store for historical querying.
- The Device Registry is the system of record for device identity, capabilities,
  and desired state; the Command Service delivers downlinks (configuration,
  control commands, firmware updates) back through the edge gateway to the
  device.
- Dashboards query the hub and time-series store for live and historical views,
  and Alerting pages ops on rule hits.

The core tensions are scale, device heterogeneity, and reliability.

- Scale: millions of devices, billions of messages.
- Device heterogeneity: protocols, flaky connectivity, NAT.
- Reliability of both uplink and downlink.
- Partitioning by device id keeps a device's messages ordered while the pipeline
  scales horizontally, and the registry acts as the glue for all command and
  state flows.

### How do you ingest telemetry from millions of devices?

Ingestion is designed for write throughput and burst tolerance.

- Devices open a persistent MQTT connection (or batched HTTPS) to an edge
  gateway, which authenticates via device credentials and validates schema
  before forwarding messages to the hub.
- The hub writes each message to a partitioned message bus (Kafka-like) keyed by
  device id, giving per-device ordering while spreading load across partitions;
  consumers then batch-write to the time-series store, dramatically cutting
  write amplification compared to one write per message.
- Inbound rate is metered per device and per hub — a misbehaving device or a
  firmware bug that spams telemetry is throttled or quarantined without harming
  neighbors.
- Edge gateways add a local buffer so devices survive brief network outages and
  reconnect with backoff.
- To handle cold starts and firmware rollouts that spike traffic, the pipeline
  autoscales partition consumers and the time-series store shards by time +
  device so hot partitions don't collapse a node.
- Delivery is at-least-once; dedup by message id happens at the rules and
  storage layers.

### How do you process rules in real time?

Rules run on the streaming path between ingestion and storage, so they see each
telemetry message with minimal latency.

- The Rules Engine evaluates a compiled rule set — a rule is a predicate over
  message fields plus a target action (alert, command, or aggregate) — and
  supports windowed state such as "temperature above 80°C for 5 consecutive
  readings" using a per-device window store.
- Rules are compiled into the engine's execution graph rather than interpreted
  per message, and rules that only need recent history are evaluated from a
  short-lived in-memory state while rules needing longer windows query a bounded
  state store keyed by device.
- To keep evaluation correct under partitioning, all of a device's messages
  route to the same partition so its window state is consistent; rebalancing
  redistributes partitions, not windows in flight.
- Rule changes are versioned and pushed to the engine hot-reload, and there is
  an explicit kill switch per rule.
- Alerting dedups by device and rule with a cooldown so a sustained fault pages
  once rather than hundreds of times, and rule hits are logged with the exact
  telemetry that triggered them for troubleshooting.

### How do you send commands back to devices?

Downlink is the hard direction because devices are often behind NAT and offline.

- The platform uses three mechanisms: devices maintain a persistent MQTT channel
  that can carry push commands immediately; for devices that cannot keep a
  connection, the command is stored as a message with a TTL and delivered on the
  device's next connect/poll; and the registry holds desired state that devices
  pull when they reconnect.
- The Command Service is the orchestrator: it takes a command (turn on, update
  config, trigger firmware install), assigns a command id, persists it, and
  routes it to the right channel.
- Delivery is confirmed via a device acknowledgment — the device responds with
  an ack and result code, and the platform tracks status per command (SENT,
  DELIVERED, ACKED, FAILED, EXPIRED) with retry policy tuned per command type.
- Idempotency matters because at-least-once delivery means a command can arrive
  twice; each command carries an id and the device dedups by it.
- Command volume is far below telemetry volume, so downlink does not share the
  bulk write path, but it shares the registry for state, and edge gateways can
  cache commands for devices that connect intermittently.

### How do you manage device state and firmware updates?

Each device has a twin: reported state (what the device says it is doing) and
desired state (what the platform wants it to do).

- The twin is stored in the registry and merged when the two converge.
- Devices report state periodically or on change; the twin update is versioned
  so concurrent updates from device and platform resolve deterministically
  (latest version wins).
- Firmware updates are a specialized command flow: the platform stores firmware
  images in versioned blob storage, marks a target version in the device twin,
  and the device pulls the image (often chunked/resumable) and reports install
  progress and final version.
- Updates roll out in cohorts — percentage-based rollout by device group with
  monitoring between cohorts — so a bad image is caught before the fleet.
- The registry enforces version compatibility and per-device update windows.
- If a device fails to report progress, the update is marked stale and retried
  or rolled back.
- All state and firmware transitions are recorded for audit, and fleet
  dashboards show firmware adoption rates across device models so ops can pause
  a rollout that is failing.

## Source

```text
title: IoT Hub
node device: Device [round, icon=worker]
node gateway: Edge Gateway [icon=server]
node hub: IoT Hub [icon=server]
node ingest: Ingestion Pipeline [icon=queue]
node rules: Rules Engine [icon=compute]
node store: Time-series Store [cylinder, icon=database]
node command: Command Service [icon=message]
node registry: Device Registry [icon=search]
node alert: Alerting [icon=message]
node dash: Dashboard [icon=browser]

edge device -> gateway: telemetry
edge gateway -> hub: publish
edge hub -> ingest: buffer
edge ingest -> rules: evaluate
edge ingest -> store: persist
edge rules -> alert: trigger
edge dash -> hub: query
edge hub -> command: downlink
edge command -> gateway: relay
edge gateway -> device: control
edge hub -> registry: register
```

## Q&A

### Q: Design an IoT device platform

**A:** The platform connects physical devices to the cloud through a hub.

- Devices talk to an Edge Gateway (MQTT/CoAP/HTTPS) which authenticates each
  device, then publish telemetry to the IoT Hub.
- The hub funnels messages into an Ingestion Pipeline — a partitioned, durable
  queue — so the platform absorbs bursty and variable-rate device traffic.
- Two consumers run in parallel: a Rules Engine evaluates streaming rules in
  real time (thresholds, alerts, commands), and a persister writes raw telemetry
  to a Time-series Store for historical querying.
- The Device Registry is the system of record for device identity, capabilities,
  and desired state; the Command Service delivers downlinks (configuration,
  control commands, firmware updates) back through the edge gateway to the
  device.
- Dashboards query the hub and time-series store for live and historical views,
  and Alerting pages ops on rule hits.

The core tensions are scale, device heterogeneity, and reliability.

- Scale: millions of devices, billions of messages.
- Device heterogeneity: protocols, flaky connectivity, NAT.
- Reliability of both uplink and downlink.
- Partitioning by device id keeps a device's messages ordered while the pipeline
  scales horizontally, and the registry acts as the glue for all command and
  state flows.

### Q: How do you ingest telemetry from millions of devices?

**A:** Ingestion is designed for write throughput and burst tolerance.

- Devices open a persistent MQTT connection (or batched HTTPS) to an edge
  gateway, which authenticates via device credentials and validates schema
  before forwarding messages to the hub.
- The hub writes each message to a partitioned message bus (Kafka-like) keyed by
  device id, giving per-device ordering while spreading load across partitions;
  consumers then batch-write to the time-series store, dramatically cutting
  write amplification compared to one write per message.
- Inbound rate is metered per device and per hub — a misbehaving device or a
  firmware bug that spams telemetry is throttled or quarantined without harming
  neighbors.
- Edge gateways add a local buffer so devices survive brief network outages and
  reconnect with backoff.
- To handle cold starts and firmware rollouts that spike traffic, the pipeline
  autoscales partition consumers and the time-series store shards by time +
  device so hot partitions don't collapse a node.
- Delivery is at-least-once; dedup by message id happens at the rules and
  storage layers.

### Q: How do you process rules in real time?

**A:** Rules run on the streaming path between ingestion and storage, so they see each
telemetry message with minimal latency.

- The Rules Engine evaluates a compiled rule set — a rule is a predicate over
  message fields plus a target action (alert, command, or aggregate) — and
  supports windowed state such as "temperature above 80°C for 5 consecutive
  readings" using a per-device window store.
- Rules are compiled into the engine's execution graph rather than interpreted
  per message, and rules that only need recent history are evaluated from a
  short-lived in-memory state while rules needing longer windows query a bounded
  state store keyed by device.
- To keep evaluation correct under partitioning, all of a device's messages
  route to the same partition so its window state is consistent; rebalancing
  redistributes partitions, not windows in flight.
- Rule changes are versioned and pushed to the engine hot-reload, and there is
  an explicit kill switch per rule.
- Alerting dedups by device and rule with a cooldown so a sustained fault pages
  once rather than hundreds of times, and rule hits are logged with the exact
  telemetry that triggered them for troubleshooting.

### Q: How do you send commands back to devices?

**A:** Downlink is the hard direction because devices are often behind NAT and offline.

- The platform uses three mechanisms: devices maintain a persistent MQTT channel
  that can carry push commands immediately; for devices that cannot keep a
  connection, the command is stored as a message with a TTL and delivered on the
  device's next connect/poll; and the registry holds desired state that devices
  pull when they reconnect.
- The Command Service is the orchestrator: it takes a command (turn on, update
  config, trigger firmware install), assigns a command id, persists it, and
  routes it to the right channel.
- Delivery is confirmed via a device acknowledgment — the device responds with
  an ack and result code, and the platform tracks status per command (SENT,
  DELIVERED, ACKED, FAILED, EXPIRED) with retry policy tuned per command type.
- Idempotency matters because at-least-once delivery means a command can arrive
  twice; each command carries an id and the device dedups by it.
- Command volume is far below telemetry volume, so downlink does not share the
  bulk write path, but it shares the registry for state, and edge gateways can
  cache commands for devices that connect intermittently.

### Q: How do you manage device state and firmware updates?

**A:** Each device has a twin: reported state (what the device says it is doing) and
desired state (what the platform wants it to do).

- The twin is stored in the registry and merged when the two converge.
- Devices report state periodically or on change; the twin update is versioned
  so concurrent updates from device and platform resolve deterministically
  (latest version wins).
- Firmware updates are a specialized command flow: the platform stores firmware
  images in versioned blob storage, marks a target version in the device twin,
  and the device pulls the image (often chunked/resumable) and reports install
  progress and final version.
- Updates roll out in cohorts — percentage-based rollout by device group with
  monitoring between cohorts — so a bad image is caught before the fleet.
- The registry enforces version compatibility and per-device update windows.
- If a device fails to report progress, the update is marked stale and retried
  or rolled back.
- All state and firmware transitions are recorded for audit, and fleet
  dashboards show firmware adoption rates across device models so ops can pause
  a rollout that is failing.

## Source

```text
title: IoT Hub
node device: Device [round, icon=worker]
node gateway: Edge Gateway [icon=server]
node hub: IoT Hub [icon=server]
node ingest: Ingestion Pipeline [icon=queue]
node rules: Rules Engine [icon=compute]
node store: Time-series Store [cylinder, icon=database]
node command: Command Service [icon=message]
node registry: Device Registry [icon=search]
node alert: Alerting [icon=message]
node dash: Dashboard [icon=browser]

edge device -> gateway: telemetry
edge gateway -> hub: publish
edge hub -> ingest: buffer
edge ingest -> rules: evaluate
edge ingest -> store: persist
edge rules -> alert: trigger
edge dash -> hub: query
edge hub -> command: downlink
edge command -> gateway: relay
edge gateway -> device: control
edge hub -> registry: register
```
