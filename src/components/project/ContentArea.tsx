
import { ScrapedContent } from "@/services/ScraperService";
import { ContentDisplay } from "@/components/ContentDisplay";
import { Globe } from "lucide-react";

interface ContentAreaProps {
  selectedPage: ScrapedContent | null;
}

export const ContentArea = ({ selectedPage }: ContentAreaProps) => {
  return (
    <div className="md:col-span-3">
      {selectedPage ? (
        <div className="border rounded-md p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold">{selectedPage.title}</h2>
            <div className="text-sm text-gray-500">
              <a href={selectedPage.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-indigo-600">
                <Globe className="h-3 w-3 mr-1" />
                {selectedPage.url}
              </a>
            </div>
          </div>
          
          <ContentDisplay data={selectedPage} />
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Select a page from the left to view its content</p>
        </div>
      )}
    </div>
  );
};
