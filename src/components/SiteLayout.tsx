import React from "react";
import { Outlet } from "react-router-dom";
import HeroNavigation from "@/components/HeroNavigation";
import Footer from "@/components/Footer";

const SiteLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top nav (sticky inside) */}
      <HeroNavigation />

      {/* Push content below sticky header (adjust if header height changes) */}
      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      {/* Bottom footer */}
      <Footer />
    </div>
  );
};

export default SiteLayout;
