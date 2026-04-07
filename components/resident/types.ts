export type PassType = "single" | "service" | "permanent";
export type PassStatus = "active" | "used" | "pending" | "revoked";

export type GuestPass = {
  id: string;
  residentId: string;
  // Human-friendly ID shown as "code" (also encoded into QR)
  code: string;
  guestName: string;
  passType: PassType;
  validUntilLabel: string;
  status: PassStatus;
  createdAt: number;
  timeStart?: string;
  timeEnd?: string;
  date?: string;
};

export type ResidentNotification = {
  id: string;
  message: string;
  timeLabel: string;
  read: boolean;
  residentId: string;
  meta?: {
    incidentId?: string;
    // Used to unlock resident actions (e.g., create payment)
    incidentStatus?: string;
  };
  type: "arrival" | "service" | "payment" | "notice" | "emergency" | "visitor";
};

