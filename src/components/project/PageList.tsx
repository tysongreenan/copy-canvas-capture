
import { ScrapedContent } from "@/services/ScraperService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageListItem } from "./PageListItem";
import { DomainCard } from "./DomainCard";

interface PageListProps {
  projectUrl: string | undefined;
  pages: ScrapedContent[];
  selectedPage: ScrapedContent | null;
  setSelectedPage: (page: ScrapedContent) => void;
  getDomainFromUrl: (url: string) => string;
  getPathFromUrl: (url: string) => string;
  isMainUrl: (url: string) => boolean;
}

export const PageList = ({
  projectUrl,
  pages,
  selectedPage,
  setSelectedPage,
  getDomainFromUrl,
  getPathFromUrl,
  isMainUrl
}: PageListProps) => {
  // Sort pages to have the main URL first, then alphabetically by path
  const sortedPages = [...pages].sort((a, b) => {
    // Main URL goes first
    if (isMainUrl(a.url) && !isMainUrl(b.url)) return -1;
    if (!isMainUrl(a.url) && isMainUrl(b.url)) return 1;
    
    // Then sort by pathname
    const pathA = getPathFromUrl(a.url);
    const pathB = getPathFromUrl(b.url);
    return pathA.localeCompare(pathB);
  });

  return (
    <div className="md:col-span-1 space-y-4">
      <div className="font-medium text-lg mb-2">
        Pages ({pages.length})
      </div>
      
      {/* Project domain card at the top */}
      {projectUrl && (
        <DomainCard url={projectUrl} getDomainFromUrl={getDomainFromUrl} />
      )}
      
      {/* Scrollable area for pages */}
      <ScrollArea className="h-[55vh]">
        <div className="space-y-2 pr-2">
          {sortedPages.map((page, index) => (
            <PageListItem 
              key={index}
              page={page}
              isSelected={selectedPage?.url === page.url}
              isMainUrl={isMainUrl}
              getPathFromUrl={getPathFromUrl}
              onSelect={() => setSelectedPage(page)}
            />
          ))}
          
          {pages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No pages found in this project
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
