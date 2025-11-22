import { Task, Quadrant, Tag } from '../types';

export const exportTasksToMarkdown = (tasks: Task[]): string => {
    let markdown = '# Todo List\n\n';

    // Group by Quadrant
    const quadrants = {
        [Quadrant.Q1]: tasks.filter(t => t.quadrant === Quadrant.Q1),
        [Quadrant.Q2]: tasks.filter(t => t.quadrant === Quadrant.Q2),
        [Quadrant.Q3]: tasks.filter(t => t.quadrant === Quadrant.Q3),
        [Quadrant.Q4]: tasks.filter(t => t.quadrant === Quadrant.Q4),
    };

    const quadrantNames = {
        [Quadrant.Q1]: '重要且紧急',
        [Quadrant.Q2]: '重要不紧急',
        [Quadrant.Q3]: '紧急不重要',
        [Quadrant.Q4]: '不重要不紧急',
    };

    Object.entries(quadrants).forEach(([q, qTasks]) => {
        if (qTasks.length > 0) {
            markdown += `## ${quadrantNames[q as Quadrant]}\n\n`;
            qTasks.forEach(task => {
                const check = task.completed ? 'x' : ' ';
                markdown += `- [${check}] ${task.title}`;
                if (task.description) {
                    markdown += `\n  > ${task.description}`;
                }
                if (task.date) {
                    markdown += ` (Due: ${task.date})`;
                }
                markdown += '\n';

                // Subtasks
                if (task.subtasks && task.subtasks.length > 0) {
                    task.subtasks.forEach(st => {
                        const stCheck = st.completed ? 'x' : ' ';
                        markdown += `  - [${stCheck}] ${st.title}\n`;
                    });
                }
            });
            markdown += '\n';
        }
    });

    return markdown;
};

export const parseMarkdownToTasks = (markdown: string): Partial<Task>[] => {
    const lines = markdown.split('\n');
    const tasks: Partial<Task>[] = [];
    let currentQuadrant: Quadrant = Quadrant.Q2; // Default to Q2
    let currentTask: Partial<Task> | null = null;

    const quadrantMap: Record<string, Quadrant> = {
        '重要且紧急': Quadrant.Q1,
        '重要不紧急': Quadrant.Q2,
        '紧急不重要': Quadrant.Q3,
        '不重要不紧急': Quadrant.Q4,
    };

    lines.forEach(line => {
        const trimmed = line.trim();

        // Header - Quadrant detection
        if (line.startsWith('## ')) {
            const header = line.replace('## ', '').trim();
            if (quadrantMap[header]) {
                currentQuadrant = quadrantMap[header];
            }
            return;
        }

        // Task Item
        const taskMatch = trimmed.match(/^- \[(x| )\] (.*)/);
        if (taskMatch) {
            const completed = taskMatch[1] === 'x';
            let content = taskMatch[2];
            let date = '';

            // Extract date if present (Due: YYYY-MM-DD)
            const dateMatch = content.match(/\(Due: (\d{4}-\d{2}-\d{2})\)/);
            if (dateMatch) {
                date = dateMatch[1];
                content = content.replace(dateMatch[0], '').trim();
            }

            currentTask = {
                id: Date.now().toString(36) + Math.random().toString(36).substring(2),
                title: content,
                completed: completed ? new Date().toISOString().split('T')[0] : null,
                quadrant: currentQuadrant,
                date: date || new Date().toISOString().split('T')[0],
                tag: Tag.WORK, // Default tag
                subtasks: [],
                createdAt: Date.now(),
            };
            tasks.push(currentTask);
            return;
        }

        // Description
        if (trimmed.startsWith('>') && currentTask) {
            currentTask.description = trimmed.replace('>', '').trim();
            return;
        }

        // Subtask
        const subtaskMatch = line.match(/^\s+- \[(x| )\] (.*)/);
        if (subtaskMatch && currentTask) {
            const stCompleted = subtaskMatch[1] === 'x';
            const stTitle = subtaskMatch[2];
            currentTask.subtasks = currentTask.subtasks || [];
            currentTask.subtasks.push({
                id: Date.now().toString(36) + Math.random().toString(36).substring(2),
                title: stTitle,
                completed: stCompleted
            });
        }
    });

    return tasks;
};
