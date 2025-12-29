import { AuditLogEntry, AuditAction, User } from "../types";
import { STORAGE_KEYS } from "../constants";

// Mock In-Memory Audit Log
const AUDIT_LOGS: AuditLogEntry[] = [
    {
        id: 'log_0',
        timestamp: Date.now() - 86400000,
        actorId: 'sys_admin',
        actorEmail: 'system@sentinel.ai',
        action: 'EXPORT_DATA',
        resource: 'System Backup',
        details: 'Daily automated backup completed successfully.',
        ipAddress: '127.0.0.1',
        hash: 'a1b2c3d4e5f67890...'
    }
];

// Helper to simulate a crypto hash
const generateHash = (data: string) => {
    let hash = 0, i, chr;
    if (data.length === 0) return hash.toString(16);
    for (i = 0; i < data.length; i++) {
        chr = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
};

export const logAction = async (action: AuditAction, resource: string, details: string) => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const user: User | null = userStr ? JSON.parse(userStr) : null;

    const entry: AuditLogEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        actorId: user?.id || 'system',
        actorEmail: user?.email || 'system',
        action,
        resource,
        details,
        ipAddress: '192.168.1.50', // Mock IP
        hash: ''
    };

    // Calculate hash based on content to simulate immutability
    const contentToHash = `${entry.id}:${entry.timestamp}:${entry.actorId}:${entry.action}:${entry.resource}`;
    entry.hash = generateHash(contentToHash);

    AUDIT_LOGS.unshift(entry);
    console.log(`[Audit] Action logged: ${action} by ${entry.actorEmail}`);
};

export const getAuditLogs = async (filters?: { action?: string, actor?: string }): Promise<AuditLogEntry[]> => {
    let logs = [...AUDIT_LOGS];
    
    if (filters?.action) {
        logs = logs.filter(l => l.action === filters.action);
    }
    if (filters?.actor) {
        logs = logs.filter(l => l.actorEmail.includes(filters.actor));
    }

    return logs.sort((a, b) => b.timestamp - a.timestamp);
};