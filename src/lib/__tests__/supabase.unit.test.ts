import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

// Supabase 환경 변수 설정
const supabaseUrl = '------';
const supabaseServiceRoleKey = '-------';

describe('Supabase 클라이언트 테스트', () => {
  let supabase: ReturnType<typeof createClient<Database>>;
  let testTodoId: string;
  let testTodoIds: string[] = [];

  beforeAll(() => {
    supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
  });

  it('Supabase 클라이언트가 올바르게 생성되어야 함', () => {
    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe('function');
    expect(typeof supabase.channel).toBe('function');
  });

  it('Supabase 클라이언트가 todos 테이블에 접근할 수 있어야 함', () => {
    const todos = supabase.from('todos');
    expect(todos).toBeDefined();
    expect(typeof todos.select).toBe('function');
    expect(typeof todos.insert).toBe('function');
    expect(typeof todos.update).toBe('function');
    expect(typeof todos.delete).toBe('function');
  });

  it('Supabase 클라이언트가 실시간 기능을 지원해야 함', () => {
    const channel = supabase.channel('test');
    expect(channel).toBeDefined();
    expect(typeof channel.subscribe).toBe('function');
    expect(typeof channel.unsubscribe).toBe('function');
  });

  describe('CRUD 작업', () => {
    it('새로운 할 일을 생성할 수 있어야 함', async () => {
      const testTodo = {
        text: '테스트 할 일',
        content: '테스트 내용',
        completed: false
      };

      const { data, error } = await supabase
        .from('todos')
        .insert(testTodo)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.text).toBe(testTodo.text);
      expect(data?.content).toBe(testTodo.content);
      expect(data?.completed).toBe(testTodo.completed);

      if (data) {
        testTodoId = data.id;
      }
    });

    it('생성된 할 일을 조회할 수 있어야 함', async () => {
      const { data, error } = await supabase
        .from('todos')
        .select()
        .eq('id', testTodoId)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.id).toBe(testTodoId);
      expect(data?.text).toBe('테스트 할 일');
      expect(data?.content).toBe('테스트 내용');
      expect(data?.completed).toBe(false);
    });

    it('할 일의 내용을 수정할 수 있어야 함', async () => {
      const updatedText = '수정된 할 일';
      const updatedContent = '수정된 내용';

      const { data, error } = await supabase
        .from('todos')
        .update({ 
          text: updatedText,
          content: updatedContent 
        })
        .eq('id', testTodoId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.text).toBe(updatedText);
      expect(data?.content).toBe(updatedContent);
    });

    it('할 일을 삭제할 수 있어야 함', async () => {
      // 삭제 전에 할 일이 존재하는지 확인
      const { data: beforeDelete } = await supabase
        .from('todos')
        .select()
        .eq('id', testTodoId)
        .single();

      expect(beforeDelete).not.toBeNull();

      // 할 일 삭제
      const { error: deleteError } = await supabase
        .from('todos')
        .delete()
        .eq('id', testTodoId);

      expect(deleteError).toBeNull();

      // 삭제 후 할 일이 존재하지 않는지 확인
      const { data: afterDelete, error: selectError } = await supabase
        .from('todos')
        .select()
        .eq('id', testTodoId)
        .single();

      expect(selectError).not.toBeNull();
      expect(afterDelete).toBeNull();
    });
  });

  describe('실시간 업데이트', () => {
    beforeEach(async () => {
      // 테스트 전에 잠시 대기하여 이전 테스트의 영향을 최소화
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    it('INSERT 이벤트를 수신할 수 있어야 함', (done) => {
      let isTestComplete = false;

      const channel = supabase
        .channel('todos-insert')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'todos' },
          (payload) => {
            if (!isTestComplete) {
              expect(payload.new).toBeDefined();
              expect(payload.new.text).toBe('실시간 테스트 할 일');
              isTestComplete = true;
              channel.unsubscribe();
              done();
            }
          }
        )
        .subscribe();

      // 구독이 완료되길 기다린 후 데이터 추가
      setTimeout(async () => {
        try {
          await supabase
            .from('todos')
            .insert({
              text: '실시간 테스트 할 일',
              content: '실시간 테스트 내용',
              completed: false
            });
        } catch (error) {
          console.error('INSERT 실패:', error);
        }

        // 타임아웃 처리
        setTimeout(() => {
          if (!isTestComplete) {
            isTestComplete = true;
            channel.unsubscribe();
            done(new Error('실시간 INSERT 이벤트를 받지 못했습니다.'));
          }
        }, 8000);
      }, 2000);
    }, 15000);

    it('UPDATE 이벤트를 수신할 수 있어야 함', (done) => {
      let isTestComplete = false;

      const channel = supabase
        .channel('todos-update')
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'todos' },
          (payload) => {
            if (!isTestComplete) {
              expect(payload.new).toBeDefined();
              expect(payload.new.text).toBe('수정된 실시간 테스트 할 일');
              isTestComplete = true;
              channel.unsubscribe();
              done();
            }
          }
        )
        .subscribe();

      // 구독이 완료되길 기다린 후 데이터 수정
      setTimeout(async () => {
        try {
          const { data } = await supabase
            .from('todos')
            .select()
            .limit(1)
            .single();

          if (data) {
            await supabase
              .from('todos')
              .update({ text: '수정된 실시간 테스트 할 일' })
              .eq('id', data.id);
          }
        } catch (error) {
          console.error('UPDATE 실패:', error);
        }

        // 타임아웃 처리
        setTimeout(() => {
          if (!isTestComplete) {
            isTestComplete = true;
            channel.unsubscribe();
            done(new Error('실시간 UPDATE 이벤트를 받지 못했습니다.'));
          }
        }, 8000);
      }, 2000);
    }, 15000);

    it('DELETE 이벤트를 수신할 수 있어야 함', (done) => {
      let isTestComplete = false;

      const channel = supabase
        .channel('todos-delete')
        .on('postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'todos' },
          (payload) => {
            if (!isTestComplete) {
              expect(payload.old).toBeDefined();
              isTestComplete = true;
              channel.unsubscribe();
              done();
            }
          }
        )
        .subscribe();

      // 구독이 완료되길 기다린 후 데이터 삭제
      setTimeout(async () => {
        try {
          const { data } = await supabase
            .from('todos')
            .select()
            .limit(1)
            .single();

          if (data) {
            await supabase
              .from('todos')
              .delete()
              .eq('id', data.id);
          }
        } catch (error) {
          console.error('DELETE 실패:', error);
        }

        // 타임아웃 처리
        setTimeout(() => {
          if (!isTestComplete) {
            isTestComplete = true;
            channel.unsubscribe();
            done(new Error('실시간 DELETE 이벤트를 받지 못했습니다.'));
          }
        }, 8000);
      }, 2000);
    }, 15000);
  });

  describe('에러 케이스', () => {
    describe('잘못된 ID 테스트', () => {
      const invalidId = '00000000-0000-0000-0000-000000000000';

      it('존재하지 않는 ID로 조회 시 에러가 발생해야 함', async () => {
        const { data, error } = await supabase
          .from('todos')
          .select()
          .eq('id', invalidId)
          .single();

        expect(error).not.toBeNull();
        expect(data).toBeNull();
      });

      it('존재하지 않는 ID로 수정 시 데이터가 수정되지 않아야 함', async () => {
        const { data, error } = await supabase
          .from('todos')
          .update({ text: '수정된 할 일' })
          .eq('id', invalidId)
          .select();

        expect(error).toBeNull();
        expect(data).toHaveLength(0);
      });

      it('존재하지 않는 ID로 삭제 시 에러가 발생하지 않아야 함', async () => {
        const { error } = await supabase
          .from('todos')
          .delete()
          .eq('id', invalidId);

        expect(error).toBeNull();
      });
    });

    describe('필수 필드 누락 테스트', () => {
      it('text 필드 없이 생성 시 에러가 발생해야 함', async () => {
        const invalidTodo = {
          content: '테스트 내용',
          completed: false
        };

        const { data, error } = await supabase
          .from('todos')
          .insert(invalidTodo as any)
          .select();

        expect(error).not.toBeNull();
        expect(data).toBeNull();
      });

      it('빈 text로 생성 시 에러가 발생해야 함', async () => {
        const invalidTodo = {
          text: '',
          content: '테스트 내용',
          completed: false
        };

        const { data, error } = await supabase
          .from('todos')
          .insert(invalidTodo)
          .select();

        expect(error).not.toBeNull();
        expect(data).toBeNull();
      });
    });

    describe('잘못된 데이터 타입 테스트', () => {
      it('completed 필드에 boolean이 아닌 값 입력 시 에러가 발생해야 함', async () => {
        const invalidTodo = {
          text: '테스트 할 일',
          content: '테스트 내용',
          completed: 'not a boolean' // string type
        };

        const { data, error } = await supabase
          .from('todos')
          .insert(invalidTodo as any)
          .select();

        expect(error).toBeDefined();
        expect(data).toBeNull();
      });
    });
  });

  describe('페이지네이션', () => {
    beforeAll(async () => {
      // 테스트 데이터 생성
      const todos = Array.from({ length: 15 }, (_, i) => ({
        text: `테스트 할 일 ${i + 1}`,
        content: `테스트 내용 ${i + 1}`,
        completed: i % 2 === 0
      }));

      const { data, error } = await supabase
        .from('todos')
        .insert(todos)
        .select();

      if (data) {
        testTodoIds = data.map(todo => todo.id);
      }
    });

    afterAll(async () => {
      // 테스트 데이터 정리
      if (testTodoIds.length > 0) {
        await supabase
          .from('todos')
          .delete()
          .in('id', testTodoIds);
      }
    });

    describe('기본 페이지네이션', () => {
      it('페이지 크기만큼만 데이터를 가져와야 함', async () => {
        const pageSize = 5;
        const { data, error } = await supabase
          .from('todos')
          .select()
          .range(0, pageSize - 1);

        expect(error).toBeNull();
        expect(data).toHaveLength(pageSize);
      });

      it('다음 페이지의 데이터를 가져올 수 있어야 함', async () => {
        const pageSize = 5;
        const { data: firstPage } = await supabase
          .from('todos')
          .select()
          .range(0, pageSize - 1);

        const { data: secondPage, error } = await supabase
          .from('todos')
          .select()
          .range(pageSize, pageSize * 2 - 1);

        expect(error).toBeNull();
        expect(secondPage).toHaveLength(pageSize);
        expect(secondPage).not.toEqual(firstPage);
      });
    });

    describe('정렬', () => {
      it('생성일 기준 오름차순 정렬이 가능해야 함', async () => {
        const { data, error } = await supabase
          .from('todos')
          .select()
          .order('created_at', { ascending: true })
          .limit(10);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        if (data && data.length > 1) {
          for (let i = 1; i < data.length; i++) {
            expect(new Date(data[i].created_at).getTime())
              .toBeGreaterThanOrEqual(new Date(data[i-1].created_at).getTime());
          }
        }
      });

      it('생성일 기준 내림차순 정렬이 가능해야 함', async () => {
        const { data, error } = await supabase
          .from('todos')
          .select()
          .order('created_at', { ascending: false })
          .limit(10);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        if (data && data.length > 1) {
          for (let i = 1; i < data.length; i++) {
            expect(new Date(data[i].created_at).getTime())
              .toBeLessThanOrEqual(new Date(data[i-1].created_at).getTime());
          }
        }
      });

      it('텍스트 기준 정렬이 가능해야 함', async () => {
        const { data, error } = await supabase
          .from('todos')
          .select()
          .order('text', { ascending: true })
          .limit(10);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        if (data && data.length > 1) {
          for (let i = 1; i < data.length; i++) {
            expect(data[i].text >= data[i-1].text).toBe(true);
          }
        }
      });
    });
  });

  describe('필터링', () => {
    beforeAll(async () => {
      // 테스트 데이터 생성
      const todos = [
        {
          text: '완료된 할 일 1',
          content: '완료된 내용 1',
          completed: true
        },
        {
          text: '완료된 할 일 2',
          content: '완료된 내용 2',
          completed: true
        },
        {
          text: '미완료 할 일 1',
          content: '미완료 내용 1',
          completed: false
        },
        {
          text: '미완료 할 일 2',
          content: '미완료 내용 2',
          completed: false
        },
        {
          text: '중요한 할 일',
          content: '중요한 내용',
          completed: false
        }
      ];

      const { data, error } = await supabase
        .from('todos')
        .insert(todos)
        .select();

      if (data) {
        testTodoIds = data.map(todo => todo.id);
      }
    });

    afterAll(async () => {
      // 테스트 데이터 정리
      if (testTodoIds.length > 0) {
        await supabase
          .from('todos')
          .delete()
          .in('id', testTodoIds);
      }
    });

    describe('완료 상태 필터링', () => {
      it('완료된 할 일만 조회할 수 있어야 함', async () => {
        const { data, error } = await supabase
          .from('todos')
          .select()
          .eq('completed', true);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.every(todo => todo.completed)).toBe(true);
      });

      it('미완료된 할 일만 조회할 수 있어야 함', async () => {
        const { data, error } = await supabase
          .from('todos')
          .select()
          .eq('completed', false);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.every(todo => !todo.completed)).toBe(true);
      });
    });

    describe('텍스트 검색', () => {
      it('제목에 특정 텍스트가 포함된 할 일을 검색할 수 있어야 함', async () => {
        const searchText = '중요한';
        const { data, error } = await supabase
          .from('todos')
          .select()
          .ilike('text', `%${searchText}%`);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.every(todo => todo.text.includes(searchText))).toBe(true);
      });

      it('내용에 특정 텍스트가 포함된 할 일을 검색할 수 있어야 함', async () => {
        const searchText = '중요한';
        const { data, error } = await supabase
          .from('todos')
          .select()
          .ilike('content', `%${searchText}%`);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.every(todo => todo.content.includes(searchText))).toBe(true);
      });

      it('제목 또는 내용에 특정 텍스트가 포함된 할 일을 검색할 수 있어야 함', async () => {
        const searchText = '중요한';
        const { data, error } = await supabase
          .from('todos')
          .select()
          .or(`text.ilike.%${searchText}%,content.ilike.%${searchText}%`);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.every(todo => 
          todo.text.includes(searchText) || todo.content.includes(searchText)
        )).toBe(true);
      });
    });

    describe('복합 필터링', () => {
      it('완료된 할 일 중 특정 텍스트가 포함된 항목을 검색할 수 있어야 함', async () => {
        const searchText = '완료된';
        const { data, error } = await supabase
          .from('todos')
          .select()
          .eq('completed', true)
          .ilike('text', `%${searchText}%`);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.every(todo => 
          todo.completed && todo.text.includes(searchText)
        )).toBe(true);
      });
    });
  });

  describe('벌크 작업', () => {
    describe('벌크 생성', () => {
      it('여러 할 일을 한 번에 생성할 수 있어야 함', async () => {
        const todos = Array.from({ length: 5 }, (_, i) => ({
          text: `벌크 생성 할 일 ${i + 1}`,
          content: `벌크 생성 내용 ${i + 1}`,
          completed: false
        }));

        const { data, error } = await supabase
          .from('todos')
          .insert(todos)
          .select();

        expect(error).toBeNull();
        expect(data).toHaveLength(todos.length);
        expect(data?.every((todo, i) => todo.text === todos[i].text)).toBe(true);

        if (data) {
          testTodoIds = data.map(todo => todo.id);
        }
      });
    });

    describe('벌크 수정', () => {
      it('여러 할 일의 완료 상태를 한 번에 변경할 수 있어야 함', async () => {
        const { error } = await supabase
          .from('todos')
          .update({ completed: true })
          .in('id', testTodoIds);

        expect(error).toBeNull();

        // 변경된 상태 확인
        const { data: updatedTodos } = await supabase
          .from('todos')
          .select()
          .in('id', testTodoIds);

        expect(updatedTodos?.every(todo => todo.completed)).toBe(true);
      });

      it('여러 할 일의 내용을 한 번에 변경할 수 있어야 함', async () => {
        const newContent = '일괄 수정된 내용';
        const { error } = await supabase
          .from('todos')
          .update({ content: newContent })
          .in('id', testTodoIds);

        expect(error).toBeNull();

        // 변경된 상태 확인
        const { data: updatedTodos } = await supabase
          .from('todos')
          .select()
          .in('id', testTodoIds);

        expect(updatedTodos?.every(todo => todo.content === newContent)).toBe(true);
      });
    });

    describe('벌크 삭제', () => {
      it('여러 할 일을 한 번에 삭제할 수 있어야 함', async () => {
        const { error } = await supabase
          .from('todos')
          .delete()
          .in('id', testTodoIds);

        expect(error).toBeNull();

        // 삭제 확인
        const { data: remainingTodos } = await supabase
          .from('todos')
          .select()
          .in('id', testTodoIds);

        expect(remainingTodos).toHaveLength(0);
      });
    });
  });
});