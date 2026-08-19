# 10 — Local / LAN Security

## 1. Security promise

GitDrive should be able to operate without sending repository or build data to external services by default. This is an architecture requirement, not merely a privacy statement.

## 2. Network modes

### Mode A — Local-only

- LAN allowed
- Internet egress disabled for GitDrive-managed services where policy permits

### Mode B — Air-gapped

- no external DNS dependency
- no external HTTP/HTTPS dependency
- approved internal services only

### Mode C — Controlled online

- explicit outbound allowlist
- optional package/update integrations

## 3. Egress policy

Policies SHOULD be enforceable at:
- server;
- runner;
- job;
- container namespace.

## 4. Runner threat model

A workflow is arbitrary code. Therefore a runner must be treated as an execution boundary. Risks include:
- filesystem destruction;
- credential theft;
- network exfiltration;
- lateral movement;
- resource exhaustion.

## 5. Required controls

MVP baseline:
- explicit runner registration;
- scoped runner labels;
- job timeout;
- resource limits where backend supports them;
- secret masking;
- no host credentials mounted by default;
- audit logs.

## 6. Secrets

Secrets SHOULD be encrypted at rest and exposed to jobs only when scope/policy permits. Logs SHOULD mask known secret values.

## 7. Supply chain

For generated workflows, GitDrive should prefer local/approved actions and package sources. Remote action execution must be explicit in controlled-online mode.

## 8. Telemetry

Default should be no external telemetry. Local diagnostics may be available to administrators. Any external telemetry integration must be explicit and visible.

## 9. Data boundary

Typical local data classes:
- Git objects;
- source code;
- metadata;
- workflow definitions;
- logs;
- artifacts;
- releases;
- package cache;
- secrets.

These should remain within the configured storage/network boundary unless an administrator explicitly enables an external integration.
