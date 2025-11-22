import { useState, useCallback } from 'react';
import { Task, Quadrant } from '../types';

export const useDragDrop = (
    tasks: Task[],
    onTaskUpdate: (task: Task) => Promise<void>,
    quadrants: Record<Quadrant, Task[]>
) => {
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverQuadrant, setDragOverQuadrant] = useState<Quadrant | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
        setDraggedTaskId(id);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragEnter = useCallback((e: React.DragEvent, q: Quadrant) => {
        e.preventDefault();
        setDragOverQuadrant(q);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent, targetQuadrant: Quadrant, targetTaskId?: string, position?: 'top' | 'bottom') => {
        e.preventDefault();
        setDragOverQuadrant(null);
        if (!draggedTaskId) return;

        const originalTask = tasks.find(t => t.id === draggedTaskId);
        if (!originalTask) return;

        const targetList = quadrants[targetQuadrant];
        let newOrder = originalTask.order;

        if (targetTaskId && targetTaskId !== draggedTaskId && position) {
            const targetIndex = targetList.findIndex(t => t.id === targetTaskId);
            const targetTask = targetList[targetIndex];

            if (targetIndex !== -1) {
                if (position === 'top') {
                    const prevTask = targetIndex > 0 ? targetList[targetIndex - 1] : null;
                    if (prevTask) {
                        newOrder = (prevTask.order + targetTask.order) / 2;
                    } else {
                        newOrder = targetTask.order - 10000;
                    }
                } else {
                    const nextTask = targetIndex < targetList.length - 1 ? targetList[targetIndex + 1] : null;
                    if (nextTask) {
                        newOrder = (targetTask.order + nextTask.order) / 2;
                    } else {
                        newOrder = targetTask.order + 10000;
                    }
                }
            }
        } else if (!targetTaskId) {
            const allInQuad = tasks.filter(t => t.quadrant === targetQuadrant);
            const maxOrder = allInQuad.length > 0 ? Math.max(...allInQuad.map(t => t.order)) : 0;
            newOrder = maxOrder + 10000;
        }

        const updatedTask = {
            ...originalTask,
            quadrant: targetQuadrant,
            order: newOrder
        };

        await onTaskUpdate(updatedTask);
        setDraggedTaskId(null);
    }, [draggedTaskId, tasks, quadrants, onTaskUpdate]);

    return {
        draggedTaskId,
        dragOverQuadrant,
        handleDragStart,
        handleDragEnter,
        handleDrop
    };
};
