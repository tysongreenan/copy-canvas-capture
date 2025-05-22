
import { useState } from "react";
import { Header } from "@/components/Header";
import { ScrapeForm } from "@/components/ScrapeForm";
import { ContentDisplay } from "@/components/ContentDisplay";
import { useAuth } from "@/context/AuthContext";
import type { ScrapedContent } from "@/services/ScraperTypes";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SaveButton } from "@/components/SaveButton";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Download, MessageSquare, Check } from "lucide-react";

const ScrapCopy = () => {
  const [scrapedData, setScrapedData] = useState<ScrapedContent | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<"json" | "text" | "html">("json");
  const { user } = useAuth();

  const handleResult = (data: ScrapedContent) => {
    setScrapedData(data);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDownload = () => {
    if (!scrapedData) return;

    let content = "";
    let filename = "";
    let mimeType = "";

    if (downloadFormat === "json") {
      content = JSON.stringify(scrapedData, null, 2);
      filename = `${scrapedData.title.replace(/\s+/g, "-").toLowerCase()}-content.json`;
      mimeType = "application/json";
    } else if (downloadFormat === "text") {
      content = `Title: ${scrapedData.title}\n\n`;
      
      if (scrapedData.metaDescription) {
        content += `Description: ${scrapedData.metaDescription}\n\n`;
      }
      
      scrapedData.headings.forEach(h => {
        content += `${h.tag.toUpperCase()}: ${h.text}\n`;
      });
      
      content += "\nParagraphs:\n";
      scrapedData.paragraphs.forEach(p => {
        content += `${p}\n\n`;
      });
      
      content += "\nLinks:\n";
      scrapedData.links.forEach(link => {
        content += `${link.text} - ${link.url}\n`;
      });
      
      content += "\nList Items:\n";
      scrapedData.listItems.forEach(item => {
        content += `- ${item}\n`;
      });
      
      filename = `${scrapedData.title.replace(/\s+/g, "-").toLowerCase()}-content.txt`;
      mimeType = "text/plain";
    } else if (downloadFormat === "html") {
      content = `<!DOCTYPE html>
<html>
<head>
  <title>${scrapedData.title}</title>
  <meta charset="UTF-8">
  ${scrapedData.metaDescription ? `<meta name="description" content="${scrapedData.metaDescription}">` : ""}
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
    p { margin-bottom: 1em; }
    ul { margin-bottom: 1em; }
  </style>
</head>
<body>
  <h1>${scrapedData.title}</h1>

  ${scrapedData.headings.map(h => `<${h.tag}>${h.text}</${h.tag}>`).join('\n  ')}
  
  ${scrapedData.paragraphs.map(p => `<p>${p}</p>`).join('\n  ')}
  
  <h2>Links</h2>
  <ul>
    ${scrapedData.links.map(link => `<li><a href="${link.url}">${link.text}</a></li>`).join('\n    ')}
  </ul>
  
  <h2>List Items</h2>
  <ul>
    ${scrapedData.listItems.map(item => `<li>${item}</li>`).join('\n    ')}
  </ul>
  
  <footer>
    <p><small>Generated with Beggor Copy Scraper</small></p>
  </footer>
</body>
</html>`;
      
      filename = `${scrapedData.title.replace(/\s+/g, "-").toLowerCase()}-content.html`;
      mimeType = "text/html";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: `Your content is downloading as ${filename}`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 border-b border-gray-200 bg-gradient-to-br from-indigo-50 to-white">
          <div className="container max-w-5xl px-6 md:px-0">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 px-3 py-1 rounded-full bg-white">
                Free Website Copy Scraper Tool
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Extract All Text from Any Website
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Instantly extract headings, paragraphs, links and more from any website. 
                Save time and enhance your SEO, content writing, or research.
              </p>
            </div>

            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 border border-gray-100">
              <ScrapeForm onResult={handleResult} />
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 bg-white">
          <div className="container max-w-5xl px-6 md:px-0">
            <h2 className="text-2xl font-bold text-center mb-10">Why Use Our Website Copy Scraper</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <Check className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="font-bold mb-2">Fast & Easy</h3>
                    <p className="text-gray-600">
                      Just paste a URL and get all website content in seconds. No coding or technical knowledge required.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="font-bold mb-2">Complete Content</h3>
                    <p className="text-gray-600">
                      Extract headings, paragraphs, lists, meta descriptions and all text elements from any webpage.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <Download className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="font-bold mb-2">Export Options</h3>
                    <p className="text-gray-600">
                      Save the content in multiple formats including JSON, plain text, or HTML for easy integration.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Results Section */}
        {scrapedData && (
          <section id="results" className="py-12 bg-gray-50 border-t border-gray-200">
            <div className="container max-w-5xl px-6 md:px-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Scraped Content</h2>
                <div className="flex gap-2">
                  {user ? (
                    <SaveButton content={scrapedData} />
                  ) : (
                    <Link to="/auth">
                      <Button variant="outline" size="sm" className="whitespace-nowrap">
                        Login to Save
                      </Button>
                    </Link>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <select 
                      value={downloadFormat}
                      onChange={(e) => setDownloadFormat(e.target.value as any)}
                      className="text-sm border rounded p-1"
                    >
                      <option value="json">JSON</option>
                      <option value="text">Text</option>
                      <option value="html">HTML</option>
                    </select>
                    <Button 
                      size="sm" 
                      onClick={handleDownload}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg border border-gray-200">
                <ContentDisplay data={scrapedData} />
              </div>
              
              {/* AI chat upsell */}
              {scrapedData && !scrapedData.projectId && (
                <div className="mt-8 bg-indigo-50 rounded-lg p-6 border border-indigo-100">
                  <div className="flex items-center gap-4">
                    <div className="hidden md:block h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">Want to chat with this content?</h3>
                      <p className="text-gray-600">
                        Save this content to your account and use our AI chat to ask questions about this website.
                      </p>
                    </div>
                    <div>
                      <Link to={user ? "/dashboard" : "/auth"}>
                        <Button className="whitespace-nowrap">
                          {user ? "Try AI Chat" : "Sign Up Free"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* SEO Content Section */}
        <section className="py-12 bg-white">
          <div className="container max-w-5xl px-6 md:px-0">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Extract Website Content Quickly & Easily</h2>
              
              <div className="prose prose-gray max-w-none">
                <p>
                  Our website copy scraper tool helps you extract all the text content from any website with just one click. 
                  Whether you're a content writer, SEO specialist, researcher, or developer, this tool saves you hours of 
                  manual copy-pasting and formatting.
                </p>
                
                <h3>How Our Website Content Scraper Works</h3>
                <p>
                  Simply enter the URL of the website you want to extract content from. Our tool instantly scans the page
                  and extracts all text elements including headings, paragraphs, lists, and links. You can view the content 
                  right in your browser or download it in your preferred format.
                </p>
                
                <h3>Free to Use, No Registration Required</h3>
                <p>
                  Our website content scraper is completely free to use. No registration, no hidden fees, and no limits.
                  However, if you create a free account, you'll get access to our AI chat feature that lets you ask 
                  questions about the content you've scraped.
                </p>
                
                <h3>Use Cases for Our Website Copy Scraper</h3>
                <ul>
                  <li><strong>SEO Analysis:</strong> Extract content to analyze keyword density and content structure</li>
                  <li><strong>Content Research:</strong> Gather content from multiple sources for research</li>
                  <li><strong>Competitive Analysis:</strong> Study competitor websites' content strategies</li>
                  <li><strong>Migration:</strong> Extract content to move between platforms</li>
                  <li><strong>Content Archive:</strong> Create backups of your web content</li>
                </ul>
                
                <h3>Advanced Features</h3>
                <p>
                  Upgrade to access our full suite of content tools including:
                </p>
                <ul>
                  <li>AI-powered chat to ask questions about any website</li>
                  <li>Bulk website scraping to extract content from multiple pages at once</li>
                  <li>PDF and document upload to extract and analyze content from files</li>
                  <li>Content comparison tools to identify similarities and differences</li>
                </ul>
                
                <p>
                  Try our free website copy scraper today and see how it can save you time and effort in your content workflow.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500 border-t">
        <div className="container">
          <p>Lumen © {new Date().getFullYear()} • Designed for web professionals</p>
        </div>
      </footer>
    </div>
  );
};

export default ScrapCopy;
