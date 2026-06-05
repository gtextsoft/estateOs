export type EstateRole = "resident" | "guard" | "manager" | "platform_admin";

export function roleLabel(role: EstateRole | string | null | undefined) {
  switch (role) {
    case "resident":
      return "Resident";
    case "guard":
      return "Security Guard";
    case "manager":
      return "Estate Manager";
    case "platform_admin":
      return "Platform Admin";
    default:
      return "User";
  }
}

