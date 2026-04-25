import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NewInvoice from "./pages/NewInvoice";
import InvoiceDetail from "./pages/InvoiceDetail";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import { useAuth } from "./_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin w-8 h-8 text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = `/login?redirect=${encodeURIComponent(location)}`;
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/signup"} component={Signup} />
      <Route path={"/dashboard"} component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path={"/invoices/new"} component={() => <ProtectedRoute component={NewInvoice} />} />
      <Route path={"/invoices/:id"} component={() => <ProtectedRoute component={InvoiceDetail} />} />
      <Route path={"/settings"} component={() => <ProtectedRoute component={Settings} />} />
      <Route path={"/billing"} component={() => <ProtectedRoute component={Billing} />} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
