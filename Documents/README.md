# GitDrive — Business Analysis Document Set

## 1. Mục đích

Bộ tài liệu này mô tả GitDrive dưới góc nhìn Business Analysis / Product Requirements, không phải thiết kế code chi tiết. Mục tiêu là biến ý tưởng ban đầu thành một product thesis có thể dùng làm nền cho architecture, UX, API, database và implementation.

## 2. Product thesis

> **GitDrive là một local-first software delivery platform cho máy cá nhân và private LAN, tối ưu quá trình từ source code → workflow → build → test → package → release → phân phối ứng dụng nội bộ với mức cấu hình CI/CD thủ công tối thiểu.**

GitDrive không được định vị là một bản sao GitHub/GitLab self-hosted. Git hosting chỉ là nền tảng; giá trị cốt lõi nằm ở **automatic workflow generation + local/LAN build & delivery**.

## 3. Tài liệu

| File | Nội dung |
|---|---|
| 01-product-vision.md | Vision, problem, product principles |
| 02-business-analysis.md | Problem space, value proposition, business rationale |
| 03-users-personas.md | Personas, stakeholders, jobs-to-be-done |
| 04-product-scope.md | Scope, boundaries, MVP / non-MVP |
| 05-functional-requirements.md | Functional requirements tổng thể |
| 06-workflow-intelligence.md | Core differentiator: tự động xây dựng workflow |
| 07-git-repository.md | Git hosting và collaboration |
| 08-git-actions-cicd.md | CI/CD execution model |
| 09-build-release-distribution.md | Build, artifact, release và LAN app distribution |
| 10-local-lan-security.md | Local-first, network isolation, secrets, runner security |
| 11-system-architecture.md | Logical architecture |
| 12-non-functional-requirements.md | NFR và acceptance targets |
| 13-use-cases.md | Use cases / scenarios |
| 14-competitive-positioning.md | Competitive analysis và differentiation |
| 15-metrics-kpis.md | Metrics, KPI, benchmark strategy |
| 16-roadmap.md | Product roadmap |
| 17-risks-open-questions.md | Risks, assumptions, unresolved decisions |
| 18-glossary.md | Thuật ngữ |

## 4. Nguyên tắc đọc tài liệu

- Không xem feature list là product differentiation.
- Không claim đối thủ “không có CI/CD”, vì nhiều nền tảng đã có Actions/runners/artifacts/packages.
- Differentiation của GitDrive nằm ở **workflow orchestration cho local software delivery** và **giảm configuration time**.
- Mọi cam kết về “không đưa dữ liệu lên Internet” phải được thể hiện bằng architecture, network policy và telemetry policy, không chỉ bằng marketing copy.

## 5. Trạng thái

Đây là baseline BA v0.1. Các mục đánh dấu `TBD` cần được xác nhận trong product discovery và technical spike trước khi freeze architecture.
