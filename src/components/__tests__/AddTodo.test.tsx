import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTodo from '../AddTodo';

// TipTap 에디터 모킹
const mockEditor = {
  chain: jest.fn(() => ({
    focus: jest.fn(() => ({
      toggleBold: jest.fn(() => ({ run: jest.fn() })),
      toggleItalic: jest.fn(() => ({ run: jest.fn() })),
    })),
  })),
  isActive: jest.fn((type) => type === 'bold'),
  getHTML: jest.fn(() => '<p>테스트 내용</p>'),
  commands: {
    setContent: jest.fn(),
  },
};

// Mock the entire @tiptap/react module
jest.mock('@tiptap/react', () => ({
  useEditor: () => mockEditor,
  EditorContent: ({ editor }: any) => (
    <div className="editor-content">
      <div>{editor?.getHTML()}</div>
    </div>
  ),
}));

jest.mock('@tiptap/starter-kit', () => ({
  default: {},
}));

describe('AddTodo 컴포넌트', () => {
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('필수 UI 요소들이 렌더링되어야 함', () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      expect(screen.getByTestId('todo-form')).toBeInTheDocument();
      expect(screen.getByTestId('todo-input')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-editor-button')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('에디터는 처음에 숨겨져 있어야 함', () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      expect(screen.queryByTestId('editor-container')).not.toBeInTheDocument();
    });

    it('토글 버튼의 텍스트가 올바르게 표시되어야 함', () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      expect(screen.getByTestId('toggle-editor-button')).toHaveTextContent('내용 추가');
    });
  });

  describe('입력 처리', () => {
    it('텍스트 입력이 올바르게 동작해야 함', async () => {
      render(<AddTodo onAdd={mockOnAdd} />);
      
      const input = screen.getByTestId('todo-input');
      await userEvent.type(input, '새로운 할 일');

      expect(input).toHaveValue('새로운 할 일');
    });

    it('빈 텍스트로 제출 시 onAdd가 호출되지 않아야 함', () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      fireEvent.submit(screen.getByTestId('todo-form'));

      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it('공백만 있는 텍스트로 제출 시 onAdd가 호출되지 않아야 함', async () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      const input = screen.getByTestId('todo-input');
      await userEvent.type(input, '   ');
      fireEvent.submit(screen.getByTestId('todo-form'));

      expect(mockOnAdd).not.toHaveBeenCalled();
    });
  });

  describe('에디터 기능', () => {
    it('토글 버튼 클릭 시 에디터가 표시되어야 함', () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      fireEvent.click(screen.getByTestId('toggle-editor-button'));

      expect(screen.getByTestId('editor-container')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-editor-button')).toHaveTextContent('내용 숨기기');
    });

    it('에디터가 표시된 상태에서 토글 버튼 클릭 시 에디터가 숨겨져야 함', () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      const toggleButton = screen.getByTestId('toggle-editor-button');
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);

      expect(screen.queryByTestId('editor-container')).not.toBeInTheDocument();
      expect(toggleButton).toHaveTextContent('내용 추가');
    });

    it('에디터 버튼이 올바르게 동작해야 함', () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      fireEvent.click(screen.getByTestId('toggle-editor-button'));

      const boldButton = screen.getByTestId('bold-button');
      const italicButton = screen.getByTestId('italic-button');

      fireEvent.click(boldButton);
      expect(mockEditor.chain).toHaveBeenCalled();

      fireEvent.click(italicButton);
      expect(mockEditor.chain).toHaveBeenCalled();
    });
  });

  describe('폼 제출', () => {
    it('유효한 입력으로 제출 시 onAdd가 올바른 인자와 함께 호출되어야 함', async () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      const input = screen.getByTestId('todo-input');
      await userEvent.type(input, '새로운 할 일');

      fireEvent.click(screen.getByTestId('toggle-editor-button'));
      fireEvent.submit(screen.getByTestId('todo-form'));

      expect(mockOnAdd).toHaveBeenCalledWith('새로운 할 일', '<p>테스트 내용</p>');
    });

    it('제출 후 입력 필드와 에디터가 초기화되어야 함', async () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      const input = screen.getByTestId('todo-input');
      await userEvent.type(input, '새로운 할 일');

      fireEvent.click(screen.getByTestId('toggle-editor-button'));
      fireEvent.submit(screen.getByTestId('todo-form'));

      expect(input).toHaveValue('');
      expect(mockEditor.commands.setContent).toHaveBeenCalledWith('');
      expect(screen.queryByTestId('editor-container')).not.toBeInTheDocument();
    });
  });

  describe('에러 처리', () => {
    it('에디터가 null일 때도 정상적으로 동작해야 함', async () => {
      jest.spyOn(require('@tiptap/react'), 'useEditor').mockReturnValue(null);

      render(<AddTodo onAdd={mockOnAdd} />);

      const input = screen.getByTestId('todo-input');
      await userEvent.type(input, '새로운 할 일');

      fireEvent.click(screen.getByTestId('toggle-editor-button'));
      fireEvent.submit(screen.getByTestId('todo-form'));

      expect(mockOnAdd).toHaveBeenCalledWith('새로운 할 일', '');
    });

    it('에디터 내용이 없을 때도 정상적으로 동작해야 함', async () => {
      mockEditor.getHTML.mockReturnValue('');

      render(<AddTodo onAdd={mockOnAdd} />);

      const input = screen.getByTestId('todo-input');
      await userEvent.type(input, '새로운 할 일');

      fireEvent.click(screen.getByTestId('toggle-editor-button'));
      fireEvent.submit(screen.getByTestId('todo-form'));

      expect(mockOnAdd).toHaveBeenCalledWith('새로운 할 일', '');
    });
  });
}); 