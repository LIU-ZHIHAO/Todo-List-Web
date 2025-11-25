import { dbService } from '../services/db';
import { supabase } from '../services/supabase';

/**
 * 数据迁移工具
 * 将本地 IndexedDB 数据同步到 Supabase
 */

export interface MigrationResult {
    success: boolean;
    tasksCount: number;
    notesCount: number;
    errors: string[];
}

/**
 * 将 Task 对象的字段名从 camelCase 转换为 snake_case
 */
function convertTaskToSupabase(task: any): any {
    return {
        id: task.id,
        title: task.title,
        description: task.description,
        subtasks: task.subtasks,
        date: task.date,
        quadrant: task.quadrant,
        tag: task.tag,
        completed: task.completed,
        completed_at: task.completedAt ? new Date(task.completedAt).toISOString() : null,
        progress: task.progress,
        created_at: task.createdAt ? new Date(task.createdAt).toISOString() : new Date().toISOString(),
        order: task.order,
        is_overdue: task.isOverdue
    };
}

/**
 * 将 QuickNote 对象的字段名从 camelCase 转换为 snake_case
 */
function convertNoteToSupabase(note: any): any {
    return {
        id: note.id,
        content: note.content,
        created_at: note.createdAt ? new Date(note.createdAt).toISOString() : new Date().toISOString(),
        tags: note.tags || [],
        linked_task_id: note.linkedTaskId,
        is_starred: note.isStarred || false,
        color: note.color,
        attachments: note.attachments || []
    };
}

/**
 * 将 Supabase 的 Task 对象转换回 camelCase
 */
function convertTaskFromSupabase(task: any): any {
    return {
        id: task.id,
        title: task.title,
        description: task.description,
        subtasks: task.subtasks,
        date: task.date,
        quadrant: task.quadrant,
        tag: task.tag,
        completed: task.completed,
        completedAt: task.completed_at ? new Date(task.completed_at).getTime() : undefined,
        progress: task.progress,
        createdAt: task.created_at ? new Date(task.created_at).getTime() : Date.now(),
        order: task.order,
        isOverdue: task.is_overdue
    };
}

/**
 * 将 Supabase 的 QuickNote 对象转换回 camelCase
 */
function convertNoteFromSupabase(note: any): any {
    return {
        id: note.id,
        content: note.content,
        createdAt: note.created_at ? new Date(note.created_at).getTime() : Date.now(),
        tags: note.tags || [],
        linkedTaskId: note.linked_task_id,
        isStarred: note.is_starred || false,
        color: note.color,
        attachments: note.attachments || []
    };
}

/**
 * 检查 Supabase 连接状态
 */
export async function checkSupabaseConnection(): Promise<boolean> {
    try {
        const { error } = await supabase.from('tasks').select('count', { count: 'exact', head: true });
        return !error;
    } catch (e) {
        console.error('Supabase connection check failed:', e);
        return false;
    }
}

/**
 * 迁移所有任务到 Supabase
 */
async function migrateTasks(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
        const tasks = await dbService.getAllTasks();

        if (tasks.length === 0) {
            return { count: 0, errors: [] };
        }

        // 转换字段名
        const supabaseTasks = tasks.map(convertTaskToSupabase);

        const { error } = await supabase
            .from('tasks')
            .upsert(supabaseTasks, { onConflict: 'id' });

        if (error) {
            errors.push(`任务迁移失败: ${error.message}`);
        } else {
            count = tasks.length;
        }
    } catch (e) {
        errors.push(`任务迁移异常: ${e instanceof Error ? e.message : String(e)}`);
    }

    return { count, errors };
}

/**
 * 迁移所有快速笔记到 Supabase
 */
async function migrateQuickNotes(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
        const notes = await dbService.getAllQuickNotes();

        if (notes.length === 0) {
            return { count: 0, errors: [] };
        }

        // 转换字段名
        const supabaseNotes = notes.map(convertNoteToSupabase);

        const { error } = await supabase
            .from('quick_notes')
            .upsert(supabaseNotes, { onConflict: 'id' });

        if (error) {
            errors.push(`笔记迁移失败: ${error.message}`);
        } else {
            count = notes.length;
        }
    } catch (e) {
        errors.push(`笔记迁移异常: ${e instanceof Error ? e.message : String(e)}`);
    }

    return { count, errors };
}

/**
 * 执行完整的数据迁移
 */
export async function migrateAllData(): Promise<MigrationResult> {
    const allErrors: string[] = [];

    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
        return {
            success: false,
            tasksCount: 0,
            notesCount: 0,
            errors: ['无法连接到 Supabase,请检查网络连接和配置']
        };
    }

    const tasksResult = await migrateTasks();
    allErrors.push(...tasksResult.errors);

    const notesResult = await migrateQuickNotes();
    allErrors.push(...notesResult.errors);

    return {
        success: allErrors.length === 0,
        tasksCount: tasksResult.count,
        notesCount: notesResult.count,
        errors: allErrors
    };
}

/**
 * 从 Supabase 同步数据到本地
 */
export async function syncFromSupabase(): Promise<MigrationResult> {
    const allErrors: string[] = [];
    let tasksCount = 0;
    let notesCount = 0;

    try {
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (tasksError) {
            allErrors.push(`获取任务失败: ${tasksError.message}`);
        } else if (tasks && tasks.length > 0) {
            await dbService.clearTasks();

            for (const task of tasks) {
                try {
                    const localTask = convertTaskFromSupabase(task);
                    await dbService.updateTask(localTask);
                    tasksCount++;
                } catch (e) {
                    allErrors.push(`任务 ${task.id} 同步失败`);
                }
            }
        }

        const { data: notes, error: notesError } = await supabase
            .from('quick_notes')
            .select('*')
            .order('created_at', { ascending: false });

        if (notesError) {
            allErrors.push(`获取笔记失败: ${notesError.message}`);
        } else if (notes && notes.length > 0) {
            await dbService.clearQuickNotes();

            for (const note of notes) {
                try {
                    const localNote = convertNoteFromSupabase(note);
                    await dbService.updateQuickNote(localNote);
                    notesCount++;
                } catch (e) {
                    allErrors.push(`笔记 ${note.id} 同步失败`);
                }
            }
        }
    } catch (e) {
        allErrors.push(`同步异常: ${e instanceof Error ? e.message : String(e)}`);
    }

    return {
        success: allErrors.length === 0,
        tasksCount,
        notesCount,
        errors: allErrors
    };
}

/**
 * 获取 Supabase 数据统计
 */
export async function getSupabaseStats(): Promise<{
    tasksCount: number;
    notesCount: number;
    error?: string;
}> {
    try {
        const [tasksResult, notesResult] = await Promise.all([
            supabase.from('tasks').select('*', { count: 'exact', head: true }),
            supabase.from('quick_notes').select('*', { count: 'exact', head: true })
        ]);

        return {
            tasksCount: tasksResult.count || 0,
            notesCount: notesResult.count || 0
        };
    } catch (e) {
        return {
            tasksCount: 0,
            notesCount: 0,
            error: e instanceof Error ? e.message : String(e)
        };
    }
}
