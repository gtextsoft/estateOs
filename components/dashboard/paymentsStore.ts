"use client";

export type PaymentStatus = "Paid" | "Pending" | "Overdue";

export type PaymentRecord = {
  id: string;
  residentId: string;
  residentName: string;
  unit: string;
  amount: string;
  type: string;
  status: PaymentStatus;
  dateLabel: string;
  createdAt: number;
  reference?: string;
  notes?: string;
};

const PAYMENTS_KEY = "estateos_payments_v1";

export function seedPayments(): PaymentRecord[] {
  const base = Date.now();
  const make = (i: number, p: Omit<PaymentRecord, "createdAt"> & { createdAt?: number }): PaymentRecord => ({
    ...p,
    createdAt: p.createdAt ?? base - 1000 * 60 * 60 * 24 * (i + 1),
  });

  return [
    {
      id: "pay_sarah_mar",
      residentId: "res_sarah_chen",
      residentName: "Sarah Chen",
      unit: "4B",
      amount: "₦250,000",
      type: "Service Charge",
      status: "Paid",
      dateLabel: "Mar 1, 2026",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 17,
      reference: "TRX-842193",
    },
    {
      id: "pay_mike_mar",
      residentId: "res_mike_brown",
      residentName: "Mike Brown",
      unit: "12A",
      amount: "₦250,000",
      type: "Service Charge",
      status: "Paid",
      dateLabel: "Mar 1, 2026",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 17,
      reference: "TRX-842311",
    },
    {
      id: "pay_david_feb",
      residentId: "res_david_lee",
      residentName: "David Lee",
      unit: "7C",
      amount: "₦250,000",
      type: "Service Charge",
      status: "Overdue",
      dateLabel: "Feb 1, 2026",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
      reference: "INV-22019",
      notes: "Reminder sent (demo).",
    },
    {
      id: "pay_emma_maint",
      residentId: "res_emma_wilson",
      residentName: "Emma Wilson",
      unit: "1A",
      amount: "₦150,000",
      type: "Maintenance",
      status: "Pending",
      dateLabel: "Mar 15, 2026",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      reference: "INV-22901",
    },
    {
      id: "pay_james_jan",
      residentId: "res_james_obi",
      residentName: "James Obi",
      unit: "15D",
      amount: "₦250,000",
      type: "Service Charge",
      status: "Overdue",
      dateLabel: "Jan 1, 2026",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 76,
      reference: "INV-21300",
    },
    make(6, {
      id: "pay_aisha_mar",
      residentId: "res_aisha_bello",
      residentName: "Aisha Bello",
      unit: "3F",
      amount: "₦250,000",
      type: "Service Charge",
      status: "Paid",
      dateLabel: "Mar 1, 2026",
      reference: "TRX-845009",
    }),
    make(7, {
      id: "pay_adaeze_levy",
      residentId: "res_adaeze_okafor",
      residentName: "Adaeze Okafor",
      unit: "A-01",
      amount: "₦50,000",
      type: "Security Levy",
      status: "Pending",
      dateLabel: "Mar 20, 2026",
      reference: "INV-23100",
    }),
    make(8, {
      id: "pay_sarah_maint",
      residentId: "res_sarah_chen",
      residentName: "Sarah Chen",
      unit: "4B",
      amount: "₦30,000",
      type: "Maintenance",
      status: "Paid",
      dateLabel: "Feb 20, 2026",
      reference: "TRX-839112",
    }),
    make(9, {
      id: "pay_mike_levy",
      residentId: "res_mike_brown",
      residentName: "Mike Brown",
      unit: "12A",
      amount: "₦50,000",
      type: "Security Levy",
      status: "Overdue",
      dateLabel: "Feb 10, 2026",
      reference: "INV-22411",
      notes: "Second reminder queued (demo).",
    }),
    make(10, {
      id: "pay_emma_service_feb",
      residentId: "res_emma_wilson",
      residentName: "Emma Wilson",
      unit: "1A",
      amount: "₦250,000",
      type: "Service Charge",
      status: "Paid",
      dateLabel: "Feb 1, 2026",
      reference: "TRX-833901",
    }),
    make(11, {
      id: "pay_david_maint_mar",
      residentId: "res_david_lee",
      residentName: "David Lee",
      unit: "7C",
      amount: "₦25,000",
      type: "Maintenance",
      status: "Pending",
      dateLabel: "Mar 28, 2026",
      reference: "INV-23318",
    }),
    make(12, {
      id: "pay_james_levy_mar",
      residentId: "res_james_obi",
      residentName: "James Obi",
      unit: "15D",
      amount: "₦50,000",
      type: "Security Levy",
      status: "Pending",
      dateLabel: "Mar 22, 2026",
      reference: "INV-23244",
    }),
  ];
}

export function loadPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(PAYMENTS_KEY);
    if (!raw) {
      const seeded = seedPayments();
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as PaymentRecord[];
    const arr = Array.isArray(parsed) ? parsed : seedPayments();
    // Migration: ensure newer demo payments exist
    const seeded = seedPayments();
    const existingIds = new Set(arr.map((p) => p.id));
    const missing = seeded.filter((p) => !existingIds.has(p.id));
    if (missing.length) {
      const next = [...missing, ...arr];
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(next));
      return next;
    }
    return arr;
  } catch {
    return seedPayments();
  }
}

export function savePayments(payments: PaymentRecord[]) {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

