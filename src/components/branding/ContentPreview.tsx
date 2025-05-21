
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrandVoice } from "@/services/BrandingService";

interface ContentPreviewProps {
  brandVoice: Partial<BrandVoice>;
}

export function ContentPreview({ brandVoice }: ContentPreviewProps) {
  const [contentType, setContentType] = useState("homepage");
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const generatePreviewContent = () => {
    // This is a simplified version - in a real implementation, this would use more
    // sophisticated logic to generate content based on brand voice settings
    const tone = brandVoice.tone || "Professional";
    const audience = brandVoice.audience || "customers";
    const style = brandVoice.style || "Informative";
    
    let contentTemplate = "";
    
    switch (contentType) {
      case "homepage":
        if (tone.toLowerCase().includes("formal") || tone.toLowerCase().includes("professional")) {
          contentTemplate = `<h1>Welcome to Our Professional Platform</h1>
          <p>We are committed to providing industry-leading solutions for ${audience}. Our team of experts has developed comprehensive services that address your specific needs.</p>
          <p>With years of experience in the field, we understand the challenges you face and offer tailored solutions that drive results and create value.</p>`;
        } else if (tone.toLowerCase().includes("casual") || tone.toLowerCase().includes("friendly")) {
          contentTemplate = `<h1>Hey there! Welcome aboard!</h1>
          <p>We're super excited to show you around our platform made just for awesome ${audience} like you. We've created some really cool features we think you'll love.</p>
          <p>Our team has been working hard to make everything easy and fun to use, so you can focus on what matters most to you!</p>`;
        } else {
          contentTemplate = `<h1>Welcome to Our Platform</h1>
          <p>We provide solutions designed for ${audience}. Our services are developed to meet your specific requirements.</p>
          <p>Our experienced team understands your needs and works to deliver value through our offerings.</p>`;
        }
        break;
      case "about":
        if (style.toLowerCase().includes("story") || style.toLowerCase().includes("narrative")) {
          contentTemplate = `<h1>Our Journey</h1>
          <p>It all started with a simple idea and a passion to make a difference. When we first began, we recognized a gap in the market that wasn't serving ${audience} properly.</p>
          <p>That realization led us down a path of innovation and discovery, ultimately bringing us to where we are today - a trusted partner for thousands of clients worldwide.</p>`;
        } else if (style.toLowerCase().includes("data") || style.toLowerCase().includes("technical")) {
          contentTemplate = `<h1>About Our Company</h1>
          <p>Founded in 2015, we've grown by 200% year-over-year, now serving over 10,000 ${audience} globally with a 98.7% satisfaction rate.</p>
          <p>Our proprietary technology has been benchmarked to outperform competitors by 35% in efficiency metrics, while maintaining industry-leading security standards.</p>`;
        } else {
          contentTemplate = `<h1>About Us</h1>
          <p>We're a dedicated team focused on creating the best possible experience for ${audience}. Our mission is to provide exceptional service and innovative solutions.</p>
          <p>With our expertise and commitment to quality, we've built a reputation as a reliable partner that understands and meets your needs.</p>`;
        }
        break;
      case "product":
        contentTemplate = `<h1>Our Solutions</h1>
        <p>Designed specifically for ${audience}, our products combine cutting-edge technology with user-friendly interfaces.</p>
        <p>Each solution is developed with attention to detail and a focus on solving real problems that you face every day.</p>`;
        break;
      default:
        contentTemplate = `<h1>Welcome</h1>
        <p>Content tailored for ${audience}.</p>`;
    }
    
    // Add key messages if available
    if (Array.isArray(brandVoice.key_messages) && brandVoice.key_messages.length > 0) {
      contentTemplate += `
      <h2>Why Choose Us</h2>
      <ul>
        ${brandVoice.key_messages.slice(0, 3).map(message => `<li>${message}</li>`).join('')}
      </ul>`;
    }
    
    return contentTemplate;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Content Preview
            </CardTitle>
            
            <div className="flex items-center gap-3">
              <Select
                value={contentType}
                onValueChange={setContentType}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homepage">Homepage</SelectItem>
                  <SelectItem value="about">About Us</SelectItem>
                  <SelectItem value="product">Product Page</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCcw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="border rounded-md overflow-hidden">
            <div className="bg-gray-100 border-b p-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="ml-2 text-xs text-gray-500">Preview</div>
            </div>
            
            <div className="p-6 bg-white">
              <div 
                className="prose prose-sm max-w-none" 
                dangerouslySetInnerHTML={{ __html: generatePreviewContent() }}
              />
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p className="italic">This preview is generated based on your brand voice settings to help you visualize how your content will appear.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
