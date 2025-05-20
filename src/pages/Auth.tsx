
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/services/AuthService";

const Auth = () => {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ensure all hooks are declared before any conditional returns
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await AuthService.demoLogin();
      setUser(userData);
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md p-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center">Welcome to Lumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 mb-4">Sign in to access your account</p>
            </div>
            
            <div className="space-y-4">
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Continue with Demo Account"}
              </Button>
              
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
