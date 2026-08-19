# 08 — GitActions / CI-CD

## 1. Product concept

GitActions là execution subsystem của GitDrive. “Actions” ở đây là local/LAN workflow jobs, không phụ thuộc public cloud control plane.

## 2. Trigger types

MVP:
- push to branch;
- manual run.

Later:
- pull request;
- tag;
- release;
- scheduled;
- upstream project event.

## 3. Execution lifecycle

```
Event
 ↓
Workflow Resolution
 ↓
Run Creation
 ↓
Job Queue
 ↓
Runner Matching
 ↓
Sandbox Creation
 ↓
Execution
 ↓
Log/Artifact Collection
 ↓
Run Finalization
```

## 4. Runner model

Runner SHALL declare capabilities such as:
- OS: windows/linux;
- architecture;
- installed toolchain;
- labels;
- capacity;
- network policy.

Scheduler routes a job only when required capabilities are satisfied.

## 5. Isolation

Default build jobs SHOULD execute in isolated containers/VMs where feasible. Native runners are needed for workloads that cannot reasonably execute in containers (for example some Windows desktop build chains).

## 6. Pipeline output

Each run SHOULD produce:
- status;
- duration;
- per-step logs;
- runner identity;
- commit SHA;
- artifact list;
- failure reason;
- cache metrics.

## 7. Reproducibility

Workflow metadata SHOULD capture toolchain version, target, dependencies/source references and runner image/profile.

## 8. Compatibility strategy

Do not promise full GitHub Actions compatibility in MVP. GitDrive MAY support an export/import adapter later. The native semantic model should be designed for local workflow generation rather than constrained by external syntax.

## 9. Queue priorities

Suggested priorities:
- interactive/manual build: high;
- PR validation: normal;
- scheduled maintenance: low.
