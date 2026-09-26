import React, { useRef, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { AppSidebar } from '../components/layout/AppSidebar';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { LegacyHashRedirect } from './LegacyHashRedirect';
import { useActiveTool } from './useActiveTool';

export const RootLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeTool = useActiveTool();
  const { pathname } = useLocation();

  // A transição de entrada só vale depois da primeira navegação. No carregamento
  // inicial ela atrasaria a primeira pintura, e a classe no primeiro render do
  // navegador divergiria do HTML pré-renderizado, quebrando a hidratação.
  const initialPath = useRef(pathname);
  const hasNavigated = useRef(false);
  if (pathname !== initialPath.current) hasNavigated.current = true;

  return (
    <div className="min-h-screen bg-bg text-slate-100 flex flex-row selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Sobe ao topo a cada navegação e devolve a posição ao voltar pelo histórico. */}
      <ScrollRestoration />

      {/* Desvia os endereços com fragmento da versão anterior do site. */}
      <LegacyHashRedirect />

      <div className="hidden md:block">
        <AppSidebar
          activeTool={activeTool}
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
              activeTool={activeTool}
              isCollapsed={false}
              setIsCollapsed={() => setIsMobileMenuOpen(false)}
              onAfterAction={() => setIsMobileMenuOpen(false)}
              // A sidebar do desktop continua no DOM, só escondida por CSS: sem
              // prefixo, abrir o drawer duplicaria todos os id da página.
              idPrefix="mobile-"
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {/* A chave remonta o invólucro a cada rota, e é isso que dispara a animação
              de novo. O estado dos formulários vive no FormStateProvider, acima daqui. */}
          <div key={pathname} className={hasNavigated.current ? 'page-enter' : undefined}>
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};
