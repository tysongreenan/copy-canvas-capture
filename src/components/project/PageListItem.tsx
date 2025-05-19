import { LinkIcon } from "lucide-react";
import { ScrapedContent } from "@/services/ScraperTypes";

interface PageListItemProps {
  page: ScrapedContent;
  isSelected: boolean;
  isMainUrl: (url: string) => boolean;
  getPathFromUrl: (url: string) => string;
  onSelect: () => void;
}

export const PageListItem = ({ 
  page, 
  isSelected, 
  isMainUrl, 
  getPathFromUrl, 
  onSelect 
}: PageListItemProps) => {
  return (
    <div 
      onClick={onSelect}
      className={`p-3 border rounded-md hover:bg-gray-50 cursor-pointer ${
        isSelected ? 'bg-indigo-50 border-indigo-200' : ''
      }`}
    >
      <div className="font-medium truncate">{page.title || getPathFromUrl(page.url)}</div>
      <div className="flex items-center text-xs text-gray-500 truncate">
        <LinkIcon className="h-3 w-3 mr-1" />
        {isMainUrl(page.url) ? '/' : getPathFromUrl(page.url)}
      </div>
    </div>
  );
};
