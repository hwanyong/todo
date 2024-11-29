import { createClient } from '@supabase/supabase-js';

export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string;
          created_at: string;
          text: string;
          content: string;
          completed: boolean;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          text: string;
          content?: string;
          completed?: boolean;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          text?: string;
          content?: string;
          completed?: boolean;
          user_id?: string | null;
        };
      };
    };
  };
}

export const getSupabaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL;
  }
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
};

export const getSupabaseAnonKey = () => {
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
};

export const supabase = createClient<Database>(
  getSupabaseUrl(),
  getSupabaseAnonKey()
); 