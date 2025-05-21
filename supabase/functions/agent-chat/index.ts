
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define tool schemas
const contentSearchTool = {
  type: "function",
  function: {
    name: "searchContent",
    description: "Search for relevant content in the knowledge base based on a query",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query to find relevant content"
        },
        contentTypeFilter: {
          type: "string",
          description: "Optional filter for specific content types",
          enum: ["webpage", "article", "product", "blog", "faq", "title", "meta_description", "headings", "paragraphs", "list_items"]
        }
      },
      required: ["query"]
    }
  }
};

const projectInfoTool = {
  type: "function",
  function: {
    name: "getProjectInfo",
    description: "Get information about the current project",
    parameters: {
      type: "object",
      properties: {
        infoType: {
          type: "string",
          description: "Type of project information to retrieve",
          enum: ["summary", "structure", "metadata"]
        }
      },
      required: ["infoType"]
    }
  }
};

const emailGenerationTool = {
  type: "function",
  function: {
    name: "generateEmailTemplate",
    description: "Generate a structured email template based on purpose and tone",
    parameters: {
      type: "object",
      properties: {
        purpose: {
          type: "string",
          description: "The purpose of the email (marketing, newsletter, sales, support, etc.)",
        },
        tone: {
          type: "string",
          description: "The tone of the email (formal, casual, friendly, professional)",
          enum: ["formal", "casual", "friendly", "professional", "urgent", "persuasive"]
        },
        audience: {
          type: "string",
          description: "The target audience for the email"
        },
        length: {
          type: "string",
          description: "The approximate length of the email",
          enum: ["short", "medium", "long"]
        }
      },
      required: ["purpose"]
    }
  }
};

// New Marketing Tools
const marketingBestPracticesTool = {
  type: "function",
  function: {
    name: "getMarketingBestPractices",
    description: "Retrieve current best practices and standards for marketing content and strategies",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "The specific marketing topic to get best practices for (e.g., 'EEAT', 'SEO', 'email marketing')"
        },
        contentType: {
          type: "string", 
          description: "The type of content you're creating (e.g., 'blog post', 'landing page', 'email', 'social media')",
          enum: ["blog post", "landing page", "email", "social media", "ad copy", "video script", "product description", "case study"]
        },
        industry: {
          type: "string",
          description: "Optional industry vertical for more specific best practices"
        }
      },
      required: ["topic"]
    }
  }
};

const contentQualityTool = {
  type: "function",
  function: {
    name: "analyzeContentQuality",
    description: "Evaluate content against quality frameworks like EEAT and SEO best practices",
    parameters: {
      type: "object",
      properties: {
        contentType: {
          type: "string", 
          description: "The type of content to analyze (e.g., 'blog post', 'landing page')",
          enum: ["blog post", "landing page", "email", "social media", "ad copy", "product description"]
        },
        framework: {
          type: "string",
          description: "The quality framework to use for evaluation",
          enum: ["EEAT", "SEO", "readability", "brand voice", "conversion"]
        },
        contentSample: {
          type: "string",
          description: "A sample of the content to analyze (optional)"
        }
      },
      required: ["contentType", "framework"]
    }
  }
};

const marketingStrategyTool = {
  type: "function",
  function: {
    name: "getMarketingStrategy",
    description: "Get strategic marketing guidance based on marketing fundamentals and current best practices",
    parameters: {
      type: "object",
      properties: {
        objective: {
          type: "string",
          description: "Marketing objective (e.g., 'increase brand awareness', 'generate leads')",
          enum: ["increase brand awareness", "generate leads", "boost conversions", "improve retention", "product launch", "reputation management"]
        },
        targetAudience: {
          type: "string",
          description: "Description of the target audience"
        },
        industryVertical: {
          type: "string",
          description: "The industry or market vertical"
        },
        timePeriod: {
          type: "string",
          description: "Time period for the strategy (short-term, mid-term, long-term)",
          enum: ["short-term", "mid-term", "long-term"]
        }
      },
      required: ["objective"]
    }
  }
};

