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
      problem_sets: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          user_id?: string
        }
      }
      problems: {
        Row: {
          id: string
          created_at: string
          problem_set_id: string
          question_image_url: string | null
          answer_image_url: string | null
          last_answered_at: string | null
          next_review_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          problem_set_id: string
          question_image_url?: string | null
          answer_image_url?: string | null
          last_answered_at?: string | null
          next_review_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          problem_set_id?: string
          question_image_url?: string | null
          answer_image_url?: string | null
          last_answered_at?: string | null
          next_review_at?: string | null
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
} 