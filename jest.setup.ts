import '@testing-library/jest-dom';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://squknlajsblajhfpfsyb.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxdWtubGFqc2JsYWpoZnBmc3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3NjU3ODUsImV4cCI6MjA0ODM0MTc4NX0.rEnf42VxsccfgEPsftpqkF7MafFyCFBSORLkdMw4MhA';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    })),
  })),
})); 