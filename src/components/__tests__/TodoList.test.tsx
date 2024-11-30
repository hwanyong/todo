import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoList from '../TodoList';

describe('TodoList 컴포넌트', () => {
  const mockTodos = [
    { id: '1', text: '첫 번째 할 일', content: '<p>첫 번째 내용</p>', completed: false },
    { id: '2', text: '두 번째 할 일', content: '<p>두 번째 내용</p>', completed: true },
    { id: '3', text: '세 번째 할 일', content: '', completed: false },
  ];

  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('할 일 목록이 올바르게 렌더링되어야 함', () => {
      render(
        <TodoList
          todos={mockTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
        />
      );

      mockTodos.forEach(todo => {
        expect(screen.getByText(todo.text)).toBeInTheDocument();
      });
    });

    it('할 일이 없을 때 메시지가 표시되어야 함', () => {
      render(
        <TodoList
          todos={[]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('할 일이 없습니다.')).toBeInTheDocument();
    });

    it('각 할 일 항목이 올바른 스타일을 가져야 함', () => {
      render(
        <TodoList
          todos={mockTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
        />
      );

      const todoItems = screen.getAllByRole('listitem');
      expect(todoItems).toHaveLength(mockTodos.length);

      todoItems.forEach(item => {
        expect(item).toHaveClass(
          'flex',
          'items-center',
          'gap-4',
          'p-4',
          'bg-white',
          'rounded-lg',
          'shadow'
        );
      });
    });
  });

  describe('사용자 상호작용', () => {
    it('체크박스 클릭 시 onToggle이 호출되어야 함', async () => {
      const user = userEvent.setup();
      render(
        <TodoList
          todos={mockTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      expect(mockOnToggle).toHaveBeenCalledWith(mockTodos[0].id);
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('삭제 버튼 클릭 시 onDelete가 호출되어야 함', async () => {
      const user = userEvent.setup();
      render(
        <TodoList
          todos={mockTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: '삭제' });
      await user.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith(mockTodos[0].id);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('할 일 내용 표시', () => {
    it('내용이 있는 할 일은 내용이 표시되어야 함', () => {
      render(
        <TodoList
          todos={mockTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('첫 번째 내용')).toBeInTheDocument();
      expect(screen.getByText('두 번째 내용')).toBeInTheDocument();
    });

    it('내용이 없는 할 일은 내용이 표시되지 않아야 함', () => {
      render(
        <TodoList
          todos={mockTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
        />
      );

      const todoWithoutContent = mockTodos[2];
      const todoElement = screen.getByText(todoWithoutContent.text).closest('li');
      expect(todoElement?.querySelector('.prose')).not.toBeInTheDocument();
    });
  });
}); 