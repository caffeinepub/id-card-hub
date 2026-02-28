import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const baseNavItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Dashboard",
    href: "#dashboard",
  },
  {
    icon: <ClipboardList className="h-5 w-5" />,
    label: "Orders",
    href: "#orders",
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: "Customers",
    href: "#customers",
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    label: "Card Types",
    href: "#card-types",
  },
];

const clientOrdersItem: NavItem = {
  icon: <Building2 className="h-5 w-5" />,
  label: "Client Orders",
  href: "#client-orders",
};

interface AppSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  showClientOrders?: boolean;
}

export function AppSidebar({
  currentPage,
  onNavigate,
  showClientOrders = false,
}: AppSidebarProps) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggedIn = !!identity;

  const navItems = showClientOrders
    ? [...baseNavItems, clientOrdersItem]
    : baseNavItems;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
        <img
          src="/assets/uploads/kakatiya-uniforms-logo-2--1.png"
          alt="KAKATIYA ID CARDS Logo"
          className="h-10 w-10 rounded-lg object-contain bg-white p-0.5 flex-shrink-0"
        />
        <div>
          <p className="font-display font-bold text-sidebar-foreground text-sm leading-tight">
            KAKATIYA ID CARDS
          </p>
          <p className="text-xs text-sidebar-foreground/50 font-body">
            Manufacturing Manager
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-3">
          Navigation
        </p>
        {navItems.map((item) => {
          const page = item.href.replace("#", "");
          const isActive = currentPage === page;
          return (
            <button
              type="button"
              key={item.href}
              onClick={() => {
                onNavigate(page);
                setMobileOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 transition-colors",
                  isActive
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-primary",
                )}
              >
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && (
                <ChevronRight className="h-3.5 w-3.5 text-sidebar-primary" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Auth */}
      <div className="border-t border-sidebar-border p-4">
        {isLoggedIn ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-sidebar-accent-foreground">
                  {identity
                    ?.getPrincipal()
                    .toString()
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  Admin
                </p>
                <p className="text-xs text-sidebar-foreground/40 truncate">
                  {identity?.getPrincipal().toString().slice(0, 12)}...
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={login}
            disabled={isLoggingIn}
          >
            <LogIn className="h-4 w-4" />
            {isLoggingIn ? "Signing in..." : "Sign in"}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-sidebar text-sidebar-foreground shadow-elevated"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar sidebar-glow transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-sidebar sidebar-glow fixed inset-y-0 left-0 z-20">
        <SidebarContent />
      </aside>
    </>
  );
}
