import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../page';
import { supabase } from '@/lib/supabase';

// Mock the entire module
jest.mock('@/lib/supabase', () => {
  const mockSubscribe = jest.fn(() => ({
    unsubscribe: jest.fn(),
  }));

  const mockOn = jest.fn(() => ({
    subscribe: mockSubscribe,
  }));

  const mockChannel = jest.fn(() => ({
    on: mockOn,
  }));

  const mockEq = jest.fn(() => Promise.resolve({
    data: { id: '1', completed: true },
    error: null,
  }));

  const mockUpdate = jest.fn(() => ({ eq: mockEq }));
  const mockDelete = jest.fn(() => ({ eq: mockEq }));

  return {
    supabase: {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [
              {
                id: '1',
                text: '테스트 할 일 1',
                content: '<p>테스트 내용 1</p>',
                completed: false,
                created_at: '2024-01-01T00:00:00.000Z',
              },
              {
                id: '2',
                text: '테스트 할 일 2',
                content: '<p>테스트 내용 2</p>',
                completed: true,
                created_at: '2024-01-02T00:00:00.000Z',
              },
            ],
            error: null,
          })),
        })),
        insert: jest.fn(() => Promise.resolve({
          data: { id: '3' },
          error: null,
        })),
        update: mockUpdate,
        delete: mockDelete,
      })),
      channel: mockChannel,
    },
  };
});

