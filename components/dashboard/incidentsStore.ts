"use client";

export type IncidentSeverity = "Low" | "Medium" | "High";
export type IncidentStatus = "Open" | "Investigating" | "In Progress" | "Resolved";

export type IncidentTypeCategory =
  | "theft"
  | "dispute"
  | "breach"
  | "noise"
  | "property_damage"
  | "medical"
  | "other";

export type IncidentUpdate = {
  id: string;
  createdAt: number;
  by: string;
  message: string;
};

export type IncidentRecord = {
  id: string;
  residentId?: string;
  title: string;
  reporter: string;
  incidentType?: IncidentTypeCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  timeLabel: string;
  createdAt: number;
  description?: string;
  attachments?: string[];
  updates?: IncidentUpdate[];
};

const INCIDENTS_KEY = "estateos_incidents_v1";

export function seedIncidents(): IncidentRecord[] {
  const base = Date.now();
  const make = (i: number, inc: IncidentRecord): IncidentRecord => ({
    ...inc,
    createdAt: inc.createdAt ?? base - 1000 * 60 * 60 * (i + 1),
  });

  return [
    {
      id: "inc_unauth_parking",
      title: "Unauthorized parking in Block B",
      reporter: "Guard - North Gate",
      severity: "Low",
      status: "Open",
      timeLabel: "1 hr ago",
      createdAt: Date.now() - 1000 * 60 * 60,
      description: "A vehicle was parked in a reserved spot without authorization. Plate number captured for follow-up.",
    },
    {
      id: "inc_noise_9d",
      residentId: "res_aisha_bello",
      title: "Noise complaint - Unit 9D",
      reporter: "Aisha Bello",
      severity: "Medium",
      status: "Investigating",
      timeLabel: "3 hrs ago",
      createdAt: Date.now() - 1000 * 60 * 60 * 3,
      description: "Complaint about loud music after quiet hours. Patrol assigned to verify.",
    },
    {
      id: "inc_gate_malfunction",
      title: "North Gate barrier malfunction",
      reporter: "Guard - North Gate",
      severity: "High",
      status: "In Progress",
      timeLabel: "5 hrs ago",
      createdAt: Date.now() - 1000 * 60 * 60 * 5,
      description: "Barrier arm intermittently fails to raise. Maintenance notified; temporary manual control enabled.",
    },
    {
      id: "inc_suspicious_vehicle",
      title: "Suspicious vehicle near Block A",
      reporter: "Guard - South Gate",
      severity: "High",
      status: "Resolved",
      timeLabel: "1 day ago",
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      description: "Unrecognized vehicle loitering. Driver verified and escorted out. CCTV footage logged.",
    },
    {
      id: "inc_water_leak",
      residentId: "res_mike_brown",
      title: "Water leak in parking garage",
      reporter: "Mike Brown",
      severity: "Medium",
      status: "Resolved",
      timeLabel: "2 days ago",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      description: "Leak detected near basement parking. Pipe isolated and repair completed.",
    },
    make(6, {
      id: "inc_gate_tailgating",
      title: "Tailgating attempt at South Gate",
      reporter: "Guard - South Gate",
      severity: "High",
      status: "Investigating",
      timeLabel: "6 hrs ago",
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
      description: "A vehicle attempted to follow closely behind an authorized car. Incident recorded; CCTV flagged.",
    }),
    make(7, {
      id: "inc_package_theft",
      residentId: "res_sarah_chen",
      title: "Package missing from reception",
      reporter: "Sarah Chen",
      severity: "Medium",
      status: "Open",
      timeLabel: "10 hrs ago",
      createdAt: Date.now() - 1000 * 60 * 60 * 10,
      description: "Resident reported a missing package. Reception logs and CCTV review requested.",
    }),
    make(8, {
      id: "inc_alarm_false",
      title: "False fire alarm trigger - Block C",
      reporter: "Facility Desk",
      severity: "Low",
      status: "Resolved",
      timeLabel: "1 day ago",
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      description: "Alarm triggered due to sensor fault. Sensor replaced; system tested.",
    }),
    make(9, {
      id: "inc_access_card_lost",
      residentId: "res_emma_wilson",
      title: "Lost access card reported",
      reporter: "Emma Wilson",
      severity: "Low",
      status: "Resolved",
      timeLabel: "2 days ago",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      description: "Card deactivated and new card issued (demo).",
    }),
    make(10, {
      id: "inc_power_outage",
      title: "Power outage - Block A corridor",
      reporter: "Guard Patrol",
      severity: "Medium",
      status: "In Progress",
      timeLabel: "3 days ago",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      description: "Lighting down along corridor. Maintenance escalated; temporary lighting deployed.",
    }),
    make(11, {
      id: "inc_adaeze_access_issue",
      residentId: "res_adaeze_okafor",
      title: "Access delay reported - Unit A-01",
      reporter: "Adaeze Okafor",
      severity: "Low",
      status: "Resolved",
      timeLabel: "4 days ago",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
      description: "Resident reported delayed gate access on arrival. Verification completed; issue resolved (demo).",
    }),
    make(12, {
      id: "inc_david_parking_violation",
      residentId: "res_david_lee",
      title: "Parking sticker mismatch - Unit 7C",
      reporter: "David Lee",
      severity: "Low",
      status: "Resolved",
      timeLabel: "5 days ago",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
      description: "Vehicle sticker mismatch flagged at gate. Resident verified; record updated (demo).",
    }),
    make(13, {
      id: "inc_james_guest_dispute",
      residentId: "res_james_obi",
      title: "Guest verification dispute - Block D",
      reporter: "James Obi",
      severity: "Medium",
      status: "Investigating",
      timeLabel: "6 days ago",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
      description: "Guest verification failed on first attempt. Security reviewing ID and invitation details (demo).",
    }),
    make(14, {
      id: "inc_emma_water_pressure",
      residentId: "res_emma_wilson",
      title: "Low water pressure - Unit 1A",
      reporter: "Emma Wilson",
      severity: "Low",
      status: "Resolved",
      timeLabel: "1 week ago",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
      description: "Water pressure reported low in the morning. Maintenance inspected; resolved (demo).",
    }),
    make(15, {
      id: "inc_mike_gate_intercom",
      residentId: "res_mike_brown",
      title: "Gate intercom not responding",
      reporter: "Mike Brown",
      severity: "Medium",
      status: "In Progress",
      timeLabel: "8 days ago",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
      description: "Resident reports intercom delay at North Gate. Technician assigned (demo).",
    }),
  ];
}

export function loadIncidents(): IncidentRecord[] {
  try {
    const raw = localStorage.getItem(INCIDENTS_KEY);
    if (!raw) {
      const seeded = seedIncidents();
      localStorage.setItem(INCIDENTS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as IncidentRecord[];
    const arr = Array.isArray(parsed) ? parsed : seedIncidents();
    // Migration: ensure newer demo incidents exist
    const seeded = seedIncidents();
    const existingIds = new Set(arr.map((i) => i.id));
    const missing = seeded.filter((i) => !existingIds.has(i.id));
    const next = missing.length ? [...missing, ...arr] : arr;

    // Migration: ensure updates exists.
    const migrated = next.map((i) => ({
      ...i,
      updates: Array.isArray(i.updates) ? i.updates : [],
    }));

    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return seedIncidents();
  }
}

export function saveIncidents(incidents: IncidentRecord[]) {
  localStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents));
}

