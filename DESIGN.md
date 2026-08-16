# Design

<!-- impeccable:design-schema 1 -->

## Scope

This file records the **marketing site** (`app/(marketing)/*`: `/`, `/como-funciona`, `/precios`, `/nosotros`, `/contacto`, sharing `marketing.module.css` and a common header/footer layout), a Persuade surface with its own committed visual world. It does not describe the in-app dashboard (`app/(app)/*`, `app/superadmin/*`), which stays on its existing utilitarian inline-style system (light neutral ground, oklch blue accent oklch(55% 0.16 250), Source Sans 3) — that system is unchanged and still authoritative for Operate surfaces.

## World

Argentine escribanía / libro de registro (notarial ledger), on **light paper** rather than a dark leather-bound cover. Every alquiler is a folio; every payment status is an ink stamp. Originally built dark (deep ledger-green, then navy) as the assigned direction from a 7-candidate grounded list (seed key `d41b6298`, candidate 6 of 7); revised twice on direct user feedback:

1. Green → navy: green+brass read as unusual/niche rather than trustworthy for this category.
2. Navy → light warm cream: dark, saturated palettes read as expensive/premium, which fights the product's actual pitch (affordable, first alquiler free, $1.000/mes after). The brief now explicitly wants light, friendly, "accessible" — which, as a bonus, is also the *more* natural rendition of a paper ledger than the inverted dark-mode version was.

## Tokens (`app/(marketing)/marketing.module.css`, scoped under `.page`)

| Token | Value | Use |
|---|---|---|
| `--bg` | `oklch(97% 0.014 80)` | Page ground — warm cream, not neutral gray |
| `--bg-deep` | `oklch(94% 0.018 78)` | Alternate section ground |
| `--line` | `oklch(88% 0.014 75)` | Hairlines, card borders, grid gaps |
| `--card` | `oklch(99.5% 0.004 90)` | White card surface (folio, pricing, app-mock) — sits just above `--bg` |
| `--ink-text` | `oklch(26% 0.025 255)` | Primary text — dark navy-charcoal, not black, for warmth+trust |
| `--muted-text` | `oklch(50% 0.02 255)` | Secondary text |
| `--accent` | `oklch(64% 0.16 40)` | Primary CTA, warm terracotta/coral — replaces the earlier brass/gold, deliberately not a "premium" color |
| `--accent-bright` | `oklch(70% 0.17 42)` | Hover state |
| `--accent-deep` | `oklch(48% 0.14 36)` | Accent text on light ground (needs more contrast than the button-fill shade) |
| `--ink` | `oklch(32% 0.09 260)` | Confirmed/positive stamp ink (blue-black) — unchanged across all three palette passes |
| `--ink-red` | `oklch(50% 0.18 25)` | Overdue stamp ink only — never decorative |

Amber `oklch(55% 0.14 70)` is used inline once, for the "Pendiente" stamp — not tokenized since it only appears in that one demonstration.

## Typography

- **Display** (`.display`): Vollkorn, serif — old-book/ledger character. Chosen deliberately over Fraunces/Playfair (both flagged as AI-landing-page tells) after the design hook caught the first pass.
- **Labels/data** (`.mono`): IBM Plex Mono — folio numbers, nav-adjacent labels, stamp badges. Diegetic to the registry-document world (typewritten ledger entries), not a generic "technical" costume.
- **Body**: Source Sans 3 — shared with the in-app dashboard for brand continuity across the two surfaces.

## Components

- **Folio card** (`.folioCard` + `.folioLine`/`.folioNum`): white card on the cream page, subtle border + soft shadow for lift, slight rotation, dashed rules between fields, an ink stamp (`.stamp`) pinned to the bottom-right corner that animates down once on load. Signature motif, reused in the hero, the features section's "stamp showcase," and the `/como-funciona` app-mock.
- **App-mock scroller** (`/como-funciona`, `mechanism-scroller.tsx`): a sticky white panel that swaps its content (property fields → payment terms → payment-status stamps → pending alerts) via `IntersectionObserver` as the visitor scrolls past each of the four numbered steps — a stylized "watch someone use the app" demonstration in the ledger's own grammar, not a screen recording or a literal dashboard screenshot.
- **Stamp badge** (`.stampBadge`): bordered mono label in the status ink color (ink / amber / ink-red for Al día / Pendiente / En mora). Mirrors the dashboard's actual `estadoPagoLabel` states.
- **Ledger list** (`.ledgerList` + `.ledgerItem`): a `§` mark instead of an icon, ruled dividers instead of card borders. Paired asymmetrically against the stamp showcase rather than repeated as a uniform icon-card grid.
- **Roadmap card** (`.roadmapCard`, `.providerBadge`): dashed-border card tagged "Próximamente," used for the utility-provider integrations (Aguas Cordobesas, EPEC, ECOGAS, Cooperativa de Luz y Agua de Villa Allende) and the future per-agency subdomain website — both real, both explicitly future, neither claimed as live.
- **Buttons**: `.btnPrimary` (solid terracotta fill, white text, lifts on hover) and `.btnGhost` (outlined, terracotta border on hover). 8px radius (up from the original ledger world's 3–4px) — friendlier, less severe, matches the "accessible" brief.

## Motion

One authored moment per surface: the stamp impresses onto the hero folio card ~0.7s after load; on `/como-funciona`, the app-mock's fields stagger in as each step becomes active. Everything else is conventional hover/transition feedback, not scattered entrance animation.

## Voice

Direct, specific, no generic SaaS language ("streamline your workflow"). Names the real product surface (ICL/IPC indexation, agua/luz/gas/municipalidad/rentas/expensas, WhatsApp contact) rather than abstracting it. Pricing is stated as one plain number with no tiers, explicitly scoped as "today's price for today's module" since more modules (and their own pricing) are coming.

## Known gaps / next work

- Mobile-viewport screenshots were not captured across any of the three palette passes (browser-automation tooling was unreliable in this session); responsive rules are authored and build-clean but not visually re-verified on a real narrow viewport.
- No customer testimonials, logos, or case studies exist yet and none were fabricated — the page relies on mechanism demonstration instead of social proof by design, not by omission.
