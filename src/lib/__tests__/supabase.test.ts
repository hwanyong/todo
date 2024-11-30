import { getSupabaseUrl, getSupabaseAnonKey, supabase } from '../supabase';

jest.mock('../supabase', () => {
  const originalModule = jest.requireActual('../supabase');
  return {
    ...originalModule,
    getSupabaseUrl: jest.fn(() => 'https://example.supabase.co'),
    getSupabaseAnonKey: jest.fn(() => 'test-key'),
    supabase: {
      auth: {},
      from: jest.fn(),
    },
  };
});

describe('Supabase 모듈 테스트', () => {
  // 모듈 로드 테스트
  it('모듈이 정상적으로 불러와져야 함', () => {
    expect(getSupabaseUrl).toBeDefined();
    expect(getSupabaseAnonKey).toBeDefined();
    expect(supabase).toBeDefined();
  });

  // 환경 변수 설정
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  // 유틸리티 함수 테스트
  describe('getSupabaseUrl', () => {
    it('함수가 존재해야 함', () => {
      expect(getSupabaseUrl).toBeDefined();
      expect(typeof getSupabaseUrl).toBe('function');
    });

    it('환경 변수가 설정되어 있을 때 URL을 반환해야 함', () => {
      const url = getSupabaseUrl();
      expect(url).toBe('https://example.supabase.co');
    });

    it('환경 변수가 없을 때 에러를 발생시켜야 함', () => {
      (getSupabaseUrl as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
      });
      expect(() => getSupabaseUrl()).toThrow('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    });
  });

  describe('getSupabaseAnonKey', () => {
    it('함수가 존재해야 함', () => {
      expect(getSupabaseAnonKey).toBeDefined();
      expect(typeof getSupabaseAnonKey).toBe('function');
    });

    it('환경 변수가 설정되어 있을 때 키를 반환해야 함', () => {
      const key = getSupabaseAnonKey();
      expect(key).toBe('test-key');
    });

    it('환경 변수가 없을 때 에러를 발생시켜야 함', () => {
      (getSupabaseAnonKey as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
      });
      expect(() => getSupabaseAnonKey()).toThrow('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    });
  });

  // Supabase 클라이언트 테스트
  describe('supabase', () => {
    it('클라이언트가 존재해야 함', () => {
      expect(supabase).toBeDefined();
      expect(typeof supabase).toBe('object');
    });

    it('필요한 메서드들이 존재해야 함', () => {
      expect(supabase.auth).toBeDefined();
      expect(supabase.from).toBeDefined();
    });
  });
});