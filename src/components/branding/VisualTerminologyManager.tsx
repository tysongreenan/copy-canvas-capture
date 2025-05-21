
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PlusIcon, X, Edit, Trash2 } from "lucide-react";

interface VisualTerminologyManagerProps {
  initialTerminology?: Record<string, string>;
  onTerminologyChange: (terminology: Record<string, string>) => void;
}

export function VisualTerminologyManager({ 
  initialTerminology = {}, 
  onTerminologyChange 
}: VisualTerminologyManagerProps) {
  const [terminology, setTerminology] = useState<Record<string, string>>(initialTerminology || {});
  const [newTerm, setNewTerm] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  
  const handleAddTerm = () => {
    if (newTerm.trim() === "") return;
    
    const updatedTerminology = {
      ...terminology,
      [newTerm.trim()]: newDefinition.trim()
    };
    
    setTerminology(updatedTerminology);
    onTerminologyChange(updatedTerminology);
    setNewTerm("");
    setNewDefinition("");
  };
  
  const handleRemoveTerm = (term: string) => {
    const updatedTerminology = { ...terminology };
    delete updatedTerminology[term];
    
    setTerminology(updatedTerminology);
    onTerminologyChange(updatedTerminology);
  };
  
  const handleEdit = (term: string) => {
    setEditKey(term);
    setEditValue(terminology[term]);
  };
  
  const saveEdit = () => {
    if (!editKey) return;
    
    const updatedTerminology = { ...terminology };
    updatedTerminology[editKey] = editValue;
    
    setTerminology(updatedTerminology);
    onTerminologyChange(updatedTerminology);
    setEditKey(null);
    setEditValue("");
  };
  
  const cancelEdit = () => {
    setEditKey(null);
    setEditValue("");
  };

  return (
    <div className="space-y-6">
      <Card className="border border-dashed border-gray-300 bg-gray-50">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium mb-4">Add New Term</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Term</label>
              <Input 
                placeholder="e.g., product name, service"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Preferred Description</label>
              <Input 
                placeholder="e.g., Lumen AI, content service"
                value={newDefinition}
                onChange={(e) => setNewDefinition(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={handleAddTerm}
            variant="outline" 
            className="w-full gap-2"
            disabled={newTerm.trim() === ""}
          >
            <PlusIcon className="h-4 w-4" />
            Add Term
          </Button>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h3 className="font-medium">Brand Terminology</h3>
        
        {Object.keys(terminology).length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md bg-gray-50">
            <p className="text-sm text-gray-500">No terminology defined yet</p>
            <p className="text-xs text-gray-400 mt-1">Add terms above to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(terminology).map(([term, definition], index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-4">
                  {editKey === term ? (
                    <div className="space-y-3">
                      <Input 
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="text-sm font-medium"
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={cancelEdit}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEdit}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{term}</h4>
                          <Badge variant="outline" className="font-normal text-xs">Term</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{definition}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEdit(term)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleRemoveTerm(term)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
