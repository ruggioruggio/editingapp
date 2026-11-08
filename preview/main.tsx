import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import AppLayout from "@/app/(app)/layout";
import { ProfileView } from "@/components/profile/ProfileView";
import { WorldLeaderboard } from "@/components/leaderboard/WorldLeaderboard";
import LearnPage from "@/app/(app)/learn/page";
import PracticePage from "@/app/(app)/practice/page";
import PricingPage from "@/app/(app)/pricing/page";
import QuestsPage from "@/app/(app)/quests/page";
import DownloadPage from "@/app/download/page";
import LoginPage from "@/app/login/page";
import LandingPage from "@/app/page";
import ResetPasswordPage from "@/app/reset-password/page";
import SignupPage from "@/app/signup/page";
import { LegalDocView } from "@/components/legal/LegalDocView";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { AfterEffectsStudio } from "@/components/studio/ae/AfterEffectsStudio";
import { PremiereStudio } from "@/components/studio/premiere/PremiereStudio";
import { SupabaseSync } from "@/components/app/SupabaseSync";
import { CookieBanner } from "@/components/app/CookieBanner";
import { NotFoundView } from "@/components/site/NotFoundView";
import { useAuth } from "@/lib/supabase/auth";
import { getLesson } from "@/content/lessons";
import { getLegalDoc } from "@/content/legal";
import { PreviewRouter, usePreviewRouter } from "./router";
import { AdminGate } from "@/components/admin/AdminGate";
import { MaintenanceGate } from "@/components/app/Maintenance";
import { ThemeSync } from "@/components/app/ThemeSync";

// Anteprima a file unico di SqueakEdit: le stesse pagine e componenti
// dell'app, con un router in memoria al posto delle rotte di Next.js.

const IS_ELECTRON = typeof navigator !== "undefined" && /Electron/i.test(navigator.userAgent);
const IS_NATIVE = IS_ELECTRON || !!process.env.SQUEAK_DESKTOP;
const NO_ADMIN = !!process.env.SQUEAK_NO_ADMIN;

const BLOCKED_ON_NATIVE = new Set(["/"]);
const AUTH_PAGES = new Set(["/login", "/signup", "/reset-password"]);

function NativeAuthGate({ path, children }: { path: string; children: React.ReactNode }) {
  const status = useAuth((s) => s.status);
  const { navigate } = usePreviewRouter();
  const onAuthPage = AUTH_PAGES.has(path.split("?")[0]);

  useEffect(() => {
    if (IS_NATIVE && status === "user" && onAuthPage) {
      navigate("/learn", true);
    }
  }, [status, onAuthPage, navigate]);

  if (IS_NATIVE && onAuthPage && status === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", background: "#121212" }}>
        <div style={{ width: 48, height: 48, border: "4px solid #333", borderTopColor: "#3ecf8e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      </div>
    );
  }

  return <>{children}</>;
}

// come redirect() di Next: sostituisce la voce corrente nella cronologia
function Redirect({ to }: { to: string }) {
  const { navigate } = usePreviewRouter();
  useEffect(() => navigate(to, true), [to, navigate]);
  return null;
}

const APP_PAGES: Record<string, () => React.ReactNode> = {
  "/learn": () => <LearnPage />,
  "/quests": () => <QuestsPage />,
  // in Next /goals reindirizza alle quest con la scheda Obiettivi
  "/goals": () => <Redirect to="/quests?tab=obiettivi" />,
  "/practice": () => <PracticePage />,
  "/friends": () => <ProfileView />,
  "/profile": () => <ProfileView />,
  "/pricing": () => <PricingPage />,
  "/ai": () => <Redirect to="/learn" />,
  "/leaderboard": () => <WorldLeaderboard />,
};

const SITE_PAGES: Record<string, () => React.ReactNode> = {
  "/": () => <LandingPage />,
  "/login": () => <LoginPage />,
  "/signup": () => <SignupPage />,
  "/reset-password": () => <ResetPasswordPage />,
  "/download": () => <DownloadPage />,
  "/studio/premiere": () => <PremiereStudio />,
  "/studio/after-effects": () => <AfterEffectsStudio />,
};

// al posto del 404 di Next: su desktop/mobile il login, mai la landing
const notFoundPage = () => (IS_NATIVE ? SITE_PAGES["/login"]() : <NotFoundView />);

function render(fullPath: string) {
  const path = fullPath.split("?")[0];
  if (path.startsWith("/lesson/")) {
    const id = path.slice("/lesson/".length);
    return getLesson(id) ? <LessonPlayer key={id} lessonId={id} /> : notFoundPage();
  }
  if (path.startsWith("/unit-test/")) {
    const id = path.slice("/unit-test/".length);
    return <LessonPlayer key={id} unitTestId={id} />;
  }
  if (path.startsWith("/legal/")) {
    const doc = getLegalDoc(path.slice("/legal/".length));
    return doc ? <LegalDocView doc={doc} /> : notFoundPage();
  }
  // il layout dell'app resta montato tra le schede (come in Next): cambia solo la pagina
  if (APP_PAGES[path]) return <AppLayout>{<div key={path}>{APP_PAGES[path]()}</div>}</AppLayout>;
  if (IS_NATIVE && BLOCKED_ON_NATIVE.has(path)) return notFoundPage();
  return SITE_PAGES[path]?.() ?? notFoundPage();
}

createRoot(document.getElementById("root")!).render(
  <PreviewRouter initial={IS_NATIVE ? "/login" : "/"} blockedPaths={IS_NATIVE ? BLOCKED_ON_NATIVE : undefined}>
    {(path) => (
      <>
        <SupabaseSync />
        <ThemeSync />
        <MaintenanceGate />
        <CookieBanner />
        {!NO_ADMIN && <AdminGate />}
        <NativeAuthGate path={path}>
          <div key={APP_PAGES[path.split("?")[0]] ? "app" : path}>{render(path)}</div>
        </NativeAuthGate>
      </>
    )}
  </PreviewRouter>,
);
