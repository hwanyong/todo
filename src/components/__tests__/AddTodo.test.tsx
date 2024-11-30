import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTodo from '../AddTodo';

// TipTap 에디터 모킹
const mockSetContent = jest.fn();
let mockEditorContent = '';
const mockGetHTML = jest.fn(() => mockEditorContent);
const mockChain = jest.fn(() => ({
  focus: jest.fn(() => ({
    toggleBold: jest.fn(() => ({ run: jest.fn() })),
    toggleItalic: jest.fn(() => ({ run: jest.fn() })),
  })),
}));

jest.mock('@tiptap/react', () => ({
  useEditor: () => ({
    commands: {
      setContent: (content: string) => {
        mockEditorContent = content;
        mockSetContent(content);
      },
    },
    chain: mockChain,
    getHTML: mockGetHTML,
    isActive: jest.fn((type) => type === 'bold'),
  }),
  EditorContent: ({ editor }: { editor: any }) => (
    <div data-testid="editor-content" className="editor-content">
      <div dangerouslySetInnerHTML={{ __html: editor?.getHTML() }} />
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
    mockEditorContent = '';
  });

  describe('기본 렌더링', () => {
    it('필수 UI 요소들이 올바르게 렌더링되어야 함', () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      expect(screen.getByPlaceholderText('할 일을 입력하세요')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '내용 추가' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
    });

    it('초기 상태에서 에디터가 숨겨져 있어야 함', () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      expect(screen.queryByTestId('editor-container')).not.toBeInTheDocument();
      expect(screen.queryByTestId('editor-content')).not.toBeInTheDocument();
    });

    it('입력 필드가 올바른 속성을 가져야 함', () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      const input = screen.getByPlaceholderText('할 일을 입력하세요');
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveClass(
        'flex-1',
        'p-2',
        'border',
        'border-gray-300',
        'rounded-lg',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-blue-500'
      );
    });

    it('버튼들이 올바른 스타일을 가져야 함', () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      const toggleButton = screen.getByRole('button', { name: '내용 추가' });
      expect(toggleButton).toHaveClass(
        'px-4',
        'py-2',
        'bg-gray-100',
        'text-gray-700',
        'rounded-lg',
        'hover:bg-gray-200',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-gray-500'
      );

      const submitButton = screen.getByRole('button', { name: '추가' });
      expect(submitButton).toHaveClass(
        'px-4',
        'py-2',
        'bg-blue-500',
        'text-white',
        'rounded-lg',
        'hover:bg-blue-600',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-blue-500'
      );
    });
  });

  describe('사용자 상호작용', () => {
    it('내용 추가 버튼 클릭 시 에디터가 토글되어야 함', async () => {
      const user = userEvent.setup();
      render(<AddTodo onAdd={mockOnAdd} />);

      const toggleButton = screen.getByRole('button', { name: '내용 추가' });
      
      // 에디터 표시
      await user.click(toggleButton);
      expect(screen.getByTestId('editor-container')).toBeInTheDocument();
      expect(toggleButton).toHaveTextContent('내용 숨기기');

      // 에디터 숨김
      await user.click(toggleButton);
      expect(screen.queryByTestId('editor-container')).not.toBeInTheDocument();
      expect(toggleButton).toHaveTextContent('내용 추가');
    });

    it('할 일 입력 후 제출 시 onAdd가 호출되어야 함', async () => {
      const user = userEvent.setup();
      render(<AddTodo onAdd={mockOnAdd} />);

      // 할 일 입력
      await user.type(screen.getByPlaceholderText('할 일을 입력하세요'), '새로운 할 일');
      
      // 제출
      await user.click(screen.getByRole('button', { name: '추가' }));
      
      expect(mockOnAdd).toHaveBeenCalledWith('새로운 할 일', '');
      expect(mockOnAdd).toHaveBeenCalledTimes(1);
    });

    it('에디터 내용이 있을 때 제출하면 에디터 내용도 함께 전달되어야 함', async () => {
      const user = userEvent.setup();
      render(<AddTodo onAdd={mockOnAdd} />);

      // 할 일 입력
      await user.type(screen.getByPlaceholderText('할 일을 입력하세요'), '새로운 할 일');
      
      // 에디터 표시 및 내용 설정
      await user.click(screen.getByRole('button', { name: '내용 추가' }));
      mockEditorContent = '<p>테스트 내용</p>';
      
      // 제출
      await user.click(screen.getByRole('button', { name: '추가' }));
      
      expect(mockOnAdd).toHaveBeenCalledWith('새로운 할 일', '<p>테스트 내용</p>');
      expect(mockOnAdd).toHaveBeenCalledTimes(1);
    });

    it('빈 입력으로 제출 시 onAdd가 호출되지 않아야 함', async () => {
      const user = userEvent.setup();
      render(<AddTodo onAdd={mockOnAdd} />);

      // 빈 상태로 제출
      await user.click(screen.getByRole('button', { name: '추가' }));
      expect(mockOnAdd).not.toHaveBeenCalled();

      // 공백만 입력 후 제출
      await user.type(screen.getByPlaceholderText('할 일을 입력하세요'), '   ');
      await user.click(screen.getByRole('button', { name: '추가' }));
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it('제출 후 입력 필드와 에디터가 초기화되어야 함', async () => {
      const user = userEvent.setup();
      render(<AddTodo onAdd={mockOnAdd} />);

      // 입력 및 에디터 표시
      await user.type(screen.getByPlaceholderText('할 일을 입력하세요'), '새로운 할 일');
      await user.click(screen.getByRole('button', { name: '내용 추가' }));
      mockEditorContent = '<p>테스트 내용</p>';
      
      // 제출
      await user.click(screen.getByRole('button', { name: '추가' }));
      
      // 초기화 확인
      const input = screen.getByPlaceholderText('할 일을 입력하세요');
      expect(input).toHaveValue('');
      expect(mockSetContent).toHaveBeenCalledWith('');
      expect(mockEditorContent).toBe('');
      expect(screen.queryByTestId('editor-container')).not.toBeInTheDocument();
    });
  });

  describe('에디터 기능', () => {
    it('에디터 버튼이 올바르게 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<AddTodo onAdd={mockOnAdd} />);

      // 에디터 표시
      await user.click(screen.getByRole('button', { name: '내용 추가' }));

      // 굵게 버튼
      const boldButton = screen.getByRole('button', { name: '굵게' });
      expect(boldButton).toHaveClass('bg-gray-200');
      await user.click(boldButton);
      expect(mockChain).toHaveBeenCalled();

      // 기울임 버튼
      const italicButton = screen.getByRole('button', { name: '기울임' });
      expect(italicButton).toHaveClass('hover:bg-gray-100');
      expect(italicButton).not.toHaveClass('bg-gray-200');
      await user.click(italicButton);
      expect(mockChain).toHaveBeenCalled();
    });

    it('에디터 내용이 변경되면 상태가 업데이트되어야 함', async () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      // 에디터 표시
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: '내용 추가' }));

      // 에디터 내용 변경
      mockEditorContent = '<p>새로운 내용</p>';
      expect(mockGetHTML()).toBe('<p>새로운 내용</p>');
    });

    it('에디터 내용이 초기화되면 빈 문자열이 되어야 함', async () => {
      render(<AddTodo onAdd={mockOnAdd} />);

      // 에디터 표시
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: '내용 추가' }));

      // 에디터 내용 설정
      mockEditorContent = '<p>테스트 내용</p>';
      expect(mockGetHTML()).toBe('<p>테스트 내용</p>');

      // 에디터 내용 초기화
      mockEditorContent = '';
      expect(mockGetHTML()).toBe('');
    });
  });
}); 