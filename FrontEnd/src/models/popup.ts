export interface Popup {
  type: POPUP_TYPE;
  message: string;
  description?: string;
}

export enum POPUP_TYPE {
  SUCCESS = "success",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}
