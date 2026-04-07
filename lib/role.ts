export type EstateRole = "resident" | "guard" | "manager";

export function roleLabel(role: EstateRole | null | undefined) {
  switch (role) {
    case "resident":
      return "Resident";
    case "guard":
      return "Security Guard";
    case "manager":
      return "Estate Manager";
    default:
      return "Estate Manager";
  }
}

