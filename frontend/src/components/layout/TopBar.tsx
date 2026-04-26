import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Bell, Search, User, Sun, Moon, Laptop, LogOut, Settings, LayoutDashboard,
  Users, Wrench, BarChart, CreditCard,
  ShieldAlert, Database, Activity, Menu, ArrowLeft, Crown, ScrollText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getNavSections,
  NavItem
} from "./Sidebar";
import { allNavigation, allBottomNav } from "@/config/navigation";
import {
  allAdminNavigation,
  getAdminNavSections,
  NavItem as AdminNavItem
} from "./AdminSidebar";
import { useBranding } from "@/lib/branding";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth";
import { CommonService } from "@/service/commonservice.page";
import { useLocation, Link } from "wouter";

/** Safely converts any value to a renderable string. Prevents crashes when API returns objects instead of strings. */
const toStr = (val: any): string => {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    // Handle {answer, question} pattern from KB
    if (val.answer) return String(val.answer);
    if (val.question) return String(val.question);
    if (val.text) return String(val.text);
    if (val.content) return String(val.content);
    return JSON.stringify(val);
  }
  return String(val);
};

export function TopBar({ isAdmin = false }: { isAdmin?: boolean }) {
  const { setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [openSearch, setOpenSearch] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [searchData, setSearchData] = useState<{
    users: any[];
  }>({ users: [] });

  useEffect(() => {
    if (openSearch) {
      const fetchData = async () => {
        try {
          const isAdminRole = user?.role === "super_admin";

          const [usersRes] = await Promise.all([
            isAdminRole ? CommonService.GetAll("/admin/users") : Promise.resolve([]),
          ]);

          setSearchData({
            users: (Array.isArray(usersRes) ? usersRes : (usersRes?.AddtionalData || [])).filter((u: any) => u && u.id && (u.firstName || u.username || u.email)),
          });
        } catch (error) {
          console.error("Failed to fetch search data:", error);
        }
      };
      fetchData();
    }
  }, [openSearch, user?.role]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenSearch((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpenSearch(false);
      command();
    },
    []
  );

  const handleSignOut = async () => {
    console.log("TopBar: handleSignOut triggered");
    // Immediately clear local storage to ensure state is reset
    localStorage.removeItem("billing_ramesh_auth_user");
    
    try {
      // Set a timeout to force redirect if the API call hangs
      const timeoutId = setTimeout(() => {
        console.warn("Logout API timed out, forcing redirect...");
        window.location.replace("/login");
      }, 2000);

      await logout();
      clearTimeout(timeoutId);
      window.location.replace("/login");
    } catch (error) {
      console.error("Logout execution failed:", error);
      window.location.replace("/login");
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#f0e8e2] dark:border-[#f0e8e2]/10 bg-[#FFFDF8] dark:bg-black/20 backdrop-blur-lg px-2 md:px-6 sticky top-0 z-40 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-1 md:gap-3 flex-1 min-w-0">
        {/* Mobile Sidebar Trigger */}
        <div className="md:hidden flex items-center shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/20 dark:hover:bg-white/10 rounded-full h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className={cn(
              "w-[280px] p-0 border-none text-white flex flex-col h-full",
              isAdmin
                ? "bg-[linear-gradient(180deg,#2a1e38,#291e38,#281d37,#271d37,#261d36,#251d35,#231c34,#1d1b2f,#1a1a2e)]"
                : "bg-[linear-gradient(180deg,#2a1e38,#291e38,#281d37,#271d37,#261d36,#251d35,#231c34,#1d1b2f,#1a1a2e)]"
            )}>
              <SheetHeader className="p-6 border-b border-white/10 text-left">
                <Link href="/">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className="h-10 w-10 flex items-center justify-center shrink-0 bg-white/10 rounded-xl text-white">
                      <ScrollText className="h-6 w-6" />
                    </div>
                    <SheetTitle className="text-xl font-bold bg-gradient-to-r from-white/90 to-white/40 bg-clip-text text-transparent font-display">
                      {isAdmin ? "Admin Portal" : (useBranding().settings?.platformName || "Billing Ramesh")}
                    </SheetTitle>
                  </div>
                </Link>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-none space-y-8 pb-10">
                {isAdmin ? (
                  <>
                    {getAdminNavSections(allAdminNavigation).map((section) => {
                      const filteredItems = section.items.filter((item: any) => {
                        if (user?.role === "super_admin") return true;
                        return !item.superAdminOnly;
                      });
                      if (filteredItems.length === 0) return null;
                      return (
                        <div key={section.label}>
                          <h2 className="px-3 mb-3 text-[10px] uppercase tracking-[0.25em] font-black text-white/40">
                            {section.label}
                          </h2>
                          <nav className="space-y-1">
                            {filteredItems.map((item) => (
                              <AdminNavItem key={item.name} item={item} isActive={location === item.href || (item.href !== "/admin" && location.startsWith(item.href))} isMobile={true} />
                            ))}
                          </nav>
                        </div>
                      );
                    })}

                    <div className="pt-4 mt-4 border-t border-white/10">
                      <AdminNavItem
                        item={{ name: "Back to App", href: "/dashboard", icon: ArrowLeft }}
                        isActive={false}
                        isMobile={true}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {getNavSections(allNavigation, allBottomNav).map((section) => {
                      const filteredItems = section.items.filter(item => {
                        const normalizedUserRole = user?.role?.toLowerCase()?.replace(/\s+/g, '_') || "";
                        if (item.roles && !item.roles.includes(normalizedUserRole || "")) return false;
                        return true;
                      });

                      if (filteredItems.length === 0) return null;

                      return (
                        <div key={section.label}>
                          <h2 className="px-3 mb-3 text-[10px] uppercase tracking-[0.25em] font-black text-white/40">
                            {section.label}
                          </h2>
                          <nav className="space-y-1">
                            {filteredItems.map((item) => (
                              <NavItem key={item.name} item={item} isActive={location === item.href} isMobile={true} />
                            ))}
                          </nav>
                        </div>
                      );
                    })}

                    {user?.role === "super_admin" && (
                      <div className="pt-4 mt-4 border-t border-white/10">
                        <NavItem
                          item={{
                            name: "Admin Panel",
                            href: "/admin",
                            icon: Crown
                          }}
                          isActive={false}
                          isMobile={true}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* <div className="flex items-center ml-1">
            <img 
              src={useBranding().settings?.logoUrl || "/favicon.png"} 
              alt="Logo" 
              className="h-6 w-6 md:h-7 md:w-7 object-contain" 
            />
          </div> */}
        </div>



        <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Workspace">
              <CommandItem value="Dashboard" onSelect={() => runCommand(() => setLocation("/dashboard"))}>
                <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                <span>Dashboard</span>
              </CommandItem>
            </CommandGroup>

            {searchData.users.length > 0 && (
              <CommandGroup heading="System Users">
                {searchData.users.map((u) => (
                  <CommandItem key={u.id} value={`user-${u.id}-${u.username || u.email || ""}`} onSelect={() => runCommand(() => setLocation(`/admin/users`))}>
                    <Users className="mr-2 h-4 w-4 text-rose-400" />
                    <div className="flex flex-col">
                      <span className="font-medium">{u.firstName ? `${u.firstName} ${u.lastName || ''}` : (u.username || "Unnamed User")}</span>
                      <span className="text-[10px] text-muted-foreground">{u.email || "No Email"} • {u.role || "No Role"}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />

            <CommandGroup heading="Settings">
              <CommandItem value="Settings" onSelect={() => runCommand(() => setLocation("/settings"))}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>

            {user?.role === "super_admin" && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Admin Settings">
                  <CommandItem value="Admin Dashboard" onSelect={() => runCommand(() => setLocation("/admin"))}>
                    <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />
                    <span>Admin Dashboard</span>
                  </CommandItem>
                  <CommandItem value="Manage Users" onSelect={() => runCommand(() => setLocation("/admin/users"))}>
                    <Users className="mr-2 h-4 w-4 text-rose-500" />
                    <span>Manage Users</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}

            {user?.role === "super_admin" && (
              <>
                <CommandSeparator />
                <CommandGroup heading="System Administration">
                  <CommandItem value="Audit Logs" onSelect={() => runCommand(() => setLocation("/admin/auditlogs"))}>
                    <Database className="mr-2 h-4 w-4 text-red-600" />
                    <span>Audit Logs</span>
                  </CommandItem>
                  <CommandItem value="Error Logs" onSelect={() => runCommand(() => setLocation("/admin/errorlogs"))}>
                    <ShieldAlert className="mr-2 h-4 w-4 text-red-600" />
                    <span>Error Logs</span>
                  </CommandItem>
                  <CommandItem value="System Settings" onSelect={() => runCommand(() => setLocation("/admin/settings"))}>
                    <Settings className="mr-2 h-4 w-4 text-red-600" />
                    <span>System Settings</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </CommandDialog>

        <div className="flex-1 min-w-0 max-w-[200px] md:max-w-none">
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-4 shrink-0 px-1">

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10 rounded-full">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card border-[#f0e8e2] dark:border-[#f0e8e2]/20 rounded-2xl p-1 shadow-xl animate-in fade-in slide-in-from-top-2">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Laptop className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </Button> */}


        <div className="flex items-center gap-3 pl-2 ml-2 border-l border-[#f0e8e2] dark:border-[#f0e8e2]/10">
          <div className="hidden md:flex flex-col items-end mr-1">
            <span className="text-sm font-bold text-foreground leading-tight">
              {user?.company?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.username || "User")}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-tight">
              {user?.role?.replace('_', ' ') || "Member"}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-gradient-primary border border-[#f0e8e2] dark:border-[#f0e8e2]/20 ring-2 ring-white/20 dark:ring-white/5 p-0 overflow-hidden shadow-md shadow-primary/20 hover:scale-105 transition-transform">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.firstName || "User avatar"} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-white/10 dark:bg-black/20 backdrop-blur-sm">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-[#f0e8e2] dark:border-[#f0e8e2]/20 rounded-2xl p-1 shadow-xl animate-in fade-in slide-in-from-top-2 w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/20 dark:bg-white/10" />
              <DropdownMenuItem className="group focus:bg-primary/10 hover:text-black  text-primary focus:text-black cursor-pointer rounded-xl transition-colors mb-1" onClick={() => setLocation("/settings")}>
                <User className="mr-2 h-4 w-4 text-primary group-hover:text-black group-focus:text-black" /> Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/20 dark:bg-white/10" />
              <DropdownMenuItem
                className="group focus:bg-destructive/10 text-destructive hover:text-black focus:text-black font-medium cursor-pointer rounded-xl transition-colors mt-2"
                onClick={() => setShowSignOutDialog(true)}
              >
                <LogOut className="mr-2 h-4 w-4 group-hover:text-black group-focus:text-black" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged out of your account and redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              asChild
            >
              <Button 
                variant="destructive" 
                className="rounded-xl w-full"
                onClick={(e) => {
                  e.preventDefault(); // Prevent closing before handler runs
                  handleSignOut();
                }}
              >
                Sign out
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
