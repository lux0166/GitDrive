# 02 — Business Analysis

## 1. Problem statement

Trong nhiều team nhỏ, lab, homelab và môi trường doanh nghiệp nội bộ, việc lưu Git không phải là điểm khó nhất. Vấn đề nằm ở khoảng cách giữa:

```
source code
→ CI configuration
→ runner setup
→ dependency/build environment
→ artifact
→ release
→ deployment/distribution
→ user update
```

Người dùng có thể phải hiểu Git, YAML, runner labels, artifact configuration, signing, packaging và deployment trước khi một project “ship” được.

## 2. Business problem GitDrive chọn giải quyết

**Configuration friction** và **delivery friction** trong private/local software environments.

GitDrive không cố chứng minh rằng local CI nhanh hơn mọi cloud CI. Thay vào đó, sản phẩm tối ưu: 
- setup time;
- repeated build time qua cache/mirror;
- number of manual steps;
- time from repository detection to runnable pipeline;
- time from successful build to internal availability.

## 3. Value proposition

### Cho developer
“Không cần là CI/CD expert mới có thể ship project.”

### Cho team lead / DevOps
“Chuẩn hóa đường đi từ repository đến release mà vẫn giữ runner/build resources trong hạ tầng nội bộ.”

### Cho IT administrator
“Private development infrastructure có policy rõ ràng, predictable và có thể vận hành offline/LAN.”

### Cho end user nội bộ
“Nhận application version mới từ một nguồn nội bộ thay vì nhận file thủ công qua chat/email/shared folder.”

## 4. Value chain

```
Repository
   ↓
Project Understanding
   ↓
Workflow Generation
   ↓
Build/Test
   ↓
Packaging
   ↓
Release
   ↓
LAN Distribution
   ↓
Update
```

## 5. Why local matters

Local/LAN mang lại các thuộc tính product đáng kể:
- source và artifact có thể ở trong private infrastructure;
- build resources có thể là máy vật lý sẵn có;
- có thể chạy trong môi trường Internet hạn chế;
- application delivery trong LAN không cần external CDN;
- có thể tận dụng cache/package mirror nội bộ;
- có thể kiểm soát network egress.

## 6. Business assumptions

- Một số tổ chức có software nội bộ cần build/distribute thường xuyên.
- Những tổ chức này coi setup/maintenance complexity là một chi phí thực tế.
- Local-first delivery có giá trị khi source, build và application đều nằm trong cùng security boundary.
- Một sản phẩm mới chỉ có khả năng thắng nếu configuration effort thấp hơn hoặc delivery loop tốt hơn, không chỉ vì “self-hosted”.

## 7. Success hypothesis

> Nếu GitDrive có thể giảm đáng kể thời gian từ “repository mới” đến “workflow chạy được”, đồng thời giảm số thao tác thủ công từ “build passed” đến “application available in LAN”, thì nó có một product wedge rõ ràng hơn một Git hosting server thông thường.
