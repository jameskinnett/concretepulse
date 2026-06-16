import React from 'react';
import { useRole } from '@/lib/useRole';
import { Lock } from 'lucide-react';

/**
 * Wraps content that should only be visible/interactive for certain roles.
 * Usage: <RoleGuard allow="canCreateOrders"> ... </RoleGuard>
 * Or:    <RoleGuard roles={['admin']}> ... </RoleGuard>
 * showLocked: show a locked placeholder instead of hiding completely
 */
export default function RoleGuard({ children, allow, roles, showLocked = false }) {
  const rolePerms = useRole();

  let permitted = true;
  if (allow) {
    permitted = !!rolePerms[allow];
  } else if (roles) {
    permitted = roles.includes(rolePerms.role);
  }

  if (permitted) return <>{children}</>;
  if (!showLocked) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground opacity-50 cursor-not-allowed select-none">
      <Lock className="w-3 h-3" />
      <span>No access</span>
    </div>
  );
}