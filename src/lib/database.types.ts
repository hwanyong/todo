export type Database = {
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
      users: {
        Row: {
          id: string;
          created_at: string;
          email: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          email: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string;
        };
      };
    };
  };
}; 