import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Crea il tuo profilo" };

export default function SignupPage() {
  return (
    <AuthShell title="Crea il tuo profilo" corner={{ href: "/login", label: "Accedi" }}>
      <SignupForm />
    </AuthShell>
  );
}
