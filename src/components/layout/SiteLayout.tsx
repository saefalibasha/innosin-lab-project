
import React from 'react';
import { Outlet } from 'react-router-dom';
import HeroNavigation from '../navigation/HeroNavigation';
import EnhancedLiveChat from '../EnhancedLiveChat';

const SiteLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroNavigation />
      <main className="pt-0">
        <Outlet />
      </main>
      <EnhancedLiveChat />
    </div>
  );
};

export default SiteLayout;