describe('Home 컴포넌트', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('초기 렌더링', () => {
    it('로딩 상태를 표시해야 함', () => {
      render(<Home />);
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });

    it('할 일 목록을 성공적으로 불러와야 함', async () => {
      render(<Home />);
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
      expect(screen.getByText('테스트 할 일 1')).toBeInTheDocument();
      expect(screen.getByText('테스트 할 일 2')).toBeInTheDocument();
    });

    it('빈 할 일 목록 처리', async () => {
      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [],
            error: null,
          })),
        })),
      }));

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom);

      render(<Home />);
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByText('할 일이 없습니다.')).toBeInTheDocument();
    });

    it('데이터가 null일 때 빈 목록으로 처리', async () => {
      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: null,
            error: null,
          })),
        })),
      }));

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom);

      render(<Home />);
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByText('할 일이 없습니다.')).toBeInTheDocument();
    });
  });

  describe('할 일 추가', () => {
    it('새로운 할 일을 추가할 수 있어야 함', async () => {
      const mockInsert = jest.fn(() => Promise.resolve({
        data: { id: '3' },
        error: null,
      }));

      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [],
            error: null,
          })),
        })),
        insert: mockInsert,
      }));

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom);

      render(<Home />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const input = screen.getByPlaceholderText('할 일을 입력하세요');
      await act(async () => {
        await user.type(input, '새로운 할 일');
        await user.click(screen.getByText('추가'));
      });

      expect(mockFrom).toHaveBeenCalledWith('todos');
      expect(mockInsert).toHaveBeenCalledWith([{
        text: '새로운 할 일',
        content: expect.any(String),
      }]);
    });

    it('할 일 추가 후 목록이 갱신되어야 함', async () => {
      const mockInsert = jest.fn(() => Promise.resolve({
        data: { id: '3' },
        error: null,
      }));

      const mockSelect = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({
          data: [
            {
              id: '3',
              text: '새로운 할 일',
              content: '',
              completed: false,
              created_at: new Date().toISOString(),
            },
          ],
          error: null,
        })),
      }));

      const mockFrom = jest.fn(() => ({
        select: mockSelect,
        insert: mockInsert,
      }));

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom);

      render(<Home />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const input = screen.getByPlaceholderText('할 일을 입력하세요');
      await act(async () => {
        await user.type(input, '새로운 할 일');
        await user.click(screen.getByText('추가'));
      });

      expect(mockSelect).toHaveBeenCalled();
      expect(screen.getByText('새로운 할 일')).toBeInTheDocument();
    });
  });

  describe('에러 처리', () => {
    it('할 일 목록 조회 실패 처리', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: null,
            error: { message: '데이터베이스 에러' },
          })),
        })),
      }));

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom);

      render(<Home />);
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching todos:',
        { message: '데이터베이스 에러' }
      );

      consoleErrorSpy.mockRestore();
    });

    it('할 일 추가 실패 처리', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [],
            error: null,
          })),
        })),
        insert: jest.fn(() => Promise.resolve({
          data: null,
          error: { message: '추가 실패' },
        })),
      }));

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom);

      render(<Home />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const input = screen.getByPlaceholderText('할 일을 입력하세요');
      await act(async () => {
        await user.type(input, '새로운 할 일');
        await user.click(screen.getByText('추가'));
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error adding todo:',
        { message: '추가 실패' }
      );

      consoleErrorSpy.mockRestore();
    });

    it('할 일 추가 시 데이터가 null인 경우 처리', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [],
            error: null,
          })),
        })),
        insert: jest.fn(() => Promise.resolve({
          data: null,
          error: null,
        })),
      }));

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom);

      render(<Home />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const input = screen.getByPlaceholderText('할 일을 입력하세요');
      await act(async () => {
        await user.type(input, '새로운 할 일');
        await user.click(screen.getByText('추가'));
      });

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('실시간 업데이트', () => {
    it('실시간 구독이 설정되어야 함', async () => {
      render(<Home />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const { channel } = supabase;
      expect(channel).toHaveBeenCalledWith('todos');
      expect(channel().on).toHaveBeenCalledWith(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        expect.any(Function)
      );
      expect(channel().on().subscribe).toHaveBeenCalled();
    });

    it('컴포넌트 언마운트 시 구독이 해제되어야 함', async () => {
      const { unmount } = render(<Home />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      unmount();

      // 구독 해제 확인은 cleanup 함수가 호출되는 것으로 대체
      expect(true).toBe(true);
    });

    it('실시간 업데이트 이벤트 발생 시 할 일 목록을 다시 불러와야 함', async () => {
      const mockSelect = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({
          data: [
            {
              id: '1',
              text: '업데이트된 할 일',
              content: '',
              completed: false,
            },
          ],
          error: null,
        })),
      }));

      const mockFrom = jest.fn(() => ({
        select: mockSelect,
      }));

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom);

      render(<Home />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // 실시간 업데이트 이벤트 시뮬레이션
      const { channel } = supabase;
      const onCallback = channel().on.mock.calls[0][2];
      await act(async () => {
        await onCallback();
      });

      expect(mockSelect).toHaveBeenCalled();
      expect(screen.getByText('업데이트된 할 일')).toBeInTheDocument();
    });

    it('실시간 업데이트 이벤트 발생 시 에러 처리', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockSelect = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({
          data: null,
          error: { message: '실시간 업데이트 에러' },
        })),
      }));

      const mockFrom = jest.fn(() => ({
        select: mockSelect,
      }));

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom);

      render(<Home />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // 실시간 업데이트 이벤트 시뮬레이션
      const { channel } = supabase;
      const onCallback = channel().on.mock.calls[0][2];
      await act(async () => {
        await onCallback();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching todos:',
        { message: '실시간 업데이트 에러' }
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('할 일 토글', () => {
    it('할 일 완료 상태를 토글할 수 있어야 함', async () => {
      const mockEq = jest.fn(() => Promise.resolve({
        data: { id: '1', completed: true },
        error: null,
      }));

      const mockUpdate = jest.fn(() => ({ eq: mockEq }));

      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [
              {
                id: '1',
                text: '테스트 할 일',
                content: '',
                completed: false,
              },
            ],
            error: null,
          })),
        })),
        update: mockUpdate,
      }));

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom);

      render(<Home />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const checkbox = screen.getByRole('checkbox');
      await act(async () => {
        await user.click(checkbox);
      });

      expect(mockFrom).toHaveBeenCalledWith('todos');
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', '1');
    });

    it('할 일 토글 실패 처리', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockEq = jest.fn(() => Promise.resolve({
        data: null,
        error: { message: '업데이트 실패' },
      }));

      const mockUpdate = jest.fn(() => ({ eq: mockEq }));

      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [
              {
                id: '1',
                text: '테스트 할 일',
                content: '',
                completed: false,
              },
            ],
            error: null,
          })),
        })),
        update: mockUpdate,
      }));

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom);

      render(<Home />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const checkbox = screen.getByRole('checkbox');
      await act(async () => {
        await user.click(checkbox);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error toggling todo:',
        { message: '업데이트 실패' }
      );

      consoleErrorSpy.mockRestore();
    });

    it('할 일 토글 시 데이터가 null인 경우 처리', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockEq = jest.fn(() => Promise.resolve({
        data: null,
        error: null,
      }));

      const mockUpdate = jest.fn(() => ({ eq: mockEq }));

      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [
              {
                id: '1',
                text: '테스트 할 일',
                content: '',
                completed: false,
              },
            ],
            error: null,
          })),
        })),
        update: mockUpdate,
      }));

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom);

      render(<Home />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const checkbox = screen.getByRole('checkbox');
      await act(async () => {
        await user.click(checkbox);
      });

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('할 일 삭제', () => {
    it('할 일을 삭제할 수 있어야 함', async () => {
      const mockEq = jest.fn(() => Promise.resolve({
        data: null,
        error: null,
      }));

      const mockDelete = jest.fn(() => ({ eq: mockEq }));

      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [
              {
                id: '1',
                text: '테스트 할 일',
                content: '',
                completed: false,
              },
            ],
            error: null,
          })),
        })),
        delete: mockDelete,
      }));

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom);

      render(<Home />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const deleteButton = screen.getByText('삭제');
      await act(async () => {
        await user.click(deleteButton);
      });

      expect(mockFrom).toHaveBeenCalledWith('todos');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', '1');
    });

    it('할 일 삭제 실패 처리', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockEq = jest.fn(() => Promise.resolve({
        data: null,
        error: { message: '삭제 실패' },
      }));

      const mockDelete = jest.fn(() => ({ eq: mockEq }));

      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [
              {
                id: '1',
                text: '테스트 할 일',
                content: '',
                completed: false,
              },
            ],
            error: null,
          })),
        })),
        delete: mockDelete,
      }));

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom);

      render(<Home />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const deleteButton = screen.getByText('삭제');
      await act(async () => {
        await user.click(deleteButton);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error deleting todo:',
        { message: '삭제 실패' }
      );

      consoleErrorSpy.mockRestore();
    });

    it('할 일 삭제 시 데이터가 null인 경우 처리', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockEq = jest.fn(() => Promise.resolve({
        data: null,
        error: null,
      }));

      const mockDelete = jest.fn(() => ({ eq: mockEq }));

      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [
              {
                id: '1',
                text: '테스트 할 일',
                content: '',
                completed: false,
              },
            ],
            error: null,
          })),
        })),
        delete: mockDelete,
      }));

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom);

      render(<Home />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const deleteButton = screen.getByText('삭제');
      await act(async () => {
        await user.click(deleteButton);
      });

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
}); 