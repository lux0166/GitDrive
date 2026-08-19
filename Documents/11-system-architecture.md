# 11 — Logical System Architecture

## 1. Architecture model

GitDrive should use a control-plane / execution-plane / distribution-plane separation.

```
                ┌──────────────────────────────┐
                │         GitDrive UI          │
                └──────────────┬───────────────┘
                               │
                ┌──────────────▼───────────────┐
                │      GitDrive Control Plane  │
                │                              │
                │ Auth / API / Git / Workflow │
                │ Scheduler / Release / Audit │
                └───────┬──────────────┬───────┘
                        │              │
              ┌─────────▼───┐   ┌────▼─────────┐
              │ PostgreSQL  │   │ Git Storage  │
              └─────────────┘   └──────────────┘
                        │
                        ▼
                ┌───────────────┐
                │ Job Queue     │
                └───────┬───────┘
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
   Windows Runner   Linux Runner    Docker Runner
        │               │                │
        └───────────────┼────────────────┘
                        ▼
                 Artifact Storage
                        │
                        ▼
                 Release / Apps
```

## 2. Core components

### Web UI
Repository, workflow, run, artifact, release and app distribution interfaces.

### API
Application service layer for auth, repo metadata, workflow management, queueing and release.

### Git service
Handles Git protocol / repository operations and internal repository events.

### Workflow engine
Project detector, workflow planner, validator and compiler to execution graph.

### Scheduler
Matches jobs to compatible runners.

### Runner
Executes jobs and returns logs/results.

### Artifact service
Stores immutable build outputs and metadata.

### Distribution service
Serves authorized application releases and update metadata.

## 3. Suggested storage split

```
PostgreSQL
- users
- orgs
- repo metadata
- PRs
- workflow definitions
- runs
- runners
- release metadata

Filesystem/Object-like storage
- Git objects
- artifacts
- release binaries
- package cache
```

## 4. Local deployment

Reference deployment may use Docker Compose for server-side components, while native build runners can live on host machines in the LAN.

## 5. Scaling path

Single node → multiple runners → multiple build nodes → optional HA control plane. Do not require distributed deployment for MVP.
