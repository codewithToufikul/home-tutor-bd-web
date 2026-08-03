# Production Security Hardening Plan

## Contact Message Protection Architecture

The `contact_messages` collection is currently the only public-write surface in the frontend flow. Production hardening should add the following layers before broadening exposure:

1. Firebase App Check
   - Enforce App Check on the web app and Firebase Storage requests.
   - Reject traffic from untrusted clients or bot traffic.

2. reCAPTCHA / Bot Protection
   - Add reCAPTCHA on the contact form before submission.
   - Use a server-side verification step when available.

3. Rate Limiting
   - Add client-side debounce and server-side throttling.
   - Restrict repeated submissions per IP or per account.

4. Cloud Functions Validation
   - Validate incoming message payloads, spam patterns, and required field constraints.
   - Normalize and sanitize text before writing to Firestore.

> Cloud Functions are intentionally not implemented in this milestone. This document captures the required production architecture for the next backend milestone.

## Storage Cleanup Strategy (Architecture Only)

When Firestore metadata is deleted, the corresponding Storage object should also be removed through a trusted backend workflow:

1. Trigger cleanup from the document deletion path.
2. Resolve the Storage file path from metadata fields such as `photoUrl`, `cvUrl`, `nidFrontUrl`, `nidBackUrl`, or similar.
3. Delete the object from Firebase Storage using a privileged backend or Cloud Function.
4. Treat cleanup as an atomic follow-up to the Firestore delete.
5. Log failures for reconciliation so orphaned objects can be reaped later.

This milestone only documents the architecture. The actual deletion implementation should come in the backend milestone after the authorization model is fully backed by Custom Claims or a trusted server layer.
