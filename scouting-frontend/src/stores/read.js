import { defineStore } from "pinia";
import axios from "@/axios";
import vars from "@/vars";

export const useReadStore = defineStore("read", {
  state: () => ({
    token: "",
  }),
  actions: {
    async getEventMatches(eventNum) {
        try {
            const response = await axios.get("/match?event=" + eventNum);

            return response.data.data;
        } catch {
            return "NO DATA";
        }
    },
    async getTeamsMatches(teamNum, eventNum, scoutingWarmps) {
        var temp = eventNum;

        if (scoutingWarmps) {
            temp++;
        }

        return await this.getEventMatches(temp)
            .then(eventMatches => {
                if (eventMatches == "NO DATA") {
                    return eventMatches;
                } else {
                    var teamMatches = eventMatches.filter(x => x.team == teamNum);
                    var used = [];

                    if (teamMatches.length == 0) {
                        return "NO DATA";
                    } else {

                        // console.log(teamMatches.filter(x => {
                        //     if (used.includes(x.match_num)) {
                        //         return false;
                        //     } else {
                        //         used.push(x.match_num);
                        //         return true;
                        //     }
                        // }))

                        return teamMatches.filter(x => {
                            if (used.includes(x.match_num)) {
                                return false;
                            } else {
                                used.push(x.match_num);
                                return true;
                            }
                        }).map(x => {
                            let obj = x.DataObj.data;
                            obj.match_num = x.match_num;

                            return obj;
                        });
                    }
                }
            });
    },
    async getEventPitList(eventNum) {
        try {
            const response = await axios.get("/pit?event=" + eventNum);

            return response.data.data;
        } catch {
            return "NO DATA";
        }
    },
    async getTeamPit(teamNum) {
        try {
            const response = await axios.get("/pit?event=" + vars.dbEventId);
            
            return Array.from(response.data.data).filter(x => x['team'] == teamNum).pop().data.data;
        } catch {
            return "NO DATA";
        }

        // try {
        //     const response = await axios.get("/pit/" + teamNum);
        //     return Array.from(response)[0].data.data;
        // } catch {
        //     return "NO DATA";
        // }
    }
  },
});
