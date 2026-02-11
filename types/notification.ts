export type NotificationType =
  | "report_assigned"
  | "report_approved"
  | "report_rejected";

export interface Notification {
  id: number;
  recipient_id: number;
  sender_id: number;
  sender_name: string | null;
  type: NotificationType;
  message: string;
  report_id: number | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
}

export interface UnreadCountResponse {
  unread_count: number;
}
