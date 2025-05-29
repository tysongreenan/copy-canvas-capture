# 🚀 AI Marketing Assistant - Development Plan

## 📋 Product Vision
An AI-powered marketing assistant that helps small businesses (1-10 employees) build knowledge bases, maintain brand consistency, and execute marketing tasks without hiring a full marketing team.

### Core Value Propositions
1. **Knowledge Base Creation** - Build expertise about customers, competitors, and industry
2. **Brand Voice Consistency** - Ensure all communications match the brand identity
3. **Marketing Task Automation** - Handle SEO, email, content creation, and more

---

## 🎯 Target User Profile
- **Business Size**: 1-10 employees
- **Pain Points**: 
  - Can't afford full-time marketing person
  - Need help with day-to-day marketing tasks
  - Want to maintain consistent brand voice
  - Need expertise in marketing best practices
- **Use Cases**:
  - Email composition with brand voice check
  - SEO recommendations and keyword research
  - Social media content planning
  - Competitor analysis
  - Landing page copy creation

---

## 🏛️ Core Backend Principles

### Authentication & Authorization
- **All sensitive operations** require authentication via Supabase Auth
- **Role-based access control** using RoleService (admin, master_admin, user)
- **Project ownership** enforced at database level with RLS policies
- **API endpoint protection** in all Supabase Edge Functions

### Data Validation & Integrity
- **Double validation**: Frontend (Zod) + Backend (Edge Functions)
- **Content normalization** before processing (clean text, remove HTML)
- **Type safety** enforced through TypeScript and Supabase types
- **File validation**: Only PDF, DOCX, TXT for document uploads

### Task Management
- **Async processing** for long-running tasks (scraping, embeddings)
- **Batch operations** to respect API rate limits
- **Progress tracking** for all multi-step operations
- **Graceful interruption** of ongoing processes

### AI & RAG Implementation
- **Context-first responses** using project-specific embeddings
- **Quality thresholds** with iterative refinement
- **Memory management** for conversation continuity
- **Content type filtering** for focused responses

### Error Handling & Monitoring
- **Graceful degradation** when services fail
- **Comprehensive logging** in Edge Functions
- **User-friendly error messages** via toast system
- **Retry mechanisms** with exponential backoff

### Scalability & Performance
- **Rate limiting** on resource-intensive operations
- **Caching strategies** using React Query
- **Database indexing** for frequent queries
- **Cost monitoring** for API usage

---

## 🏗️ Phase 1: Core Foundation Transformation (Weeks 1-2)

### 1.1 Transform Chat Interface ⏳
- [ ] **Redesign landing to be chat-first** (like ChatGPT/Gemini)
  - [ ] Remove current Index.tsx hero sections
  - [ ] Create clean chat interface as main entry point
  - [ ] Add prominent "New Project" button
  - [ ] Implement welcome message for new users
  - [ ] Add quick-start suggestions/prompts

### 1.2 Project Creation Wizard Overhaul ⏳
- [x] **Design multi-source data ingestion popup** ✅ (ProjectWizard exists)
  - [ ] YouTube video URL input with validation
  - [ ] Text paste area with formatting preservation
  - [x] Document upload (PDF, Word, TXT) ✅ (File upload exists in services)
  - [x] Website URL input for scraping ✅ (ScrapCopy page exists)
  - [ ] Research keywords/topics input
  - [ ] Competitor identification fields

- [ ] **Implement data processing pipeline**
  - [ ] YouTube transcript extraction API
  - [x] Document parsing service (PDF/Word) ✅ (EmbeddingService.processFile exists)
  - [x] Enhanced website scraping ✅ (ScraperService exists)
  - [ ] Deep research report generation
  - [ ] Progress indicators for each process
  - [ ] Error handling and retry logic

### 1.3 Knowledge Base Architecture ⏳
- [x] **Set up embedding system** ✅
  - [x] OpenAI embeddings API integration ✅ (EmbeddingService exists)
  - [x] Supabase pgvector setup ✅ (Using Supabase)
  - [x] Chunking strategy for documents ✅ (TextChunkGenerator exists)
  - [x] Metadata preservation system ✅

- [x] **Build retrieval system** ✅
  - [x] Context-aware search implementation ✅ (RAGDebugger indicates RAG system)
  - [x] Project-isolated knowledge bases ✅ (ProjectService exists)
  - [ ] Relevance scoring algorithm
  - [ ] Cache frequently accessed data

---

## 🧠 Phase 2: AI Agent Development (Weeks 3-4)

