import React from 'react';

interface TodoItemProps {
  id: string;
  text: string;
  content: string;
  completed: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ id, text, content, completed, onToggle, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow mb-2 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={completed}
            onChange={() => onToggle(id)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            aria-label={`${text} 완료 여부`}
          />
          <span className={`ml-3 font-medium ${completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {text}
          </span>
        </div>
        <button
          onClick={() => onDelete(id)}
          className="text-red-500 hover:text-red-700"
        >
          삭제
        </button>
      </div>
      {content && (
        <div 
          className="p-4 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
};

export default TodoItem; 