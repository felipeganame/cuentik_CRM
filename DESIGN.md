# Design

<!-- impeccable:design-schema 1 -->

## Scope

This file records the **landing page** (`app/page.tsx`, `app/landing.module.css`), a Persuade surface with its own committed visual world. It does not describe the in-app dashboard (`app/(app)/*`, `app/superadmin/*`), which stays on its existing utilitarian inline-style system (light neutral ground, oklch blue accent oklch(55% 0.16 250), Source Sans 3) — that system is unchanged and still authoritative for Operate surfaces.

## World

Argentine escribanía / libro de registro (notarial ledger). Every alquiler is a folio; every payment status is an ink stamp. Built as the assigned direction from a 7-candidate grounded list scoped to the audience's real world (Córdoba real estate), seed key `d41b6298`, candidate 6 of 7.

Deliberately avoids the cream-paper + serif + terracotta AI-cliché rendition of this world: the ground is a saturated dark ledger-green (leather/cloth-bound register), not neutral cream; accents are brass/gold (foil, hardware), not terracotta; "paper" appears only as a foreground material (the folio card, the pricing card) sitting on the dark ground, never as the page's own background.

## Tokens (`app/landing.module.css`, scoped under `.page`)

| Token | Value | Use |
|---|---|---|
| `--ledger` | `oklch(24% 0.045 155)` | Primary ground |
| `--ledger-deep` | `oklch(17% 0.04 155)` | Alternate section ground, folio-card text color |
| `--ledger-line` | `oklch(34% 0.045 155)` | Hairlines, borders, grid gaps |
| `--brass` | `oklch(76% 0.11 85)` | Primary CTA, accent borders |
| `--brass-bright` | `oklch(82% 0.12 88)` | Hover state, emphasis text, folio marks |
| `--paper` | `oklch(93% 0.02 85)` | Foreground card material (folio, pricing) |
| `--ink` | `oklch(28% 0.07 260)` | Confirmed/positive stamp ink (blue-black) |
| `--ink-red` | `oklch(48% 0.17 25)` | Overdue stamp ink only — never decorative |
| `--cream-text` | `oklch(90% 0.015 95)` | Body text on dark ground |
| `--muted-text` | `oklch(68% 0.025 150)` | Secondary text on dark ground |

Amber `oklch(55% 0.14 70)` is used inline once, for the "Pendiente" stamp (between ink and ink-red on the trust spectrum) — not tokenized since it only appears in that one demonstration.

## Typography

- **Display** (`.display`): Vollkorn, serif — old-book/ledger character. Chosen deliberately over Fraunces/Playfair (both flagged as AI-landing-page tells) after the design hook caught the first pass.
- **Labels/data** (`.mono`): IBM Plex Mono — folio numbers, nav-adjacent labels, stamp badges. Diegetic to the registry-document world (typewritten ledger entries), not a generic "technical" costume.
- **Body**: Source Sans 3 — shared with the in-app dashboard for brand continuity across the two surfaces.

## Components

- **Folio card** (`.folioCard` + `.folioLine`/`.folioNum`): paper-colored card, slight rotation, dashed rules between fields, an ink stamp (`.stamp`) pinned to the bottom-right corner that animates down once on load (`stampDown` keyframe, disabled under `prefers-reduced-motion`). This is the page's signature motif — reused in the hero and the features section's "stamp showcase."
- **Stamp badge** (`.stampBadge`): bordered mono label in the status ink color (ink / amber / ink-red for Al día / Pendiente / En mora). Mirrors the dashboard's actual `estadoPagoLabel` states, so the metaphor tracks the real product.
- **Ledger list** (`.ledgerList` + `.ledgerItem`): a `§` mark instead of an icon, ruled dividers instead of card borders. Deliberately paired asymmetrically against the stamp showcase rather than repeated as a uniform icon-card grid.
- **Folio grid** ("Cómo funciona"): four ledger-style panels numbered as folios (diegetic registry numbering, not a generic 01/02/03 device) on a hairline grid.
- **Buttons**: `.btnPrimary` (solid brass, dark text, lifts on hover) and `.btnGhost` (outlined, brass border on hover). No rounded-pill shapes — 3px radius throughout, consistent with the ledger world's stamped/printed materials rather than soft SaaS chrome.

## Motion

One authored moment: the stamp impresses onto the hero folio card ~0.7s after load, scaling down with a slight overshoot (`cubic-bezier(0.2, 0.8, 0.3, 1.1)`). Everything else is conventional hover/transition feedback (transform + shadow + color), not scattered entrance animation.

## Voice

Direct, specific, no generic SaaS language ("streamline your workflow"). Names the real product surface (ICL/IPC indexation, agua/luz/gas/municipalidad/rentas/expensas, WhatsApp contact) rather than abstracting it. Pricing is stated as one plain number with no tiers, since the product has exactly one plan.

## Known gaps / next work

- Mobile-viewport screenshots were not captured for this build (browser-automation tooling was unreliable in this session); responsive rules (900px/720px/640px breakpoints) are authored and build-clean but not visually re-verified on a real narrow viewport.
- The primary CTA ("Empezar gratis") currently links to WhatsApp, not a self-serve `/registro` flow — that flow doesn't exist yet. Rewire once it ships.
- No customer testimonials, logos, or case studies exist yet and none were fabricated — the page relies on mechanism demonstration instead of social proof by design, not by omission.
