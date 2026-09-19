# Nestora

> Find your space. Find your people. Live smarter.

Nestora is a student-focused PropTech platform for discovering and managing short-term housing. It connects tenants, property owners, and roommates through trusted listings, practical living-cost comparisons, payments, maintenance coordination, and a documented move-in/move-out process.

This document is the implementation specification for extending the existing Nestora frontend. Preserve the current design system and navigation wherever possible. Every feature below must be genuinely connected to the backend; do not ship static or misleading controls except where a feature is explicitly presented as a demo.

## Platform requirements

- **Frontend:** retain the existing Nestora UI and add the described flows responsively.
- **Backend:** Supabase Auth, PostgreSQL, Storage, Realtime, Row Level Security (RLS), and Edge Functions.
- **Authentication:** UI → Supabase Auth → profile record → role-specific authenticated application.
- **Storage:** use private buckets and signed URLs for identity, utility, proof-vault, ticket, and contract files.
- **Operational features:** external services (Stripe, mapping/geocoding, WhatsApp/Twilio, OCR) must be called through secure server-side/Edge Function integrations. Never expose service secrets in the browser.

## Permanent tenant/owner role selection

Role is selected **before** an account is created and remains fixed after registration. There must be no Tenant ↔ Owner switcher in Profile or Settings. Only an authorized administrator may change a role.

### Entry flow

```text
Get Started
    ↓
Choose Role
    ↓
Tenant or Owner
    ↓
Sign Up
    ↓
Email Verification
    ↓
Profile Creation
    ↓
Permanent role assignment
    ↓
Role-specific onboarding
    ↓
Dashboard
```

### Role-choice screen

Show this screen immediately after **Get Started**:

**How will you use Nestora?**

| Choice | Description |
| --- | --- |
| 🏠 **I'm a Tenant** | Find housing and roommates; manage rent, maintenance, and move-in/move-out records. |
| 🏢 **I'm a Property Owner** | List properties; manage tenants, rent, maintenance, and property verification. |

The user must select exactly one card before **Continue** is enabled. Persist the selected value through signup and create the profile only after authentication succeeds.

Allowed values are `tenant`, `owner`, and `admin`. The database, not the client, is the authority for role assignment. A database trigger or protected Edge Function should create the profile and write the selected initial role; RLS and server-side validation must prevent users from changing it themselves.

## Authentication

Create Sign In and Sign Up interfaces that match the existing design.

### Sign In

- Heading: **Welcome back 👋**
- Supporting text: “Sign in to continue to your Nestora account.”
- Email and password fields
- Show/hide password control
- Remember-session option
- Forgot-password flow
- **Sign In** action
- Link: “Don't have an account? **Create one**”

### Sign Up

- Heading: **Create your Nestora account**
- Supporting text: “Find your space. Find your people. Live smarter.”
- Full name, email, phone number, password, and confirm-password fields
- The role selected on the preceding screen, shown as read-only context
- Terms of Service and Privacy Policy consent checkbox
- **Create Account** action
- Link: “Already have an account? **Sign In**”

Validate required fields, email format, password strength/minimum secure length, matching passwords, and terms consent in the client. Keep the submission action disabled until the form is valid. Also validate every input server-side. Verify email before activating the user experience, restore authenticated sessions on return, and surface useful errors without revealing sensitive account information. Social login is optional only when it is fully configured.

## Housing discovery and nearest hostels

Provide tenant search for hostels, PGs, apartments, and shared rooms, including a **nearest hostels** experience.

- Let tenants search by campus, locality, address, or current location after consent.
- Geocode listing addresses and store a normalized location plus latitude/longitude; do not expose precise private address data before an appropriate booking/contact stage.
- Sort and filter by distance from campus/current location, rent, availability, property type, furnishing, gender preference, amenities, verification, and rental window.
- Display a map/list result view with distance, estimated commute time, listing verification state, and monthly true cost.
- Support saved searches/favourites and notify users when a matching listing becomes available.
- Owner listing forms must collect a valid address, map location, nearby campus/landmarks, rent, deposit, availability, rental duration, amenities, photos, and house rules.

