# 05 — Functional Requirements

## A. Core GitHub-like development capabilities

### FR-001 — User and identity

GitDrive SHALL support local user identity. Minimum MVP: username/password + session/token. Future: SSH keys, PAT, OIDC/LDAP.

### FR-002 — Repository management

User SHALL be able to create, import, archive and delete repositories. Repository SHALL support private/local access semantics.

### FR-003 — Git operations

System SHALL support authenticated clone/fetch/pull/push over at least one Git transport in MVP.

### FR-004 — Branching and tags

System SHALL allow creation, deletion and comparison of branches and tags according to repository permissions.

### FR-005 — Commit history and diff

System SHALL display commit history, commit metadata and file-level diffs.

### FR-006 — File and README browsing

System SHALL provide web-based repository tree/file browsing and README rendering.

### FR-007 — Issues

Users SHALL be able to create, view, update, label and close issues within authorized repositories.

### FR-008 — Pull requests

Users SHALL be able to create pull requests between branches, inspect diffs and track PR state.

### FR-009 — Code review

Authorized reviewers SHALL be able to comment, approve or request changes on a pull request.

### FR-010 — Merge

Authorized users SHALL be able to merge an approved pull request according to repository policy.

### FR-011 — Teams, roles and permissions

System SHALL support repository-level access control with at least owner/maintainer/developer/viewer semantics or an equivalent minimal role model.

### FR-012 — Audit baseline

System SHALL record security-sensitive repository and administrative actions with actor, timestamp, target and action result.

## B. Workflow Intelligence

### FR-013 — Repository inspection

System SHALL inspect repository manifests, project files, lock files, build configuration, tests and packaging configuration to infer project characteristics.

### FR-014 — Project detection

System SHALL infer, with confidence information, applicable project family, build system, test tooling, packaging strategy and candidate targets.

### FR-015 — Workflow proposal

System SHALL generate a proposed delivery workflow from repository evidence and declared project intent/targets.

### FR-016 — Workflow explanation

Generated workflow SHALL expose evidence, assumptions and rationale for generated nodes/steps.

### FR-017 — Workflow preview

User SHALL be able to inspect the proposed workflow before execution.

### FR-018 — Workflow override

User SHALL be able to accept, edit or override generated workflow behavior.

### FR-019 — Workflow versioning

Workflow definitions SHALL be versioned so that a build can be associated with the exact workflow definition used.

### FR-020 — Workflow adaptation

System SHOULD detect material repository changes that may invalidate or improve the current workflow and SHALL propose updates rather than silently changing production behavior.

## C. GitActions / CI-CD

### FR-021 — Pipeline triggers

System SHALL support pipeline triggers from push, pull request, tag/release and manual execution in MVP scope.

### FR-022 — Job scheduler

System SHALL create a queue of executable jobs and maintain lifecycle states such as queued, running, passed, failed, canceled and timed out.

### FR-023 — Runner registration

Runner SHALL register itself with capabilities including operating system, architecture, labels and toolchain information.

### FR-024 — Runner scheduling

Scheduler SHALL route jobs to compatible available runners based on declared requirements.

### FR-025 — Isolated execution

Runner SHALL execute jobs within a defined isolation boundary appropriate to its host OS and security policy.

### FR-026 — Logs

System SHALL stream and persist execution logs with sufficient context to diagnose a failed job.

### FR-027 — Retry/cancel

Authorized users SHALL be able to retry failed jobs and cancel queued/running jobs where the runner backend permits.

### FR-028 — Secrets

Secrets SHALL be scoped and injected without exposing plaintext in normal logs or repository source.

## D. Build, release and distribution

### FR-029 — Build/test/package

Runner SHALL support execution of build, test and packaging tasks generated or explicitly configured by the workflow.

### FR-030 — Artifact persistence

System SHALL persist artifacts with repository, commit, workflow, job, target, checksum and timestamp metadata.

### FR-031 — Release creation

User or workflow SHALL be able to create a versioned release from successful artifacts.

### FR-032 — Release integrity

System SHOULD generate checksums and SHALL preserve artifact provenance from source commit through release.

### FR-033 — LAN distribution

Release artifacts SHALL be downloadable through GitDrive's authenticated local/LAN interface.

### FR-034 — Application distribution metadata

System SHOULD maintain application name, version, target platform, release channel and installation/update metadata.

## E. Local-first security and operations

### FR-035 — Network policy

Admin SHALL be able to configure outbound network policy at instance, runner and/or job level.

### FR-036 — Local-only operation

Core repository, collaboration, workflow and delivery functionality SHALL be usable without dependency on a public cloud service.

### FR-037 — Health

System SHALL expose control-plane, runner, queue and storage health.

### FR-038 — Backup/export

System SHOULD provide an instance backup/export mechanism covering database metadata and repository/artifact storage.
