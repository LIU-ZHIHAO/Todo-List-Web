import { supabase } from './supabase';
import { Task, QuickNote } from '../types';

// Conversion Helpers
function convertTaskToSupabase(task: Task, userId?: string): any {
    return {
        id: task.id,
        title: task.title,
        description: task.description,
        subtasks: task.subtasks,
        date: task.date,
        quadrant: task.quadrant,
        tag: task.tag,
        completed: task.completed,
        completed_at: task.completedAt,
        progress: task.progress,
        created_at: task.createdAt,
        order: task.order,
        is_overdue: task.isOverdue,
        user_id: userId // 添加 user_id
    };
}

function convertTaskFromSupabase(task: any): Task {
    return {
        id: task.id,
        title: task.title,
        description: task.description,
        subtasks: task.subtasks,
        date: task.date,
        quadrant: task.quadrant,
        tag: task.tag,
        completed: task.completed,
        completedAt: task.completed_at,
        progress: task.progress,
        createdAt: task.created_at,
        order: task.order,
        isOverdue: task.is_overdue
    };
}

function convertNoteToSupabase(note: QuickNote, userId?: string): any {
    return {
        id: note.id,
        content: note.content,
        created_at: note.createdAt,
        tags: note.tags || [],
        linked_task_id: note.linkedTaskId,
        is_starred: note.isStarred || false,
        color: note.color,
        attachments: note.attachments || [],
        user_id: userId // 添加 user_id
    };
}

function convertNoteFromSupabase(note: any): QuickNote {
    return {
        id: note.id,
        content: note.content,
        createdAt: note.created_at,
        tags: note.tags || [],
        linkedTaskId: note.linked_task_id,
        isStarred: note.is_starred || false,
        color: note.color,
        attachments: note.attachments || []
    };
}

// 获取当前用户 ID
async function getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
}

export const supabaseService = {
    // Tasks
    async getAllTasks(): Promise<Task[]> {
        const userId = await getCurrentUserId();
        if (!userId) {
            console.warn('No authenticated user, skipping Supabase sync');
            return [];
        }

        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId) // 只获取当前用户的数据
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(convertTaskFromSupabase);
    },

    async addTask(task: Task): Promise<void> {
        const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('tasks')
            .insert(convertTaskToSupabase(task, userId));
        if (error) throw error;
    },

    async updateTask(task: Task): Promise<void> {
        const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('tasks')
            .update(convertTaskToSupabase(task, userId))
            .eq('id', task.id)
            .eq('user_id', userId); // 确保只更新自己的数据
        if (error) throw error;
    },

    async deleteTask(id: string): Promise<void> {
        const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', userId); // 确保只删除自己的数据
        if (error) throw error;
    },

    // Quick Notes
    async getAllQuickNotes(): Promise<QuickNote[]> {
        const userId = await getCurrentUserId();
        if (!userId) {
            console.warn('No authenticated user, skipping Supabase sync');
            return [];
        }

        const { data, error } = await supabase
            .from('quick_notes')
            .select('*')
            .eq('user_id', userId) // 只获取当前用户的数据
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(convertNoteFromSupabase);
    },

    async addQuickNote(note: QuickNote): Promise<void> {
        const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('quick_notes')
            .insert(convertNoteToSupabase(note, userId));
        if (error) throw error;
    },

    async updateQuickNote(note: QuickNote): Promise<void> {
        const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('quick_notes')
            .update(convertNoteToSupabase(note, userId))
            .eq('id', note.id)
            .eq('user_id', userId); // 确保只更新自己的数据
        if (error) throw error;
    },

    async deleteQuickNote(id: string): Promise<void> {
        const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('quick_notes')
            .delete()
            .eq('id', id)
            .eq('user_id', userId); // 确保只删除自己的数据
        if (error) throw error;
    }
};

