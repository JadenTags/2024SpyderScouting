import { defineStore } from "pinia";
// import { ref } from "vue";
import axios from "@/axios";
import { useUserStore } from "@/stores/user";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: "",
    isLoggedIn: false,
    user: useUserStore(),
  }),
  actions: {
    async login(username, password) {
      const response = await axios.post("/auth/login", { username, password });

      if (response.status != 200) {
        return false;
      }
      this.token = response.data.data;
      axios.defaults.headers.common["Authorization"] = "Bearer " + this.token;
      this.user.retrieveData();
      this.isLoggedIn = true;
      return true;
    },
    logout() {
      this.token = "";
      this.isLoggedIn = false;
    },
  },
  persist: true,
});
