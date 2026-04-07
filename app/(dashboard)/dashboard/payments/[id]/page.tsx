import Link from "next/link";
import { CreditCard } from "lucide-react";

const payments = [
  { id: "pay_sarah_mar", resident: "Sarah Chen", unit: "4B", amount: "₦250,000", type: "Service Charge", status: "Paid", date: "Mar 1, 2026" },
  { id: "pay_mike_mar", resident: "Mike Brown", unit: "12A", amount: "₦250,000", type: "Service Charge", status: "Paid", date: "Mar 1, 2026" },
  { id: "pay_david_feb", resident: "David Lee", unit: "7C", amount: "₦250,000", type: "Service Charge", status: "Overdue", date: "Feb 1, 2026" },
  { id: "pay_emma_maint", resident: "Emma Wilson", unit: "1A", amount: "₦150,000", type: "Maintenance", status: "Pending", date: "Mar 15, 2026" },
  { id: "pay_james_jan", resident: "James Obi", unit: "15D", amount: "₦250,000", type: "Service Charge", status: "Overdue", date: "Jan 1, 2026" },
] as const;

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = payments.find((x) => x.id === id);

  if (!p) {
    return (
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-foreground">Payment not found</h1>
        <p className="text-sm text-muted-foreground">This payment record does not exist.</p>
        <Link href="/dashboard/payments" className="text-sm font-medium text-primary hover:underline">
          Back to Payments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{p.type}</h1>
          <p className="text-sm text-muted-foreground">Payment record details.</p>
        </div>
        <Link href="/dashboard/payments" className="text-sm font-medium text-primary hover:underline">
          Back
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{p.amount}</p>
            <p className="text-xs text-muted-foreground">
              {p.resident} · Unit {p.unit}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="font-medium text-foreground">{p.status}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Due date</p>
            <p className="font-medium text-foreground">{p.date}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="font-medium text-foreground">{p.type}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft">
        <div className="p-5 border-b border-border">
          <h3 className="font-display text-lg font-semibold text-foreground">Actions</h3>
          <p className="text-sm text-muted-foreground">Next: wire to `PATCH /payments/:id` and reminders.</p>
        </div>
        <div className="p-5 flex flex-wrap gap-3">
          <button className="h-10 px-4 rounded-md border border-border bg-background hover:bg-muted text-sm font-medium">
            Send reminder
          </button>
          <button className="h-10 px-4 rounded-md bg-gradient-gold shadow-gold hover:opacity-90 text-sm font-medium text-primary-foreground">
            Mark as paid
          </button>
        </div>
      </div>
    </div>
  );
}

