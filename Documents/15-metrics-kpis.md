# 15 — Metrics & KPIs

## 1. North-star metric

### Time-to-Usable-Release (TTUR)

Time from a valid source state to a distributable application release available to an authorized LAN user.

```
TTUR = T_release_available - T_source_ready
```

## 2. Core KPI groups

### Workflow onboarding
- time to first successful generated workflow;
- percentage of repositories auto-detected;
- percentage of generated workflows accepted without manual step insertion;
- workflow correction rate.

### Build performance
- median build duration;
- queue wait time;
- cache hit ratio;
- dependency mirror hit ratio.

### Delivery
- time from build success to release;
- time from release to first download;
- percentage of releases distributed without manual file transfer.

### Reliability
- workflow success rate;
- runner failure rate;
- artifact corruption rate;
- rollback success rate.

## 3. Benchmark scenarios

### Scenario A — New repository
Measure:
`repository import → first green pipeline`.

### Scenario B — Repeat build
Measure:
`same project with warm cache → artifact`.

### Scenario C — Release
Measure:
`green build → release visible in LAN`.

### Scenario D — End-user update
Measure:
`release visible → client updated`.

## 4. Anti-metrics

Do not optimize only for:
- number of features;
- lines of YAML generated;
- number of supported frameworks.

Product value is demonstrated by time and manual effort saved.
