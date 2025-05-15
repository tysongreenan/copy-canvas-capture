
import { Link } from "react-router-dom";
import { UserMenu } from "@/components/UserMenu";

export function Header() {
  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-10 relative">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00CFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <circle cx="12" cy="12" r="10" className="stroke-primary" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" className="stroke-primary" />
            </svg>
            <span className="text-lg tracking-tight uppercase">Lumen</span>
          </Link>
          <div className="hidden md:block ml-2">
            <span className="text-xs text-muted-foreground">Shedding Light on Hidden Copy</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
