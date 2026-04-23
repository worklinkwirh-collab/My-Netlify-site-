import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Bitcoin,
  Landmark,
  PiggyBank,
  BarChart3,
  CreditCard,
  MessageSquare,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const userNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transfer', label: 'Transfer', icon: ArrowLeftRight },
  { path: '/crypto', label: 'Crypto', icon: Bitcoin },
  { path: '/loans', label: 'Loans', icon: Landmark },
  { path: '/savings', label: 'Savings', icon: PiggyBank },
  { path: '/portfolio', label: 'Portfolio', icon: BarChart3 },
  { path: '/cards', label: 'Cards', icon: CreditCard },
  { path: '/chat-support', label: 'Support', icon: MessageSquare },
];

const adminNavItems = [
  { path: '/admin', label: 'Admin Panel', icon: Shield },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, isAdmin } = useAuth();
  const location = useLocation();

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <div className="min-h-screen bg-[#EDF2FB] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#001233] text-white flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#3A86FF]" />
            <div className="text-lg tracking-wider">
              <span className="font-bold">ATLAS</span>
              <span className="font-light ml-1">LEDGER</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#3A86FF]/20 text-[#3A86FF] border-l-2 border-[#3A86FF]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#DEE2E6] flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#5C677D] hover:text-[#001845]"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden md:flex items-center gap-2 text-xs text-[#5C677D]">
              <div className="w-2 h-2 rounded-full bg-[#2A9D8F]" />
              <span>System Online</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
