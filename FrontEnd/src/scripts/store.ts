import { defineStore } from "pinia";
import { UserDataDTO } from "shared/dto/userDataDTO";

export const useSessionStore = defineStore("session", {
  state: () => ({ userData: null as UserDataDTO | null }),
  persist: true,
});
