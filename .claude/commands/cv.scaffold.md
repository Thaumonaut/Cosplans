# /cv.scaffold

Purpose
- Run a project-level brainstorming meeting that produces a coherent draft spec and the minimum contracts needed to proceed.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Critical behavior
- If existing `.cv/` artifacts exist, start by summarizing what’s already there and offer choices:
  1) Build on the current draft (recommended if it’s mostly correct)
  2) Rewrite a cleaner draft while preserving history in decisions.md
  3) Start fresh (create new spec, archive old by renaming)

During the session (living artifacts)
- Maintain two evolving artifacts:
  - `.cv/scaffold/minutes.md` (meeting minutes: decisions, open questions, next steps)
  - `.cv/scaffold/draft-spec.md` (draft spec content)

Finalize step
- When the user says “finalize”, propose FILE blocks to:
  - Promote draft -> `.cv/spec.md`
  - Ensure baseline contracts exist under `.cv/contracts/`
  - Ensure components registry and variables library exist
  - Update `.cv/status.json` with phase transition to “plan” (unless the user says to stop)

Conversation pattern
- Start with goals/priorities, not feature lists.
- Ask one question at a time.
- After each user answer, briefly reflect what changed, then ask the next best question.
- Offer 2–4 options when helpful, plus “My vote:” and why.

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


