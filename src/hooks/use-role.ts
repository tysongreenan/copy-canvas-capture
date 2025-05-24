
import { useState, useEffect } from "react";
import { RoleService, AppRole } from "@/services/RoleService";
import { useAuth } from "@/context/AuthContext";

export function useRole() {
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const userRole = await RoleService.getCurrentUserRole();
      setRole(userRole);
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  const isMasterAdmin = role === 'master_admin';
  const isAdmin = role === 'admin' || role === 'master_admin';

  return {
    role,
    loading,
    isMasterAdmin,
    isAdmin,
    hasRole: (requiredRole: AppRole) => {
      if (!role) return false;
      
      const roleHierarchy = {
        'user': 1,
        'admin': 2,
        'master_admin': 3
      };
      
      return roleHierarchy[role] >= roleHierarchy[requiredRole];
    }
  };
}
