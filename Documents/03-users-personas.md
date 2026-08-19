# 03 — Users, Personas & Stakeholders

## 1. Primary personas

### Persona A — Software Developer

**Mục tiêu:** viết code và ship nhanh.

**Pain points:**
- không muốn dành thời gian viết CI YAML cho project nhỏ;
- không muốn tự quản lý artifact/release file;
- cần build trên OS/hardware đặc thù;
- muốn biết build thất bại vì đâu.

**Desired experience:**
```
Push → GitDrive understands project → workflow ready → build → release
```

### Persona B — Tech Lead / Maintainer

**Mục tiêu:** chuẩn hóa build/release nhưng vẫn cho developer flexibility.

**Pain points:**
- pipeline copy-paste giữa repository;
- drift giữa các workflow;
- khó enforce team conventions;
- cần review thay đổi workflow.

### Persona C — DevOps / Platform Administrator

**Mục tiêu:** cung cấp runner/build infrastructure nội bộ an toàn và ổn định.

**Pain points:**
- runner configuration;
- resource scheduling;
- network isolation;
- secrets;
- artifact retention;
- disk growth.

### Persona D — IT / Internal Software Distributor

**Mục tiêu:** đưa bản phần mềm mới tới nhiều máy trong LAN.

**Pain points:**
- gửi file thủ công;
- không biết máy nào đang chạy version nào;
- update không đồng nhất;
- rollback khó.

### Persona E — End User

**Mục tiêu:** sử dụng app, không quan tâm Git/CI.

**Desired experience:**
```
New version available → Verify → Update
```

## 2. Secondary stakeholders

- Security / compliance
- System administrators
- Lab managers
- University instructors
- Build-machine owners
- Project auditors

## 3. Jobs-to-be-done

### Developer JTBD
“Khi tôi push project mới, tôi muốn hệ thống tự hiểu cách build/test cơ bản để tôi không phải học một CI DSL chỉ để ship app.”

### Platform JTBD
“Khi team có nhiều repository, tôi muốn workflow generation có convention chung nhưng vẫn có override rõ ràng.”

### Admin JTBD
“Khi tôi đặt GitDrive trong LAN, tôi muốn kiểm soát egress, runner và storage mà không cần cloud control plane.”

### End-user JTBD
“Khi có version mới, tôi muốn cập nhật app từ mạng nội bộ bằng một thao tác.”
