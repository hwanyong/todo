'use client';

import { useState, useEffect } from 'react';
import AddTodo from '@/components/AddTodo';
import TodoList from '@/components/TodoList';
import { supabase } from '@/lib/supabase';

interface Todo {
  id: string;
  text: string;
  content: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
    
    const subscription = supabase
      .channel('todos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, () => {
        fetchTodos();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (text: string, content: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .insert([{ text, content }]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          할 일 목록
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <AddTodo onAdd={addTodo} />
          {loading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : (
            <>
              <TodoList
                todos={todos}
                onToggleTodo={toggleTodo}
                onDeleteTodo={deleteTodo}
              />
              {todos.length === 0 && (
                <p className="text-gray-500 text-center">할 일이 없습니다.</p>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
