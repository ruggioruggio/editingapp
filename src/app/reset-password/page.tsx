import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Recupera la password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Recupera la password" corner={{ href: "/login", label: "Accedi" }}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
