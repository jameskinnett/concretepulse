import { useAuth } from '@/lib/AuthContext';

/**
 * Role hierarchy: admin > dispatcher > viewer
 * - admin: full access (financials, delete, all pages)
 * - dispatcher: create/assign orders, no compensation/financials
 * - viewer: read-only, no create/edit/delete
 */
export function useRole() {
  const { user } = useAuth();
  const role = user?.role || 'viewer';

  return {
    role,
    isAdmin: role === 'admin',
    isDispatcher: role === 'admin' || role === 'dispatcher',
    isViewer: true, // everyone can view
    canCreateOrders: role === 'admin' || role === 'dispatcher',
    canAssignOrders: role === 'admin' || role === 'dispatcher',
    canViewFinancials: role === 'admin',
    canManageUsers: role === 'admin',
    canExportReports: role === 'admin' || role === 'dispatcher',
    canEditTrucksDrivers: role === 'admin',
    canDeleteRecords: role === 'admin',
  };
}