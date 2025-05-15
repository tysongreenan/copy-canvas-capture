
import { Link } from "react-router-dom";
import { UserMenu } from "@/components/UserMenu";

export function Header() {
  return (
    <header className="sticky top-0 border-b border-[#F3F4F6] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-sans font-bold tracking-tight">
            <div className="relative w-8 h-8">
              {/* Lumen Logo - Circle with diagonal beam */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00CFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" className="stroke-lumenBlue" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" className="stroke-lumenBlue" />
              </svg>
            </div>
            <span className="text-xl uppercase tracking-tight text-jet">Lumen</span>
          </Link>
          <div className="hidden md:block ml-2 border-l pl-2">
            <span className="text-xs text-slate tracking-tight">Shedding Light on Hidden Copy</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
