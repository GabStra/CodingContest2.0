export interface Notification {
  type: NOTIFICATION_TYPE;
  message: string;
  description?: string;
}

export enum NOTIFICATION_TYPE {
  SUCCESS = "success",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}
