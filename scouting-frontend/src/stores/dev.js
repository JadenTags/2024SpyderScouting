import { defineStore } from "pinia";
import axios from "@/axios";
import { useReadStore } from "@/stores/read";

export const useDevStore = defineStore("dev", {
  state: () => ({
    token: "",
  }),
  actions: {
    async createAccount(username, password, email) {
        console.log(username, password, email)

        const response = axios.post("/auth/register", {
            username: username,
            password: password,
            email: email
        });

        console.log(response);
    },
    async deleteMatch(id) {
        const response = await axios.delete("/match/" + id);

        console.log(response);
    },
    async clearEventMatches(eventId) {
        const readStore = useReadStore();

        (await readStore.getEventMatches(eventId)).map(x => x.ID).forEach(x => {
          this.deleteMatch(x);
        });
    },
    async deletePit(id) {
        const response = await axios.delete("/pit/" + id);

        console.log(response);
    },
    async clearEventPit(eventId) {
        const readStore = useReadStore();

        (await readStore.getEventPitList(eventId)).map(x => x.ID).forEach(x => {
          this.deletePit(x);
        });
    },
  },
  persist: true,
});