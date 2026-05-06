import {
  LayoutDashboard,
  Settings,
  ScrollText,
  ShoppingCart,
  Shirt,
  Users,
  Warehouse,
  PieChart,
  Layers,
  Ruler,
  TrendingUp,
  AlertTriangle,
  Hash,
  Box,
  Building2,
  Receipt,
  Wallet,
  CreditCard,
  ShieldCheck,
  UserCog
} from "lucide-react";

export const allNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "view_dashboard" },
  { name: "POS Terminal", href: "/pos", icon: ShoppingCart, permission: "access_pos" },
  { name: "Products", href: "/products", icon: Shirt, permission: "access_pos" }, // Assuming POS access implies product viewing
  { name: "Categories", href: "/categories", icon: Layers, permission: "access_pos" },
  { name: "Sizes", href: "/sizes", icon: Ruler, permission: "access_pos" },
  { name: "Bank Accounts", href: "/masters/banks", icon: Building2, permission: "view_analytics" },
  { name: "Expense Master", href: "/masters/expense-categories", icon: Layers, permission: "view_pnl" },
  { name: "Expenses", href: "/pos/expenses", icon: Receipt, permission: "view_pnl" },
  { name: "Customer Khata", href: "/pos/ledger", icon: Wallet, permission: "access_pos" },
  { name: "Customers", href: "/customers", icon: Users, permission: "access_pos" },
  { name: "Inventory", href: "/inventory", icon: Warehouse, permission: "view_analytics" },
  { name: "Bill Profit", href: "/reports/bill-profit", icon: ScrollText, permission: "view_analytics" },
  { name: "Business P&L", href: "/reports/pnl", icon: PieChart, permission: "view_pnl" },
  { name: "Item Performance", href: "/reports/item-profit", icon: TrendingUp, permission: "view_analytics" },
  { name: "Stock Valuation", href: "/reports/stock-summary", icon: Warehouse, permission: "view_analytics" },
  { name: "Low Stock", href: "/reports/low-stock", icon: AlertTriangle, permission: "view_analytics" },
  { name: "Category Report", href: "/reports/category", icon: Layers, permission: "view_analytics" },
  { name: "Batch Tracking", href: "/reports/batch", icon: Box, permission: "view_analytics" },
  { name: "Serial Tracking", href: "/reports/serial", icon: Hash, permission: "view_analytics" },
  { name: "Invoice Center", href: "/invoices", icon: ScrollText, permission: "access_pos" },
  { name: "User Roles", href: "/masters/roles", icon: ShieldCheck, roles: ["tenant", "super_admin"] },
  { name: "Employee Management", href: "/settings/employees", icon: UserCog, roles: ["tenant", "super_admin"] },
  { name: "Global Customers", href: "/admin/customers", icon: Users, roles: ["super_admin"] },
];

export const allBottomNav = [
  { name: "Settings", href: "/settings", icon: Settings },
];
