
import { SitemapFlow } from '@/components/sitemap/SitemapFlow';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Sitemap() {
  return (
    <div className="w-full h-screen bg-background">
      <div className="container mx-auto h-full py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Site Map</h1>
          <Button variant="outline" asChild size="sm">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <div className="w-full h-[calc(100vh-160px)] border border-border rounded-lg overflow-hidden">
          <SitemapFlow />
        </div>
      </div>
    </div>
  );
}
