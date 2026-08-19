# 01 — Product Vision

## 1. Product definition

GitDrive là nền tảng **local-first software development and delivery**. Hệ thống cung cấp một trải nghiệm phát triển kiểu GitHub trong phạm vi một máy hoặc private LAN: Git repository, code browsing, issues, pull requests, code review, permissions và các năng lực collaboration cốt lõi là nền tảng bắt buộc.

GitDrive không đặt mục tiêu sao chép toàn bộ GitHub hoặc cạnh tranh về Internet-scale ecosystem. Điểm khác biệt nằm ở lớp phía trên Git collaboration: **repository understanding → automatic workflow generation → local/LAN execution → build → release → application distribution**.

### Core promise

> **GitDrive cung cấp trải nghiệm Git-based collaboration quen thuộc trong private infrastructure, đồng thời tự hiểu repository để tạo workflow phù hợp và đưa source code tới application có thể cài đặt/phân phối trong LAN với tối thiểu cấu hình thủ công.**

## 2. Vision statement

“Biến private infrastructure thành một software development and delivery factory: developer cộng tác trên source code bằng các năng lực GitHub-like cần thiết, trong khi GitDrive tự suy luận workflow, thực thi build/test/package bằng tài nguyên local/LAN và đưa application tới người dùng nội bộ.”

## 3. Product layers

### Layer 1 — GitHub-like development foundation

Đây là **table-stakes capability**, không phải USP:

- Git repository hosting
- clone/fetch/pull/push
- branches, tags và commit history
- file browsing và diff
- issues
- pull requests
- review/comments/approvals
- merge
- users, teams, roles và repository permissions
- authentication và audit cơ bản

GitDrive phải đủ năng lực để một team software bình thường có thể thực hiện development workflow mà không cần chuyển repository sang một nền tảng Git khác chỉ vì thiếu collaboration primitives.

### Layer 2 — Workflow Intelligence

Đây là lớp khác biệt chính:

- repository/project inspection
- project family và build-system detection
- test/package/target inference
- automatic workflow generation
- generated workflow explainability
- workflow validation
- workflow override
- workflow adaptation khi repository thay đổi

### Layer 3 — Local Software Delivery

Đây là lớp biến GitDrive từ Git hosting thành delivery platform:

- CI/CD orchestration
- local/LAN runner scheduling
- build/test/package
- artifact management
- versioned releases
- signing integration
- LAN application distribution
- optional update agent
- private/offline delivery controls

## 4. Product principles

### Local-first
Internet là optional integration, không phải dependency mặc định.

### Git collaboration is foundational
GitDrive không được hy sinh các developer workflows phổ biến chỉ để tập trung vào automation. Core collaboration phải đủ hữu dụng trước khi các lớp delivery phát huy giá trị.

### Automation before configuration
Ưu tiên detect → recommend → generate → validate thay vì bắt người dùng thiết kế CI/CD từ đầu.

### Transparent automation
Workflow tự động phải giải thích được evidence, assumptions và lý do của từng generated step. Advanced users có thể inspect và override.

### Ship-oriented
CI/CD không kết thúc ở “build passed”. Mục tiêu cuối là tested artifact, release và nếu được cấu hình thì distribution/update.

### User-owned data
Repository, workflow metadata, logs, artifacts, releases và package data mặc định nằm trong hạ tầng do operator kiểm soát.

### Secure by default
Runner và pipeline được coi là execution boundary. Arbitrary build commands không được mặc định chạy trực tiếp trên control-plane host.

## 5. Product outcomes

1. Một team có thể chuyển từ Git-based development sang GitDrive mà không mất các collaboration primitives cốt lõi.
2. Giảm thời gian cấu hình CI/CD ban đầu thông qua repository understanding và workflow generation.
3. Giảm số thao tác thủ công từ commit/merge tới release.
4. Giảm phụ thuộc Internet/cloud trong private development environments.
5. Tận dụng build resources trong LAN như một private build fleet.
6. Rút ngắn đường đi từ source code tới application có thể cài đặt và phân phối.

## 6. Non-goals

- Không cạnh tranh với GitHub về public social network, global ecosystem hoặc marketplace quy mô Internet.
- Không cố tái tạo mọi chức năng ngách của GitHub/GitLab trong MVP.
- Không coi AI là điều kiện bắt buộc để workflow generation hoạt động.
- Không yêu cầu public cloud để development/CI/CD core chạy.
