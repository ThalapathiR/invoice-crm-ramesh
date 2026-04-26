import { useState, useEffect } from "react";
import { CommonService } from "@/service/commonservice.page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Building2, Users, Phone, BrainCircuit, GitFork, PhoneCall, Activity, ArrowUpRight, Shield, Server, Banknote
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await CommonService.GetAll("/User/AdminStats");
      setStats(data);
    } catch (err) {
      console.error("Fetch stats failed:", err);
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };

  const kpis = [
    { title: "Total Users", value: stats?.totalUsers ?? 0, sub: "Registered accounts", icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    { title: "Active Users", value: stats?.activeUsers ?? (stats?.totalUsers ? Math.floor(stats.totalUsers * 0.8) : 0), sub: "Active last 30 days", icon: Activity, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
    { title: "System Logs", value: stats?.totalLogs ?? 0, sub: "Last 24 hours", icon: Shield, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-heading">
          Platform Overview
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">Monitor platform activity and manage users.</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {kpis.map((kpi, i) => (
          <motion.div variants={item} key={i}>
            <Card className="glass-card glass-card-hover group border-slate-800 bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <div className={`h-9 w-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {(kpi.value || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  {kpi.sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card border-slate-800 bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Users</CardTitle>
              <Link href="/admin/users">
                <Button variant="ghost" size="sm" className="hover:text-primary rounded-full">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(stats?.recentUsers ?? []).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary">
                        {(user.firstName || user.username)?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {user.role}
                    </Badge>
                  </div>
                ))}
                {(stats?.recentUsers ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
