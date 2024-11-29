import { render, screen } from '@testing-library/react';
import TodoList from '../TodoList';

jest.mock('../TodoItem', () => {
  return function MockTodoItem({ text, completed }: { text: string; completed: boolean }) {
    return (
      <div data-testid="todo-item" data-completed={completed}>
        {text}
      </div>
    );
  };
});

describe('TodoList', () => {
  const mockTodos = [
    { id: '1', text: '할 일 1', content: '', completed: false },
    { id: '2', text: '할 일 2', content: '', completed: true },
    { id: '3', text: '할 일 3', content: '', completed: false },
  ];

  const mockOnToggleTodo = jest.fn();
  const mockOnDeleteTodo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all todo items', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggleTodo={mockOnToggleTodo}
        onDeleteTodo={mockOnDeleteTodo}
      />
    );

    const todoItems = screen.getAllByTestId('todo-item');
    expect(todoItems).toHaveLength(mockTodos.length);
    expect(screen.getByText('할 일 1')).toBeInTheDocument();
    expect(screen.getByText('할 일 2')).toBeInTheDocument();
    expect(screen.getByText('할 일 3')).toBeInTheDocument();
  });

  it('renders empty list when no todos provided', () => {
    render(
      <TodoList
        todos={[]}
        onToggleTodo={mockOnToggleTodo}
        onDeleteTodo={mockOnDeleteTodo}
      />
    );

    const todoItems = screen.queryAllByTestId('todo-item');
    expect(todoItems).toHaveLength(0);
  });

  it('renders todos in correct order', () => {
    const orderedTodos = [
      { id: '1', text: '첫 번째 할 일', content: '', completed: false },
      { id: '2', text: '두 번째 할 일', content: '', completed: false },
      { id: '3', text: '세 번째 할 일', content: '', completed: false },
    ];

    render(
      <TodoList
        todos={orderedTodos}
        onToggleTodo={mockOnToggleTodo}
        onDeleteTodo={mockOnDeleteTodo}
      />
    );

    const todoItems = screen.getAllByTestId('todo-item');
    todoItems.forEach((item, index) => {
      expect(item).toHaveTextContent(orderedTodos[index].text);
    });
  });

  it('handles completed and incomplete todos correctly', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggleTodo={mockOnToggleTodo}
        onDeleteTodo={mockOnDeleteTodo}
      />
    );

    const todoItems = screen.getAllByTestId('todo-item');
    expect(todoItems[0]).toHaveAttribute('data-completed', 'false');
    expect(todoItems[1]).toHaveAttribute('data-completed', 'true');
    expect(todoItems[2]).toHaveAttribute('data-completed', 'false');
  });

  it('renders large number of todos efficiently', () => {
    const largeTodoList = Array.from({ length: 100 }, (_, i) => ({
      id: `${i}`,
      text: `할 일 ${i}`,
      content: '',
      completed: false,
    }));

    const startTime = performance.now();
    render(
      <TodoList
        todos={largeTodoList}
        onToggleTodo={mockOnToggleTodo}
        onDeleteTodo={mockOnDeleteTodo}
      />
    );
    const endTime = performance.now();

    const todoItems = screen.getAllByTestId('todo-item');
    expect(todoItems).toHaveLength(100);
    expect(endTime - startTime).toBeLessThan(1000); // 1초 이내 렌더링
  });

  it('maintains consistent spacing between items', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggleTodo={mockOnToggleTodo}
        onDeleteTodo={mockOnDeleteTodo}
      />
    );

    const container = screen.getAllByTestId('todo-item')[0].parentElement;
    expect(container).toHaveClass('space-y-2');
  });
}); 