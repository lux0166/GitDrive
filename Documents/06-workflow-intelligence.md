# 06 — Workflow Intelligence

## 1. Purpose

Đây là core product differentiator của GitDrive. Hệ thống không chờ developer viết workflow trước; nó **suy luận workflow từ evidence trong repository + mục tiêu build/release mà user chọn**.

## 2. Inputs

### Repository evidence
- manifests: package.json, *.csproj, pom.xml, Cargo.toml, go.mod, pyproject.toml...
- lock files;
- solution/project files;
- Dockerfile;
- build scripts;
- test directories;
- packaging config;
- existing CI configs;
- repository structure;
- declared target frameworks/platforms.

### User intent
- application vs library;
- target OS/architecture;
- output type;
- distribution target;
- release policy.

### Organization policy
- approved runner labels;
- allowed package sources;
- security policy;
- signing policy;
- release channel rules.

## 3. Detection pipeline

```
Repository
  ↓
Evidence Collector
  ↓
Project Detector
  ↓
Build/Package Detector
  ↓
Test Detector
  ↓
Target Resolver
  ↓
Workflow Planner
  ↓
Validator
  ↓
Human Review
  ↓
Executable Workflow
```

## 4. Principle: deterministic before AI

MVP nên dùng deterministic rules trước. AI chỉ được dùng cho ambiguous cases / explanation / failure diagnosis.

Ví dụ:
- Có `.csproj` → detect .NET.
- Có Electron config → detect Electron packaging.
- Có `Cargo.toml` → detect Rust.

Không để model tự “đoán” build command khi evidence đủ rõ.

## 5. Workflow intermediate representation

GitDrive SHOULD represent workflow internally as a graph/IR rather than treating YAML as the canonical semantic model.

Ví dụ:

```yaml
project:
  family: dotnet-desktop
  target: windows-x64

pipeline:
  - checkout
  - restore
  - build
  - test
  - package
  - sign
  - release
  - distribute
```

YAML/visual workflow là presentation/configuration layer; execution plan là compiled representation.

## 6. Auto-generated workflow requirements

Workflow generator SHALL:
1. cite the evidence used for detection;
2. generate only steps compatible with detected project;
3. mark uncertain decisions;
4. allow user override;
5. validate runner requirements before execution;
6. produce a preview/diff before saving.

## 7. Adaptive workflow

When repository structure changes, GitDrive MAY detect capability changes and propose workflow updates. Example: adding Dockerfile triggers recommendation for container build.

System SHALL NOT silently alter a production workflow without explicit approval unless a user/admin policy explicitly permits it.

## 8. Confidence model

MVP SHOULD expose confidence qualitatively: `high`, `medium`, `needs confirmation`. Confidence is based on evidence coverage, not on model confidence alone.

## 9. Failure behavior

Nếu không đủ evidence:

```
Cannot safely generate package step.
Reason: no packaging definition detected.
Action: choose output type or provide packaging configuration.
```

Không được sinh workflow “có vẻ hợp lý” nhưng không có cơ sở.
