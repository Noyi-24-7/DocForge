export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          repository_url: string | null
          methodology: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          repository_url?: string | null
          methodology?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          repository_url?: string | null
          methodology?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          project_id: string
          title: string
          content: string | null
          type: string | null
          order_index: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          content?: string | null
          type?: string | null
          order_index?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          content?: string | null
          type?: string | null
          order_index?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      generations: {
        Row: {
          id: string
          project_id: string
          prompt: string
          response: string | null
          model: string | null
          tokens_used: number | null
          cost: number | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          prompt: string
          response?: string | null
          model?: string | null
          tokens_used?: number | null
          cost?: number | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          prompt?: string
          response?: string | null
          model?: string | null
          tokens_used?: number | null
          cost?: number | null
          status?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

