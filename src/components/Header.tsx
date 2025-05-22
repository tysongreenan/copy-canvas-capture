
import { Link } from "react-router-dom";
import { UserMenu } from "@/components/UserMenu";
import { FileText } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 border-b border-[#F3F4F6] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-sans font-bold tracking-tight">
            <div className="relative w-8 h-8">
              {/* Beggor Logo - Dachshund silhouette */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D2A679" className="w-8 h-8">
                {/* Simplified dachshund silhouette */}
                <path d="M20,10c0-1.1-0.9-2-2-2h-2V7c0-1.1-0.9-2-2-2H8C6.9,5,6,5.9,6,7v1H4c-1.1,0-2,0.9-2,2v4c0,1.1,0.9,2,2,2h2v1 c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2v-1h2c1.1,0,2-0.9,2-2V10z M18,14h-2c-1.1,0-2,0.9-2,2v1H8v-1c0-1.1-0.9-2-2-2H4v-4h2 c1.1,0,2-0.9,2-2V7h8v1c0,1.1,0.9,2,2,2h2V14z" />
                <circle cx="18" cy="11" r="1" />
              </svg>
            </div>
            <span className="text-xl uppercase tracking-tight text-charcoal">Beggor</span>
          </Link>
          <div className="hidden md:block ml-2 border-l pl-2">
            <span className="text-xs text-slate tracking-tight">Ask Boldly, Get Brilliant Copy</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 mr-6">
            <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link to="/scrapcopy" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Copy Scraper
            </Link>
          </nav>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
