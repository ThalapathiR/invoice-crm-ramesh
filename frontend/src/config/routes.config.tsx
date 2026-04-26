import { lazy } from "react";

// Lazy-loaded components
export const Home = lazy(() => import("@/pages/public/Home"));
export const Login = lazy(() => import("@/pages/auth/Login"));
export const Signup = lazy(() => import("@/pages/auth/Signup"));
export const VerifyEmail = lazy(() => import("@/pages/auth/VerifyEmail"));
export const ForgotPassword = lazy(() => import("@/pages/auth/forgetpassword"));
export const ResetPassword = lazy(() => import("@/pages/auth/resetpassword"));

export const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
export const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
export const AdminUserForm = lazy(() => import("@/pages/admin/AdminUserForm"));
export const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
export const AdminAuditLog = lazy(() => import("@/pages/admin/AdminAuditLog"));
export const AdminErrorLog = lazy(() => import("@/pages/admin/AdminErrorLog"));
export const AdminCustomersPage = lazy(() => import("@/pages/admin/AdminCustomersPage"));

export const POSPage = lazy(() => import("@/pages/pos/POSPage"));
export const ProductsPage = lazy(() => import("@/pages/products/ProductsPage"));
export const CustomersPage = lazy(() => import("@/pages/customers/CustomersPage"));
export const InventoryPage = lazy(() => import("@/pages/inventory/InventoryPage"));
export const ReportsPage = lazy(() => import("@/pages/reports/ReportsPage"));
export const BusinessDashboard = lazy(() => import("@/pages/BusinessDashboard"));
export const InvoicesPage = lazy(() => import("@/pages/invoices/InvoicesPage"));
export const CategoriesPage = lazy(() => import("@/pages/inventory/CategoriesPage"));
export const SizesPage = lazy(() => import("@/pages/inventory/SizesPage"));
export const BankAccountsPage = lazy(() => import("@/pages/masters/BankAccountsPage"));
export const ExpenseCategoriesPage = lazy(() => import("@/pages/masters/ExpenseCategoriesPage"));
export const ExpensesPage = lazy(() => import("@/pages/pos/ExpensesPage"));
export const CustomerLedgerPage = lazy(() => import("@/pages/pos/CustomerLedgerPage"));

export const BillProfitPage = lazy(() => import("@/pages/reports/BillProfitPage"));
export const BusinessPNLPage = lazy(() => import("@/pages/reports/BusinessPNLPage"));
export const ItemProfitPage = lazy(() => import("@/pages/reports/ItemProfitPage"));
export const StockSummaryPage = lazy(() => import("@/pages/reports/StockSummaryPage"));
export const LowStockPage = lazy(() => import("@/pages/reports/LowStockPage"));
export const CategoryReportPage = lazy(() => import("@/pages/reports/CategoryReportPage"));
export const BatchReportPage = lazy(() => import("@/pages/reports/BatchReportPage"));
export const SerialReportPage = lazy(() => import("@/pages/reports/SerialReportPage"));

export const Settings = lazy(() => import("@/pages/Settings"));
export const UserRolesPage = lazy(() => import("@/pages/inventory/UserRolesPage"));
export const EmployeeManagementPage = lazy(() => import("@/pages/settings/EmployeeManagementPage"));
