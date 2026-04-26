import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Settings, ChevronLeft,
  ChevronRight,
  LogOut,
  ArrowLeft,
  CreditCard,
  Layers, ClipboardList, AlertCircle, ScrollText
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CommonService } from "@/service/commonservice.page";
import { useAuth } from "@/lib/auth";

import { useBranding } from "@/lib/branding";

export const allAdminNavigation = [
  { name: "Platform Overview", href: "/admin", icon: LayoutDashboard },
  { name: "All Users", href: "/admin/users", icon: Users },
  { name: "Audit Logs", href: "/admin/auditlogs", icon: ClipboardList, superAdminOnly: true },
  { name: "Error Logs", href: "/admin/errorlogs", icon: AlertCircle, superAdminOnly: true },
  { name: "System Settings", href: "/admin/settings", icon: Settings, superAdminOnly: true },
];

export const getAdminNavSections = (nav: any[]) => [
  {
    label: "Management",
    items: nav.filter(item => ["Platform Overview", "All Users"].includes(item.name))
  },
  {
    label: "System",
    items: nav.filter(item => ["System Settings", "Audit Logs", "Error Logs"].includes(item.name))
  }
];

export const NavItem = ({ item, isActive, isCollapsed = false, isMobile = false }: { item: any; isActive: boolean; isCollapsed?: boolean; isMobile?: boolean }) => (
  <Link
    href={item.href}
    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
    className={cn(
      "group flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 relative overflow-hidden",
      isActive
        ? "bg-[#31203d] text-[#E04FB2]"
        : "text-white/60 hover:bg-[#252541] hover:text-white",
      isCollapsed ? "justify-center" : "",
      isMobile ? "py-3 px-4" : ""
    )}
  >
    {isActive && (
      <motion.div
        layoutId="active-nav-pill"
        className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl"
        initial={false}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
      />
    )}

    <item.icon
      className={cn(
        "shrink-0 transition-all z-10",
        isActive
          ? "text-[#E04FB2] scale-110 drop-shadow-[0_0_8px_rgba(150,100,250,0.5)]"
          : "text-white/40 group-hover:text-white group-hover:scale-110",
        isCollapsed ? "h-6 w-6" : "mr-3 h-4 w-4",
        isMobile ? "h-5 w-5 mr-4" : ""
      )}
    />
    {(!isCollapsed || isMobile) && (
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
        className="whitespace-nowrap capitalize"
      >
        {item.name}
      </motion.span>
    )}
  </Link>
);

export function AdminSidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { settings } = useBranding();
  const { user, logout } = useAuth();
  const navSections = getAdminNavSections(allAdminNavigation);

  const handleLogout = async () => {
    try {
      await CommonService.CommonPost({}, "/auth/logout");
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      await logout();
      window.location.href = "/login";
    }
  };

  const filteredSections = navSections.map(section => ({
    ...section,
    items: section.items.filter((item) => {
      if (user?.role === "super_admin") return true;
      return !item.superAdminOnly;
    })
  })).filter(section => section.items.length > 0);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        className="flex h-screen flex-col bg-[linear-gradient(180deg,#2a1e38,#291e38,#281d37,#271d37,#261d36,#251d35,#231c34,#1d1b2f,#1a1a2e)] backdrop-blur-xl pt-6 pb-4 relative transition-all duration-300 ease-in-out z-50"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 h-6 w-6 rounded-full border border-[#f0e8e2] dark:border-[#f0e8e2] bg-white/80 dark:bg-black/60 shadow-lg shadow-black/10 hover:bg-white dark:hover:bg-black z-50 backdrop-blur-md text-muted-foreground"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        <div className={cn("px-6 pb-6 flex items-center gap-3", isCollapsed && "px-4 justify-center")}>
          <div className="h-10 w-10 flex items-center justify-center shrink-0 bg-primary/10 rounded-xl text-primary">
            <ScrollText className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent font-display whitespace-nowrap">
                Admin Portal
              </h1>
            </motion.div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 scrollbar-none pb-20">
          {filteredSections.map((section, idx) => (
            <div key={section.label} className={cn("mb-6", idx === 0 ? "" : "mt-8")}>
              {!isCollapsed && (
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-3 mb-3 text-[15px]  font-black text-white/60"
                >
                  {section.label}
                </motion.h2>
              )}
              {isCollapsed && idx !== 0 && (
                <div className="mx-4 my-4 h-px bg-linear-to-r from-transparent via-white/40 to-transparent" />
              )}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
                  return isCollapsed ? (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <div>
                          <NavItem item={item} isActive={isActive} isCollapsed={isCollapsed} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-[#f0e8e2] dark:border-[#f0e8e2] text-foreground">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <NavItem key={item.name} item={item} isActive={isActive} isCollapsed={isCollapsed} />
                  );
                })}
              </nav>
            </div>
          ))}

          <div className="my-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <Link
            href="/dashboard"
            className="group flex items-center rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-300 bg-blue-500/10 dark:bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20"
          >
            <ArrowLeft
              className={cn(
                "shrink-0 text-blue-400 group-hover:text-white transition-colors",
                isCollapsed ? "h-6 w-6" : "mr-3 h-5 w-5"
              )}
            />

            {!isCollapsed && (
              <span className="font-semibold tracking-wide">
                Back to App
              </span>
            )}
          </Link>
          <button
            onClick={() => setShowLogoutDialog(true)}
            data-testid="button-logout"
            className="w-full mt-5 group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className={cn("shrink-0 text-muted-foreground group-hover:text-destructive", isCollapsed ? "h-6 w-6" : "mr-3 h-6 w-6")} />
            {!isCollapsed && <span className="font-semibold tracking-wide">Logout</span>}
          </button>
        </div>
      </motion.div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged out of the admin portal and redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
