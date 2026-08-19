# 18 — Glossary

**GitDrive** — Product name for the local-first software delivery platform.

**Local-first** — Thiết kế ưu tiên chạy và lưu dữ liệu trong máy/local infrastructure; external services là optional.

**Private LAN** — Mạng nội bộ do tổ chức/người dùng kiểm soát.

**Workflow** — Chuỗi các bước automation được thực thi theo trigger và dependency.

**Workflow Generator** — Thành phần suy luận và tạo workflow từ repository evidence + user intent + policy.

**Workflow IR** — Intermediate representation của workflow, tách semantic model khỏi YAML/UI.

**GitActions** — Tên subsystem CI/CD của GitDrive.

**Runner** — Máy thực thi job.

**Runner capability** — Các thuộc tính như OS, architecture, toolchain và labels dùng để scheduler matching.

**Artifact** — Output không nhất thiết là release, ví dụ binary/test report/package.

**Release** — Phiên bản phần mềm được xác định danh tính, nguồn commit và artifact cụ thể.

**Application** — Sản phẩm phần mềm được end user cài/sử dụng; có thể liên kết với một hoặc nhiều repository.

**Distribution** — Quá trình đưa release tới người dùng hoặc môi trường chạy.

**Build cache** — Dữ liệu giúp tránh lặp lại computation trong build.

**Dependency mirror** — Nguồn package nội bộ/cached dùng để giảm external dependency.

**Air-gapped** — Môi trường không có kết nối Internet/external network theo policy.

**Egress** — Network traffic đi ra khỏi security boundary.

**Golden path** — Quy trình chuẩn được tối ưu và test end-to-end cho nhóm project mục tiêu.

**TTUR** — Time-to-Usable-Release, thời gian từ source state tới release sẵn sàng cho người dùng.
