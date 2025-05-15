
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const isMobile = useIsMobile();
  
  return (
    <header className="py-6 md:py-8 px-6 md:px-0 border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
      <div className="container max-w-5xl flex flex-col items-center">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-primary rounded-lg flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-6 h-6">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H4"/>
            </svg>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">CopyScraper</h1>
        </div>
        
        <p className="mt-4 text-center text-gray-500 max-w-md">
          {isMobile 
            ? "Extract and organize text content from any website" 
            : "Extract and organize text content from any website for your design projects"}
        </p>
      </div>
    </header>
  );
}
