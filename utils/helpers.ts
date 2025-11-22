export const generateId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        try { return crypto.randomUUID(); } catch (e) { }
    }
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
};

export const checkIsOverdue = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
};
