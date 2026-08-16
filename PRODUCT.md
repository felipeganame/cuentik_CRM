# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: property managers at small-to-mid real estate agencies (inmobiliarias) in Córdoba, Argentina, who administer rental contracts (alquileres) day to day — tracking locador/locatario/garante contact info, monthly rent payment status, utility services (agua, luz, gas, municipalidad, rentas, expensas), contract PDFs and property photos, and lease renewal/expiration dates.

Secondary: Cuentik CRM's own team (superadmin role), who manage agency accounts — create/suspend agencies, set plan limits, track billing, configure pricing.

## Product Purpose

Replaces spreadsheets and manual bookkeeping for rental-contract management. Success for an agency is being able to see at a glance who's paid, who's overdue, which utility services are unpaid, and which contracts are expiring soon, without maintaining that by hand.

## Positioning

Purpose-built for the Argentine rental market rather than a generic property-management tool: ARS amounts, WhatsApp-based contact with locador/locatario, index-based rent adjustment tracking (ICL/IPC, common in Argentine leases), Córdoba-first go-to-market.

## Operating Context

Agencies self-register and land directly in the product with one free alquiler to try. Adding a 2nd alquiler crosses into the paid tier ($1000 ARS/month per active alquiler); there's no live payment gateway yet, so this is a UI notice + payment-method-preference capture, not an automated charge — Cuentik CRM's team bills and marks payment manually via the superadmin panel for now.

Cuentik CRM's own team operates a separate superadmin panel: agency list with usage/billing metrics, suspend/activate, global pricing control, password resets, and MFA-protected superadmin login.

## Capabilities and Constraints

- Multi-tenant CRM: alquiler creation wizard (property, parties, payment terms, services, confirm), dashboard with search/filters, per-alquiler detail (summary/services/payments/photos), agency profile with logo upload.
- Self-serve registration is new as of this work — previously all agency accounts were created manually by superadmin only.
- No real payment gateway integrated (open/undecided: which processor, if/when to automate). Mercado Pago is the natural fit for Argentina if/when this happens, but that's explicitly future work.
- Billing is per-active-alquiler, first one free, superadmin-configurable global rate (currently $1000 ARS).

## Brand Commitments

Name: Cuentik CRM. Existing in-app visual language: blue accent (oklch(55% 0.16 250)), Source Sans 3, clean minimal SaaS interior. The landing page is a new, more expressive surface (Persuade mode) and is not required to inherit the dashboard's utilitarian interior styling wholesale — brand continuity (name, accent color family, tone) matters more than reusing dashboard component styles verbatim.

## Evidence on Hand

No existing landing page (root `/` currently redirects straight to `/login`). No testimonials, case studies, or press exist yet — do not fabricate them. `mockup/` folder holds the original design reference for the in-app product UI, not the landing page.

## Product Principles

- Built for one country's rental-law and payment norms, not generic property management — the copy and specifics should say so.
- Superadmin controls billing and account state manually today; the product should read as "real business, human-run," not as a fully automated black box, since it isn't yet.
- The trial is genuinely free (1 alquiler, no card required upfront) — the landing page and register flow should say that plainly rather than hiding it behind vague "get started" language.
- Córdoba-first framing, with room to grow to the rest of Argentina.
