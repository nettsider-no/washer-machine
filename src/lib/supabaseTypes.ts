export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          status: "new" | "in_progress" | "done" | "cancelled";
          locale: string | null;
          name: string;
          phone: string;
          address: string | null;
          brand: string | null;
          model: string | null;
          issue: string;
          error_code: string | null;
          preferred_window: "today" | "tomorrow" | "soon" | null;
          preferred_comment: string | null;
          visit_date: string | null;
          visit_time: string | null;
          visit_comment: string | null;
          tg_chat_id: string | null;
          tg_message_id: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          status: "new" | "in_progress" | "done" | "cancelled";
          locale?: string | null;
          name: string;
          phone: string;
          address?: string | null;
          brand?: string | null;
          model?: string | null;
          issue: string;
          error_code?: string | null;
          preferred_window?: "today" | "tomorrow" | "soon" | null;
          preferred_comment?: string | null;
          visit_date?: string | null;
          visit_time?: string | null;
          visit_comment?: string | null;
          tg_chat_id?: string | null;
          tg_message_id?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          status?: "new" | "in_progress" | "done" | "cancelled";
          locale?: string | null;
          name?: string;
          phone?: string;
          address?: string | null;
          brand?: string | null;
          model?: string | null;
          issue?: string;
          error_code?: string | null;
          preferred_window?: "today" | "tomorrow" | "soon" | null;
          preferred_comment?: string | null;
          visit_date?: string | null;
          visit_time?: string | null;
          visit_comment?: string | null;
          tg_chat_id?: string | null;
          tg_message_id?: number | null;
        };
        Relationships: [];
      };
      tg_sessions: {
        Row: {
          user_id: number;
          session: Json;
          updated_at: string;
          expires_at: string;
        };
        Insert: {
          user_id: number;
          session: Json;
          updated_at?: string;
          expires_at: string;
        };
        Update: {
          user_id?: number;
          session?: Json;
          updated_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

