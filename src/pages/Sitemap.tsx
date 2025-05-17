
import { SitemapFlow } from '@/components/sitemap/SitemapFlow';

export default function Sitemap() {
  return (
    <div className="w-full h-screen bg-background">
      <div className="container mx-auto h-full py-8">
        <h1 className="text-2xl font-bold mb-8">Site Map</h1>
        <div className="w-full h-[calc(100vh-160px)] border border-border rounded-lg overflow-hidden">
          <SitemapFlow />
        </div>
      </div>
    </div>
  );
}
