export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agent_memories: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          importance_score: number | null
          last_accessed_at: string | null
          project_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          last_accessed_at?: string | null
          project_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          last_accessed_at?: string | null
          project_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "scraped_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_voices: {
        Row: {
          audience: string | null
          avoid_phrases: Json | null
          created_at: string
          id: string
          key_messages: Json | null
          language: string | null
          project_id: string
          style: string | null
          terminology: Json | null
          tone: string | null
          updated_at: string
        }
        Insert: {
          audience?: string | null
          avoid_phrases?: Json | null
          created_at?: string
          id?: string
          key_messages?: Json | null
          language?: string | null
          project_id: string
          style?: string | null
          terminology?: Json | null
          tone?: string | null
          updated_at?: string
        }
        Update: {
          audience?: string | null
          avoid_phrases?: Json | null
          created_at?: string
          id?: string
          key_messages?: Json | null
          language?: string | null
          project_id?: string
          style?: string | null
          terminology?: Json | null
          tone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_voices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "scraped_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "scraped_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_summaries: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          project_id: string
          summary: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          project_id: string
          summary: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          project_id?: string
          summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversation_id"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "scraped_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json
          project_id: string | null
          quality_score: number | null
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          project_id?: string | null
          quality_score?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          project_id?: string | null
          quality_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "scraped_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      global_knowledge: {
        Row: {
          complexity_level: string | null
          content: string
          content_type: string
          created_at: string
          embedding: string | null
          id: string
          marketing_domain: string
          metadata: Json | null
          quality_score: number | null
          source: string
          tags: Json | null
          title: string | null
          updated_at: string
        }
        Insert: {
          complexity_level?: string | null
          content: string
          content_type: string
          created_at?: string
          embedding?: string | null
          id?: string
          marketing_domain: string
          metadata?: Json | null
          quality_score?: number | null
          source: string
          tags?: Json | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          complexity_level?: string | null
          content?: string
          content_type?: string
          created_at?: string
          embedding?: string | null
          id?: string
          marketing_domain?: string
          metadata?: Json | null
          quality_score?: number | null
          source?: string
          tags?: Json | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_sources: {
        Row: {
          author: string | null
          authority_score: number | null
          created_at: string
          description: string | null
          id: string
          last_processed_at: string | null
          name: string
          source_type: string
          url: string | null
        }
        Insert: {
          author?: string | null
          authority_score?: number | null
          created_at?: string
          description?: string | null
          id?: string
          last_processed_at?: string | null
          name: string
          source_type: string
          url?: string | null
        }
        Update: {
          author?: string | null
          authority_score?: number | null
          created_at?: string
          description?: string | null
          id?: string
          last_processed_at?: string | null
          name?: string
          source_type?: string
          url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      project_settings: {
        Row: {
          created_at: string
          id: string
          integrations: Json
          scraping_config: Json
          seo_settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          integrations?: Json
          scraping_config?: Json
          seo_settings?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          integrations?: Json
          scraping_config?: Json
          seo_settings?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_settings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "scraped_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scraped_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          project_id: string | null
          title: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          project_id?: string | null
          title?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          project_id?: string | null
          title?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scraped_content_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "scraped_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scraped_projects: {
        Row: {
          created_at: string
          id: string
          page_count: number | null
          title: string
          url: string
          user_id: string
          team_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page_count?: number | null
          title: string
          url: string
          user_id: string
          team_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page_count?: number | null
          title?: string
          url?: string
          user_id?: string
          team_id?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      team_memberships: {
        Row: {
          id: string
          team_id: string | null
          user_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          team_id?: string | null
          user_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          team_id?: string | null
          user_id?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      match_documents: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          p_project_id: string
        }
        Returns: {
          id: string
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_multilevel: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          p_project_id?: string
          content_type?: string
          include_global?: boolean
          marketing_domain?: string
          complexity_level?: string
        }
        Returns: {
          id: string
          content: string
          metadata: Json
          similarity: number
          source_type: string
          source_info: string
        }[]
      }
      match_documents_quality_weighted: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
          p_project_id?: string
          p_content_type?: string
          include_global?: boolean
          p_marketing_domain?: string
          p_complexity_level?: string
          p_min_quality_score?: number
        }
        Returns: {
          id: string
          content: string
          metadata: Json
          similarity: number
          source_type: string
          source_info: string
          quality_score: number
          weighted_score: number
        }[]
      }
      search_agent_memories: {
        Args: {
          query_embedding: string
          similarity_threshold: number
          max_results: number
          p_user_id: string
          p_project_id: string
        }
        Returns: {
          id: string
          content: string
          similarity: number
        }[]
      }
    }
    Enums: {
      app_role: "user" | "admin" | "master_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin", "master_admin"],
    },
  },
} as const
