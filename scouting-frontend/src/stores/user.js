import { defineStore } from "pinia";
import axios from "@/axios";
import { useAuthStore } from "@/stores/auth";

export const useUserStore = defineStore("user", {
  state: () => ({
    name: null,
    email: null,
    bio: null,
  }),
  actions: {
    async changeEmail(newEmail) {
      this.email = newEmail;
    },
    async changeBio(newBio) {
      this.bio = newBio;
    },
    async putChanges() {
      await axios.put("/user/" + this.name, {
        email: this.email,
        bio: this.bio,
      });
    },
    async retrieveData() {
      const response = await axios.get("/user/me").catch(console.error);
      if (!response) {
        console.log("Something went wrong");
        return;
      }
      if (response.status != 200) {
        console.log("Unable to get user info");
        const authStore = useAuthStore();
        authStore.logout();
        return;
      }
      this.name = response.data.data.username;
      this.bio = response.data.data.bio;
      this.email = response.data.data.email;
    },
  },
  getters: {
    getName() {
      if (this.name === null) {
        return "Guest";
      }
      return this.name;
    },
  },
});
