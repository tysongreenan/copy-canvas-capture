
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/use-role";
import { AppRole } from "@/services/RoleService";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: AppRole;
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = "/chat" 
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, loading: roleLoading } = useRole();

  // Show loading state while checking authentication and roles
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show access denied if user doesn't have required role
  if (!hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page. This area is restricted to Beggor team members only.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="text-primary hover:underline"
            >
              Go back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
