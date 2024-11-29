import { getSupabaseUrl, getSupabaseAnonKey } from '../supabase';

describe('Supabase 유틸리티 함수 테스트', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getSupabaseUrl', () => {
    it('환경 변수가 설정되어 있을 때 URL을 반환해야 함', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      expect(getSupabaseUrl()).toBe('https://example.supabase.co');
    });

    it('환경 변수가 없을 때 에러를 발생시켜야 함', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      expect(() => getSupabaseUrl()).toThrow('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    });
  });

  describe('getSupabaseAnonKey', () => {
    it('환경 변수가 설정되어 있을 때 키를 반환해야 함', () => {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
      expect(getSupabaseAnonKey()).toBe('test-key');
    });

    it('환경 변수가 없을 때 에러를 발생시켜야 함', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      expect(() => getSupabaseAnonKey()).toThrow('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    });
  });
});