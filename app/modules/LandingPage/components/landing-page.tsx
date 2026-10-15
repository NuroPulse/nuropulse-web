import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { Dashboard } from "./dashboard";
import { FeaturesCta } from "./features-cta";
import { Hero } from "./hero";
import { Works } from "./works";

export function LandingPage() {
  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-surface text-ink-muted">
      <SiteHeader />
      <main>
        <Hero />
        <Dashboard />
        <Works />
        <FeaturesCta />
      </main>
      <SiteFooter />
    </div>
  );
}
