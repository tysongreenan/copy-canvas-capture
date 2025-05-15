import { useState } from "react";
import { Header } from "@/components/Header";
import { ScrapeForm } from "@/components/ScrapeForm";
import { ContentDisplay } from "@/components/ContentDisplay";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { ScrapedContent } from "@/services/ScraperService";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Lightbulb, Search, TestTube } from "lucide-react";

const Index = () => {
  const [scrapedData, setScrapedData] = useState<ScrapedContent | null>(null);
  const { user } = useAuth();

  const handleResult = (data: ScrapedContent) => {
    setScrapedData(data);
  };

  const features = [
    {
      title: "Content Extraction",
      description: "Extract headings, paragraphs, links and more from any website with a single click",
      icon: <Search className="w-10 h-10 text-primary" />
    },
    {
      title: "Clean Formatting",
      description: "Get ready-to-use content without ads, navigation or other distractions",
      icon: <TestTube className="w-10 h-10 text-primary" />
    },
    {
      title: "Instant Results",
      description: "No waiting - get your content immediately and ready for implementation",
      icon: <Lightbulb className="w-10 h-10 text-primary" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white relative">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-primary rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      <Header />
      
      <main className="flex-1 relative z-0">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container max-w-5xl px-6 md:px-0">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                <span className="text-gradient-lumen">Illuminate Hidden Content</span> <br />
                From Any Website
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
                Extract clean, formatted content from any website instantly. 
                Buy once, use forever.
              </p>

              <div className="max-w-2xl mx-auto">
                <ScrapeForm onResult={handleResult} />
              </div>
            </div>
            
            {scrapedData && <ContentDisplay data={scrapedData} />}
            
            {!scrapedData && (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 text-gray-200">
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
                  Try example sites like <span className="text-primary">apple.com</span> or <span className="text-primary">wikipedia.org</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* About Us Section */}
        <section className="py-16 bg-gray-50">
          <div className="container max-w-5xl px-6 md:px-0">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">About Lumen</h2>
              <div className="h-1 w-20 bg-primary mx-auto"></div>
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <div className="relative">
                  <div className="w-full h-64 md:h-96 bg-gray-200 rounded-lg overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-gray-300">
                      <circle cx="12" cy="12" r="10" className="stroke-primary" />
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" className="stroke-primary" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-gray-600 mb-6">
                  At Lumen, we believe that content should be accessible, clean, and ready to use. Our mission is to shed light on hidden content, making it easy for web professionals to extract and repurpose website content without the hassle of manual copying and formatting.
                </p>
                <p className="text-gray-600 mb-6">
                  Founded by a team of web designers and developers, Lumen was born out of the frustration of constantly needing to manually extract content from clients' existing websites.
                </p>
                <Button asChild>
                  <Link to="/auth" className="inline-flex items-center gap-2">
                    Learn More <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-20">
          <div className="container max-w-5xl px-6 md:px-0">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
              <div className="h-1 w-20 bg-primary mx-auto"></div>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Everything you need to extract and repurpose website content efficiently.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 px-6 pb-6 flex flex-col items-center text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-3">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-gray-50">
          <div className="container max-w-5xl px-6 md:px-0">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
              <div className="h-1 w-20 bg-primary mx-auto"></div>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Transparent pricing with no subscription or hidden fees.
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <Card className="border-none shadow-xl">
                <CardContent className="pt-8 px-8 pb-8">
                  <div className="text-center mb-6">
                    <div className="inline-block rounded-full bg-primary/10 p-3 mb-4">
                      <Lightbulb className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">Lifetime Access</h3>
                    <div className="text-4xl font-bold my-4">$49</div>
                    <p className="text-gray-600 text-sm">One-time payment, forever access</p>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Unlimited Content Extraction
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Save & Export Results
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Free Updates Forever
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Personal & Commercial Use
                    </li>
                  </ul>
                  
                  <Button className="w-full" asChild>
                    <Link to="/auth">Buy Lifetime Access</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 to-white">
          <div className="container max-w-5xl px-6 md:px-0">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Try Lumen Before You Buy</h2>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                Extract content from any website now - no sign up required.
              </p>

              <div className="max-w-2xl mx-auto">
                <ScrapeForm onResult={handleResult} />
              </div>
              
              <div className="mt-10 pt-10 border-t border-gray-200">
                <p className="text-gray-500">
                  Questions? <a href="mailto:support@lumen-extractor.com" className="text-primary hover:underline">Contact our support team</a>
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

export default Index;
