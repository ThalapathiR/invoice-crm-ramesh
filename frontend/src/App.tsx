import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth";
import { BrandingProvider } from "@/lib/branding";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { LoadingProvider } from "@/context/LoadingContext";

import { Suspense, Component, ErrorInfo, ReactNode } from "react";
import { LazyMotion, domMax } from "framer-motion";
import { CommonService } from "@/service/commonservice.page";

import * as Routes from "@/config/routes.config";
import { 
  AppRoute, 
  PublicRoute, 
  AdminRoute, 
  SuperAdminRoute, 
  SuspenseLoader
} from "@/components/routing/RouteGuards";

import { GoogleOAuthProvider } from "@react-oauth/google";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical Application Error:", error, errorInfo);
    // Auto-rescue to login if it looks like a routing error
    if (error.message.includes("parameter name") || error.message.includes("wouter")) {
      console.warn("Routing crash detected, auto-redirecting to /login...");
      window.location.replace("/login");
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground">The application encountered a routing error.</p>
            <button 
              onClick={() => window.location.replace("/login")}
              className="px-6 py-2 bg-primary text-white rounded-full font-bold"
            >
              Return to Login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function DashboardWrapper() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <SuspenseLoader />;
  const normalizedRole = user?.role?.toLowerCase()?.replace(/\s+/g, '_') || "";
  if (normalizedRole === "super_admin") return <Redirect to="/admin" />;
  return <AppRoute component={Routes.BusinessDashboard} />;
}

function Router() {
  return (
    <Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route path="/">
          <Redirect to="/login" />
        </Route>
        <Route path="/login" component={Routes.Login} />
        <Route path="/signup" component={Routes.Signup} />
        <Route path="/verifyemail" component={Routes.VerifyEmail} />
        <Route path="/forgotpassword" component={Routes.ForgotPassword} />
        <Route path="/resetpassword/:uid" component={Routes.ResetPassword} />

        {/* Dashboard / App Home */}
        <Route path="/dashboard" component={DashboardWrapper} />

        {/* Admin Routes */}
        <Route path="/admin">
          <AdminRoute component={Routes.AdminDashboard} />
        </Route>
        <Route path="/admin/users">
          <AdminRoute component={Routes.AdminUsers} />
        </Route>
        <Route path="/admin/user/:uid">
          <AdminRoute component={Routes.AdminUserForm} />
        </Route>
        <Route path="/admin/customers">
          <SuperAdminRoute component={Routes.AdminCustomersPage} />
        </Route>
        <Route path="/admin/auditlogs">
          <SuperAdminRoute component={Routes.AdminAuditLog} />
        </Route>
        <Route path="/admin/errorlogs">
          <SuperAdminRoute component={Routes.AdminErrorLog} />
        </Route>
        <Route path="/admin/settings">
          <SuperAdminRoute component={Routes.AdminSettings} />
        </Route>

        {/* User Settings */}
        <Route path="/settings">
          <AppRoute component={Routes.Settings} />
        </Route>
        
        <Route path="/settings/employees">
          <AppRoute component={Routes.EmployeeManagementPage} />
        </Route>

        {/* Help & Support */}
        <Route path="/help">
          <AppRoute component={() => <div className="p-8">Help Center Coming Soon</div>} />
        </Route>

        {/* POS & Billing Routes */}
        <Route path="/pos">
          <AppRoute component={Routes.POSPage} />
        </Route>
        <Route path="/products">
          <AppRoute component={Routes.ProductsPage} />
        </Route>
        <Route path="/customers">
          <AppRoute component={Routes.CustomersPage} />
        </Route>
        <Route path="/inventory">
          <AppRoute component={Routes.InventoryPage} />
        </Route>
        <Route path="/reports">
          <AppRoute component={Routes.ReportsPage} />
        </Route>
        <Route path="/invoices">
          <AppRoute component={Routes.InvoicesPage} />
        </Route>
        <Route path="/categories">
          <AppRoute component={Routes.CategoriesPage} />
        </Route>
        <Route path="/sizes">
          <AppRoute component={Routes.SizesPage} />
        </Route>
        <Route path="/masters/banks">
          <AppRoute component={Routes.BankAccountsPage} />
        </Route>
        <Route path="/masters/roles">
          <AppRoute component={Routes.UserRolesPage} />
        </Route>
        <Route path="/masters/expense-categories">
          <AppRoute component={Routes.ExpenseCategoriesPage} />
        </Route>
        <Route path="/pos/expenses">
          <AppRoute component={Routes.ExpensesPage} />
        </Route>
        <Route path="/pos/ledger">
          <AppRoute component={Routes.CustomerLedgerPage} />
        </Route>
        <Route path="/reports/bill-profit">
          <AppRoute component={Routes.BillProfitPage} />
        </Route>
        <Route path="/reports/pnl">
          <AppRoute component={Routes.BusinessPNLPage} />
        </Route>
        <Route path="/reports/item-profit">
          <AppRoute component={Routes.ItemProfitPage} />
        </Route>
        <Route path="/reports/stock-summary">
          <AppRoute component={Routes.StockSummaryPage} />
        </Route>
        <Route path="/reports/low-stock">
          <AppRoute component={Routes.LowStockPage} />
        </Route>
        <Route path="/reports/category">
          <AppRoute component={Routes.CategoryReportPage} />
        </Route>
        <Route path="/reports/batch">
          <AppRoute component={Routes.BatchReportPage} />
        </Route>
        <Route path="/reports/serial">
          <AppRoute component={Routes.SerialReportPage} />
        </Route>

        {/* Catch-all */}
        <Route path="*">
           <Redirect to="/" />
        </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  const finalClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "missing-client-id";

  return (
    <GoogleOAuthProvider clientId={finalClientId}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrandingProvider>
              <LoadingProvider>
                <TooltipProvider>
                    <Toaster />
                    <ErrorBoundary>
                      <LazyMotion features={domMax}>
                        <Router />
                      </LazyMotion>
                    </ErrorBoundary>
                </TooltipProvider>
              </LoadingProvider>
            </BrandingProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
