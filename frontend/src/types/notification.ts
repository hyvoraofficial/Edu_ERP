export interface Notification {
  id: string;
  academyId: string;
  userId: string;
  title: string;
  message: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  status: 'queued' | 'sent' | 'read' | 'failed';
  readAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  academyId: string;
  userId?: string;
  eventType: string;
  description: string;
  metadata: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  academyId: string;
  userId?: string;
  action: 'create' | 'update' | 'delete';
  resourceType: string;
  resourceId: string;
  originalValues: Record<string, any>;
  newValues: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
