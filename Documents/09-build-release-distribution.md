# 09 — Build, Release & Distribution

## 1. Product objective

Build completion is not the end state. GitDrive should carry a successful build to an installable and distributable release with minimal human handoff.

## 2. Application lifecycle

```
Source
 ↓
Build
 ↓
Test
 ↓
Package
 ↓
Sign (optional/policy-driven)
 ↓
Release
 ↓
LAN Distribution
 ↓
Update / Rollback
```

## 3. Artifact types

Examples:
- `.exe`, `.msi`, `.msix`;
- `.apk`, `.aab`;
- `.AppImage`, `.deb`, `.rpm`;
- `.zip`, `.tar.gz`;
- binaries;
- Docker/OCI images.

MVP should support only a small tested subset.

## 4. Release model

Release SHALL reference:
- repository;
- source commit/tag;
- pipeline run;
- artifact(s);
- target platform;
- version;
- checksum;
- release notes.

## 5. Internal App Distribution

GitDrive MAY expose an application catalog separate from Git repository pages.

Example:

```
Applications
------------------------
Inventory       v4.3.2
POS             v8.1.0
HR Client       v2.2.4
```

End users can see only applications authorized for their device/user group.

## 6. Update agent

Optional GitDrive Agent can:
- check version;
- fetch metadata;
- download artifact;
- verify checksum/signature;
- invoke installer;
- report installed version.

## 7. Rollback

A failed release SHOULD be revertible to a previously known-good release.

## 8. Build cache

GitDrive SHOULD support cache layers such as dependency cache, compiler cache, Docker layer cache and project build cache where correctness can be preserved.

## 9. Dependency mirror

For offline/restricted deployments, GitDrive MAY act as a controlled internal package cache/mirror. The feature is not “package registry as novelty”; its purpose is to shorten builds and reduce external network dependence.

## 10. Time-to-ship model

Primary optimization target:

```
T_ship = T_configuration + T_queue + T_build + T_test + T_package + T_release + T_distribution
```

GitDrive's product differentiation targets `T_configuration`, `T_release` and `T_distribution`, while cache/mirroring can reduce repeated `T_build`.