### 2.1 Research & Analysis Engine ⏳
- [ ] **Deep Research Module**
  - [ ] Integrate OpenAI web search tool
  - [ ] Build competitor analysis framework
  - [ ] Industry trends monitoring
  - [ ] Keyword research automation
  - [ ] Research report templates
  - [ ] Fact verification system

- [ ] **Auto-insights Generation**
  - [ ] SWOT analysis from research
  - [ ] Market positioning recommendations
  - [ ] Content gap identification
  - [ ] Trend alerts and opportunities

### 2.2 Brand Voice System ⏳
- [x] **Brand Profile Generator** ✅ (BrandingService exists)
  - [x] Voice/tone extraction algorithm ✅
  - [x] Brand guideline creator ✅
  - [ ] Writing style analyzer
  - [ ] Brand vocabulary builder
  - [ ] Example content library

- [ ] **Voice Consistency Checker**
  - [ ] Real-time brand alignment scoring
  - [ ] Suggestion engine for improvements
  - [ ] A/B testing for brand voice
  - [ ] Historical voice tracking

### 2.3 Customer Intelligence ⏳
- [ ] **Customer Profile Management**
  - [ ] Customer company database
  - [ ] Individual contact tracking
  - [ ] Interaction history
  - [ ] Preference learning system
  - [ ] Customer-specific knowledge bases

---

## 📊 Phase 3: Marketing Departments (Weeks 5-6)

### 3.1 Department Structure Setup ⏳
- [ ] **Transform project settings into marketing hub**
  - [ ] Department navigation design
  - [ ] Role-based access control
  - [ ] Department-specific dashboards
  - [ ] Cross-department insights

### 3.2 Email Marketing Module ⏳
- [ ] **Core Features**
  - [ ] Email composer with brand voice
  - [ ] Template library system
  - [ ] Subject line optimizer
  - [ ] Preview across devices
  - [ ] Spam score checker

- [ ] **Advanced Features**
  - [ ] A/B test suggestions
  - [ ] Send time optimization
  - [ ] Personalization tokens
  - [ ] Follow-up sequences

### 3.3 SEO Command Center ⏳
- [ ] **Basic SEO Tools**
  - [ ] Keyword research interface
  - [ ] On-page SEO analyzer
  - [ ] Meta description generator
  - [ ] Content optimization scorer

- [ ] **Advanced SEO Features**
  - [ ] Google Search Console integration
  - [ ] Competitor SEO tracking
  - [ ] Backlink opportunity finder
  - [ ] Technical SEO audit

### 3.4 Content Creation Hub ⏳
- [ ] **Content Generators**
  - [ ] Landing page copy wizard
  - [ ] Social media post creator
  - [ ] Blog post outliner
  - [ ] Ad copy generator
  - [ ] Video script writer

- [ ] **Content Planning**
  - [ ] Editorial calendar
  - [ ] Content idea generator
  - [ ] Trending topics monitor
  - [ ] Content performance tracking

---

## 🔧 Phase 4: Integrations & Tools (Weeks 7-8)

### 4.1 External Tool Research ⏳
- [ ] **Tool Preference System**
  - [ ] Tool discovery questionnaire
  - [ ] Popular tools database
  - [ ] Tool-specific guidance system
  - [ ] Integration recommendations

### 4.2 API Integrations ⏳
- [ ] **Priority Integrations**
  - [ ] Google Search Console API
  - [ ] Google Analytics 4
  - [ ] Social media APIs (LinkedIn, X, Facebook)
  - [ ] Email service providers (SendGrid, Mailchimp)

- [ ] **Future Integrations**
  - [ ] CRM systems
  - [ ] Marketing automation tools
  - [ ] Analytics platforms
  - [ ] Design tools

---

## 💾 Database Schema Updates

