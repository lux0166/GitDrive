# 13 — Use Cases

## UC-01 — Create application repository

**Actor:** Developer

**Goal:** Start a new project without configuring CI manually.

**Flow:**
1. Create/import repository.
2. GitDrive scans project.
3. Detected stack is displayed.
4. User chooses target/output.
5. Workflow proposal is generated.
6. User reviews and confirms.

**Success:** repository has a runnable workflow.

## UC-02 — Push and automatic build

**Actor:** Developer

**Trigger:** push to configured branch.

**Flow:** push → event → workflow resolution → queue → runner → build/test → artifact.

## UC-03 — Pull request validation

**Actor:** Developer / reviewer

**Flow:** PR opened → validation workflow → result attached to PR.

## UC-04 — Build Windows desktop app

**Actor:** Developer

**Example:** .NET/WinUI/WPF project.

**Outcome:** Windows runner produces installer/executable artifact, checksum and optional signature.

## UC-05 — Publish internal release

**Actor:** Maintainer

**Outcome:** Versioned release appears in application catalog and is downloadable from LAN.

## UC-06 — End-user update

**Actor:** End user / update agent

**Flow:** agent detects newer release → downloads from LAN → verifies checksum/signature → installs.

## UC-07 — Offline build

**Actor:** Admin

**Precondition:** source, dependencies, toolchains and runners are local.

**Outcome:** push/build/release operates without Internet.

## UC-08 — Workflow evolution proposal

**Actor:** Developer

**Trigger:** repository gains Dockerfile or new build capability.

**Outcome:** GitDrive proposes a workflow diff; user approves it.

## UC-09 — Failed build diagnosis

**Actor:** Developer

**Outcome:** system provides logs + deterministic failure classification; optional local AI explains probable root cause.

## UC-10 — Runner outage

**Actor:** Platform admin

**Outcome:** scheduler marks runner unavailable and preserves queued jobs.
