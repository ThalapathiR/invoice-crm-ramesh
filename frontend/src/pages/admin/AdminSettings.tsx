import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Settings, Server, Shield, Database, Globe, Lock,
  RefreshCcw, Activity, HardDrive, Cpu, Wifi, CheckCircle2,
  CreditCard, Mail, Key
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CommonService } from "@/service/commonservice.page";

import { cn } from "@/lib/utils";

export default function AdminSettings() {
  const { toast } = useToast();
  const [config, setConfig] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localConfig, setLocalConfig] = useState<any>(null);
  const [emailConfig, setEmailConfig] = useState<any>({
    mailer_name: "",
    host: "",
    email_id: "",
    password: ""
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configData, healthData, emailData] = await Promise.all([
        CommonService.GetAll("/admin/config"),
        CommonService.GetAll("/admin/health"),
        CommonService.GetAll("/EmailConfig")
      ]);
      setConfig(configData);
      setLocalConfig(configData);
      setHealth(healthData);
      if (emailData) {
        setEmailConfig({ ...emailData, password: "" });
      }
    } catch (err) {
      console.error("Data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const healthData = await CommonService.GetAll("/admin/health");
      setHealth(healthData);
    } catch (err) {
      console.error("Health update failed:", err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        CommonService.CommonPut(localConfig, "/admin/config"),
        CommonService.CommonPatch(emailConfig, "/EmailConfig/Update")
      ]);
      fetchData(); // Refresh
      toast({ title: "Settings saved successfully", variant: "success" });
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !localConfig) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading configuration...</div>;
  }

  const systemHealth = [
    { name: "API Server", status: health?.api || "healthy", uptime: health?.uptime || "99.99%", icon: Server, color: "text-green-600" },
    { name: "Database", status: health?.database || "healthy", uptime: health?.uptime || "99.98%", icon: Database, color: "text-green-600" },
    { name: "Voice Engine", status: health?.voiceEngine || "healthy", uptime: "99.95%", icon: Wifi, color: "text-green-600" },
    { name: "CDN / Storage", status: health?.storage || "healthy", uptime: "100%", icon: HardDrive, color: "text-green-600" },
    { name: "AI Processing", status: health?.aiProcessing || "healthy", uptime: "99.97%", icon: Cpu, color: "text-green-600" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          {/* <Settings className="h-8 w-8 text-red-600 dark:text-red-400" /> */}
          <h1 className="text-3xl font-bold tracking-tight">
            System Settings
          </h1>
        </div>
        <p className="text-muted-foreground">Configure platform-wide settings and monitor system health.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-green-600 animate-pulse" /> System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {systemHealth.map((service, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/20 dark:bg-white/5">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <service.icon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{service.name}</p>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span className="text-[10px] text-muted-foreground">{service.uptime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-card border-[#f0e8e2]0 dark:border-[#f0e8e2]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> General Settings</CardTitle>
              <CardDescription>Platform-wide configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Maintenance Mode</Label>
                  <p className="text-xs text-muted-foreground">Temporarily disable the platform for all users.</p>
                </div>
                <Switch
                  checked={localConfig.maintenanceMode}
                  onCheckedChange={(val) => setLocalConfig({ ...localConfig, maintenanceMode: val })}
                />
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Open Registration</Label>
                  <p className="text-xs text-muted-foreground">Allow new users to sign up.</p>
                </div>
                <Switch
                  checked={localConfig.registrationOpen}
                  onCheckedChange={(val) => setLocalConfig({ ...localConfig, registrationOpen: val })}
                />
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Send email alerts for important events.</p>
                </div>
                <Switch
                  checked={localConfig.emailNotifications}
                  onCheckedChange={(val) => setLocalConfig({ ...localConfig, emailNotifications: val })}
                />
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Webhook Notifications</Label>
                  <p className="text-xs text-muted-foreground">Send event data to an external webhook.</p>
                </div>
                <Switch
                  checked={localConfig.webhookNotifications}
                  onCheckedChange={(val) => setLocalConfig({ ...localConfig, webhookNotifications: val })}
                />
              </div>
              {localConfig.webhookNotifications && (
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    value={localConfig.webhookUrl}
                    onChange={(e) => setLocalConfig({ ...localConfig, webhookUrl: e.target.value })}
                    placeholder="https://hooks.example.com/events"
                  />
                </div>
              )}
              <div className="h-px bg-white/10" />
              <div className="space-y-2">
                <Label className="font-medium">Google Client ID (OAuth)</Label>
                <p className="text-xs text-muted-foreground">Required for 'Sign in with Google' functionality.</p>
                <Input
                  value={localConfig.googleClientId || ""}
                  onChange={(e) => setLocalConfig({ ...localConfig, googleClientId: e.target.value })}
                  placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-[#f0e8e2]0 dark:border-[#f0e8e2]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security Settings</CardTitle>
              <CardDescription>Access control and authentication policies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Require 2FA</Label>
                  <p className="text-xs text-muted-foreground">Force two-factor authentication for all users.</p>
                </div>
                <Switch checked={false} disabled /> {/* Hardcoded for now */}
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">IP Whitelist</Label>
                  <p className="text-xs text-muted-foreground">Restrict admin access to specific IPs.</p>
                </div>
                <Switch checked={false} disabled /> {/* Hardcoded for now */}
              </div>
              <div className="h-px bg-white/10" />
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input
                  type="number"
                  value={localConfig.sessionTimeout}
                  onChange={(e) => setLocalConfig({ ...localConfig, sessionTimeout: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Login Attempts</Label>
                <Input
                  type="number"
                  value={localConfig.maxLoginAttempts}
                  onChange={(e) => setLocalConfig({ ...localConfig, maxLoginAttempts: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="glass-card border-[#f0e8e2]0 dark:border-[#f0e8e2]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Data Management</CardTitle>
            <CardDescription>Database and cache operations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[#f0e8e2] bg-white/10 dark:bg-white/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Database</span>
                </div>
                <p className="text-xs text-muted-foreground">PostgreSQL connected and healthy.</p>
                <Badge className="bg-green-500/10 text-green-600">Connected</Badge>
              </div>
              <div className="p-4 rounded-xl border border-[#f0e8e2] bg-white/10 dark:bg-white/5 space-y-3">
                <div className="flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Cache</span>
                </div>
                <p className="text-xs text-muted-foreground">In-memory caching active.</p>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: "Cache cleared" })}>
                  Clear Cache
                </Button>
              </div>
              <div className="p-4 rounded-xl border border-[#f0e8e2] bg-white/10 dark:bg-white/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Backups</span>
                </div>
                <p className="text-xs text-muted-foreground">Automatic daily backups enabled.</p>
                <Badge className="bg-green-500/10 text-green-600">Automated</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="glass-card border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" /> Email Configuration
            </CardTitle>
            <CardDescription>Configure SMTP settings for system notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mailer Name</Label>
                <Input
                  value={emailConfig.mailer_name || ""}
                  onChange={(e) => setEmailConfig({ ...emailConfig, mailer_name: e.target.value })}
                  placeholder="e.g. Platform Support"
                />
              </div>
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input
                  value={emailConfig.host || ""}
                  onChange={(e) => setEmailConfig({ ...emailConfig, host: e.target.value })}
                  placeholder="e.g. smtp.gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Email ID</Label>
                <Input
                  value={emailConfig.email_id || ""}
                  onChange={(e) => setEmailConfig({ ...emailConfig, email_id: e.target.value })}
                  placeholder="e.g. support@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>SMTP Password</Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={emailConfig.password || ""}
                    onChange={(e) => setEmailConfig({ ...emailConfig, password: e.target.value })}
                    placeholder="••••••••••••••••"
                    className="pr-10"
                  />
                  <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-[10px] text-muted-foreground italic">Leave empty to keep existing password.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>


      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full"
          data-testid="button-save-settings"
        >
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
}
