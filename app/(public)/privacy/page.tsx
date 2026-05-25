export default function PrivacyPage() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6 max-w-3xl prose prose-neutral dark:prose-invert">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4 not-prose">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm mb-8 not-prose">Last updated: May 2026</p>

        <h2>Who we are</h2>
        <p>
          EstateOS provides estate management and gate security software for residential communities.
          This policy describes how we process personal data when you use our web application.
        </p>

        <h2>Data we collect</h2>
        <ul>
          <li>Account data: name, email, phone, unit, role, and password (stored hashed).</li>
          <li>KYC information submitted during onboarding (as provided by your estate).</li>
          <li>Visitor data: guest names, access pass codes, entry/exit security events.</li>
          <li>Operational data: incidents, payment requests, notifications, and emergency alerts.</li>
          <li>Technical logs: request metadata and security audit events (platform actions).</li>
        </ul>

        <h2>How we use data</h2>
        <p>
          We use data to authenticate users, enforce estate access rules, notify residents and guards,
          support managers, and maintain audit trails for security-sensitive actions.
        </p>

        <h2>Processors</h2>
        <p>
          Depending on your deployment, data may be processed by MongoDB (database), Resend (transactional email),
          and your hosting providers (e.g. Vercel, Railway). Review subprocessors with your legal team before launch.
        </p>

        <h2>Retention</h2>
        <p>
          Estates should configure retention for visitor logs and inactive accounts. Platform deletion of an estate
          removes associated tenant data from the primary database.
        </p>

        <h2>Your rights</h2>
        <p>
          Contact your estate manager or <a href="mailto:privacy@estateos.example">privacy@estateos.example</a> for
          access, correction, or deletion requests. We will assist estates in fulfilling applicable regional requirements.
        </p>

        <h2>Security</h2>
        <p>
          We use HTTPS, httpOnly session cookies, CSRF protection on mutations, role-based access control, and
          rate limiting on authentication and scan endpoints. No system is perfectly secure; report issues responsibly.
        </p>
      </div>
    </section>
  );
}
