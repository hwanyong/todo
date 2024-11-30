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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
    setupRealtimeSubscription();
  }, []);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching todos:', error);
        return;
      }

      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('todos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
          console.log('Change received!', payload);
          fetchTodos();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const handleAddTodo = async (text: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ text, content, completed: false }])
        .select()
        .single();

      if (error) {
        console.error('Error adding todo:', error);
        return;
      }

      setTodos([data, ...todos]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id);

      if (error) {
        console.error('Error toggling todo:', error);
        return;
      }

      setTodos(
        todos.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting todo:', error);
        return;
      }

      setTodos(todos.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">할 일 목록</h1>
      <AddTodo onAdd={handleAddTodo} />
      {isLoading ? (
        <div className="text-center py-4">로딩 중...</div>
      ) : (
        <TodoList
          todos={todos}
          onToggle={handleToggleTodo}
          onDelete={handleDeleteTodo}
        />
      )}
    </main>
  );
}
