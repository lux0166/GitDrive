# 04 — Product Scope

## 1. Scope model

GitDrive scope được chia thành ba lớp:

1. **Core development parity** — các năng lực GitHub-like cần có để team phát triển phần mềm.
2. **GitDrive differentiation** — workflow intelligence và local-first delivery.
3. **Extended capabilities** — các chức năng nâng cao chỉ triển khai sau khi golden path ổn định.

## 2. In scope — Core development foundation

### Repository

- Local/private Git repository hosting
- Create/import/archive/delete repository
- Clone/fetch/pull/push
- Branch/tag/commit history
- File tree and file viewer
- Commit diff
- Repository metadata
- README rendering

### Collaboration

- Issues
- Pull requests
- Branch comparison
- Review comments
- Approval/request changes
- Merge
- Basic project/team membership

### Identity and access

- Local users
- Authentication
- Repository roles/permissions
- Private repository access
- Audit baseline

## 3. In scope — GitDrive differentiation

### Workflow Intelligence

- Repository scanning
- Project family detection
- Build-system/tool detection
- Test detection
- Packaging/target inference
- Workflow proposal
- Workflow generation
- Explainability/evidence
- Visual workflow representation
- Manual override
- Workflow versioning
- Workflow adaptation after repository changes

### GitActions / CI-CD

- Pipeline scheduler
- Trigger by push, PR, tag/release and manual action
- Local/LAN runners
- Runner capability matching
- Job queue
- Live logs
- Retry/cancel
- Artifact collection
- Secret injection
- Environment configuration

### Build / Release / Distribution

- Build/test/package
- Artifact storage
- Versioned releases
- Checksums
- Optional signing
- LAN download/distribution
- Application/update metadata

## 4. In scope — Local-first infrastructure

- Local-only operation
- LAN operation
- Configurable outbound network policy
- Local/LAN runner fleet
- Local artifact storage
- Optional dependency/cache mirror
- Backup/export baseline

## 5. Extended scope

Các năng lực này được xem là roadmap, không phải MVP blocker:

- Dependency/package mirrors
- Dependency, compiler và Docker layer cache
- Preview environments per PR
- Application update agent
- AI-assisted code review
- AI-assisted CI failure analysis
- Advanced signing/notarization integrations
- Device/application inventory

## 6. Out of scope for MVP

- Public SaaS hosting
- GitHub-scale social/discovery ecosystem
- Global third-party Actions marketplace
- Full Kubernetes control plane
- Full MDM/UEM solution
- Multi-region replication
- Dozens of framework-specific build systems
- Complete parity with every GitHub Enterprise feature

## 7. MVP definition

MVP phải chứng minh **cả hai**:

### A. Core Git development path

```text
Create/import repository
→ clone/push/pull
→ branch
→ issue/PR
→ review
→ merge
```

### B. GitDrive delivery path

```text
Merged change
→ inspect repository
→ generate workflow
→ user reviews workflow
→ run on local/LAN runner
→ build/test/package
→ store artifact
→ create release
→ download from LAN
```

Thiếu A thì GitDrive trở thành build service. Thiếu B thì GitDrive trở thành một Git hosting platform thông thường.

## 8. Product boundary

GitDrive gồm:

- **Control plane:** repository, collaboration, workflow metadata, scheduler, release metadata.
- **Execution plane:** local/LAN runners và build environments.
- **Distribution plane:** artifact/release delivery và optional application update agent.

## 9. Prioritization rule

Một capability được ưu tiên nếu nó:

1. giữ hoặc nâng core development usability;
2. giảm configuration time;
3. giảm build/delivery time;
4. giảm thao tác thủ công;
5. tăng local/offline capability;
6. tăng security/observability của private delivery.
