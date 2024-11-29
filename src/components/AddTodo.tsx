import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface AddTodoProps {
  onAdd: (text: string, content: string) => void;
}

const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [isEditorVisible, setIsEditorVisible] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim(), editor?.getHTML() || '');
      setText('');
      editor?.commands.setContent('');
      setIsEditorVisible(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-4" data-testid="todo-form">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="할 일을 입력하세요"
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="todo-input"
        />
        <button
          type="button"
          onClick={() => setIsEditorVisible(!isEditorVisible)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          data-testid="toggle-editor-button"
        >
          {isEditorVisible ? '내용 숨기기' : '내용 추가'}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="submit-button"
        >
          추가
        </button>
      </div>
      
      {isEditorVisible && editor && (
        <div className="border border-gray-300 rounded-lg" data-testid="editor-container">
          <div className="border-b border-gray-300 p-2 flex gap-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded ${
                editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
              data-testid="bold-button"
            >
              굵게
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded ${
                editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
              data-testid="italic-button"
            >
              기울임
            </button>
          </div>
          <div className="editor-content">
            <EditorContent editor={editor} className="p-4 min-h-[200px] prose max-w-none" />
          </div>
        </div>
      )}
    </form>
  );
};

export default AddTodo; 