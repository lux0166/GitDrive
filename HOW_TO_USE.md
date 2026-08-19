# GitDrive — Comprehensive User & Operator Guide (How To Use)

> **GitDrive** is a high-assurance, local-first software delivery platform designed for air-gapped networks, private LAN environments, and edge server clusters. It delivers unified Git hosting, automated AST workflow intelligence, multi-tier CI/CD runner execution, cryptographic build provenance, and LAN-wide 1-click application distribution with zero reliance on public cloud infrastructure.

---

## 1. Quickstart & Installation

### System Prerequisites
- **Node.js**: v20.x or v22.x LTS
- **Package Manager**: `npm` v10+
- **Host OS**: Windows 10/11, Windows Server, Linux (Ubuntu/Debian/RHEL), or macOS
- **Optional Native Toolchains** (for local compilation): `rustc` / `cargo`, `.NET 8 SDK`, `go`, or `python`

### Starting the Platform
Clone or navigate to the GitDrive workspace and start the fullstack environment:

```bash
# 1. Install all monorepo dependencies
npm install

# 2. Run unit tests to verify core services
npm test --workspace=server

# 3. Build both server and client workspaces
npm run build

# 4. Launch the local control plane & web interface
npm run dev
```

Once running:
- **Web UI & Control Plane**: [`http://localhost:5173`](http://localhost:5173) (or `http://<your-lan-ip>:5173`)
- **Backend API & Git Server**: [`http://localhost:3000`](http://localhost:3000)

---

## 2. Platform Architecture & Core Navigation

GitDrive is structured around 5 core operational domains:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 GITDRIVE CONTROL PLANE                                  │
├───────────────────┬─────────────────────────────────────────────────────────────────────┤
│ 1. Dashboard      │ Real-time metrics, active repository status, recent delivery logs   │
│ 2. Repositories   │ 2-Pane Code Explorer, File Tree, Git Commits, and Working Tree Diff │
│ 3. Workflow Studio│ AST Manifest Detection, Interactive DAG Graph, Stage Parameter Editor│
│ 4. GitActions Runs│ 8-Stage Delivery Loop, Live SSE Terminal Log Stream, Provenance SHA │
│ 5. LAN App Store  │ Filterable Package Catalog, 1-Click Binary Installation, Checksums  │
└───────────────────┴─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Step-by-Step Workflow Guide

### Step 1: Browse & Manage Git Repositories
1. Click **Hosted Repositories** on the left navigation sidebar.
2. Select any repository from the dropdown (`pos-terminal`, `inventory-service`, `lan-gateway`).
3. Use the 3 tabs in the header:
   - **Code & Files**: Browse the directory tree on the left. Click any file (e.g., `README.md`, `package.json`, `src/index.ts`) to open the full-height code viewer with line numbers.
   - **Commits**: View immutable Git commit history with author metadata and SHA hashes.
   - **Working Tree Diff**: Inspect modified lines with colored diff gutters (`+` additions, `-` deletions).
4. Click **Clone URL** to copy the local Git endpoint (`http://gitdrive.local/repos/<repo-id>.git`) to clone from any machine on the LAN.

---

### Step 2: Auto-Discover Toolchains in Workflow Studio
GitDrive automatically parses your repository manifests (`package.json`, `Cargo.toml`, `*.csproj`, `go.mod`, `pyproject.toml`) and infers the optimal build pipeline.

1. Navigate to **Workflow Intelligence** on the sidebar.
2. Select your target repository from the dropdown (e.g., `pos-terminal`).
3. View the **Inferred Toolchain & Target** card:
   - Identifies framework, build tool (`tsc && vite build`), test tool (`vitest`), and package format (`Windows x64 / .exe`).
4. **Interactive 2-Column DAG Studio**:
   - **Left Canvas**: View the sequential 8-stage pipeline (`Checkout` $\rightarrow$ `Setup` $\rightarrow$ `Dependencies` $\rightarrow$ `Build` $\rightarrow$ `Test` $\rightarrow$ `Package` $\rightarrow$ `Release` $\rightarrow$ `Distribute`).
   - Click on any stage card (e.g., Stage 4: `Compile & Bundle`) to highlight it.
   - **Right Inspector Panel**: Customize the execution command directly in the dark monospace textarea (e.g., changing `npm run build` to `npm run build -- --mode production`).
   - View the **Manifest Grounding** citation box explaining why this stage was generated.
5. Click **Save Workflow** to persist changes, or click **Run Pipeline** to trigger execution.

---

### Step 3: Monitor Live Pipeline Execution & SSE Logs
1. When a pipeline is triggered, GitDrive automatically routes to **GitActions Runs**.
2. **STAGES Ribbon**:
   - Monitor real-time status as each stage transitions from `pending` $\rightarrow$ `running` $\rightarrow$ `passed`.
   - Each card displays the stage number (`01`, `02`...), name, and exact duration in seconds.
3. **Professional Dark Terminal Container**:
   - Watch live log output streamed over Server-Sent Events (SSE).
   - Timestamp format: `[HH:MM:SS]` in muted gray.
   - Standard output: Crisp silver text.
   - Executed shell commands: Bold white text.
   - **Filter Output**: Type keywords in the search bar (e.g., `error`, `vite`, `SHA-256`) to filter log lines in real-time.
   - **Auto-scroll**: Toggle auto-scrolling on or off.
   - **Copy Logs**: Click `Copy` to export the full raw log buffer with timestamps.
4. **Cryptographic Build Provenance**:
   - Once the pipeline completes, the **Produced Release Artifacts** box appears below the terminal.
   - Displays the compiled binary name (e.g., `pos-terminal-v2.4.0-win-x64.exe`), size in MB, target platform, and full SHA-256 hash.
   - Click the Copy icon next to the SHA-256 hash to copy it for verification.

---

### Step 4: Deploy & Install Applications from the LAN App Store
1. Click **LAN App Store** on the sidebar.
2. **Filter Ribbon**: Filter available packages by platform (`All Packages`, `Windows (.exe / .msi)`, `Linux (.tar.gz)`, `.NET 8 Daemons`).
3. **Package Distribution Cards**:
   - View version tags (`v2.4.0`), target platform pills, file sizes, and cryptographic SHA-256 checksums.
4. **1-Click Installation**:
   - Click **1-Click Install** on any package card.
   - GitDrive fetches the verified binary from `/api/catalog/:id/download`, registers the download on the local node, and increments the download counter.
   - The binary is ready for immediate execution in local environments.

---

## 4. REST API Reference

GitDrive exposes a comprehensive REST API for integration with local CI tools and scripts:

### Repositories API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/repos` | List all hosted Git repositories |
| `GET` | `/api/repos/:id` | Get repository metadata |
| `GET` | `/api/repos/:id/tree` | Get repository directory file tree |
| `GET` | `/api/repos/:id/blob?path=<path>` | Get raw file content and line metadata |
| `GET` | `/api/repos/:id/commits` | Get repository commit history |
| `GET` | `/api/repos/:id/diff` | Get working tree uncommitted changes |

### Workflow & AST API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/repos/:id/analyze` | Run AST analysis on repository manifests |
| `POST` | `/api/repos/:id/workflows/generate` | Generate executable DAG workflow definition |
| `GET` | `/api/workflows/:id` | Get saved workflow definition |
| `POST` | `/api/workflows` | Save/update custom workflow parameters |

### Runner & Pipeline API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/runs` | List all pipeline execution runs |
| `GET` | `/api/runs/:id` | Get status and stage breakdown for a run |
| `POST` | `/api/runs` | Trigger a new pipeline execution run |
| `GET` | `/api/runs/:id/logs/stream` | Server-Sent Events (SSE) live log stream |

### Releases & Catalog API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/releases` | List all release records |
| `GET` | `/api/catalog` | Get latest releases for LAN App Store |
| `POST` | `/api/catalog/:id/download` | Download binary and increment counter |

---

## 5. Security & Air-Gap Compliance

1. **Zero Public Egress**: GitDrive operates entirely within private LAN subnets with no external outbound telemetry or third-party tracking.
2. **Automated Secret Masking**: Credentials matching configured patterns (e.g., `SECRET_TOKEN_*`, `LAN_ACCESS_KEY_*`) are automatically masked (`***[MASKED_SECRET]***`) before emission to logs or SSE streams.
3. **Immutable Provenance**: Every generated release artifact is cryptographically hashed with SHA-256 immediately upon compilation, preventing tampering or unauthorized binary modification.
4. **Theme Standards**: Adheres to the **Strict Monochrome Black & White Standard** (`Monochrome Black and White UI Standard.md`) and **Clean Industrial Design** with high contrast and zero visual clutter.

---

## 6. Troubleshooting & Diagnostics

- **Port Conflict (3000 or 5173 in use)**:
  Set environment variables: `PORT=3001 npm run dev`
- **Re-scanning Manifests**:
  In **Workflow Intelligence**, click **Scan Repository** to re-evaluate the codebase if you added new dependencies or manifest files.
- **Viewing Log Files**:
  Server execution logs and changelogs are stored in `.agent-history/` and `data/artifacts/`.
