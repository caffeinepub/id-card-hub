import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import { AppSidebar } from "./components/AppSidebar";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin } from "./hooks/useQueries";
import { AdminClientOrdersPage } from "./pages/AdminClientOrdersPage";
import { CardTypesPage } from "./pages/CardTypesPage";
import { CustomersPage } from "./pages/CustomersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ClientPortal } from "./pages/client/ClientPortal";
import { LandingPage } from "./pages/client/LandingPage";

type AdminPage =
  | "dashboard"
  | "orders"
  | "customers"
  | "card-types"
  | "client-orders";

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="space-y-4 w-64">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <p className="text-xs text-center text-muted-foreground animate-pulse">
          Connecting to blockchain…
        </p>
      </div>
    </div>
  );
}

function AdminApp() {
  const { actor, isFetching } = useActor();
  const [currentPage, setCurrentPage] = useState<AdminPage>("dashboard");
  const seedInitialized = useRef(false);

  // Initialize seed data once on first load
  useEffect(() => {
    if (actor && !isFetching && !seedInitialized.current) {
      seedInitialized.current = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (actor as any).initializeSeedData?.().catch(() => {
        // Ignore errors — seed may already be initialized
      });
    }
  }, [actor, isFetching]);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "orders":
        return <OrdersPage />;
      case "customers":
        return <CustomersPage />;
      case "card-types":
        return <CardTypesPage />;
      case "client-orders":
        return <AdminClientOrdersPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page as AdminPage)}
        showClientOrders
      />
      {/* Main content area */}
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
          {renderPage()}
        </div>
        {/* Footer */}
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
      <Toaster richColors position="top-right" />
    </div>
  );
}

function AppContent() {
  const { isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsAdmin();

  // Show loading while actor or identity is initializing
  if (actorFetching || isInitializing) {
    return <LoadingScreen />;
  }

  // Not logged in — show landing page
  if (!identity) {
    return (
      <>
        <LandingPage />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  // Still checking admin status
  if (adminCheckLoading) {
    return <LoadingScreen />;
  }

  // Admin
  if (isAdmin) {
    return <AdminApp />;
  }

  // Client (regular user)
  return (
    <>
      <ClientPortal />
      <Toaster richColors position="top-right" />
    </>
  );
}

export default function App() {
  return <AppContent />;
}