### New Tables Required
```sql
-- Marketing Workspaces (formerly projects)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Bases
CREATE TABLE knowledge_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  source_type TEXT NOT NULL, -- 'youtube', 'document', 'website', 'research'
  source_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brand Profiles
CREATE TABLE brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  voice_attributes JSONB NOT NULL,
  guidelines TEXT,
  example_content TEXT[],
  tone_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Profiles
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  profile_data JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing Tasks
CREATE TABLE marketing_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  department TEXT NOT NULL, -- 'email', 'seo', 'content', 'social'
  task_type TEXT NOT NULL,
  content TEXT,
  metadata JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 MVP Deliverables (4 Weeks)

### Week 1-2: Foundation ✅
- [ ] Chat-first interface launch
- [ ] Multi-source data upload working
- [x] Basic knowledge base creation ✅ (Embeddings system exists)
- [x] User authentication flow ✅ (Auth system exists)

### Week 3-4: Core AI Features ✅
- [ ] Deep research with web search
- [x] Brand voice extraction and checking ✅ (BrandingService exists)
- [x] Basic marketing recommendations ✅ (Chat with AI exists)
- [ ] Customer profile management

### Success Metrics for MVP
- [ ] User can upload 5+ different data sources
- [x] AI provides relevant responses based on knowledge base ✅ (Chat interface works)
- [ ] Brand voice consistency score > 80%
- [ ] Generate at least 3 actionable marketing insights
- [x] Response time < 5 seconds for queries ✅

---

## 🔄 Technical Transformation Steps

### Immediate Code Changes
1. **Rename Core Components**
   ```
   ScrapCopy.tsx → DataIngestion.tsx (Keep as is - already handles scraping)
   Project.tsx → Workspace.tsx (Consider keeping - already established)
   Chat.tsx → AssistantChat.tsx (Already has ChatDemo component)
   Index.tsx → ChatInterface.tsx (Need to transform landing page)
   ```

2. **Update Routes**
   ```typescript
   <Route path="/" element={<ChatInterface />} /> // Need to change from current Index
   <Route path="/workspace/:id" element={<Workspace />} />
   <Route path="/workspace/new" element={<WorkspaceWizard />} />
   <Route path="/settings/:id" element={<MarketingHub />} />
   ```

3. **Environment Variables Needed**
   ```
   OPENAI_API_KEY= (Likely already configured in Supabase)
   OPENAI_ORG_ID=
   GOOGLE_SEARCH_CONSOLE_API_KEY=
   YOUTUBE_API_KEY=
   ```

---

## 📈 Post-MVP Roadmap

### Phase 5: Advanced Features (Months 2-3)
- [ ] Automated reporting
- [ ] Multi-workspace collaboration
- [ ] White-label options
- [ ] API for external integrations
- [ ] Mobile app development

### Phase 6: Enterprise Features (Months 4-6)
- [ ] Team management
- [ ] Advanced permissions
- [ ] Custom AI training
- [ ] SLA guarantees
- [ ] Dedicated support

---

## 🎯 Current Sprint Focus

### Sprint 1 (Current) - Foundation
**Goal**: Transform existing app into chat-first AI assistant

**Tasks**:
1. [ ] Update landing page to chat interface
2. [ ] Create data ingestion popup
3. [x] Set up OpenAI integration ✅ (Through Supabase Edge Functions)
4. [x] Design workspace structure ✅ (Projects exist)
5. [x] Implement basic embedding system ✅ (EmbeddingService exists)

**Definition of Done**:
- User can start a chat immediately
- User can create a workspace with multiple data sources
- AI can answer questions based on uploaded content

---

## 📝 Notes & Decisions

### Technical Decisions
- **Embedding Model**: OpenAI text-embedding-3-small
- **Vector Database**: Supabase pgvector ✅
- **Chat Model**: GPT-4 with web search
- **File Processing**: Client-side for privacy, server-side for performance

### Design Decisions
- **UI Framework**: Keep shadcn/ui for consistency ✅
- **Color Scheme**: Maintain current branding
- **Layout**: Chat-centric with sidebar for navigation

### Open Questions
- [ ] Pricing model for different tiers?
- [ ] Rate limiting strategy?
- [ ] Data retention policy?
- [ ] Backup and recovery plan?

---

## 🚦 Progress Tracking

### Completed ✅
- [x] Initial project analysis
- [x] Development plan creation
- [x] User requirements gathering
- [x] Basic chat interface (ChatDemo exists)
- [x] Embedding system (EmbeddingService)
- [x] Document processing (processFile)
- [x] Website scraping (ScraperService)
- [x] Brand voice extraction (BrandingService)
- [x] Project/workspace structure
- [x] Authentication system

### In Progress 🔄
- [ ] Foundation transformation (landing page to chat-first)
- [ ] Multi-source data ingestion enhancement
- [ ] OpenAI web search integration
- [ ] Customer profile management

### Blocked 🔴
- None currently

### Next Up 📋
- [ ] Transform landing page to chat-first interface
- [ ] Add YouTube video processing
- [ ] Add research keywords/deep research functionality
- [ ] Implement customer profiles

---

## 📞 Communication & Updates

### Daily Standup Topics
1. What was completed yesterday?
2. What's planned for today?
3. Any blockers or questions?

### Weekly Review Topics
1. Sprint progress
2. Technical challenges
3. User feedback (if any)
4. Next week's priorities

---

Last Updated: [Current Date]
Next Review: [One Week from Today] 