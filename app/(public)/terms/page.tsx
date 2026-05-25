export default function TermsPage() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6 max-w-3xl prose prose-neutral dark:prose-invert">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4 not-prose">
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-sm mb-8 not-prose">Last updated: May 2026</p>

        <h2>Agreement</h2>
        <p>
          By using EstateOS you agree to these terms on behalf of yourself and, where applicable, the estate or
          organization that provisioned your account.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>Use the platform only for lawful estate and security operations.</li>
          <li>Do not attempt to bypass access controls, scan limits, or tenant isolation.</li>
          <li>Do not share credentials; guards and residents must use their assigned roles.</li>
          <li>Emergency features must be used only for genuine safety incidents.</li>
        </ul>

        <h2>Service scope</h2>
        <p>
          Payment features track billing status and requests; they do not process card payments unless your estate
          integrates a separate payment provider. Realtime features may use polling until WebSocket sync is enabled.
        </p>

        <h2>Availability</h2>
        <p>
          We target high availability but do not guarantee uninterrupted service. Estates should maintain offline
          gate procedures when connectivity fails.
        </p>

        <h2>Liability</h2>
        <p>
          EstateOS is provided as software tooling. Estates remain responsible for physical security decisions,
          guard training, and compliance with local regulations.
        </p>

        <h2>Contact</h2>
        <p>
          Questions: <a href="mailto:legal@estateos.example">legal@estateos.example</a> or the{" "}
          <a href="/support">support page</a>.
        </p>
      </div>
    </section>
  );
}
