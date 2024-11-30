import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '../page';

// Supabase 클라이언트 모킹
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [
            { id: '1', text: '첫 번째 할 일', content: '<p>첫 번째 내용</p>', completed: false },
            { id: '2', text: '두 번째 할 일', content: '<p>두 번째 내용</p>', completed: true },
          ],
          error: null,
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: '3', text: '새로운 할 일', content: '<p>새로운 내용</p>', completed: false },
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
  },
}));

describe('Page 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('필수 UI 요소들이 올바르게 렌더링되어야 함', () => {
      render(<Page />);

      expect(screen.getByText('할 일 목록')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('할 일을 입력하세요')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
    });

    it('초기 할 일 목록이 올바르게 렌더링되어야 함', () => {
      render(<Page />);

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

      // 할 일 입력
      await user.type(screen.getByPlaceholderText('할 일을 입력하세요'), '새로운 할 일');
      
      // 제출
      await user.click(screen.getByRole('button', { name: '추가' }));

      // 새로운 할 일이 목록에 추가되었는지 확인
      expect(screen.getByText('새로운 할 일')).toBeInTheDocument();
      expect(screen.getByText('새로운 내용')).toBeInTheDocument();
    });
  });

  describe('할 일 상태 변경', () => {
    it('할 일의 완료 상태를 토글할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<Page />);

      // 첫 번째 할 일의 체크박스 클릭
      const checkbox = screen.getByLabelText('첫 번째 할 일 완료 여부');
      await user.click(checkbox);

      // 상태가 변경되었는지 확인
      expect(checkbox).toBeChecked();
    });
  });

  describe('할 일 삭제', () => {
    it('할 일을 삭제할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<Page />);

      // 첫 번째 할 일의 삭제 버튼 클릭
      const deleteButtons = screen.getAllByRole('button', { name: '삭제' });
      await user.click(deleteButtons[0]);

      // 할 일이 삭제되었는지 확인
      expect(screen.queryByText('첫 번째 할 일')).not.toBeInTheDocument();
      expect(screen.queryByText('첫 번째 내용')).not.toBeInTheDocument();
    });
  });
}); 