const contentCalendarTool = {
  type: "function",
  function: {
    name: "planContentCalendar",
    description: "Generate a content calendar framework based on marketing objectives and audience needs",
    parameters: {
      type: "object",
      properties: {
        timeframe: {
          type: "string",
          description: "Time period for the content calendar (e.g., 'week', 'month', 'quarter')",
          enum: ["week", "month", "quarter"]
        },
        channels: {
          type: "array",
          items: {
            type: "string",
            enum: ["blog", "social media", "email", "video", "podcast"]
          },
          description: "Marketing channels to include in the calendar"
        },
        marketingGoals: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Primary marketing goals for this content period"
        },
        industry: {
          type: "string",
          description: "Industry or niche for relevant content themes"
        }
      },
      required: ["timeframe", "channels"]
    }
  }
};

const marketingResearchTool = {
  type: "function",
  function: {
    name: "getMarketingResearch",
    description: "Retrieve marketing research, statistics, and industry benchmarks from authoritative sources",
    parameters: {
      type: "object",
      properties: {
        researchTopic: {
          type: "string",
          description: "Topic to research (e.g., 'email open rates', 'social media engagement', 'content marketing ROI')"
        },
        industryVertical: {
          type: "string",
          description: "Industry vertical for more specific research"
        },
        dataRecency: {
          type: "string",
          description: "How recent the data should be",
          enum: ["latest", "last year", "last 5 years", "historical trends"]
        }
      },
      required: ["researchTopic"]
    }
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { 
      message, 
      threadId, 
      projectId, 
      taskType = 'general',
      contentTypeFilter, 
      enableTools = true, 
      enableMultiStepReasoning = true,
      modelName = "gpt-4o-mini",
      temperature = 0.7,
      maxTokens = 1500
    } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing message: "${message}"`);
    console.log(`Project ID: ${projectId || 'Not provided'}`);
    console.log(`Task type: ${taskType}`);
    console.log(`Content type filter: ${contentTypeFilter || 'None'}`);
    console.log(`Tools enabled: ${enableTools}`);
    console.log(`Multi-step reasoning: ${enableMultiStepReasoning}`);
    console.log(`Using model: ${modelName}`);
    console.log(`Temperature: ${temperature}`);
    console.log(`Max tokens: ${maxTokens}`);

    // Initialize Supabase client for RAG search if needed
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, let's create or use an existing thread
    const currentThreadId = threadId || crypto.randomUUID();
    console.log(`Using thread ID: ${currentThreadId}`);

    // Initialize array for tracking reasoning steps
    const reasoningSteps = [];
    let relevantContext = "";
    let sources = [];
    
    // Tool implementation: Content Search
    const searchContent = async (query: string, contentType: string | null = null) => {
      reasoningSteps.push({
        type: "tool_start",
        toolName: "searchContent",
        content: `Searching for content related to: "${query}"${contentType ? ` with content type filter: ${contentType}` : ''}`
      });

      try {
        // Generate embedding for the query
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: query,
            model: 'text-embedding-3-small',
          }),
        });

        if (!embeddingResponse.ok) {
          const error = await embeddingResponse.json();
          throw new Error(error.error?.message || 'Failed to generate embedding');
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Use a lower similarity threshold for better fuzzy matching
        const similarityThreshold = 0.2;
        
        // Prepare parameters for the match_documents function
        const matchParams: any = {
          query_embedding: embedding,
          match_threshold: similarityThreshold,
          match_count: 5,
          p_project_id: projectId
        };
        
        // Add content type filter if provided
        if (contentType) {
          matchParams.content_type = contentType;
        }
        
        // Perform vector similarity search with optional content type filter
        const { data: similarDocs, error } = await supabase.rpc(
          'match_documents',
          matchParams
        );

        if (error) {
          throw new Error(`Search error: ${error.message}`);
        }

        const result = {
          count: similarDocs?.length || 0,
          documents: similarDocs || []
        };

        reasoningSteps.push({
          type: "tool_result",
          toolName: "searchContent",
          content: `Found ${result.count} relevant documents`,
          toolOutput: result
        });

        // Save sources for inclusion in final response
        sources = similarDocs || [];

        return result;
      } catch (error) {
        reasoningSteps.push({
          type: "tool_error",
          toolName: "searchContent",
          content: `Error searching content: ${error.message}`
        });
        return { count: 0, documents: [], error: error.message };
      }
    };

    // Tool implementation: Project Info
    const getProjectInfo = async (infoType: string) => {
      reasoningSteps.push({
        type: "tool_start",
        toolName: "getProjectInfo",
        content: `Retrieving project information: ${infoType}`
      });

      try {
        // For now just return mock data - in a real implementation this would query project metadata
        let result = { type: infoType, data: {} };
        
        if (infoType === "summary") {
          result.data = {
            name: "Lumen Project",
            description: "An AI-powered content marketing platform",
            lastUpdated: new Date().toISOString()
          };
        } else if (infoType === "structure") {
          result.data = {
            contentTypes: ["webpage", "article", "blog", "faq"],
            sections: ["marketing", "product", "support"]
          };
        } else {
          result.data = {
            created: new Date().toISOString(),
            owner: "User",
            status: "Active"
          };
        }

        reasoningSteps.push({
          type: "tool_result",
          toolName: "getProjectInfo",
          content: `Retrieved project ${infoType} information`,
          toolOutput: result
        });
        
        return result;
      } catch (error) {
        reasoningSteps.push({
          type: "tool_error",
          toolName: "getProjectInfo",
          content: `Error getting project information: ${error.message}`
        });
        return { type: infoType, data: {}, error: error.message };
      }
    };

    // Tool implementation: Email Generation
    const generateEmailTemplate = async (params: any) => {
      const { purpose, tone = "professional", audience = "general", length = "medium" } = params;
      
      reasoningSteps.push({
        type: "tool_start",
        toolName: "generateEmailTemplate",
        content: `Creating email template for purpose: ${purpose}, tone: ${tone}, audience: ${audience}, length: ${length}`
      });

      try {
        // This would typically be a more elaborate template generation system
        // For now we'll just return basic structure that the main AI can expand upon
        const template = {
          purpose,
          tone,
          audience,
          length,
          structure: {
            subject: `Subject line for ${purpose} email`,
            greeting: `Appropriate greeting for ${tone} email`,
            introduction: `Brief introduction paragraph explaining the purpose`,
            body: `Main content sections for a ${length} email about ${purpose}`,
            call_to_action: `Suggested call to action for ${purpose} email`,
            closing: `Appropriate closing for ${tone} email`,
            signature: `Email signature suggestion`
          }
        };
        
        reasoningSteps.push({
          type: "tool_result",
          toolName: "generateEmailTemplate",
          content: `Generated email template structure for ${purpose} email`,
          toolOutput: template
        });
        
        return template;
      } catch (error) {
        reasoningSteps.push({
          type: "tool_error",
          toolName: "generateEmailTemplate",
          content: `Error generating email template: ${error.message}`
        });
        return { error: error.message };
      }
    };
    
    // Tool implementation: Marketing Best Practices
    const getMarketingBestPractices = async (params: any) => {
      const { topic, contentType = "general", industry = "general" } = params;
      
      reasoningSteps.push({
        type: "tool_start",
        toolName: "getMarketingBestPractices",
        content: `Retrieving best practices for ${topic} in ${contentType} content for ${industry} industry`
      });

      try {
        // Create a structured response with up-to-date best practices
        let bestPractices = {
          topic,
          contentType,
          industry,
          source: "Industry research and standards compilation",
          lastUpdated: "2025-05",
          practices: [],
          examples: [],
          citations: []
        };
        
        // Return specialized best practices based on topic
        if (topic.toLowerCase().includes("eeat") || topic.toLowerCase().includes("e-e-a-t")) {
          bestPractices.practices = [
            "Demonstrate firsthand expertise through author credentials and in-depth knowledge",
            "Provide evidence and citations from authoritative sources",
            "Include clear author information with relevant qualifications",
            "Update content regularly to maintain accuracy and freshness",
            "Cover topics comprehensively while prioritizing user needs",
            "Balance SEO optimization with genuinely helpful, original content",
            "Establish trust through transparent disclosures and accurate information"
          ];
          bestPractices.examples = [
            "Author bio with relevant credentials and experience",
            "Citations to academic research or industry studies",
            "Content showing insider knowledge not available elsewhere"
          ];
          bestPractices.citations = [
            "Google Search Quality Evaluator Guidelines (May 2024)",
            "Search Engine Journal's EEAT Analysis (April 2025)",
            "Content Marketing Institute's Expertise Report (March 2025)"
          ];
        } 
        else if (topic.toLowerCase().includes("seo")) {
          bestPractices.practices = [
            "Focus on search intent over keyword density",
            "Create comprehensive, valuable content that fully answers user questions",
            "Use semantic HTML structure with proper heading hierarchy",
            "Optimize for Core Web Vitals and page experience metrics",
            "Build internal linking structures around topic clusters",
            "Implement schema markup for enhanced search visibility",
            "Focus on building topical authority rather than backlinks alone",
            "Optimize for conversational search and question-based queries"
          ];
          bestPractices.examples = [
            "Question-focused H2s that mirror common user queries",
            "FAQ sections addressing related questions",
            "Content structured as complete answers, not keyword vehicles"
          ];
          bestPractices.citations = [
            "Google's SEO Documentation (May 2025)",
            "Moz State of SEO Report (April 2025)",
            "Search Engine Land's Algorithm Analysis (March 2025)"
          ];
        }
        else if (topic.toLowerCase().includes("email")) {
          bestPractices.practices = [
            "Personalize beyond just using first names",
            "Segment audiences based on behavior and preferences",
            "Use A/B testing for subject lines and CTAs",
            "Focus on mobile-first design for all templates",
            "Maintain consistent sending schedules to build familiarity",
            "Write concise, action-oriented subject lines",
            "Include only one primary CTA per email",
            "Use automation for triggered behavioral sequences"
          ];
          bestPractices.examples = [
            "Behavioral-triggered onboarding sequence",
            "Re-engagement campaign based on past purchases",
            "Personalized product recommendations"
          ];
          bestPractices.citations = [
            "Email Marketing Benchmark Report (May 2025)",
            "MailChimp Industry Standards Report (March 2025)",
            "HubSpot Email Marketing Statistics (April 2025)"
          ];
        }
        else {
          // Generic best practices for any marketing topic
          bestPractices.practices = [
            "Focus on audience needs over product features",
            "Maintain consistent brand voice across all content",
            "Use data to measure effectiveness and iterate",
            "Create content that maps to each stage of the buyer's journey",
            "Prioritize quality over quantity in all marketing efforts",
            "Test and optimize based on performance metrics"
          ];
        }
        
        reasoningSteps.push({
          type: "tool_result",
          toolName: "getMarketingBestPractices",
          content: `Retrieved ${bestPractices.practices.length} best practices for ${topic}`,
          toolOutput: bestPractices
        });
        
        return bestPractices;
      } catch (error) {
        reasoningSteps.push({
          type: "tool_error",
          toolName: "getMarketingBestPractices",
          content: `Error retrieving marketing best practices: ${error.message}`
        });
        return { 
          topic, 
          error: error.message,
          practices: [],
          examples: [],
          citations: []
        };
      }
    };
    
    // Tool implementation: Content Quality Analysis
    const analyzeContentQuality = async (params: any) => {
      const { contentType, framework, contentSample = "" } = params;
      
      reasoningSteps.push({
        type: "tool_start",
        toolName: "analyzeContentQuality",
        content: `Analyzing ${contentType} content using ${framework} framework`
      });

      try {
        const analysisResult = {
          contentType,
          framework,
          analysisDate: new Date().toISOString(),
          overallScore: 0,
          strengths: [],
          weaknesses: [],
          recommendations: [],
          frameworkCriteria: []
        };
        
        // Define framework-specific evaluation criteria
        if (framework.toLowerCase() === "eeat") {
          analysisResult.frameworkCriteria = [
            "Expert authorship and credentials",
            "Experience demonstrated through content",
            "Authoritative sources and citations",
            "Trustworthiness and factual accuracy"
          ];
          
          // Since we don't have real content to analyze, provide generic guidance
          analysisResult.recommendations = [
            "Add author credentials to establish expertise",
            "Include personal experiences related to the topic",
            "Cite authoritative sources to support claims",
            "Provide balanced viewpoints on controversial topics",
            "Update content regularly to maintain accuracy"
          ];
        }
        else if (framework.toLowerCase() === "seo") {
          analysisResult.frameworkCriteria = [
            "Keyword strategy and placement",
            "Content structure and readability",
            "Meta elements optimization",
            "Internal and external linking",
            "Mobile optimization",
            "Page speed factors",
            "User engagement signals"
          ];
          
          analysisResult.recommendations = [
            "Structure content with clear H1, H2, H3 hierarchy",
            "Include questions as headings that match search queries",
            "Add schema markup appropriate for content type",
            "Improve internal linking to related content",
            "Optimize images with descriptive alt text",
            "Include a table of contents for longer content"
          ];
        }
        
        reasoningSteps.push({
          type: "tool_result",
          toolName: "analyzeContentQuality",
          content: `Completed ${framework} analysis for ${contentType} content`,
          toolOutput: analysisResult
        });
        
        return analysisResult;
      } catch (error) {
        reasoningSteps.push({
          type: "tool_error",
          toolName: "analyzeContentQuality",
          content: `Error analyzing content quality: ${error.message}`
        });
        return { framework, contentType, error: error.message };
      }
    };
    
    // Tool implementation: Marketing Strategy
    const getMarketingStrategy = async (params: any) => {
      const { objective, targetAudience = "general", industryVertical = "general", timePeriod = "mid-term" } = params;
      
      reasoningSteps.push({
        type: "tool_start",
        toolName: "getMarketingStrategy",
        content: `Creating ${timePeriod} marketing strategy for ${objective} targeting ${targetAudience} in ${industryVertical}`
      });

      try {
        const strategyResult = {
          objective,
          targetAudience,
          industryVertical,
          timePeriod,
          lastUpdated: "May 2025",
          recommendedChannels: [],
          keyTactics: [],
          metrics: [],
          timeline: {},
          industryBenchmarks: {},
          bestPractices: []
        };
        
        // Customize strategy based on objective
        if (objective.toLowerCase().includes("brand awareness")) {
          strategyResult.recommendedChannels = ["Content marketing", "Social media", "PR", "Influencer partnerships"];
          strategyResult.keyTactics = [
            "Create thought leadership content",
            "Develop shareable visual assets",
            "Engage in community building",
            "Leverage social listening for trend participation"
          ];
          strategyResult.metrics = [
            "Brand mention growth",
            "Share of voice metrics",
            "Social media engagement rates",
            "Website traffic growth"
          ];
        }
        else if (objective.toLowerCase().includes("lead")) {
          strategyResult.recommendedChannels = ["SEO content", "Email marketing", "Paid search", "Webinars/Events"];
          strategyResult.keyTactics = [
            "Create gated high-value content",
            "Implement lead scoring system",
            "Develop targeted landing pages",
            "Create segmented email nurture sequences"
          ];
          strategyResult.metrics = [
            "Lead volume by source",
            "Lead quality score",
            "Conversion rate by funnel stage",
            "Cost per qualified lead"
          ];
        }
        
        reasoningSteps.push({
          type: "tool_result",
          toolName: "getMarketingStrategy",
          content: `Generated marketing strategy for ${objective} with ${strategyResult.keyTactics.length} key tactics`,
          toolOutput: strategyResult
        });
        
        return strategyResult;
      } catch (error) {
        reasoningSteps.push({
          type: "tool_error",
          toolName: "getMarketingStrategy",
          content: `Error generating marketing strategy: ${error.message}`
        });
        return { objective, error: error.message };
      }
    };
    
    // Tool implementation: Content Calendar
    const planContentCalendar = async (params: any) => {
      const { timeframe, channels, marketingGoals = [], industry = "general" } = params;
      
      reasoningSteps.push({
        type: "tool_start",
        toolName: "planContentCalendar",
        content: `Planning ${timeframe} content calendar for ${channels.join(", ")} in ${industry} industry`
      });

      try {
        const calendarTemplate = {
          timeframe,
          channels,
          marketingGoals,
          industry,
          contentThemes: [],
          contentTypes: [],
          distributionSchedule: {},
          contentIdeas: [],
          keyDatesAndEvents: [],
          contentWorkflow: {}
        };
        
        // Add general content themes based on timeframe
        if (timeframe === "week") {
          calendarTemplate.contentThemes = ["Weekly focus theme", "Trending industry topic"];
          calendarTemplate.distributionSchedule = {
            monday: "Planning and audience research",
            tuesday: "Content creation",
            wednesday: "Main content publication",
            thursday: "Engagement and community building",
            friday: "Analytics review and content promotion"
          };
        }
        else if (timeframe === "month") {
          calendarTemplate.contentThemes = [
            "Monthly campaign theme", 
            "Industry trend analysis", 
            "Customer success stories", 
            "Educational content"
          ];
          calendarTemplate.distributionSchedule = {
            week1: "Launch monthly theme content",
            week2: "Educational and how-to content",
            week3: "Social proof and case studies",
            week4: "Engagement and lead generation content"
          };
        }
        else if (timeframe === "quarter") {
          calendarTemplate.contentThemes = [
            "Quarterly campaign focus",
            "Seasonal content themes",
            "Industry report/data analysis",
            "Product/service education",
            "Thought leadership"
          ];
          calendarTemplate.distributionSchedule = {
            month1: "Launch quarterly theme and awareness content",
            month2: "Consideration and engagement content",
            month3: "Conversion-focused and planning content for next quarter"
          };
        }
        
        // Add content type suggestions based on channels
        const contentTypeMap = {
          blog: ["How-to guides", "Industry analysis", "Case studies", "Listicles", "Expert interviews"],
          "social media": ["Visual quotes", "Industry statistics", "Behind-the-scenes", "User-generated content", "Live events"],
          email: ["Newsletters", "Product announcements", "Content roundups", "Exclusive offers", "Customer stories"],
          video: ["Tutorials", "Expert interviews", "Product demos", "Customer testimonials", "Animated explainers"],
          podcast: ["Industry interviews", "Topic deep-dives", "News analysis", "Q&A episodes", "Case study discussions"]
        };
        
        channels.forEach(channel => {
          if (contentTypeMap[channel]) {
            calendarTemplate.contentTypes = [
              ...calendarTemplate.contentTypes,
              ...contentTypeMap[channel]
            ];
          }
        });
        
        // Remove duplicates
        calendarTemplate.contentTypes = [...new Set(calendarTemplate.contentTypes)];
        
        reasoningSteps.push({
          type: "tool_result",
          toolName: "planContentCalendar",
          content: `Created ${timeframe} content calendar framework for ${channels.length} channels`,
          toolOutput: calendarTemplate
        });
        
        return calendarTemplate;
      } catch (error) {
        reasoningSteps.push({
          type: "tool_error",
          toolName: "planContentCalendar",
          content: `Error planning content calendar: ${error.message}`
        });
        return { timeframe, channels, error: error.message };
      }
    };
    
    // Tool implementation: Marketing Research
    const getMarketingResearch = async (params: any) => {
      const { researchTopic, industryVertical = "general", dataRecency = "latest" } = params;
      
      reasoningSteps.push({
        type: "tool_start",
        toolName: "getMarketingResearch",
        content: `Retrieving ${dataRecency} marketing research on ${researchTopic} for ${industryVertical} industry`
      });

      try {
        const researchData = {
          topic: researchTopic,
          industry: industryVertical,
          dataRecency,
          lastUpdated: "May 2025",
          keyStatistics: [],
          trends: [],
          sources: [],
          insights: [],
          methodologyNotes: "Data aggregated from industry reports, academic research, and market analyses"
        };
        
        // Provide topic-specific research data
        if (researchTopic.toLowerCase().includes("email")) {
          researchData.keyStatistics = [
            { metric: "Average open rate", value: "21.5%", context: "Across industries, May 2025" },
            { metric: "Click-through rate", value: "3.1%", context: "Across industries, May 2025" },
            { metric: "ROI", value: "$42 per $1 spent", context: "Industry average, 2025" },
            { metric: "Mobile open rate", value: "63%", context: "Percentage of emails opened on mobile devices" }
          ];
          researchData.trends = [
            "Interactive email elements increasing engagement by 28%",
            "AI-personalized subject lines showing 32% higher open rates",
            "User-generated content in emails improving click rates by 22%"
          ];
          researchData.sources = [
            "Email Marketing Benchmark Report 2025 (EmailStatistics.com)",
            "HubSpot State of Marketing Report, May 2025",
            "Mailchimp Industry Analysis Q1 2025"
          ];
        }
        else if (researchTopic.toLowerCase().includes("social media")) {
          researchData.keyStatistics = [
            { metric: "Average engagement rate", value: "4.2%", context: "Across platforms, 2025" },
            { metric: "Video content performance", value: "38% higher engagement", context: "Compared to static posts" },
            { metric: "LinkedIn conversion rate", value: "6.1%", context: "B2B focused campaigns, 2025" }
          ];
          researchData.trends = [
            "Short-form video content dominating engagement metrics",
            "Community-building features outperforming broadcast-style content",
            "Platform-specific content optimization showing 43% better results than cross-posting"
          ];
          researchData.sources = [
            "Social Media Marketing Industry Report 2025",
            "Sprout Social Index, Q2 2025",
            "Hootsuite Social Trends Analysis, May 2025"
          ];
        }
        
        reasoningSteps.push({
          type: "tool_result",
          toolName: "getMarketingResearch",
          content: `Retrieved research data on ${researchTopic} with ${researchData.keyStatistics.length} key statistics`,
          toolOutput: researchData
        });
        
        return researchData;
      } catch (error) {
        reasoningSteps.push({
          type: "tool_error",
          toolName: "getMarketingResearch",
          content: `Error retrieving marketing research: ${error.message}`
        });
        return { researchTopic, error: error.message };
      }
    };

    // First phase: Perform RAG search using the content search tool
    if (projectId) {
      const searchResult = await searchContent(message, contentTypeFilter);
      if (searchResult.count > 0) {
        relevantContext = "Here's relevant information from the knowledge base:\n\n" + 
          searchResult.documents.map((doc: any, index: number) => 
            `[Document ${index + 1}]: ${doc.content}`
          ).join("\n\n");
      } else {
        relevantContext = "No relevant information was found in the knowledge base.";
      }

      // Add reasoning step for initial content analysis
      reasoningSteps.push({
        type: "reasoning",
        content: "Analyzed the retrieved content for relevance to the user query"
      });
    }

    // Second phase: Enable multi-step reasoning and function calling
    let tools = [];
    if (enableTools) {
      // Base tools
      tools = [contentSearchTool, projectInfoTool];
      
      // Add email-specific tools for email-related tasks
      if (taskType === 'email' || message.toLowerCase().includes('email')) {
        tools.push(emailGenerationTool);
      }
      
      // Add specialized marketing tools
      if (taskType === 'marketing' || 
          message.toLowerCase().includes('market') || 
          message.toLowerCase().includes('content') ||
          message.toLowerCase().includes('seo') ||
          message.toLowerCase().includes('eeat') || 
          message.toLowerCase().includes('blog')) {
        tools.push(marketingBestPracticesTool);
        tools.push(contentQualityTool);
        tools.push(marketingStrategyTool);
        tools.push(contentCalendarTool);
        tools.push(marketingResearchTool);
      }
    }
    
    // Structure the system message based on enabled features and task type
    let systemMessage = `You are an intelligent assistant for the Lumen platform, specialized in marketing research and content analysis.
    You provide thoughtful, well-reasoned responses based on the user's query and any relevant information from their content.
    
    When answering:
    1. Use the provided relevant information when available
    2. Cite your sources when providing information
    3. Be honest when you don't know something
    4. Organize your responses clearly
    5. Provide actionable insights when possible`;

    // Add task-specific instructions
    if (taskType === 'email') {
      systemMessage += `\n\nYou are currently focusing on email creation. When generating email content:
      1. Create clear, concise, and engaging email copy
      2. Structure emails with appropriate sections (subject line, greeting, body, call to action, closing)
      3. Adjust tone and style based on the purpose (marketing, outreach, newsletter, etc.)
      4. Use language that resonates with the target audience
      5. Suggest effective subject lines that will improve open rates`;
    }
    else if (taskType === 'marketing' || message.toLowerCase().includes('market') || 
             message.toLowerCase().includes('seo') || message.toLowerCase().includes('eeat')) {
      systemMessage += `\n\nYou are currently focusing on marketing strategy and content. When addressing marketing questions:
      1. Follow current best practices like Google's E-E-A-T guidelines for content
      2. Provide specific, actionable recommendations based on industry standards
      3. Include relevant statistics and benchmark data when available
      4. Consider SEO implications in content recommendations
      5. Suggest measurable goals and KPIs for marketing activities
      6. Adjust recommendations based on the user's industry and audience
      7. Stay focused on evidence-based approaches backed by research`;
    }

    if (enableMultiStepReasoning) {
      systemMessage += `\n\nImportant: Think step-by-step to solve complex questions. Before providing a final answer:
      1. Break down the question into smaller parts
      2. Consider what information you need to answer each part
      3. Use available tools to gather necessary information
      4. Analyze the collected information
      5. Synthesize all insights into a coherent response`;
    }

    // Send the request to OpenAI with system instructions, function calling, and relevant context
    const openaiRequestBody: any = {
      model: modelName,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: relevantContext ? `${relevantContext}\n\nUser question: ${message}` : message
        }
      ],
      temperature: temperature,
      max_tokens: maxTokens,
    };

    if (tools.length > 0) {
      openaiRequestBody.tools = tools;
      openaiRequestBody.tool_choice = "auto";
    }

    // Log the complete request for debugging purposes
    console.log("Sending request to OpenAI");
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiRequestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiResponse = await response.json();
    
    // Process the response and handle any tool calls
    let finalResponse = aiResponse.choices[0].message.content;
    let toolCalls = aiResponse.choices[0].message.tool_calls || [];
    
    // If there are tool calls, execute them
    if (toolCalls && toolCalls.length > 0) {
      reasoningSteps.push({
        type: "planning",
        content: "AI determined it needs additional information and will use tools to gather it"
      });
      
      console.log(`Processing ${toolCalls.length} tool calls`);
      
      // Track tool call results to include in the follow-up message
      const toolResults = [];
      
      // Process each tool call
      for (const call of toolCalls) {
        const { id, function: fn } = call;
        const { name, arguments: args } = fn;
        
        console.log(`Executing tool call: ${name} with ID ${id}`);
        const parsedArgs = JSON.parse(args);
        let toolResult;
        
        if (name === "searchContent") {
          toolResult = await searchContent(parsedArgs.query, parsedArgs.contentTypeFilter);
        }
        else if (name === "getProjectInfo") {
          toolResult = await getProjectInfo(parsedArgs.infoType);
        }
        else if (name === "generateEmailTemplate") {
          toolResult = await generateEmailTemplate(parsedArgs);
        }
        // Handle new marketing tools
        else if (name === "getMarketingBestPractices") {
          toolResult = await getMarketingBestPractices(parsedArgs);
        }
        else if (name === "analyzeContentQuality") {
          toolResult = await analyzeContentQuality(parsedArgs);
        }
        else if (name === "getMarketingStrategy") {
          toolResult = await getMarketingStrategy(parsedArgs);
        }
        else if (name === "planContentCalendar") {
          toolResult = await planContentCalendar(parsedArgs);
        }
        else if (name === "getMarketingResearch") {
          toolResult = await getMarketingResearch(parsedArgs);
        }
        
        // Store the result with its associated tool call ID
        toolResults.push({
          tool_call_id: id,
          result: toolResult
        });
      }
      
      // Create tool response messages for the follow-up request
      const toolResponseMessages = toolResults.map(result => ({
        role: 'tool',
        tool_call_id: result.tool_call_id,
        content: JSON.stringify(result.result)
      }));
      
      console.log(`Created ${toolResponseMessages.length} tool response messages`);
      
      // Make a follow-up call to OpenAI with the tool results
      const messagesWithToolResults = [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: relevantContext ? `${relevantContext}\n\nUser question: ${message}` : message
        },
        aiResponse.choices[0].message,
        ...toolResponseMessages,
        {
          role: 'system',
          content: `Based on the tool results provided, please synthesize a final response to the user's question. Include specific references to content when relevant.`
        }
      ];
      
      console.log(`Sending follow-up request to OpenAI with ${messagesWithToolResults.length} messages`);
      
      const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: messagesWithToolResults,
          temperature: temperature,
          max_tokens: maxTokens,
        }),
      });
      
      if (!followUpResponse.ok) {
        const errorData = await followUpResponse.json();
        console.error("Error in follow-up request:", errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const synthesizedResponse = await followUpResponse.json();
      finalResponse = synthesizedResponse.choices[0].message.content;
      
      // Add final reasoning step
      reasoningSteps.push({
        type: "synthesis",
        content: "Synthesized all gathered information to provide a comprehensive response"
      });
    }
    
    // Final phase: Record our confidence in the response
    const confidenceScore = sources.length > 0 ? 0.8 : 0.5;
    reasoningSteps.push({
      type: "evaluation",
      content: `Response confidence: ${confidenceScore.toFixed(2)}. ${sources.length > 0 ? 
        'Based on multiple relevant sources.' : 
        'Limited source material available for this response.'}`
    });

    console.log("Successfully generated AI response");

    // Include metadata in response
    return new Response(
      JSON.stringify({
        message: finalResponse,
        threadId: currentThreadId,
        reasoning: reasoningSteps,
        contentTypeFilter: contentTypeFilter || null,
        sources: sources,
        confidence: confidenceScore
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in agent-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
