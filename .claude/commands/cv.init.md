# /cv.init

Purpose
- Bootstrap the `.cv/` workspace so planning and implementation can be recovered deterministically.

Behavior
1) Check whether `.cv/` exists (or ask the user if you can’t read files).
2) Offer two paths:
   - Create fresh `.cv/` skeleton (recommended for new projects)
   - Adopt existing repo (create minimal missing artifacts without overwriting)
3) Propose FILE blocks to create:
   - `.cv/status.json`
   - `.cv/spec.md`
   - `.cv/tasks.md`
   - `.cv/ledger/decisions.md`
   - `.cv/contracts/` (at least: product, architecture, design, security)
   - `.cv/components/registry.md`
   - `.cv/variables/tokens.md` and `.cv/variables/naming.md`

Default skeleton content should be minimal and editable.
- Do not fill in project-specific decisions without asking.
- Record initialization in decisions ledger.

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


