import { createRoot } from "react-dom/client";
import AppLayout from "@/app/(app)/layout";
import AiPage from "@/app/(app)/ai/page";
import FriendsPage from "@/app/(app)/friends/page";
import GoalsPage from "@/app/(app)/goals/page";
import LearnPage from "@/app/(app)/learn/page";
import PricingPage from "@/app/(app)/pricing/page";
import QuestsPage from "@/app/(app)/quests/page";
import DownloadPage from "@/app/download/page";
import LoginPage from "@/app/login/page";
import LandingPage from "@/app/page";
import ResetPasswordPage from "@/app/reset-password/page";
import SignupPage from "@/app/signup/page";
import { Markdown } from "@/components/ai/Markdown";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { SupabaseSync } from "@/components/app/SupabaseSync";
import { getLesson } from "@/content/lessons";
import { getLegalDoc, LEGAL_UPDATED } from "@/content/legal";
import { PreviewRouter } from "./router";

// Anteprima a file unico di SqueakEdit: le stesse pagine e componenti
// dell'app, con un router in memoria al posto delle rotte di Next.js.

const APP_PAGES: Record<string, () => React.ReactNode> = {
  "/learn": () => <LearnPage />,
  "/quests": () => <QuestsPage />,
  "/goals": () => <GoalsPage />,
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
  if (path.startsWith("/legal/")) return <LegalPreview slug={path.slice("/legal/".length)} />;
  if (APP_PAGES[path]) return <AppLayout>{APP_PAGES[path]()}</AppLayout>;
  return (SITE_PAGES[path] ?? SITE_PAGES["/"])();
}

createRoot(document.getElementById("root")!).render(
  <PreviewRouter>
    {(path) => (
      <>
        <SupabaseSync />
        <div key={path}>{render(path)}</div>
      </>
    )}
  </PreviewRouter>,
);
