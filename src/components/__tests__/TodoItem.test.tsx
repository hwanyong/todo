import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItem from '../TodoItem';

describe('TodoItem 컴포넌트', () => {
  const mockTodo = {
    id: '1',
    text: '테스트 할 일',
    content: '<p>테스트 내용</p>',
    completed: false,
  };

  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();

  const renderTodoItem = (props = {}) => {
    return render(
      <TodoItem
        {...mockTodo}
        {...props}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('필수 UI 요소들이 올바르게 렌더링되어야 함', () => {
      renderTodoItem();

      expect(screen.getByText(mockTodo.text)).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    });

    it('미완료 상태의 체크박스가 올바르게 표시되어야 함', () => {
      renderTodoItem();
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('완료 상태의 체크박스가 올바르게 표시되어야 함', () => {
      renderTodoItem({ completed: true });
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('내용이 제공될 때 올바르게 표시되어야 함', () => {
      renderTodoItem();

      const content = screen.getByText('테스트 내용');
      expect(content).toBeInTheDocument();
      expect(content.closest('.prose')).toHaveClass('prose', 'prose-sm', 'max-w-none');
    });

    it('내용이 없을 때 내용 영역이 렌더링되지 않아야 함', () => {
      renderTodoItem({ content: '' });
      expect(screen.queryByText('테스트 내용')).not.toBeInTheDocument();
    });
  });

  describe('사용자 상호작용', () => {
    it('체크박스 클릭 시 onToggle이 호출되어야 함', async () => {
      const user = userEvent.setup();
      renderTodoItem();

      await user.click(screen.getByRole('checkbox'));
      expect(mockOnToggle).toHaveBeenCalledWith(mockTodo.id);
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('삭제 버튼 클릭 시 onDelete가 호출되어야 함', async () => {
      const user = userEvent.setup();
      renderTodoItem();

      await user.click(screen.getByRole('button', { name: '삭제' }));
      expect(mockOnDelete).toHaveBeenCalledWith(mockTodo.id);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('스타일링', () => {
    it('완료 상태일 때 텍스트에 취소선과 회색 스타일이 적용되어야 함', () => {
      renderTodoItem({ completed: true });
      
      const text = screen.getByText(mockTodo.text);
      expect(text).toHaveClass('line-through', 'text-gray-500');
    });

    it('미완료 상태일 때 기본 텍스트 스타일이 적용되어야 함', () => {
      renderTodoItem({ completed: false });
      
      const text = screen.getByText(mockTodo.text);
      expect(text).toHaveClass('text-gray-900');
      expect(text).not.toHaveClass('line-through');
    });
  });
}); 