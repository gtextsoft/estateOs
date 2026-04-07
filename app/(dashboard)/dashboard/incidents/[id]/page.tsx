import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";

const incidents = [
  { id: "inc_unauth_parking", title: "Unauthorized parking in Block B", reporter: "Guard - North Gate", severity: "Low", status: "Open", time: "1 hr ago" },
  { id: "inc_noise_9d", title: "Noise complaint - Unit 9D", reporter: "Aisha Bello", severity: "Medium", status: "Investigating", time: "3 hrs ago" },
  { id: "inc_gate_malfunction", title: "North Gate barrier malfunction", reporter: "Guard - North Gate", severity: "High", status: "In Progress", time: "5 hrs ago" },
  { id: "inc_suspicious_vehicle", title: "Suspicious vehicle near Block A", reporter: "Guard - South Gate", severity: "High", status: "Resolved", time: "1 day ago" },
  { id: "inc_water_leak", title: "Water leak in parking garage", reporter: "Mike Brown", severity: "Medium", status: "Resolved", time: "2 days ago" },
] as const;

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inc = incidents.find((x) => x.id === id);

  if (!inc) {
    return (
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-foreground">Incident not found</h1>
        <p className="text-sm text-muted-foreground">This incident does not exist.</p>
        <Link href="/dashboard/incidents" className="text-sm font-medium text-primary hover:underline">
          Back to Incidents
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{inc.title}</h1>
          <p className="text-sm text-muted-foreground">Incident details and actions.</p>
        </div>
        <Link href="/dashboard/incidents" className="text-sm font-medium text-primary hover:underline">
          Back
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft p-5">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 h-10 w-10 rounded-lg flex items-center justify-center ${
              inc.severity === "High"
                ? "bg-destructive/10"
                : inc.severity === "Medium"
                  ? "bg-amber-100"
                  : "bg-muted"
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 ${
                inc.severity === "High"
                  ? "text-destructive"
                  : inc.severity === "Medium"
                    ? "text-amber-700"
                    : "text-muted-foreground"
              }`}
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  inc.status === "Resolved"
                    ? "bg-emerald-100 text-emerald-700"
                    : inc.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : inc.status === "Investigating"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-destructive/10 text-destructive"
                }`}
              >
                {inc.status}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                Severity: {inc.severity}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {inc.time}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Reported by {inc.reporter}</p>
            <p className="text-sm text-foreground mt-4">
              Placeholder description. Wire this to `GET /incidents/:id` from the API reference.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft">
        <div className="p-5 border-b border-border">
          <h3 className="font-display text-lg font-semibold text-foreground">Actions</h3>
          <p className="text-sm text-muted-foreground">Next: add status updates and audit logs.</p>
        </div>
        <div className="p-5 flex flex-wrap gap-3">
          <button className="h-10 px-4 rounded-md border border-border bg-background hover:bg-muted text-sm font-medium">
            Mark investigating
          </button>
          <button className="h-10 px-4 rounded-md bg-gradient-gold shadow-gold hover:opacity-90 text-sm font-medium text-primary-foreground">
            Resolve incident
          </button>
        </div>
      </div>
    </div>
  );
}

