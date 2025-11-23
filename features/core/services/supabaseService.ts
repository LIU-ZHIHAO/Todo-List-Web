import { supabase } from './supabase';
import { Task, QuickNote } from '../types';

// Conversion Helpers
function convertTaskToSupabase(task: Task): any {
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
        is_overdue: task.isOverdue
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

function convertNoteToSupabase(note: QuickNote): any {
    return {
        id: note.id,
        content: note.content,
        created_at: note.createdAt,
        tags: note.tags || [],
        linked_task_id: note.linkedTaskId,
        is_starred: note.isStarred || false,
        color: note.color,
        attachments: note.attachments || []
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

export const supabaseService = {
    // Tasks
    async getAllTasks(): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(convertTaskFromSupabase);
    },

    async addTask(task: Task): Promise<void> {
        const { error } = await supabase
            .from('tasks')
            .insert(convertTaskToSupabase(task));
        if (error) throw error;
    },

    async updateTask(task: Task): Promise<void> {
        const { error } = await supabase
            .from('tasks')
            .update(convertTaskToSupabase(task))
            .eq('id', task.id);
        if (error) throw error;
    },

    async deleteTask(id: string): Promise<void> {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Quick Notes
    async getAllQuickNotes(): Promise<QuickNote[]> {
        const { data, error } = await supabase
            .from('quick_notes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(convertNoteFromSupabase);
    },

    async addQuickNote(note: QuickNote): Promise<void> {
        const { error } = await supabase
            .from('quick_notes')
            .insert(convertNoteToSupabase(note));
        if (error) throw error;
    },

    async updateQuickNote(note: QuickNote): Promise<void> {
        const { error } = await supabase
            .from('quick_notes')
            .update(convertNoteToSupabase(note))
            .eq('id', note.id);
        if (error) throw error;
    },

    async deleteQuickNote(id: string): Promise<void> {
        const { error } = await supabase
            .from('quick_notes')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};
