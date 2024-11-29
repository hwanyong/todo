import { render, screen, fireEvent } from '@testing-library/react';
import TodoItem from '../TodoItem';

describe('TodoItem', () => {
  const mockTodo = {
    id: '1',
    text: '테스트 할 일',
    content: '<p>테스트 내용</p>',
    completed: false,
  };

  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders todo item correctly', () => {
    render(
      <TodoItem
        {...mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(mockTodo.text)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('calls onToggle when checkbox is clicked', () => {
    render(
      <TodoItem
        {...mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('checkbox'));
    expect(mockOnToggle).toHaveBeenCalledWith(mockTodo.id);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <TodoItem
        {...mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('삭제'));
    expect(mockOnDelete).toHaveBeenCalledWith(mockTodo.id);
  });

  it('displays content when provided', () => {
    render(
      <TodoItem
        {...mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const content = document.querySelector('.prose');
    expect(content).toBeInTheDocument();
    expect(content?.innerHTML).toBe(mockTodo.content);
  });

  it('applies completed styles when todo is completed', () => {
    render(
      <TodoItem
        {...mockTodo}
        completed={true}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const text = screen.getByText(mockTodo.text);
    expect(text).toHaveClass('line-through', 'text-gray-500');
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('renders without content when content is empty', () => {
    render(
      <TodoItem
        {...mockTodo}
        content=""
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    expect(document.querySelector('.prose')).not.toBeInTheDocument();
  });

  it('handles long text properly', () => {
    const longText = 'a'.repeat(100);
    render(
      <TodoItem
        {...mockTodo}
        text={longText}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const textElement = screen.getByText(longText);
    expect(textElement).toBeInTheDocument();
    const todoItem = document.querySelector('.bg-white');
    expect(todoItem).toHaveClass('overflow-hidden');
  });

  it('safely renders HTML content', () => {
    const htmlContent = '<p>안전한 내용</p><script>alert("악성 코드")</script>';
    render(
      <TodoItem
        {...mockTodo}
        content={htmlContent}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const content = document.querySelector('.prose');
    expect(content).toBeInTheDocument();
    expect(content?.textContent).toContain('안전한 내용');
  });

  it('maintains layout when content is very long', () => {
    const longContent = '<p>' + 'a'.repeat(1000) + '</p>';
    render(
      <TodoItem
        {...mockTodo}
        content={longContent}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const contentContainer = document.querySelector('.prose');
    expect(contentContainer).toBeInTheDocument();
    expect(contentContainer).toHaveClass('p-4');
  });
}); 