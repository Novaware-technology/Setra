import { useAuth } from '@/contexts/uth-context';

export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (role: string) => {
    return user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]) => {
    return roles.some(role => hasRole(role));
  };

  const canAccessDashboard = () => {
    return hasAnyRole(['admin', 'support']);
  };

  const canAccessUsers = () => {
    return hasAnyRole(['admin', 'support']);
  };

  const canAccessChats = () => {
    return hasAnyRole(['admin', 'support', 'operator']);
  };

  return {
    hasRole,
    hasAnyRole,
    canAccessDashboard,
    canAccessUsers,
    canAccessChats,
  };
}
