import { Task, QuickNote, Quadrant } from '../types';

/**
 * 导出工具函数
 * 支持 JSON, CSV, Markdown 格式
 */

// ============================================
// CSV 导出
// ============================================

/**
 * 将任务导出为 CSV 格式
 */
export function exportTasksToCSV(tasks: Task[]): string {
    const headers = ['ID', '标题', '描述', '日期', '象限', '标签', '状态', '进度', '创建时间', '完成时间'];
    const rows = tasks.map(task => [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`, // 转义引号
        `"${(task.description || '').replace(/"/g, '""')}"`,
        task.date,
        task.quadrant,
        task.tag,
        task.completed ? '已完成' : '未完成',
        task.progress,
        new Date(task.createdAt).toLocaleString('zh-CN'),
        task.completedAt ? new Date(task.completedAt).toLocaleString('zh-CN') : ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * 将快速笔记导出为 CSV 格式
 */
export function exportNotesToCSV(notes: QuickNote[]): string {
    const headers = ['ID', '内容', '标签', '创建时间', '是否标星'];
    const rows = notes.map(note => [
        note.id,
        `"${note.content.replace(/"/g, '""')}"`,
        `"${(note.tags || []).join(', ')}"`,
        new Date(note.createdAt).toLocaleString('zh-CN'),
        note.isStarred ? '是' : '否'
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

// ============================================
// Markdown 导出
// ============================================

/**
 * 将任务导出为 Markdown 格式
 */
export function exportTasksToMarkdown(tasks: Task[]): string {
    const quadrantNames = {
        [Quadrant.Q1]: 'Q1 - 重要且紧急',
        [Quadrant.Q2]: 'Q2 - 重要不紧急',
        [Quadrant.Q3]: 'Q3 - 不重要但紧急',
        [Quadrant.Q4]: 'Q4 - 不重要不紧急'
    };

    let markdown = '# 四象限任务清单\n\n';
    markdown += `> 导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

    // 按象限分组
    const tasksByQuadrant = {
        [Quadrant.Q1]: tasks.filter(t => t.quadrant === Quadrant.Q1),
        [Quadrant.Q2]: tasks.filter(t => t.quadrant === Quadrant.Q2),
        [Quadrant.Q3]: tasks.filter(t => t.quadrant === Quadrant.Q3),
        [Quadrant.Q4]: tasks.filter(t => t.quadrant === Quadrant.Q4)
    };

    Object.entries(tasksByQuadrant).forEach(([quadrant, quadrantTasks]) => {
        if (quadrantTasks.length === 0) return;

        markdown += `## ${quadrantNames[quadrant as Quadrant]}\n\n`;

        quadrantTasks.forEach(task => {
            const checkbox = task.completed ? '[x]' : '[ ]';
            markdown += `- ${checkbox} **${task.title}**`;

            if (task.progress > 0 && task.progress < 100) {
                markdown += ` (进度: ${task.progress}%)`;
            }

            markdown += '\n';

            if (task.description) {
                markdown += `  > ${task.description}\n`;
            }

            markdown += `  - 📅 日期: ${task.date}\n`;
            markdown += `  - 🏷️ 标签: ${task.tag}\n`;

            if (task.subtasks && task.subtasks.length > 0) {
                markdown += `  - 子任务:\n`;
                task.subtasks.forEach(subtask => {
                    const subCheckbox = subtask.completed ? '[x]' : '[ ]';
                    markdown += `    - ${subCheckbox} ${subtask.title}\n`;
                });
            }

            markdown += '\n';
        });
    });

    // 统计信息
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    markdown += '---\n\n';
    markdown += '## 📊 统计信息\n\n';
    markdown += `- 总任务数: ${totalTasks}\n`;
    markdown += `- 已完成: ${completedTasks}\n`;
    markdown += `- 待完成: ${pendingTasks}\n`;
    markdown += `- 完成率: ${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%\n`;

    return markdown;
}

/**
 * 将快速笔记导出为 Markdown 格式
 */
export function exportNotesToMarkdown(notes: QuickNote[]): string {
    let markdown = '# 快速笔记\n\n';
    markdown += `> 导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

    // 按日期分组
    const notesByDate: { [date: string]: QuickNote[] } = {};
    notes.forEach(note => {
        const date = new Date(note.createdAt).toLocaleDateString('zh-CN');
        if (!notesByDate[date]) {
            notesByDate[date] = [];
        }
        notesByDate[date].push(note);
    });

    // 按日期排序
    const sortedDates = Object.keys(notesByDate).sort((a, b) => {
        return new Date(b).getTime() - new Date(a).getTime();
    });

    sortedDates.forEach(date => {
        markdown += `## ${date}\n\n`;

        notesByDate[date].forEach(note => {
            const star = note.isStarred ? '⭐ ' : '';
            markdown += `- ${star}${note.content}`;

            if (note.tags && note.tags.length > 0) {
                markdown += ` \`${note.tags.join('` `')}\``;
            }

            markdown += '\n';
        });

        markdown += '\n';
    });

    markdown += '---\n\n';
    markdown += `**总计**: ${notes.length} 条笔记\n`;

    return markdown;
}

