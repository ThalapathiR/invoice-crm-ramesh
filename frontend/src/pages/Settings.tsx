import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  User,
  CreditCard,
  Shield,
  Save,
  Check,
  Phone,
  Bot,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { CommonService } from "@/service/commonservice.page";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { navigate } from "wouter/use-browser-location";
import { queryClient } from "@/lib/queryClient";


export default function Settings() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileUsername, setProfileUsername] = useState("");
  const [profileMobile, setProfileMobile] = useState("");






  useEffect(() => {
    if (user) {
      setProfileFirstName(user.firstName || "");
      setProfileLastName(user.lastName || "");
      setProfileEmail(user.email || "");
      setProfileUsername(user.username || "");
      setProfileMobile(user.mobile || "");
    }
  }, [user?.id]); // Only sync when the user identity changes

  const handleUpdateProfile = async () => {
    const currentUserId = user?.id;
    if (!currentUserId) {
      toast({ title: "User not identified", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: currentUserId,
        user_role_id: user.user_role_id || "",
        first_name: profileFirstName,
        last_name: profileLastName,
        email: profileEmail,
        username: profileUsername,
        mobile: profileMobile,
      };

      console.log("Updating profile with payload:", payload);
      const response: any = await CommonService.CommonPut(payload, `/User/Update/${currentUserId}`);

      if (response && (response.Type === "S" || response.status === true)) {
        // Use the fresh user object from the backend response
        const updatedUserFromServer = response.AddtionalData;
        if (updatedUserFromServer) {
          await login(updatedUserFromServer);
        }

        toast({
          title: "Profile updated successfully",
          description: "Your changes have been saved.",
        });
      }

      setLastUpdated(Date.now());
    } catch (err: any) {
      console.error("Profile update failed:", err);
      toast({
        title: "Update failed",
        description: err.message || "An error occurred while updating your profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };


  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "New password and confirm password must match",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const payload = {
      old_password: oldPassword,
      password: newPassword,
    };
    const res = await CommonService.CommonPost(payload, "/User/ChangePassword");

    if (res?.Type === "S") {
      await CommonService.CommonPost({}, "/auth/logout");
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    }
    setSaving(false);
  }; return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto px-4 sm:px-0">
      <div className="flex flex-col gap-1.5 px-1">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Settings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your account and preferences.
          </p>
        </motion.div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full h-auto p-1 bg-slate-900/50 border-b border-border mb-6 sm:mb-8 flex gap-2 sm:gap-6 overflow-x-auto scrollbar-none justify-start px-1 items-center no-scrollbar">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-zinc-800 rounded-full px-4 py-2.5 text-xs sm:text-sm text-slate-400 data-[state=active]:text-white transition-all flex items-center gap-2 font-bold whitespace-nowrap shadow-sm border border-transparent data-[state=active]:border-primary/20"
          >
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> General
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-zinc-800 rounded-full px-4 py-2.5 text-xs sm:text-sm text-slate-400 data-[state=active]:text-white transition-all flex items-center gap-2 font-bold whitespace-nowrap shadow-sm border border-transparent data-[state=active]:border-primary/20"
          >
            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Security
          </TabsTrigger>
        </TabsList>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          <TabsContent value="general" className="space-y-4 sm:space-y-6 mt-0">
            <Card className="glass-card border-border bg-card">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <Avatar className="h-24 w-24 sm:h-20 sm:w-20 ring-4 ring-slate-800 shadow-lg">
                    <AvatarImage src="/avatars/01.png" />
                    <AvatarFallback className="bg-primary/20 text-primary text-2xl sm:text-xl">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  {/* <Button
                    variant="outline"
                    className="glass-button rounded-full w-full sm:w-auto px-6"
                  >
                    Change Avatar
                  </Button> */}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      value={profileUsername}
                      disabled
                      className="glass-input rounded-xl bg-muted/50"
                      data-testid="input-settings-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      value={profileEmail}
                      disabled
                      className="glass-input rounded-xl bg-muted/50"
                      data-testid="input-settings-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name</Label>
                    <Input
                      value={profileFirstName}
                      onChange={(e) => setProfileFirstName(e.target.value)}
                      className="glass-input rounded-xl"
                      data-testid="input-settings-firstname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                    <Input
                      value={profileLastName}
                      onChange={(e) => setProfileLastName(e.target.value)}
                      className="glass-input rounded-xl"
                      data-testid="input-settings-lastname"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input
                    value={profileMobile}
                    onChange={(e) => setProfileMobile(e.target.value)}
                    className="glass-input rounded-xl"
                    placeholder="e.g. +1234567890"
                    data-testid="input-settings-mobile"
                  />
                </div>

                <Button
                  type="button"
                  className="gap-2 glossy-button-primary rounded-full min-w-[140px]"
                  onClick={handleUpdateProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-border bg-card">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <CardTitle className="text-lg sm:text-xl">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 p-4 sm:p-6 pt-0">
                <div className="flex items-center justify-between py-3 border-b border-border/10">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive daily summaries
                    </p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Beta Features</Label>
                    <p className="text-xs text-muted-foreground">
                      Access new features early
                    </p>
                  </div>
                  <Switch className="data-[state=checked]:bg-primary" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value="security" className="space-y-4 sm:space-y-6 mt-0">
            <Card className="glass-card border-border bg-card">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <CardTitle className="text-lg sm:text-xl font-bold">Password</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Password</Label>
                  <Input
                    type="password"
                    className="glass-input rounded-xl h-11"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</Label>
                    <Input
                      type="password"
                      className="glass-input rounded-xl h-11"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm New Password</Label>
                    <Input
                      type="password"
                      className="glass-input rounded-xl h-11"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleChangePassword}
                  className="w-full sm:w-auto glossy-button-primary rounded-xl h-12 sm:h-10 px-8 font-bold mt-2"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-border bg-card">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <CardTitle className="text-lg sm:text-xl font-bold">Two-Factor Authentication</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Add an extra layer of security to your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-border bg-slate-900/50 gap-4">
                  <div className="text-center sm:text-left">
                    <p className="font-bold">2FA Status</p>
                    <p className="text-xs text-muted-foreground font-medium">
                      Currently disabled
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto glass-button rounded-full px-8 font-bold"
                  >
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </motion.div>
      </Tabs>

    </div>
  );
}
