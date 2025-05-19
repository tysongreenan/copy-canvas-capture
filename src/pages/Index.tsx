
import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { ScrapeForm } from "@/components/ScrapeForm";
import { ScrapedContent } from "@/services/ScraperTypes";
import { ContentDisplay } from "@/components/ContentDisplay";
import { ArrowRight, Search, TestTube, Archive, CheckCircle, Clock, CreditCard } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const [scrapedResult, setScrapedResult] = useState<ScrapedContent | null>(null);

  // Redirect already authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

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
      icon: <Archive className="w-10 h-10 text-primary" />
    }
  ];
  
  const pricingPlans = [
    {
      name: "Lifetime Access",
      price: "$79",
      description: "One-time payment, lifetime access",
      features: [
        "Unlimited extractions",
        "Full content preservation",
        "Export to multiple formats",
        "Priority support",
        "All future updates"
      ],
      cta: "Buy Now",
      popular: true
    }
  ];

  const handleScrapedResult = (data: ScrapedContent) => {
    setScrapedResult(data);
    // Scroll to the result section
    document.getElementById("demo-result")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      <Header />
      
      <main className="flex-1 relative z-0">
        {/* Hero Section with Try Now Functionality */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200">
          <div className="container max-w-6xl px-6 md:px-0">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Illuminate Hidden Web Content
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Extract clean, formatted content from any website instantly.
                  Perfect for copywriters, marketers, and developers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <a href="#try-now">
                      Try It Now <ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a href="#pricing">See Pricing</a>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src="/placeholder.svg" 
                    alt="Lumen App Screenshot" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
            
            {/* Interactive Try Now Section */}
            <div id="try-now" className="mt-16 bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-center">Try Lumen Now</h2>
              <ScrapeForm onResult={handleScrapedResult} />
            </div>
          </div>
        </section>

        {/* Demo Result Section - Shows only when there's a result */}
        {scrapedResult && (
          <section id="demo-result" className="py-16 md:py-20 border-b border-gray-200 bg-gray-50">
            <div className="container max-w-6xl px-6 md:px-0">
              <h2 className="text-3xl font-bold mb-8 text-center">Your Extracted Content</h2>
              <ContentDisplay data={scrapedResult} />
              <div className="mt-12 text-center">
                <p className="text-lg mb-6">Like what you see? Get full access with our one-time purchase.</p>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <a href="#pricing">See Pricing</a>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* About Us Section */}
        <section className="py-16 md:py-24 border-b border-gray-200">
          <div className="container max-w-6xl px-6 md:px-0">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">About Lumen</h2>
              <div className="h-1 w-20 bg-primary mx-auto"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg mb-6">
                  Lumen was born from frustration. As web developers, we constantly needed to extract content from websites for migration projects, but existing tools were cumbersome and expensive with monthly subscriptions.
                </p>
                <p className="text-lg mb-6">
                  We built Lumen to be the tool we always wanted - powerful, simple, and affordable with a one-time payment model.
                </p>
                <p className="text-lg">
                  Our mission is to make web content extraction accessible to everyone, from freelancers to agencies, without recurring fees.
                </p>
              </div>
              <div className="relative">
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src="/placeholder.svg" 
                    alt="Team working on Lumen" 
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-gray-50 border-b border-gray-200">
          <div className="container max-w-6xl px-6 md:px-0">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
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
            
            {/* Additional Feature Highlights */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-primary mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Buy Once, Use Forever</h3>
                  <p className="text-gray-600">No monthly subscriptions or hidden fees. Purchase once and enjoy lifetime access to all features.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="w-6 h-6 text-primary mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Save Hours of Work</h3>
                  <p className="text-gray-600">Extract content in seconds that would take hours to manually copy and format.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 md:py-24 border-b border-gray-200">
          <div className="container max-w-6xl px-6 md:px-0">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
              <div className="h-1 w-20 bg-primary mx-auto"></div>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                No subscriptions. No recurring fees. Just one simple payment for lifetime access.
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`border-2 ${plan.popular ? 'border-primary' : 'border-gray-200'} shadow-lg`}>
                  {plan.popular && (
                    <div className="bg-primary text-white text-center py-2 font-medium">
                      Popular Choice
                    </div>
                  )}
                  <CardContent className="pt-6 px-6 pb-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <div className="flex items-center justify-center">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-gray-500 ml-2">one-time</span>
                      </div>
                      <p className="text-gray-600 mt-2">{plan.description}</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-primary mr-3" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90">
                      <Link to="/auth">
                        <CreditCard className="mr-2 w-4 h-4" /> {plan.cta}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <div className="mt-4 text-center text-sm text-gray-500">
                30-day money-back guarantee. No questions asked.
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container max-w-5xl px-6 md:px-0">
            <div className="bg-primary/10 rounded-xl p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Try Lumen Before You Buy
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto">
                Enter any website URL below to extract its content. See for yourself how powerful Lumen really is.
              </p>
              
              <div className="max-w-2xl mx-auto">
                <ScrapeForm onResult={handleScrapedResult} />
              </div>
              
              <div className="mt-8">
                <Button asChild size="lg" variant="outline" className="bg-white hover:bg-gray-100">
                  <Link to="/auth">
                    Create Account <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-10 bg-gray-50 border-t text-center">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500">Lumen © {new Date().getFullYear()} • Designed for web professionals</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Terms</a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
