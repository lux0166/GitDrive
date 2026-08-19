# 07 — Git Repository & Collaboration

## 1. Role

Git hosting là foundational capability, không phải primary differentiation.

## 2. Repository capabilities

MVP:
- create/import/delete/archive;
- private/local visibility;
- clone/fetch/push;
- branch/tag;
- commit history;
- tree/file view;
- diff.

Extended:
- pull request;
- comments;
- approvals;
- branch protections;
- release notes;
- webhooks/internal events.

## 3. Storage

Git repository objects SHOULD be stored in filesystem-backed repositories or another Git-compatible storage model. Relational DB stores metadata, not Git object contents by default.

## 4. Collaboration model

Recommended hierarchy:

```
Instance
  └── Organization
        └── Project/Repository
              ├── Members
              ├── Branch rules
              ├── Workflows
              ├── Secrets
              └── Releases
```

Single-user deployments can omit Organization UX without changing the underlying model.

## 5. Repository events

Internal event bus SHOULD produce events for:
- push;
- pull request opened/updated/merged;
- tag;
- release;
- workflow changed;
- runner status changed.

These events drive automation rather than direct coupling between UI and runner.
