import { Outlet, Link, useLocation } from 'react-router';
import { Sparkles } from 'lucide-react';

export default function Root() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Nav */}
      <header className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-8 ${isHome ? 'bg-transparent' : 'bg-background border-b border-border'}`}>
        <Link to="/" className={`flex items-center gap-2 ${isHome ? 'text-white' : 'text-foreground'}`}>
          <Sparkles className="size-5" />
          <span className="tracking-tight">AI Stylist</span>
        </Link>
      </header>

      {/* Page content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
