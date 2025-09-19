import React from "react";
import { Outlet } from "react-router-dom";
import HeroNavigation from "@/components/HeroNavigation";
import Footer from "@/components/Footer";
import EnhancedLiveChat from "@/components/EnhancedLiveChat";

const SiteLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top nav (sticky inside) */}
      <HeroNavigation />

      {/* Push content below sticky header (adjust if header height changes) */}
      <main className="flex-grow pt-4">
        <Outlet />
      </main>

      {/* Bottom footer */}
      <Footer />
      
      {/* AI Chat */}
      <EnhancedLiveChat />
    </div>
  );
};

export default SiteLayout;
