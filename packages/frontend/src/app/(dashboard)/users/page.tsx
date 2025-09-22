// src/app/(dashboard)/users/page.tsx
"use client"

import { UserTable } from "@/app/(dashboard)/users/user-table";
import { Button } from "@/components/ui/button";
import { RouteGuard } from "@/components/auth/route-guard";

export default function UsersPage() {
  return (
    <RouteGuard requiredRoles={['admin', 'support']}>
      <UserTable />
    </RouteGuard>
  );
}