import { createRoot } from "react-dom/client";
import AppLayout from "@/app/(app)/layout";
import AiPage from "@/app/(app)/ai/page";
import FriendsPage from "@/app/(app)/friends/page";
import LearnPage from "@/app/(app)/learn/page";
import PracticePage from "@/app/(app)/practice/page";
import PricingPage from "@/app/(app)/pricing/page";
import QuestsPage from "@/app/(app)/quests/page";
import DownloadPage from "@/app/download/page";
import LoginPage from "@/app/login/page";
import LandingPage from "@/app/page";
import ResetPasswordPage from "@/app/reset-password/page";
import SignupPage from "@/app/signup/page";
import { Markdown } from "@/components/ai/Markdown";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { AfterEffectsStudio } from "@/components/studio/ae/AfterEffectsStudio";
import { PremiereStudio } from "@/components/studio/premiere/PremiereStudio";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { SupabaseSync } from "@/components/app/SupabaseSync";
import { getLesson } from "@/content/lessons";
import { getLegalDoc, LEGAL_UPDATED } from "@/content/legal";
import { PreviewRouter } from "./router";
import { AdminGate } from "@/components/admin/AdminGate";
import { MaintenanceGate } from "@/components/app/Maintenance";

// Anteprima a file unico di SqueakEdit: le stesse pagine e componenti
// dell'app, con un router in memoria al posto delle rotte di Next.js.

const APP_PAGES: Record<string, () => React.ReactNode> = {
  "/learn": () => <LearnPage />,
  "/quests": () => <QuestsPage />,
  // in Next /goals reindirizza alle quest con la scheda Obiettivi
  "/goals": () => <QuestsPage />,
  "/practice": () => <PracticePage />,
  "/friends": () => <FriendsPage />,
  "/pricing": () => <PricingPage />,
  "/ai": () => <AiPage />,
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

function LegalPreview({ slug }: { slug: string }) {
  const doc = getLegalDoc(slug);
  if (!doc) return <LandingPage />;
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-black md:text-4xl">{doc.title}</h1>
        <p className="mb-8 text-sm text-ink-mute">Ultimo aggiornamento: {LEGAL_UPDATED}</p>
        <div className="text-ink-dim">
          <Markdown text={doc.body} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function render(fullPath: string) {
  const path = fullPath.split("?")[0];
  if (path.startsWith("/lesson/")) {
    const id = path.slice("/lesson/".length);
    return getLesson(id) ? <LessonPlayer key={id} lessonId={id} /> : <LandingPage />;
  }
  if (path.startsWith("/unit-test/")) {
    const id = path.slice("/unit-test/".length);
    return <LessonPlayer key={id} unitTestId={id} />;
  }
  if (path.startsWith("/legal/")) return <LegalPreview slug={path.slice("/legal/".length)} />;
  // il layout dell'app resta montato tra le schede (come in Next): cambia solo la pagina
  if (APP_PAGES[path]) return <AppLayout>{<div key={path}>{APP_PAGES[path]()}</div>}</AppLayout>;
  return (SITE_PAGES[path] ?? SITE_PAGES["/"])();
}

createRoot(document.getElementById("root")!).render(
  <PreviewRouter>
    {(path) => (
      <>
        <SupabaseSync />
        <MaintenanceGate />
        <AdminGate />
        <div key={APP_PAGES[path.split("?")[0]] ? "app" : path}>{render(path)}</div>
      </>
    )}
  </PreviewRouter>,
);
