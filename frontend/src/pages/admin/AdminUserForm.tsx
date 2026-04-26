import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { CommonService } from "@/service/commonservice.page";
import { useToast } from "@/hooks/use-toast";

export default function AdminUserForm() {
  const { toast } = useToast();
  const { uid: id } = useParams();
  const [, navigate] = useLocation();

  const isEdit = id !== "0";

  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    mobile: "",
    user_role_id: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const rolesData = await CommonService.GetAll("/UserRole/List");
      const roleList = rolesData?.data ?? rolesData ?? [];
      setRoles(roleList);
      if (isEdit) {
        const user = await CommonService.GetAll(`/User/ById/${id}`);
        const u = user?.data ?? user;

        setForm({
          first_name: u.firstName ?? "",
          last_name: u.lastName ?? "",
          email: u.email ?? "",
          username: u.username ?? "",
          password: u.password ?? "",
          mobile: u.mobile ?? "",
          user_role_id: u.user_role_id ?? "",
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Failed loading data",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!form.first_name || !form.email || !form.user_role_id) {
      toast({
        title: "Fill all required fields",
        variant: "destructive",
      });

      return;
    }

    setSaving(true);

    try {
      const payload: any = { ...form };
      if (isEdit && !payload.password) {
        delete payload.password;
      }

      if (isEdit) {
        await CommonService.CommonPut(payload, `/User/Update/${id}`);

        toast({ title: "User updated successfully" });
      } else {
        await CommonService.CommonPost(payload, "/User/Insert");

        toast({ title: "User created successfully" });
      }

      navigate("/admin/users");
    } catch (err: any) {
      // catch(e){

      // console.error(e);

      // toast({
      // title:"Save failed",
      // variant:"destructive"
      // });

      // }
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        err?.message ||
        "Save failed";

      toast({
        title: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardContent className="space-y-6 p-6">
          <h2 className="text-2xl font-bold mt-8">
            {isEdit ? "Edit User" : "Create User"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">First Name</Label>
              <Input
                className="h-11 rounded-2xl bg-slate-50/50 dark:bg-white/5 border-[#f0e8e2] dark:border-white/10 transition-all focus:ring-2 focus:ring-primary/20"
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Last Name</Label>
              <Input
                className="h-11 rounded-2xl bg-slate-50/50 dark:bg-white/5 border-[#f0e8e2] dark:border-white/10 transition-all focus:ring-2 focus:ring-primary/20"
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</Label>
            <Input
              className="h-11 rounded-2xl bg-slate-50/50 dark:bg-white/5 border-[#f0e8e2] dark:border-white/10 transition-all focus:ring-2 focus:ring-primary/20"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Username</Label>
            <Input
              className="h-11 rounded-2xl bg-slate-50/50 dark:bg-white/5 border-[#f0e8e2] dark:border-white/10 transition-all focus:ring-2 focus:ring-primary/20"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Password</Label>
              <Input
                type="password"
                className="h-11 rounded-2xl bg-slate-50/50 dark:bg-white/5 border-[#f0e8e2] dark:border-white/10 transition-all focus:ring-2 focus:ring-primary/20"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Mobile Number</Label>
            <Input
              className="h-11 rounded-2xl bg-slate-50/50 dark:bg-white/5 border-[#f0e8e2] dark:border-white/10 transition-all focus:ring-2 focus:ring-primary/20"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">User Role</Label>

            <Select
              value={form.user_role_id}
              onValueChange={(value) =>
                setForm({ ...form, user_role_id: value })
              }
            >
              <SelectTrigger className="w-full h-11 px-6 rounded-2xl bg-slate-50/50 dark:bg-white/5 border-[#f0e8e2] dark:border-white/10 transition-all hover:bg-white dark:hover:bg-white/10">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>

              <SelectContent>
                {roles.map((role: any) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="cancel" className="rounded-full px-6" onClick={() => navigate("/admin/users")}>
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary border border-primary-border min-h-9 px-8 py-2 gap-2 bg-gradient-to-r from-primary to-accent text-white rounded-full transition-all hover:opacity-90 shadow-lg shadow-primary/20"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