## Two- to four-month rental window

Support short stays as a first-class inventory option rather than assuming annual leases.

- Allow owners to specify minimum and maximum tenancy duration, including 2–4 month availability.
- Let tenants filter explicitly for **2 months**, **3 months**, **4 months**, or a compatible flexible range.
- Show availability start/end dates, renewal option, deposit, monthly rent, and any short-term premium before enquiry or payment.
- Validate that a requested reservation falls within both the listing's availability calendar and allowed rental duration.
- Preserve reservation, payment, and cancellation/audit history.

## Payments with Stripe

Integrate Stripe for secure payment collection and status tracking.

- Support rent/payment requests tied to a tenancy or reservation, with transparent breakdowns for rent, deposit, fees, and refunds.
- Use Stripe Checkout or Payment Elements, Payment Intents, and webhooks; create/confirm payments server-side.
- Verify signed webhooks in an Edge Function and treat webhook state—not browser callbacks—as the source of truth.
- Record Stripe customer, payment, refund, and invoice references without storing card data.
- Display payment state such as `pending`, `paid`, `failed`, `refunded`, or `overdue`; notify the relevant tenant and owner in real time.
- Gate owner payout/transfer workflows behind completed property verification and any required platform compliance review.

## Move-In / Move-Out Proof Vault

Create a private evidence vault for documenting property condition at move-in and move-out.

- Tenant and owner can create a dated inspection for a tenancy.
- Capture room-by-room photos/videos, notes, meter readings, inventory/checklist items, and signatures/acknowledgements.
- Preserve uploader, timestamps, tenancy, and immutable file metadata; do not silently overwrite submitted evidence.
- Allow each party to comment, acknowledge, or dispute an item with an auditable timeline.
- Generate/export a move-in or move-out report when needed.
- Grant access only to the linked tenant, linked owner, and authorized administrator. Use private Storage objects and signed URLs.

## Listing status: Active and Found

Make listing availability obvious and actionable.

- Owners can mark a listing **Active** when it can receive enquiries and **Found** when a suitable tenant has been identified or it is no longer available.
- `found` listings must be removed from default active search results while remaining visible to the owner and in historical records.
- Tenant-facing cards must clearly display the status; prevent new applications/enquiries for non-active listings.
- Status changes must be authorized, timestamped, and broadcast to affected saved-search users or applicants where appropriate.

## Maintenance Relay Bot — WhatsApp/chat-native ticketing

Meet tenants in the channel they already use. Implement a WhatsApp/Twilio integration or, where WhatsApp is unavailable, a clearly labelled web chat widget that follows the same ticket flow.

### Tenant flow

1. Tenant sends a message such as “geyser leaking” and optionally attaches a photo.
2. The integration authenticates or matches the tenant/tenancy and creates a maintenance ticket.
3. The bot confirms the ticket number, property, severity, and current status.
4. Tenant receives updates and can add messages/media until resolution.

### Owner and escalation flow

- Notify the owner/manager immediately via the configured channel and in-app realtime notification.
- Track states: `open`, `acknowledged`, `in_progress`, `resolved`, `closed`, and `escalated`.
- Record messages, attachments, timestamps, assignment, priority, and resolution notes.
- Escalate automatically when a ticket is ignored beyond configurable response/resolution thresholds. Notify the tenant, owner, and optionally an administrator.
- Validate incoming provider webhooks, restrict attachments, and keep ticket media private.

## Commute-cost calculator and true cost of living

Search must evaluate housing beyond sticker rent.

```text
True monthly cost = monthly rent + estimated monthly commute cost + estimated food/grocery access cost
```

