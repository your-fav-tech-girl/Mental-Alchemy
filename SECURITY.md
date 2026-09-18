# Security and health-data readiness

Mental Alchemy handles information that can be sensitive. The included backend is a secure application foundation, but deploying the code alone does not establish legal or regulatory compliance.

Before accepting real clients:

- Use a Supabase plan and contractual arrangement appropriate for the health data and jurisdictions you serve.
- Confirm whether HIPAA, UAE health-data rules, GDPR, or other requirements apply with qualified counsel.
- Enable multi-factor authentication for administrators and clinicians.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never prefix it with `NEXT_PUBLIC_` or commit it.
- Configure custom SMTP, email confirmation, redirect URLs, CAPTCHA, and rate limits in Supabase.
- Add audit logging, retention/deletion procedures, incident response, consent records, and clinician verification.
- Use a compliant video provider rather than placing video-session secrets in this database.
- Replace all sample clinicians and claims before launch.

Every exposed table in the migration has Row Level Security enabled. Public contact and guest-booking writes pass through server routes that use the service-role key; the browser never receives that key.
