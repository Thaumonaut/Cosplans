# /cv.feature FEAT-###

Purpose
- Plan or revise one feature in a way that includes both “what” and “how”, plus acceptance criteria.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Inputs to consult
- `.cv/spec.md`
- `.cv/contracts/*`
- `.cv/components/registry.md`
- `.cv/variables/*`
- `.cv/ledger/decisions.md`

Behavior
- Confirm the feature goal in plain language.
- Reuse-first: call out existing components/patterns/tokens that fit.
- Produce or update a feature block with:
  - Goal, user story, non-goals
  - Acceptance criteria (testable)
  - Design & UX notes (reference /cv.design if needed)
  - Edge cases
  - Verification outline

End
- Ask one approval question: “Want me to write this into the spec now?”
- Include “My vote:” + why.

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


