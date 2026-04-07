import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { ResidentShell } from "@/components/dashboard/ResidentShell";
import { roleLabel, type EstateRole } from "@/lib/role";

export default async function ResidentsLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("estateos_role")?.value as EstateRole | undefined;
  return <ResidentShell roleLabel={roleLabel(role)}>{children}</ResidentShell>;
}
