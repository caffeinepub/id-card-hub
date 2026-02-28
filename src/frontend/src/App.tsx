import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import { AppSidebar } from "./components/AppSidebar";
import { useActor } from "./hooks/useActor";
import { CardTypesPage } from "./pages/CardTypesPage";
import { CustomersPage } from "./pages/CustomersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OrdersPage } from "./pages/OrdersPage";

type Page = "dashboard" | "orders" | "customers" | "card-types";

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

function AppContent() {
  const { actor, isFetching } = useActor();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const seedInitialized = useRef(false);

  // Initialize seed data once on first load
  useEffect(() => {
    if (actor && !isFetching && !seedInitialized.current) {
      seedInitialized.current = true;
      actor.initializeSeedData().catch(() => {
        // Ignore errors — seed may already be initialized
      });
    }
  }, [actor, isFetching]);

  if (isFetching) {
    return <LoadingScreen />;
  }

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
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page as Page)}
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

export default function App() {
  return <AppContent />;
}
