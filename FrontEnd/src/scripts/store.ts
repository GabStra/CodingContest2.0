import { defineStore } from "pinia";
import { UserData } from "shared/models/userData";

export const useSessionStore = defineStore("session", {
  state: () => ({ userData: null as UserData | null }),
  persist: true,
});
