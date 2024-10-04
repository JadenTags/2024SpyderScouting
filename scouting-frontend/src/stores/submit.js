import { defineStore } from "pinia";
import axios from "@/axios";
import vars from "@/vars";

export const useSubmitStore = defineStore("submit", {
  state: () => ({
    token: "",
  }),
  actions: {
    async submitMatchForm(teamNum, matchNum, data, scoutingWarmups) {
      var eventId = vars.dbEventId;

      if (scoutingWarmups.value) {
        eventId += 1;
      }

      const response = await axios.post("/match", {
        event_id: eventId,
        team_num: Number(teamNum.value),
        match_num: Number(matchNum.value),
        data: { data },
      });

      return response.status >= 200 && response.status < 300;
    },
    async submitPitForm(teamNum, data) {
      const response = await axios.post("/pit", {
        event: vars.dbEventId,
        team: Number(teamNum.value),
        data: { data },
      });

      return response.status >= 200 && response.status < 300;
    },
  },
});
