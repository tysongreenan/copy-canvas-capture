
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Search, TestTube, Archive } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

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

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      <Header />
      
      <main className="flex-1 relative z-0">
        {/* Hero Section */}
        <section className="py-16 md:py-24 border-b border-gray-200">
          <div className="container max-w-6xl px-6 md:px-0">
            <div className="grid md:grid-cols-2 gap-12 items-center">
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
                    <Link to="/auth">
                      Get Started <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/auth">Learn More</Link>
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
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-gray-50">
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
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20">
          <div className="container max-w-5xl px-6 md:px-0">
            <div className="bg-primary/10 rounded-xl p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to start extracting content?
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto">
                Sign up for free today and start illuminating the web's hidden content.
              </p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/auth">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
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
