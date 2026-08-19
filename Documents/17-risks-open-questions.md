# 17 — Risks, Assumptions & Open Questions

## 1. Major risks

### R1 — Auto-generated workflow is wrong
**Impact:** high.
**Mitigation:** deterministic detectors, evidence, confidence, dry-run validation, human approval.

### R2 — “Local” is not a sufficient differentiator
**Impact:** high.
**Mitigation:** prove measurable configuration/delivery improvements.

### R3 — Scope explosion
**Impact:** high.
**Mitigation:** limit MVP project families and end-to-end golden path.

### R4 — Runner security
**Impact:** critical.
**Mitigation:** isolation, least privilege, explicit network policy, secret scoping.

### R5 — Build environment complexity
**Impact:** high.
**Mitigation:** prebuilt runner profiles, capability registry, toolchain inventory.

### R6 — Storage explosion
**Impact:** medium/high.
**Mitigation:** artifact/cache retention and quotas.

### R7 — User distrust of magic automation
**Impact:** medium.
**Mitigation:** explainability + editable generated workflow.

## 2. Product assumptions to validate

- Target users actually experience CI configuration friction.
- Internal application distribution is a real recurring problem.
- LAN bandwidth/build machines provide meaningful delivery advantages.
- Teams are willing to install a server and runners.

## 3. Open questions

### OQ-01
Which first project families? Recommended candidates: .NET desktop, Node/Electron, Docker service, or Go/Rust CLI.

### OQ-02
Is GitHub Actions-compatible syntax desirable, or should GitDrive own a smaller native DSL?

### OQ-03
Should automatic workflow generation happen only at repository creation, or continuously as the repository evolves?

### OQ-04
What is the minimum safe sandbox for Windows-native builds?

### OQ-05
How should dependency mirroring operate in air-gapped mode?

### OQ-06
Should an update agent be MVP or Phase 3?

### OQ-07
What is the canonical “application” entity relative to repository/release?

### OQ-08
How are signing certificates/keys handled without violating the local security model?

## 4. Hard decisions before architecture freeze

1. First 2–3 supported stack families.
2. Canonical workflow IR.
3. Runner isolation strategy.
4. Artifact storage implementation.
5. Network policy semantics.
6. Release/application data model.