// ============================================
// 下载文件
// ============================================

/**
 * 触发文件下载
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * 导出任务 - 支持多种格式
 */
export function exportTasks(tasks: Task[], format: 'json' | 'csv' | 'markdown') {
    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
        case 'json':
            const jsonData = {
                version: 2,
                exportDate: new Date().toISOString(),
                tasks,
                quickNotes: []
            };
            downloadFile(
                JSON.stringify(jsonData, null, 2),
                `tasks-${timestamp}.json`,
                'application/json'
            );
            break;

        case 'csv':
            downloadFile(
                exportTasksToCSV(tasks),
                `tasks-${timestamp}.csv`,
                'text/csv'
            );
            break;

        case 'markdown':
            downloadFile(
                exportTasksToMarkdown(tasks),
                `tasks-${timestamp}.md`,
                'text/markdown'
            );
            break;
    }
}

/**
 * 导出笔记 - 支持多种格式
 */
export function exportNotes(notes: QuickNote[], format: 'json' | 'csv' | 'markdown') {
    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
        case 'json':
            const jsonData = {
                version: 2,
                exportDate: new Date().toISOString(),
                tasks: [],
                quickNotes: notes
            };
            downloadFile(
                JSON.stringify(jsonData, null, 2),
                `notes-${timestamp}.json`,
                'application/json'
            );
            break;

        case 'csv':
            downloadFile(
                exportNotesToCSV(notes),
                `notes-${timestamp}.csv`,
                'text/csv'
            );
            break;

        case 'markdown':
            downloadFile(
                exportNotesToMarkdown(notes),
                `notes-${timestamp}.md`,
                'text/markdown'
            );
            break;
    }
}

/**
 * 导出所有数据 - 支持多种格式
 */
export function exportAllData(
    tasks: Task[],
    notes: QuickNote[],
    format: 'json' | 'csv' | 'markdown'
) {
    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
        case 'json':
            const jsonData = {
                version: 2,
                exportDate: new Date().toISOString(),
                tasks,
                quickNotes: notes
            };
            downloadFile(
                JSON.stringify(jsonData, null, 2),
                `eisenhower-backup-${timestamp}.json`,
                'application/json'
            );
            break;

        case 'csv':
            // CSV 格式分别导出任务和笔记
            const tasksCSV = exportTasksToCSV(tasks);
            const notesCSV = exportNotesToCSV(notes);
            const combinedCSV = `# 任务\n${tasksCSV}\n\n# 快速笔记\n${notesCSV}`;
            downloadFile(
                combinedCSV,
                `eisenhower-backup-${timestamp}.csv`,
                'text/csv'
            );
            break;

        case 'markdown':
            const tasksMD = exportTasksToMarkdown(tasks);
            const notesMD = exportNotesToMarkdown(notes);
            const combinedMD = `${tasksMD}\n\n${notesMD}`;
            downloadFile(
                combinedMD,
                `eisenhower-backup-${timestamp}.md`,
                'text/markdown'
            );
            break;
    }
}
