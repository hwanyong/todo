import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '../page';

// Supabase 클라이언트 모킹
jest.mock('@/lib/supabase', () => {
  const mockUnsubscribe = jest.fn();
  const mockSubscribe = jest.fn(() => ({
    unsubscribe: mockUnsubscribe,
  }));

  const mockOn = jest.fn(() => ({
    subscribe: mockSubscribe,
  }));

  const mockChannel = jest.fn(() => ({
    on: mockOn,
  }));

  return {
    supabase: {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [
              { id: '1', text: '첫 번째 할 일', content: '<p>첫 번째 내용</p>', completed: false },
              { id: '2', text: '두 번째 할 일', content: '<p>두 번째 내용</p>', completed: true },
            ],
            error: null,
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { id: '3', text: '새로운 할 일', content: '<p>새로운 내용</p>', completed: false },
              error: null,
            })),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: null,
            error: null,
          })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: null,
            error: null,
          })),
        })),
      })),
      channel: mockChannel,
    },
  };
});

describe('Page 컴포넌트', () => {
  let mockUnsubscribe: jest.Mock;
  let mockSubscribe: jest.Mock;
  let mockOn: jest.Mock;
  let mockChannel: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    const supabase = require('@/lib/supabase').supabase;
    mockChannel = supabase.channel;
    mockOn = mockChannel().on;
    mockSubscribe = mockOn().subscribe;
    mockUnsubscribe = mockSubscribe().unsubscribe;
  });

  describe('기본 렌더링', () => {
    it('필수 UI 요소들이 올바르게 렌더링되어야 함', () => {
      render(<Page />);

      expect(screen.getByText('할 일 목록')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('할 일을 입력하세요')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
    });

    it('초기 할 일 목록이 올바르게 렌더링되어야 함', async () => {
      render(<Page />);

      // 로딩 상태 확인
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();

      // 할 일 목록이 로드될 때까지 대기
      await waitFor(() => {
        expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
      });

      // 할 일 목록 확인
      expect(screen.getByText('첫 번째 할 일')).toBeInTheDocument();
      expect(screen.getByText('두 번째 할 일')).toBeInTheDocument();
      expect(screen.getByText('첫 번째 내용')).toBeInTheDocument();
      expect(screen.getByText('두 번째 내용')).toBeInTheDocument();
    });
  });

  describe('할 일 추가', () => {
    it('새로운 할 일을 추가할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<Page />);

      // 로딩이 완료될 때까지 대기
      await waitFor(() => {
        expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
      });

      // 할 일 입력
      await user.type(screen.getByPlaceholderText('할 일을 입력하세요'), '새로운 할 일');
      
      // 제출
      await user.click(screen.getByRole('button', { name: '추가' }));
      
      // 새로운 할 일이 목록에 추가되었는지 확인
      await waitFor(() => {
        expect(screen.getByText('새로운 할 일')).toBeInTheDocument();
        expect(screen.getByText('새로운 내용')).toBeInTheDocument();
      });
    });
  });

  describe('할 일 상태 변경', () => {
    it('할 일의 완료 상태를 토글할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<Page />);

      // 로딩이 완료될 때까지 대기
      await waitFor(() => {
        expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
      });

      // 첫 번째 할 일의 체크박스 클릭
      const checkbox = screen.getByLabelText('첫 번째 할 일 완료 여부');
      await user.click(checkbox);

      // 상태가 변경되었는지 확인
      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });
    });
  });

  describe('할 일 삭제', () => {
    it('할 일을 삭제할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<Page />);

      // 로딩이 완료될 때까지 대기
      await waitFor(() => {
        expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
      });

      // 첫 번째 할 일의 삭제 버튼 클릭
      const deleteButtons = screen.getAllByRole('button', { name: '삭제' });
      await user.click(deleteButtons[0]);

      // 할 일이 삭제되었는지 확인
      await waitFor(() => {
        expect(screen.queryByText('첫 번째 할 일')).not.toBeInTheDocument();
        expect(screen.queryByText('첫 번째 내용')).not.toBeInTheDocument();
      });
    });
  });

  describe('실시간 구독', () => {
    it('실시간 구독이 설정되어야 함', () => {
      render(<Page />);

      expect(mockChannel).toHaveBeenCalledWith('todos');
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        expect.any(Function)
      );
      expect(mockSubscribe).toHaveBeenCalled();
    });

    it('컴포넌트 언마운트 시 구독이 해제되어야 함', async () => {
      const { unmount } = render(<Page />);

      // 로딩이 완료될 때까지 대기
      await waitFor(() => {
        expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
      });

      unmount();

      expect(mockSubscribe).toHaveBeenCalled();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
}); 