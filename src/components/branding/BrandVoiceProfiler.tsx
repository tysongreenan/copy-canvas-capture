
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkle, Check } from "lucide-react";

interface BrandVoiceProfilerProps {
  initialTone?: string;
  onToneChange: (tone: string) => void;
}

interface ToneAttribute {
  name: string;
  left: string;
  right: string;
  value: number;
}

export function BrandVoiceProfiler({ initialTone, onToneChange }: BrandVoiceProfilerProps) {
  const defaultAttributes = [
    { name: "formality", left: "Casual", right: "Formal", value: 50 },
    { name: "technicality", left: "Simple", right: "Technical", value: 50 },
    { name: "emotion", left: "Reserved", right: "Expressive", value: 50 },
    { name: "humor", left: "Serious", right: "Playful", value: 30 },
  ];
  
  // Parse initial tone if available
  const [attributes, setAttributes] = useState<ToneAttribute[]>(() => {
    if (!initialTone) return defaultAttributes;
    
    try {
      // Try to extract attributes from tone text
      const newAttributes = [...defaultAttributes];
      
      if (initialTone.toLowerCase().includes("formal")) {
        newAttributes[0].value = 80;
      } else if (initialTone.toLowerCase().includes("casual")) {
        newAttributes[0].value = 20;
      }
      
      if (initialTone.toLowerCase().includes("technical")) {
        newAttributes[1].value = 80;
      } else if (initialTone.toLowerCase().includes("simple")) {
        newAttributes[1].value = 20;
      }
      
      if (initialTone.toLowerCase().includes("expressive")) {
        newAttributes[2].value = 80;
      } else if (initialTone.toLowerCase().includes("reserved")) {
        newAttributes[2].value = 20;
      }
      
      if (initialTone.toLowerCase().includes("playful")) {
        newAttributes[3].value = 80;
      } else if (initialTone.toLowerCase().includes("serious")) {
        newAttributes[3].value = 20;
      }
      
      return newAttributes;
    } catch (e) {
      return defaultAttributes;
    }
  });

  const handleSliderChange = (index: number, values: number[]) => {
    const newAttributes = [...attributes];
    newAttributes[index].value = values[0];
    setAttributes(newAttributes);
    
    // Generate tone description
    const toneDescription = generateToneDescription(newAttributes);
    onToneChange(toneDescription);
  };
  
  const generateToneDescription = (attrs: ToneAttribute[]): string => {
    const descriptions: string[] = [];
    
    if (attrs[0].value > 70) descriptions.push("Formal");
    else if (attrs[0].value < 30) descriptions.push("Casual");
    
    if (attrs[1].value > 70) descriptions.push("Technical");
    else if (attrs[1].value < 30) descriptions.push("Simple and accessible");
    
    if (attrs[2].value > 70) descriptions.push("Expressive");
    else if (attrs[2].value < 30) descriptions.push("Reserved");
    
    if (attrs[3].value > 70) descriptions.push("Playful");
    else if (attrs[3].value < 30) descriptions.push("Serious");
    
    if (descriptions.length === 0) {
      descriptions.push("Balanced");
    }
    
    return descriptions.join(", ") + " tone of voice";
  };
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {attributes.map((attr, index) => (
          <Card key={attr.name} className="overflow-hidden border border-gray-100">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-1 flex items-center justify-between">
                  {attr.name.charAt(0).toUpperCase() + attr.name.slice(1)}
                  {attr.value > 0 && attr.value < 100 && (
                    <Badge variant="outline" className="font-normal">
                      {attr.value}%
                    </Badge>
                  )}
                </h3>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{attr.left}</span>
                  <span>{attr.right}</span>
                </div>
              </div>
              
              <Slider
                defaultValue={[attr.value]}
                min={0}
                max={100}
                step={1}
                className="mb-2"
                onValueChange={(values) => handleSliderChange(index, values)}
              />
              
              <div className="mt-3 flex items-start">
                <div className="bg-indigo-50 p-2 rounded-full mr-2">
                  <Sparkle className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="text-xs text-gray-600 flex-1">
                  {attr.value <= 30 && (
                    <p>Your brand voice is more <span className="font-semibold">{attr.left.toLowerCase()}</span> which will connect with your audience on a personal level.</p>
                  )}
                  {attr.value > 30 && attr.value < 70 && (
                    <p>Your brand strikes a good balance between <span className="font-semibold">{attr.left.toLowerCase()}</span> and <span className="font-semibold">{attr.right.toLowerCase()}</span>.</p>
                  )}
                  {attr.value >= 70 && (
                    <p>Your brand voice is more <span className="font-semibold">{attr.right.toLowerCase()}</span> which will establish authority in your field.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="bg-indigo-50 border-indigo-100">
        <CardContent className="p-6">
          <div className="flex items-start">
            <div className="bg-white rounded-full p-2 mr-3 shadow-sm">
              <Check className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Generated Tone Profile</h3>
              <p className="text-sm text-indigo-900/70">
                {generateToneDescription(attributes)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
