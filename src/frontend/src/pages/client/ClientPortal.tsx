import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { CreditCard, LogOut, Menu, User, Users, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useCallerUserProfile } from "../../hooks/useQueries";
import { AddStudentsPage } from "./AddStudentsPage";
import { ClientDashboard } from "./ClientDashboard";
import { NewOrderForm } from "./NewOrderForm";
import { OrderDetailPage } from "./OrderDetailPage";
import { ProfileSetupModal } from "./ProfileSetupModal";
import { ViewRecordsPage } from "./ViewRecordsPage";

type ClientPage =
  | { type: "dashboard" }
  | { type: "new-order" }
  | { type: "order-detail"; orderId: bigint }
  | { type: "add-students"; orderId: bigint }
  | { type: "view-records" };

export function ClientPortal() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useCallerUserProfile();
  const [currentPage, setCurrentPage] = useState<ClientPage>({
    type: "dashboard",
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showProfileSetup =
    !!identity && !profileLoading && profileFetched && userProfile === null;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const renderPage = () => {
    switch (currentPage.type) {
      case "dashboard":
        return (
          <ClientDashboard
            userProfile={userProfile ?? null}
            onNewOrder={() => setCurrentPage({ type: "new-order" })}
            onViewOrder={(id) =>
              setCurrentPage({ type: "order-detail", orderId: id })
            }
          />
        );
      case "new-order":
        return (
          <NewOrderForm
            onSuccess={(id) => {
              setCurrentPage({ type: "add-students", orderId: id });
            }}
            onCancel={() => setCurrentPage({ type: "dashboard" })}
          />
        );
      case "order-detail":
        return (
          <OrderDetailPage
            orderId={currentPage.orderId}
            onBack={() => setCurrentPage({ type: "dashboard" })}
            onAddStudents={(id) =>
              setCurrentPage({ type: "add-students", orderId: id })
            }
          />
        );
      case "add-students":
        return (
          <AddStudentsPage
            orderId={currentPage.orderId}
            onBack={() =>
              setCurrentPage({
                type: "order-detail",
                orderId: currentPage.orderId,
              })
            }
            onDone={() =>
              setCurrentPage({
                type: "order-detail",
                orderId: currentPage.orderId,
              })
            }
          />
        );
      case "view-records":
        return <ViewRecordsPage />;
      default:
        return null;
    }
  };

  const displayName =
    userProfile?.name ??
    (identity ? `${identity.getPrincipal().toString().slice(0, 8)}…` : "User");

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />

      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <>
          {/* Mobile toggle */}
          <button
            type="button"
            className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-sidebar text-sidebar-foreground shadow-elevated"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Mobile overlay */}
          {mobileMenuOpen && (
            <div
              role="button"
              tabIndex={0}
              className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              onKeyDown={(e) => e.key === "Escape" && setMobileMenuOpen(false)}
              aria-label="Close menu"
            />
          )}

          {/* Sidebar content */}
          {[true, false].map((isDesktop) => (
            <aside
              key={isDesktop ? "desktop" : "mobile"}
              className={cn(
                "bg-sidebar sidebar-glow flex flex-col",
                isDesktop
                  ? "hidden lg:flex w-64 fixed inset-y-0 left-0 z-20"
                  : cn(
                      "fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-200 lg:hidden",
                      mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
                    ),
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
                <img
                  src="/assets/uploads/kakatiya-uniforms-logo-2--1.png"
                  alt="KAKATIYA ID CARDS"
                  className="h-10 w-10 rounded-lg object-contain bg-white p-0.5 flex-shrink-0"
                />
                <div>
                  <p className="font-display font-bold text-sidebar-foreground text-sm leading-tight">
                    KAKATIYA ID CARDS
                  </p>
                  <p className="text-xs text-sidebar-foreground/50 font-body">
                    Client Portal
                  </p>
                </div>
              </div>

              {/* Nav */}
              <nav className="flex-1 px-3 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-3">
                  Navigation
                </p>
                <button
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    currentPage.type === "dashboard"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                  onClick={() => {
                    setCurrentPage({ type: "dashboard" });
                    setMobileMenuOpen(false);
                  }}
                >
                  <CreditCard className="h-5 w-5 text-sidebar-primary" />
                  My Orders
                </button>
                <button
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    currentPage.type === "view-records"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                  onClick={() => {
                    setCurrentPage({ type: "view-records" });
                    setMobileMenuOpen(false);
                  }}
                >
                  <Users className="h-5 w-5 text-sidebar-primary" />
                  View Records
                </button>
              </nav>

              {/* Footer */}
              <div className="border-t border-sidebar-border p-4 space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-sidebar-accent-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-sidebar-foreground truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-sidebar-foreground/40">
                      Client Account
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
            </aside>
          ))}
        </>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
            {renderPage()}
          </div>
          <footer className="mt-12 px-4 sm:px-6 lg:px-8 py-6 border-t border-border/50">
            <p className="text-xs text-center text-muted-foreground/60">
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-muted-foreground underline underline-offset-2 transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
