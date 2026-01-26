# /cv.design

Purpose
- Design-focused planning session to produce mockups/flows/states aligned with contracts and reuse discipline.

Rehydration rule
- If you can’t see `.cv/` files, ask the user to paste the relevant ones (status.json, spec.md section, tasks.md).
- Do not ask questions the artifacts already answer. Summarize what you learned from the pasted artifacts.


Inputs to consult
- `.cv/contracts/design.contract.md`
- `.cv/components/registry.md`
- `.cv/variables/*`
- feature spec (if relevant)

Artifacts to write (recommended)
- `.cv/design/brief.md`
- `.cv/design/flows.md`
- `.cv/design/wireframes/<scope>.md`

Behavior
- Start with: what screen/flow, and what “good” feels like.
- Reuse-first: identify existing components/patterns before proposing new ones.
- Produce text wireframes: layout, states, interactions, edge cases.
- Ask one decision question with options + “My vote:”.
- If approved, propose FILE blocks and link them from the feature spec.

When you need to write/update artifacts, output FILE blocks only. Example:

FILE: .cv/spec.md
ACTION: update
CONTENT:
<full updated content or a clearly delimited patch section>

If you need the user to apply changes manually, keep the blocks copy-pasteable.


