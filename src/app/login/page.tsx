import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Accedi" };

export default function LoginPage() {
  return (
    <AuthShell title="Accedi" corner={{ href: "/signup", label: "Registrati" }}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
