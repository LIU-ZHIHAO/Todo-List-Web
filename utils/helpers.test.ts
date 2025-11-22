import { describe, it, expect } from 'vitest';
import { generateId, checkIsOverdue } from '../utils/helpers';

describe('utils/helpers', () => {
    describe('generateId', () => {
        it('should generate a unique string', () => {
            const id1 = generateId();
            const id2 = generateId();
            expect(id1).not.toBe(id2);
            expect(typeof id1).toBe('string');
            expect(id1.length).toBeGreaterThan(0);
        });
    });

    describe('checkIsOverdue', () => {
        it('should return true for past dates', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0];
            expect(checkIsOverdue(dateStr)).toBe(true);
        });

        it('should return false for today', () => {
            const today = new Date().toISOString().split('T')[0];
            expect(checkIsOverdue(today)).toBe(false);
        });

        it('should return false for future dates', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateStr = tomorrow.toISOString().split('T')[0];
            expect(checkIsOverdue(dateStr)).toBe(false);
        });

        it('should return false for invalid dates', () => {
            expect(checkIsOverdue('invalid-date')).toBe(false);
        });
    });
});
