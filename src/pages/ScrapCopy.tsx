
import { useState } from "react";
import { Header } from "@/components/Header";
import { ScrapeForm } from "@/components/ScrapeForm";
import { ContentDisplay } from "@/components/ContentDisplay";
import type { ScrapedContent } from "@/services/ScraperTypes";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, FileText, Code, MessageSquare } from "lucide-react";

const ScrapCopy = () => {
  const [scrapedData, setScrapedData] = useState<ScrapedContent | null>(null);

  const handleResult = (data: ScrapedContent) => {
    setScrapedData(data);
    
    // Scroll to results after a short delay
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-indigo-50 to-white">
          <div className="container max-w-5xl px-6 md:px-8">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                Extract All Copy From Any Website
                <span className="text-indigo-600">—In Seconds</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-6 max-w-3xl mx-auto">
                The fastest way to extract clean, formatted content from any website—ready for immediate use.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="px-8 py-6 text-lg font-semibold" onClick={() => document.getElementById("scraper")?.scrollIntoView({ behavior: "smooth" })}>
                  Try It Now
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-semibold" asChild>
                  <Link to="/chat">
                    Chat With Your Content <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* SEO-friendly keywords */}
            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500 mb-8">
              <span className="px-3 py-1 rounded-full bg-gray-100">Website Scraper Tool</span>
              <span className="px-3 py-1 rounded-full bg-gray-100">Extract Website Copy</span>
              <span className="px-3 py-1 rounded-full bg-gray-100">Website Content Extractor</span>
              <span className="px-3 py-1 rounded-full bg-gray-100">Copy Scraper</span>
              <span className="px-3 py-1 rounded-full bg-gray-100">Web Content Scraper</span>
            </div>
          </div>
        </section>
        
        {/* Search Section */}
        <section id="scraper" className="py-12 border-b border-gray-100">
          <div className="container max-w-5xl px-6 md:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Enter a Website URL Below
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our tool extracts headings, paragraphs, links and more—giving you clean, structured content in seconds.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <ScrapeForm onResult={handleResult} />
            </div>
          </div>
        </section>
        
        {/* Features */}
        <section className="py-12 bg-white">
          <div className="container max-w-5xl px-6 md:px-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              Why Use Our Web Copy Extractor?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                <div className="h-14 w-14 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast & Easy</h3>
                <p className="text-gray-600">
                  Extract website content with a single click—no technical skills required.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                <div className="h-14 w-14 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Structured Output</h3>
                <p className="text-gray-600">
                  Get clean, organized content separated by headings, paragraphs, and links.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                <div className="h-14 w-14 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Ready Content</h3>
                <p className="text-gray-600">
                  Extract content that's ready for AI analysis and conversation.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* SEO Section */}
        <section className="py-12 bg-gray-50">
          <div className="container max-w-5xl px-6 md:px-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Free Website Copy Scraping Tool
                </h2>
                <p className="text-gray-600 mb-4">
                  Our website content extractor allows you to easily extract all copy from any website. 
                  Whether you need to analyze competitor content, gather research, or prepare content for AI training, 
                  our tool makes it simple.
                </p>
                <p className="text-gray-600 mb-4">
                  Just enter the URL of the website you want to scrape, and our tool will extract all the 
                  headings, paragraphs, links, and more—giving you clean, structured content in seconds.
                </p>
                <p className="text-gray-600">
                  After extracting the content, you can also chat with our AI about the website content, 
                  making it easy to analyze and understand.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">How to use our web scraper:</h3>
                <ol className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="bg-indigo-100 text-indigo-700 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</span>
                    <span>Enter the URL of the website you want to scrape</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-100 text-indigo-700 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</span>
                    <span>Click "Go" to extract all text content</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-100 text-indigo-700 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</span>
                    <span>Review the structured content (headings, paragraphs, links)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-100 text-indigo-700 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</span>
                    <span>Chat with our AI about the content or save it for later</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>
        
        {/* Results Section */}
        <section id="results" className="py-12 min-h-[400px]">
          <div className="container max-w-6xl px-6 md:px-8">
            {scrapedData && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Extracted Website Content</h2>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        if (scrapedData?.projectId) {
                          toast({
                            title: "Ready for chat",
                            description: "Your content is ready for AI chat!",
                          });
                        } else {
                          toast({
                            title: "AI embeddings needed",
                            description: "Generate AI embeddings to enable chat functionality",
                          });
                        }
                      }}
                    >
                      Save Content
                    </Button>
                    
                    <Button asChild>
                      <Link to={scrapedData?.projectId ? `/chat/${scrapedData.projectId}` : "/chat"}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat With This Content
                      </Link>
                    </Button>
                  </div>
                </div>
                
                <ContentDisplay data={scrapedData} />
                
                <div className="mt-10 text-center">
                  <h3 className="text-xl font-semibold mb-4">Want to do more with this content?</h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Chat with our AI about this website content, save it to your account, 
                    or explore the full site structure.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild>
                      <Link to="/dashboard">
                        Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/chat${scrapedData?.projectId ? `/${scrapedData.projectId}` : ""}`}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat With Content
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {!scrapedData && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <line x1="10" y1="9" x2="8" y2="9"/>
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">Enter a URL above to extract website content</p>
                <div className="mt-4 text-sm text-gray-400">
                  Try example sites like <span className="text-indigo-600">apple.com</span> or <span className="text-indigo-600">wikipedia.org</span>
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-12 bg-indigo-50">
          <div className="container max-w-5xl px-6 md:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to do more with your website content?</h2>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
              Create a free account to save extracted content, analyze multiple websites, and chat with our AI about any website content.
            </p>
            <Button size="lg" className="px-8" asChild>
              <Link to="/dashboard">
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500 border-t">
        <div className="container">
          <p>Lumen © {new Date().getFullYear()} • Free Website Copy Scraper Tool</p>
        </div>
      </footer>
    </div>
  );
};

export default ScrapCopy;