- Ask the tenant for campus/destination, expected travel days, and preferred commute mode where needed.
- Use mapping/transit/distance data to calculate distance and typical commute duration/cost. Clearly label estimates and data freshness.
- Estimate food/grocery access from nearby options and make the assumptions visible/configurable.
- Display rent, commute time, commute cost, access estimate, and one comparable **true monthly cost** in listing cards and detail pages.
- Permit sorting/filtering by true cost, commute time, and distance—not rent alone.
- Preserve the input assumptions with a saved comparison so users can understand why values differ.

## Roommate contract generator

Provide a lightweight roommate-to-roommate agreement—not a replacement for legal advice or a tenancy lease.

- Collect a guided questionnaire: occupants, property, term, rent split, deposits, utilities, chores, cleaning, guests, quiet hours, shared groceries, notice period, and dispute process.
- Generate a clear, plain-language “house constitution” preview using a versioned template.
- Let all participating roommates review and e-sign the same immutable document version.
- Generate a downloadable PDF and retain a private copy, signature events, consent/timestamps, and amendments.
- Make legal jurisdiction/disclaimer text configurable and show it before signing.

## Verified listing via utility/property-document proof

Reduce fraudulent and duplicate listings by requiring owner evidence before publication.

- Owner uploads a recent utility bill, property-tax receipt, or equivalent ownership/occupancy document.
- Collect the listing address in structured form and compare it with OCR-extracted name/address fields.
- Use an OCR Edge Function/provider to extract text and return a verification result such as `pending`, `needs_review`, `verified`, or `rejected`.
- Do not publish a listing as verified until the automatic match succeeds or an authorized administrator reviews it.
- Flag low confidence, address/name mismatch, expired document, duplicate document, or suspicious reuse for manual review.
- Store source documents privately, minimize retention, audit reviewer decisions, and never expose raw utility/property files to tenants.

## Neighborhood safety and vibe data

Give tenants useful local context without claiming certainty.

- Show neighbourhood safety indicators, lighting/transport/accessibility information, nearby essentials, student friendliness, noise/vibe, and local highlights where data is available.
- Attribute sourced data, display its date/coverage, and distinguish sourced measures from resident opinions.
- Let verified residents contribute structured, moderated feedback on safety and vibe; provide report/flag controls.
- Avoid precise, stigmatizing, or unverified safety claims. Use aggregate signals and clear caveats.

## Reviews and trust

- Permit reviews only from verified tenants associated with a completed or active tenancy, subject to the product's review policy.
- Support separate ratings/categories for property accuracy, cleanliness, owner responsiveness, location/commute, safety/vibe, and overall experience.
- Let owners respond; maintain a moderation/reporting workflow and audit trail.
- Prevent duplicate reviews per tenancy and prevent a user from reviewing their own listing.
- Show rating distribution, verified-review context, and timestamps; never expose private tenancy data.

## Suggested database additions

Use UUID primary keys, `created_at`, `updated_at`, and foreign keys throughout. Add indexes for common filters, geospatial/location searches, and realtime lookup paths.

| Area | Core tables / fields |
| --- | --- |
| Identity | `profiles(id -> auth.users, full_name, phone, role, email_verified_at)`; role is constrained to `tenant`, `owner`, `admin`. |
| Listings | `properties`, `listings(property_id, owner_id, status, rent, deposit, min_months, max_months, availability_start, availability_end, latitude, longitude, verification_status)`; photos, amenities, rules, and nearby-campus relations. |
| Discovery | `saved_listings`, `saved_searches`, `campuses`, location/commute estimate cache, and true-cost calculation inputs/results. |
| Tenancy & payments | `enquiries`, `applications`, `reservations`, `tenancies`, `payment_requests`, `payments`, `refunds`, and Stripe event/idempotency records. |
| Maintenance | `maintenance_tickets`, `ticket_messages`, `ticket_attachments`, `ticket_escalations`, and inbound messaging/webhook events. |
| Proof vault | `inspections`, `inspection_items`, `proof_assets`, `proof_acknowledgements`, `proof_disputes`, and report exports. |
| Contracts | `roommate_contracts`, `contract_participants`, `contract_signatures`, `contract_versions`, and generated file metadata. |
| Verification | `verification_documents`, `ocr_extractions`, `listing_verifications`, reviewer decisions, confidence/match fields, and document fingerprints. |
| Community | `neighborhoods`, sourced neighborhood metrics, `neighborhood_feedback`, `reviews`, `review_reports`, and moderation decisions. |
| Operations | `notifications`, `audit_logs`, and provider webhook/event logs with idempotency keys. |

