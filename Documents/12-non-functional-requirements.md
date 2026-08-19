# 12 — Non-Functional Requirements

## NFR-001 Reliability

A queued job must not silently disappear if the runner disconnects. State transitions need durable persistence.

## NFR-002 Observability

The system must expose pipeline status, step duration, runner state, storage usage and failure logs.

## NFR-003 Performance

MVP target: UI should feel interactive on a LAN; API p95 for ordinary metadata requests SHOULD be below 500 ms under expected single-node load. Exact target is configurable after profiling.

## NFR-004 Workflow generation latency

Repository scan and deterministic workflow proposal SHOULD complete in seconds for normal repositories.

## NFR-005 Security

No secrets in normal logs. Runner registration must be authenticated. Administrative actions should be auditable.

## NFR-006 Local availability

Core Git and CI functions SHOULD continue operating with Internet disconnected if the configured workflow dependencies and runners are local.

## NFR-007 Reproducibility

The same commit + workflow version + runner profile SHOULD resolve to a comparable build environment.

## NFR-008 Storage governance

Artifact, cache and log retention policies SHALL be configurable to prevent unbounded disk growth.

## NFR-009 Extensibility

New project detectors and build profiles should be pluggable without modifying unrelated Git functionality.

## NFR-010 Explainability

Auto-generated workflow decisions need evidence and reason codes.

## NFR-011 Accessibility

Core developer workflows should be usable by keyboard and common screen-reader semantics where practical.

## NFR-012 Recovery

Backup/restore instructions shall cover metadata and file storage consistently.
