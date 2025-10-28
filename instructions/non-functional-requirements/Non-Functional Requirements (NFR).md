NFR-1 Performance: Input → recompute < 100 ms on mid-range Android; app cold start < 2 s.

NFR-2 Reliability: Works offline with bundled configs; uses remote configs if present.

NFR-3 Security:

Firestore Rules: create-only for leads, no public reads; Anonymous Auth required.

No private keys in app; only Firebase client config.

Minimum PII collected; transported via HTTPS.

NFR-4 Accessibility: As per FR-0.4.

NFR-5 Cross-platform: Single codebase runs on Android/iOS (native) and Web PWA (installable). PWA configured with display=standalone, theme color brand green.