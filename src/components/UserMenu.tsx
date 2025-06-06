
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/use-role";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Shield, Info } from "lucide-react";
import { RoleService } from "@/services/RoleService";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { isMasterAdmin } = useRole();

  const handleGetUserId = async () => {
    await RoleService.printCurrentUserId();
  };

  if (!user) {
    return (
      <Button asChild variant="outline" className="gap-2">
        <Link to="/auth">
          <User className="h-4 w-4" />
          <span>Sign In</span>
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <User className="h-4 w-4" />
          <span className="max-w-[100px] truncate">
            {user.email?.split('@')[0]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          {user.email}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        {/* TEMPORARY: Remove after setup */}
        <DropdownMenuItem onClick={handleGetUserId} className="flex items-center cursor-pointer text-blue-600">
          <Info className="mr-2 h-4 w-4" />
          <span>Get User ID (Temp)</span>
        </DropdownMenuItem>
        {isMasterAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin/knowledge" className="flex items-center cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/rag" className="flex items-center cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>RAG Stats</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="flex items-center cursor-pointer text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
