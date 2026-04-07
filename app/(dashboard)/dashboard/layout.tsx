import { cookies } from "next/headers";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { roleLabel, type EstateRole } from "@/lib/role";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = cookieStore.get("estateos_role")?.value as EstateRole | undefined;
  return <DashboardShell roleLabel={roleLabel(role)}>{children}</DashboardShell>;
}


