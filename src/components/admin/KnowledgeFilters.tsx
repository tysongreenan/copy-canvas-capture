
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface KnowledgeFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  contentType: string;
  setContentType: (type: string) => void;
  marketingDomain: string;
  setMarketingDomain: (domain: string) => void;
  complexityLevel: string;
  setComplexityLevel: (level: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

export function KnowledgeFilters({
  searchTerm,
  setSearchTerm,
  contentType,
  setContentType,
  marketingDomain,
  setMarketingDomain,
  complexityLevel,
  setComplexityLevel,
  onSearch,
  onClear
}: KnowledgeFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Search & Filter Knowledge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">Search Content</Label>
          <Input
            id="search"
            placeholder="Search knowledge content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="filterContentType">Content Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="principle">Principle</SelectItem>
                <SelectItem value="framework">Framework</SelectItem>
                <SelectItem value="example">Example</SelectItem>
                <SelectItem value="guide">Guide</SelectItem>
                <SelectItem value="case_study">Case Study</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filterMarketingDomain">Marketing Domain</Label>
            <Select value={marketingDomain} onValueChange={setMarketingDomain}>
              <SelectTrigger>
                <SelectValue placeholder="All domains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Domains</SelectItem>
                <SelectItem value="copywriting">Copywriting</SelectItem>
                <SelectItem value="branding">Branding</SelectItem>
                <SelectItem value="email-marketing">Email Marketing</SelectItem>
                <SelectItem value="general-marketing">General Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filterComplexityLevel">Complexity Level</Label>
            <Select value={complexityLevel} onValueChange={setComplexityLevel}>
              <SelectTrigger>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onSearch} className="flex-1">Search</Button>
          <Button onClick={onClear} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
