import React, { useState } from 'react';
import { AppSidebar } from '../components/layout/AppSidebar';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import type { ToolId } from '../config/tools.data';

interface RootLayoutProps {
  activeTab: ToolId;
  onSelectTool: (toolId: ToolId) => void;
  children: React.ReactNode;
}

export const RootLayout: React.FC<RootLayoutProps> = ({ activeTab, onSelectTool, children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0d12] text-slate-100 flex flex-row selection:bg-emerald-500/30 selection:text-emerald-300">
      <div className="hidden md:block">
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={onSelectTool}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 h-full">
            <AppSidebar
              activeTab={activeTab}
              setActiveTab={onSelectTool}
              isCollapsed={false}
              setIsCollapsed={() => setIsMobileMenuOpen(false)}
              onAfterAction={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {children}
        </main>

        <Footer onSelectTool={onSelectTool} />
      </div>
    </div>
  );
};