Model status fields as constrained enums/check constraints, not unconstrained display strings. Keep documents/files in Storage and store only object metadata, access rules, and signed-link generation context in PostgreSQL.

## Role-based access and security

Apply RLS to every exposed table and use server-side functions for privileged operations.

| Actor | Permitted access |
| --- | --- |
| Tenant | Browse active public listing data; manage their own profile, enquiries, tenancy, payments, tickets, proof records, roommate contracts, and eligible reviews. |
| Owner | Manage only their own properties/listings, related verified documents, applicants/tenancies, payment requests, maintenance tickets, and linked proof records. |
| Admin | Review verification/moderation queues, change roles only through an audited authorized workflow, resolve escalations/disputes, and access operational records as required. |

- Never trust `role`, owner IDs, payment state, verification state, or reservation status sent by the client.
- Use RLS policies that derive ownership from `auth.uid()` and verified tenancy/listing relationships.
- Restrict private Storage buckets by path and signed URL policy; validate file type, size, and malware/content checks as supported by the storage pipeline.
- Use rate limiting, CAPTCHA/abuse controls where appropriate, secure webhook signature validation, server-side secret storage, and idempotency for payment/messaging/OCR callbacks.
- Audit admin actions, role changes, verification outcomes, payment transitions, status changes, signatures, and evidence-vault events.
- Provide consent, retention/deletion handling, and minimum-data access for sensitive documents, phone numbers, and location details.

## Realtime and notifications

Use Supabase Realtime for changes users need to see immediately:

- maintenance ticket messages, status changes, and escalations;
- incoming enquiries/applications and listing Active/Found changes;
- payment requests and webhook-confirmed payment states;
- verification progress and document-review decisions;
- proof-vault comments/acknowledgements/disputes;
- roommate-contract review/signature progress.

Persist notifications, allow read/unread state, and deliver in-app alerts plus configured channel notifications. Ensure realtime subscriptions are constrained by the same authorization model as database reads.

## Final journeys

### Tenant journey

```text
Choose Tenant role → Sign up and verify email → Complete profile
→ Search nearest hostels/listings by campus or location
→ Filter for 2–4 month stays and compare true monthly cost
→ Review verification, safety/vibe information, and verified reviews
→ Save/enquire/apply → Pay through Stripe when requested
→ Move in with Proof Vault documentation
→ Raise and track maintenance via WhatsApp/chat
→ Create/sign a roommate contract if sharing
→ Complete move-out proof and leave an eligible review
```

### Owner journey

```text
Choose Owner role → Sign up and verify email → Complete profile
→ Add property/listing and availability (including short-term windows)
→ Upload utility/property proof → OCR validation and review
→ Publish verified Active listing → Receive enquiries/applications
→ Mark Found when suitable tenant is selected
→ Manage tenancy, Stripe payment requests, and maintenance tickets
→ Participate in move-in/move-out evidence and disputes
→ Respond to eligible reviews and maintain listing quality
```

## Definition of done

The implementation is complete only when these flows work end-to-end with real authenticated data, RLS-enforced authorization, private document storage, verified external callbacks, persisted records, error/loading states, responsive UI, and automated/manual tests for critical authorization, payment webhook, verification, ticket escalation, and role-immutability paths.
