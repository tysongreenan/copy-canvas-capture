
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Settings, CreditCard, LogOut, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/radix-dropdown-menu";

export function AccountMenu() {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <Link to="/auth" className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm border border-gray-200 hover:bg-gray-50">
        <User className="mr-2 h-4 w-4" />
        Sign In
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm border border-gray-200 hover:bg-gray-50">
          <User className="mr-2 h-4 w-4" />
          {user.email?.split('@')[0]}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56 bg-white text-gray-800 border-gray-200">
        <DropdownMenuLabel className="text-gray-800">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="text-gray-800 cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-gray-800 cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-gray-800 cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
