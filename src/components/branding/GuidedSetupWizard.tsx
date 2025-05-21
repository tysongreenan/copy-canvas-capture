
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wand2, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { BrandVoiceProfiler } from "./BrandVoiceProfiler";

interface GuidedSetupWizardProps {
  initialData?: any;
  onComplete: (data: any) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function GuidedSetupWizard({ 
  initialData,
  onComplete,
  onGenerate,
  isGenerating 
}: GuidedSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    tone: initialData?.tone || "",
    audience: initialData?.audience || "",
    style: initialData?.style || "",
    language: initialData?.language || "English",
    key_messages: initialData?.key_messages || []
  });
  
  const totalSteps = 4;
  
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const updateField = (field: string, value: any) => {
    setData({
      ...data,
      [field]: value
    });
  };
  
  const handleGenerate = () => {
    onGenerate();
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">Define Your Brand Tone</h2>
              <p className="text-gray-500 text-sm">Use the sliders to define how your brand should sound.</p>
            </div>
            
            <BrandVoiceProfiler
              initialTone={data.tone}
              onToneChange={(tone) => updateField("tone", tone)}
            />
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">Who is Your Target Audience?</h2>
              <p className="text-gray-500 text-sm">Select who your content is primarily created for.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Business Professionals", desc: "Companies, executives, and business decision-makers" },
                { title: "Technical Experts", desc: "Developers, engineers, and technical specialists" },
                { title: "General Consumers", desc: "Everyday people looking for products and services" },
                { title: "Creative Professionals", desc: "Designers, writers, and other creative minds" },
                { title: "Industry Specialists", desc: "People with specific industry knowledge" },
                { title: "Custom Audience", desc: "Define your own specific audience" }
              ].map((item, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all hover:border-indigo-300 ${
                    data.audience.includes(item.title) 
                      ? "border-2 border-indigo-600 bg-indigo-50" 
                      : "border border-gray-200"
                  }`}
                  onClick={() => updateField("audience", item.title)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 border ${
                        data.audience.includes(item.title) 
                          ? "bg-indigo-600 border-indigo-600" 
                          : "border-gray-300"
                      }`}>
                        {data.audience.includes(item.title) && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">Writing Style</h2>
              <p className="text-gray-500 text-sm">How should your content be structured?</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {[
                { 
                  title: "Concise & Direct", 
                  desc: "Short paragraphs with clear points. Gets straight to the point without unnecessary details." 
                },
                { 
                  title: "Detailed & Thorough", 
                  desc: "Comprehensive explanations with supporting information. Good for educational content." 
                },
                { 
                  title: "Conversational", 
                  desc: "Friendly and relatable, like talking to a person. Uses questions and personal pronouns." 
                },
                { 
                  title: "Storytelling", 
                  desc: "Narrative approach that engages through stories, examples and scenarios." 
                },
                { 
                  title: "Data-Driven", 
                  desc: "Fact-based approach that emphasizes statistics, research and evidence." 
                }
              ].map((item, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all hover:border-indigo-300 ${
                    data.style.includes(item.title) 
                      ? "border-2 border-indigo-600 bg-indigo-50" 
                      : "border border-gray-200"
                  }`}
                  onClick={() => updateField("style", item.title)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 border ${
                        data.style.includes(item.title) 
                          ? "bg-indigo-600 border-indigo-600" 
                          : "border-gray-300"
                      }`}>
                        {data.style.includes(item.title) && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">Key Messages</h2>
              <p className="text-gray-500 text-sm">What are the most important points to emphasize?</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <textarea
                placeholder="Enter key messages (one per line)"
                value={Array.isArray(data.key_messages) ? data.key_messages.join('\n') : data.key_messages}
                onChange={(e) => updateField("key_messages", e.target.value.split('\n').filter(m => m.trim() !== ''))}
                className="w-full min-h-[200px] p-4 border rounded-md"
              />
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Examples:</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>We prioritize customer satisfaction above all else</li>
                  <li>Our products are eco-friendly and sustainably sourced</li>
                  <li>We've been industry leaders for over 20 years</li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="py-4 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
        </div>
        <Progress value={(step / totalSteps) * 100} className="h-2" />
      </div>
      
      <div className="bg-white rounded-xl p-6">
        {renderStep()}
        
        <div className="flex justify-between mt-12">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex gap-2" 
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <Wand2 className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Auto-Generate'}
            </Button>
            
            <Button onClick={handleNext}>
              {step === totalSteps ? 'Complete' : 'Next'}
              {step !== totalSteps && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
