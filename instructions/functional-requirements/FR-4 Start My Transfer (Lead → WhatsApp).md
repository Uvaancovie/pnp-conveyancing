Purpose: Convert calculator users into qualified leads.

FR-4.1 Inputs (form fields)

fullName (required), phone (required), email (required), suburb (optional), price (optional).

FR-4.2 Actions

Create Firestore lead (create-only document) with the fields above plus createdAt = serverTimestamp() using Anonymous Auth.

Open WhatsApp deep-link:
https://wa.me/<E164_NUMBER>?text=<prefilled message> where the message includes the form values and (optionally) the last calculator input.

FR-4.3 Business Rules

The lead creation is best-effort (if Firestore write fails, still open WhatsApp).

No Cloud Functions; no server secrets in the app.

FR-4.4 Validation & Errors

If any required field missing → block submission; show inline message.

If WhatsApp not installed (native) or blocked (web) → show firm contact details as fallback.

FR-4.5 Acceptance Criteria

Submitting a valid form creates a leads document and opens WhatsApp with a correctly prefilled message.