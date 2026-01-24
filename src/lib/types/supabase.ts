// Database types for Supabase integration
// This file contains the TypeScript types for our Supabase database schema

export interface Database {
  public: {
    Tables: {
      // User and Team Management
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          type: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          type?: string;
          created_by?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: "owner" | "admin" | "member" | "viewer";
          status?: string | null;
          invited_by?: string | null;
          invited_at?: string | null;
          joined_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member" | "viewer";
          status?: string | null;
          invited_by?: string | null;
          invited_at?: string | null;
          joined_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: "owner" | "admin" | "member" | "viewer";
          status?: string | null;
          invited_by?: string | null;
          invited_at?: string | null;
          updated_at?: string;
        };
      };
      // Characters and Resources
      characters: {
        Row: {
          id: string;
          name: string;
          series: string;
          source_medium:
            | "anime"
            | "manga"
            | "game"
            | "movie"
            | "tv"
            | "book"
            | "original";
          team_id: string;
          reference_images: string[];
          budget_mode: "personal" | "commission";
          budget_limit: number | null;
          completion_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          series: string;
          source_medium:
            | "anime"
            | "manga"
            | "game"
            | "movie"
            | "tv"
            | "book"
            | "original";
          team_id: string;
          reference_images?: string[];
          budget_mode?: "personal" | "commission";
          budget_limit?: number | null;
          completion_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          series?: string;
          source_medium?:
            | "anime"
            | "manga"
            | "game"
            | "movie"
            | "tv"
            | "book"
            | "original";
          reference_images?: string[];
          budget_mode?: "personal" | "commission";
          budget_limit?: number | null;
          completion_percentage?: number;
          updated_at?: string;
        };
      };
      // Dashboard Widgets
      dashboard_widgets: {
        Row: {
          id: string;
          type: string;
          user_id: string;
          team_id: string;
          template: string;
          position: number;
          visible: boolean;
          settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          user_id: string;
          team_id: string;
          template?: string;
          position?: number;
          visible?: boolean;
          settings?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: string;
          template?: string;
          position?: number;
          visible?: boolean;
          settings?: Record<string, unknown>;
          updated_at?: string;
        };
      };
      // Ideas (MVP Redesign)
      ideas: {
        Row: {
          id: string;
          team_id: string;
          character: string;
          series: string;
          description: string | null;
          difficulty: "beginner" | "intermediate" | "advanced";
          estimated_cost: number | null;
          images: string[];
          tags: string[];
          notes: string | null;
          status: "saved" | "converted";
          converted_project_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          character: string;
          series: string;
          description?: string | null;
          difficulty: "beginner" | "intermediate" | "advanced";
          estimated_cost?: number | null;
          images?: string[];
          tags?: string[];
          notes?: string | null;
          status?: "saved" | "converted";
          converted_project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          character?: string;
          series?: string;
          description?: string | null;
          difficulty?: "beginner" | "intermediate" | "advanced";
          estimated_cost?: number | null;
          images?: string[];
          tags?: string[];
          notes?: string | null;
          status?: "saved" | "converted";
          converted_project_id?: string | null;
          updated_at?: string;
        };
      };
      // Projects (MVP Redesign)
      projects: {
        Row: {
          id: string;
          team_id: string;
          from_idea_id: string | null;
          character: string;
          series: string;
          status: "planning" | "in-progress" | "completed" | "archived";
          progress: number;
          estimated_budget: number | null;
          spent_budget: number;
          deadline: string | null;
          description: string | null;
          cover_image: string | null;
          reference_images: string[];
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          from_idea_id?: string | null;
          character: string;
          series: string;
          status?: "planning" | "in-progress" | "completed" | "archived";
          progress?: number;
          estimated_budget?: number | null;
          spent_budget?: number;
          deadline?: string | null;
          description?: string | null;
          cover_image?: string | null;
          reference_images?: string[];
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          from_idea_id?: string | null;
          character?: string;
          series?: string;
          status?: "planning" | "in-progress" | "completed" | "archived";
          progress?: number;
          estimated_budget?: number | null;
          spent_budget?: number;
          deadline?: string | null;
          description?: string | null;
          cover_image?: string | null;
          reference_images?: string[];
          tags?: string[];
          updated_at?: string;
        };
      };
      // Resources (MVP Redesign)
      resources: {
        Row: {
          id: string;
          team_id: string;
          name: string;
          description: string | null;
          images: string[];
          cost: number | null;
          tags: string[];
          notes: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          name: string;
          description?: string | null;
          images?: string[];
          cost?: number | null;
          tags?: string[];
          notes?: string | null;
          metadata: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          images?: string[];
          cost?: number | null;
          tags?: string[];
          notes?: string | null;
          metadata?: Record<string, unknown>;
          updated_at?: string;
        };
      };
      // Project Resources (MVP Redesign)
      project_resources: {
        Row: {
          id: string;
          project_id: string;
          resource_id: string;
          quantity: number;
          status: "needed" | "acquired" | "in-progress" | "completed";
          notes: string | null;
          added_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          resource_id: string;
          quantity?: number;
          status?: "needed" | "acquired" | "in-progress" | "completed";
          notes?: string | null;
          added_at?: string;
        };
        Update: {
          quantity?: number;
          status?: "needed" | "acquired" | "in-progress" | "completed";
          notes?: string | null;
        };
      };
      // Tasks (MVP Redesign)
      tasks: {
        Row: {
          id: string;
          project_id: string;
          resource_id: string | null;
          title: string;
          description: string | null;
          completed: boolean;
          due_date: string | null;
          priority: "low" | "medium" | "high";
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          resource_id?: string | null;
          title: string;
          description?: string | null;
          completed?: boolean;
          due_date?: string | null;
          priority?: "low" | "medium" | "high";
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          completed?: boolean;
          due_date?: string | null;
          priority?: "low" | "medium" | "high";
          assigned_to?: string | null;
          updated_at?: string;
        };
      };
      // Moodboard nodes
      moodboard_nodes: {
        Row: {
          id: string;
          idea_id: string | null;
          moodboard_id: string | null;
          reference_id: string | null;
          node_type: string;
          container_type: string | null;
          linked_moodboard_id: string | null;
          title: string | null;
          content_url: string | null;
          thumbnail_url: string | null;
          metadata: Record<string, unknown>;
          tags: string[];
          short_comment: string | null;
          long_note: string | null;
          position_x: number;
          position_y: number;
          width: number | null;
          height: number | null;
          z_index: number | null;
          parent_id: string | null;
          is_expanded: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          idea_id?: string | null;
          moodboard_id?: string | null;
          reference_id?: string | null;
          node_type: string;
          container_type?: string | null;
          linked_moodboard_id?: string | null;
          title?: string | null;
          content_url?: string | null;
          thumbnail_url?: string | null;
          metadata?: Record<string, unknown>;
          tags?: string[];
          short_comment?: string | null;
          long_note?: string | null;
          position_x?: number;
          position_y?: number;
          width?: number | null;
          height?: number | null;
          z_index?: number | null;
          parent_id?: string | null;
          is_expanded?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          idea_id?: string | null;
          moodboard_id?: string | null;
          reference_id?: string | null;
          node_type?: string;
          container_type?: string | null;
          linked_moodboard_id?: string | null;
          title?: string | null;
          content_url?: string | null;
          thumbnail_url?: string | null;
          metadata?: Record<string, unknown>;
          tags?: string[];
          short_comment?: string | null;
          long_note?: string | null;
          position_x?: number;
          position_y?: number;
          width?: number | null;
          height?: number | null;
          z_index?: number | null;
          parent_id?: string | null;
          is_expanded?: boolean | null;
          updated_at?: string;
        };
      };
      // References
      references: {
        Row: {
          id: string;
          team_id: string;
          node_type: string;
          content_url: string | null;
          thumbnail_url: string | null;
          metadata: Record<string, unknown>;
          tags: string[];
          short_comment: string | null;
          long_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          node_type: string;
          content_url?: string | null;
          thumbnail_url?: string | null;
          metadata?: Record<string, unknown>;
          tags?: string[];
          short_comment?: string | null;
          long_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          team_id?: string;
          node_type?: string;
          content_url?: string | null;
          thumbnail_url?: string | null;
          metadata?: Record<string, unknown>;
          tags?: string[];
          short_comment?: string | null;
          long_note?: string | null;
          updated_at?: string;
        };
      };
      // Reference links
      reference_links: {
        Row: {
          id: string;
          reference_id: string;
          idea_id: string | null;
          project_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference_id: string;
          idea_id?: string | null;
          project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          reference_id?: string;
          idea_id?: string | null;
          project_id?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      // Add views here as needed
    };
    Functions: {
      calculate_project_progress: {
        Args: {
          project_uuid: string;
        };
        Returns: number;
      };
    };
  };
}

// Type aliases for convenience
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];
export type Character = Database["public"]["Tables"]["characters"]["Row"];
export type DashboardWidget =
  Database["public"]["Tables"]["dashboard_widgets"]["Row"];

// Insert types
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type TeamInsert = Database["public"]["Tables"]["teams"]["Insert"];
export type TeamMemberInsert =
  Database["public"]["Tables"]["team_members"]["Insert"];
export type CharacterInsert =
  Database["public"]["Tables"]["characters"]["Insert"];
export type DashboardWidgetInsert =
  Database["public"]["Tables"]["dashboard_widgets"]["Insert"];

// Update types
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
export type TeamUpdate = Database["public"]["Tables"]["teams"]["Update"];
export type TeamMemberUpdate =
  Database["public"]["Tables"]["team_members"]["Update"];
export type CharacterUpdate =
  Database["public"]["Tables"]["characters"]["Update"];
export type DashboardWidgetUpdate =
  Database["public"]["Tables"]["dashboard_widgets"]["Update"];
