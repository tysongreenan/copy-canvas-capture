
import { Globe } from "lucide-react";

interface DomainCardProps {
  url: string;
  getDomainFromUrl: (url: string) => string;
}

export const DomainCard = ({ url, getDomainFromUrl }: DomainCardProps) => {
  return (
    <div className="p-3 border rounded-md bg-slate-50 mb-4">
      <div className="font-medium">Domain</div>
      <div className="flex items-center text-sm text-gray-700 mt-1">
        <Globe className="h-3.5 w-3.5 mr-1 text-indigo-600" />
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline truncate"
        >
          {getDomainFromUrl(url)}
        </a>
      </div>
    </div>
  );
};
