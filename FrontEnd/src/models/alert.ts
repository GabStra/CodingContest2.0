export interface Alert {
  type: ALERT_TYPE;
  message: string;
}

export enum ALERT_TYPE {
  SUCCESS = "success",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}
