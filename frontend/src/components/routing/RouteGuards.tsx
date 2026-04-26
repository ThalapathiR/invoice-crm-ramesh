import React from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout/Layout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useEffect } from "react";

export function SuspenseLoader() {
  useEffect(() => {
    window.showGlobalLoader?.();
    return () => window.hideGlobalLoader?.();
  }, []);
  return null;
}

export const AppRoute = ({
  component: Component,
}: {
  component: React.ComponentType;
}) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <SuspenseLoader />;
  if (!user) return <Redirect to="/login" />;

  return (
    <Layout>
      <Component />
    </Layout>
  );
};

export const PublicRoute = ({
  component: Component,
}: {
  component: React.ComponentType;
}) => (
  <PublicLayout>
    <Component />
  </PublicLayout>
);

export const AdminRoute = ({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) => {
  const { user, isLoading } = useAuth();
  const normalizedRole = user?.role?.toLowerCase()?.replace(/\s+/g, '_') || "";
  const isSuperAdmin = normalizedRole === "super_admin";

  if (isLoading) return <SuspenseLoader />;

  if (!user || !isSuperAdmin) {
    return <Redirect to="/login" />;
  }

  return (
    <AdminLayout>
      <Component {...rest} />
    </AdminLayout>
  );
};

export const SuperAdminRoute = ({
  component: Component,
}: {
  component: React.ComponentType;
}) => {
  const { user, isLoading } = useAuth();
  const normalizedRole = user?.role?.toLowerCase()?.replace(/\s+/g, '_') || "";
  const isSuperAdmin = normalizedRole === "super_admin";

  if (isLoading) return <SuspenseLoader />;
  if (!user) return <Redirect to="/login" />;
  if (!isSuperAdmin) return <Redirect to="/admin" />;
  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
};
