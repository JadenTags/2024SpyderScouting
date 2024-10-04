<script setup>
import { ref } from 'vue';
import { useTbaStore } from '@/stores/tba';
import { useReadStore } from '@/stores/read';
import { useDriveStore } from '@/stores/drive';
import vars from '@/vars';
import teamSortSlot from '@/components/teamSortSlot.vue';

const tbaStore = useTbaStore();
const readStore = useReadStore();
const driveStore = useDriveStore();

const dbTypeErrorText = ref();
const minPointsErrorText = ref();

const filters = ref([]);
const sortingBasis = ref("Total Ranking");

const dbTypes = ref();
const minPoints = ref();

const loading = ref(true);
const teams = ref([]);
const linkObj = ref({});
var rankings = {};
var teamStats = [];

const teamInfoFormat = {
    "id": {
        "#": "",
        "Rank": "",
        "Name": "",
        "Matches": "0"
    },
    "General": {
        "DB": "ND",
        "UndStage": "ND",
        "Climb": "ND",
        "Defense%": "ND",
        "Fail%": "ND",
        "Points": "ND"
    },
    "Auto": {
        "Taxi%": "ND",
        "Speaker": "ND",
        "Amp": "ND",
        "Points": "ND"
    },
    "Teleop": {
        "Speaker": "ND",
        "Amp": "ND",
        "Passed": "ND",
        "Climb%": "ND",
        "Trap": "ND"
    }
}

async function storeRankings() {
    (await tbaStore.getRankings()).rankings.forEach(rank => {
        rankings[rank["team_key"].replace("frc", "")] = rank["rank"];
    });
}

async function storePics() {
    linkObj.value = await driveStore.getRoboPics();
}
storePics();

async function calculateTeams() {
    await storeRankings();

    var teamNums = (await tbaStore.getEventTeams()).map(x => x.team_number);

    for (let i = 0; i < teamNums.length; i++) {
        let team = teamNums[i];
        console.log(team)
        let matchData = await readStore.getTeamsMatches(team, vars.dbEventId, false);
        let pitData = await readStore.getTeamPit(team);
        let teamInfo = JSON.parse(JSON.stringify(teamInfoFormat));

        teamInfo["id"]["#"] = team;
        teamInfo["id"]["Rank"] = rankings[team];

        const fillName = async () => {
            teamInfo["id"]["Name"] = (await tbaStore.getTeam(team)).nickname;
            console.log(team + " done")
        }

        fillName();

        if (team == "6574") {
            console.log(matchData)
        }

        if (pitData != "NO DATA") {
            //DRIVEBASE
            if (pitData["general"]["dbType"] != "Other") {
                teamInfo["General"]["DB"] = pitData["general"]["dbType"];
            } else {
                teamInfo["General"]["DB"] = pitData["general"]["dbTypeInput"];
            }

            //UndStage
            teamInfo["General"]["UndStage"] = pitData["general"]["fitUnderStage"];

            //CLIMB
            teamInfo["General"]["Climb"] = pitData["teleop"]["canClimb"];
        } if (matchData != "NO DATA") {
            //MATCHES
            teamInfo["id"]["Matches"] = matchData.length;

            //FAILURE%
            teamInfo["General"]["Fail%"] = Math.round(matchData.map(x => x["other"]["failure"]).filter(x => x).length / matchData.length * 100) + "%";

            //AUTO SPEAKER
            teamInfo["Auto"]["Speaker"] = Math.round(matchData.map(x => x["auto"]["speaker"]["made"]).reduce((a, b) => a + b) / matchData.length * 10) / 10;
            
            //AUTO AMP
            teamInfo["Auto"]["Amp"] = Math.round(matchData.map(x => x["auto"]["amp"]["made"]).reduce((a, b) => a + b) / matchData.length * 10) / 10;

            //TAXI
            teamInfo["Auto"]["Taxi%"] = Math.round(matchData.map(x => x["auto"]["exited"]).filter(x => x).length * 100  / matchData.length) + "%";

            //TELEOP SPEAKER
            teamInfo["Teleop"]["Speaker"] = Math.round(matchData.map(x => x["teleop"]["speaker"]["made"]).reduce((a, b) => a + b) / matchData.length * 10) / 10;

            //TELEOP AMP
            teamInfo["Teleop"]["Amp"] = Math.round(matchData.map(x => x["teleop"]["amp"]["made"]).reduce((a, b) => a + b) / matchData.length * 10) / 10;

            //Passed
            teamInfo["Teleop"]["Passed"] = Math.round(matchData.map(x => x["teleop"]["passed"]).reduce((a, b) => a + b)  / matchData.length * 10) / 10;

            //CLIMB
            teamInfo["Teleop"]["Climb%"] = Math.round(matchData.filter(x => x["endgame"]["endgame"] == "Climbing").length * 100 / matchData.length) + "%";

            //TRAP
            teamInfo["Teleop"]["Trap"] = Math.round(matchData.map(x => x["endgame"]["trapScore"]["made"]).reduce((a, b) => a + b) * 5 / matchData.length & 10) / 10;

            //DEFENSE PERCENT
            teamInfo["General"]["Defense%"] = Math.round(matchData.filter(x => x["teleop"]["playstyle"] == "Defense").length / matchData.length * 100) + "%";

            //AUTO POINTS
            teamInfo["Auto"]["Points"] = Math.round(((teamInfo["Auto"]["Speaker"] * 5) + (teamInfo["Auto"]["Amp"] * 2) + Math.round(Number(teamInfo["Auto"]["Taxi%"].replace("%", "")) / 100 * 2)) * 10) / 10;

            //TELEOP POINTS
            teamInfo["Teleop"]["Points"] = Math.round(((teamInfo["Teleop"]["Speaker"] * 3) + teamInfo["Teleop"]["Amp"] + (teamInfo["Teleop"]["Passed"] * 0.5) + Math.round(Number(teamInfo["Teleop"]["Climb%"].replace("%", "")) / 100 * 3) + teamInfo["Teleop"]["Trap"]) * 10) / 10;

            //POINTS
            teamInfo["General"]["Points"] = teamInfo["Auto"]["Points"] + teamInfo["Teleop"]["Points"];
        }

        teamStats.push(teamInfo);
    };

    teamStats = teamStats.sort((a, b) => a["id"]["Rank"] - b["id"]["Rank"]);
    teams.value = teamStats;
    loading.value = false;
}
calculateTeams();

async function waitVarUpdate(vr) {
    if (vr == "mp") {
        vr = minPoints;
    } else if (vr == "db") {
        vr = dbTypes;
    }

    var curVal = vr.value;

    while (curVal == vr.value) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    filterTeams();
}

function filterTeams() {
    teams.value = teamStats;
    
    if (filters.value.includes("Defense")) {
        let ndTeams = teams.value.filter(x => x["General"]["Defense%"] == "ND");
        teams.value = teams.value.filter(x => x["General"]["Defense%"] != "ND" && x["General"]["Defense%"] != "0%").concat(ndTeams);
    }
    
    if (filters.value.includes("Climb")) {
        let ndTeams = teams.value.filter(x => x["General"]["Climb"] == "ND");
        teams.value = teams.value.filter(x => x["General"]["Climb"] == true).concat(ndTeams);
    }
    
    if (filters.value.includes("Trap")) {
        let ndTeams = teams.value.filter(x => x["Teleop"]["Trap"] == "ND");
        teams.value = teams.value.filter(x => x["Teleop"]["Trap"] != "ND" && x["Teleop"]["Trap"] > 0).concat(ndTeams);
    }
    
    if (filters.value.includes("UndStage")) {
        let ndTeams = teams.value.filter(x => x["General"]["UndStage"] == "ND");
        teams.value = teams.value.filter(x => x["General"]["UndStage"] == true).concat(ndTeams);
    }

    if (filters.value.includes("Drivebase")) {
        if (dbTypes.value && dbTypes.value.length > 0) {
            dbTypeErrorText.value = "";

            console.log(dbTypes.value)

            let ndTeams = teams.value.filter(x => x["General"]["DB"] == "ND");
            teams.value = teams.value.filter(x => dbTypes.value.includes(x["General"]["DB"])).concat(ndTeams);
        } else {
            dbTypeErrorText.value = "You need to add drivebases!";
        }
    } else {
        dbTypeErrorText.value = "";
    }
    
    if (filters.value.includes("Min Points")) {
        if (minPoints.value && minPoints.value != "") {
            if (!isNaN(minPoints.value)) {
                minPointsErrorText.value = "";

                let ndTeams = teams.value.filter(x => x["General"]["Points"] == "ND");
                teams.value = teams.value.filter(x => x["General"]["Points"] != "ND" && x["General"]["Points"] > minPoints.value).concat(ndTeams);
            } else {
                minPointsErrorText.vaue = "That is not a number!";
            }
        } else {
            minPointsErrorText.value = "You did not input a minimum point value!";
        }
    } else {
        minPointsErrorText.value = "";
    }

    sortTeams();
}

function sortTeams() {
    if (sortingBasis.value == "Number") {
        teams.value = teams.value.sort((a, b) => a["id"]["#"] - b["id"]["#"]);
    } else if (sortingBasis.value == "Total Ranking") {
        teams.value = teams.value.sort((a, b) => a["id"]["Rank"] - b["id"]["Rank"]);
    } else if (sortingBasis.value == "Auto Speaker") {
        let ndTeams = teams.value.filter(x => x["Auto"]["Speaker"] == "ND");
        teams.value = teams.value.filter(x => x["Auto"]["Speaker"] != "ND").sort((a, b) => b["Auto"]["Speaker"] - a["Auto"]["Speaker"]).concat(ndTeams);
    } else if (sortingBasis.value == "Auto Amp") {
        let ndTeams = teams.value.filter(x => x["Auto"]["Amp"] == "ND");
        teams.value = teams.value.filter(x => x["Auto"]["Amp"] != "ND").sort((a, b) => b["Auto"]["Amp"] - a["Auto"]["Amp"]).concat(ndTeams);
    } else if (sortingBasis.value == "Taxi") {
        let ndTeams = teams.value.filter(x => x["Auto"]["Taxi%"] == "ND");
        teams.value = teams.value.filter(x => x["Auto"]["Taxi%"] != "ND").sort((a, b) => Number(b["Auto"]["Taxi%"].replace("%", "")) - Number(a["Auto"]["Taxi%"].replace("%", ""))).concat(ndTeams);
    } else if (sortingBasis.value == "TSpeaker") {
        let ndTeams = teams.value.filter(x => x["Teleop"]["Speaker"] == "ND");
        teams.value = teams.value.filter(x => x["Teleop"]["Speaker"] != "ND").sort((a, b) => b["Teleop"]["Speaker"] - a["Teleop"]["Speaker"]).concat(ndTeams);
    } else if (sortingBasis.value == "TAmp") {
        let ndTeams = teams.value.filter(x => x["Teleop"]["Amp"] == "ND");
        teams.value = teams.value.filter(x => x["Teleop"]["Amp"] != "ND").sort((a, b) => b["Teleop"]["Amp"] - a["Teleop"]["Amp"]).concat(ndTeams);
    } else if (sortingBasis.value == "Passed") {
        let ndTeams = teams.value.filter(x => x["Teleop"]["Passed"] == "ND");
        teams.value = teams.value.filter(x => x["Teleop"]["Passed"] != "ND").sort((a, b) => b["Teleop"]["Passed"] - a["Teleop"]["Passed"]).concat(ndTeams);
    } else if (sortingBasis.value == "Trap") {
        let ndTeams = teams.value.filter(x => x["Teleop"]["Trap"] == "ND");
        teams.value = teams.value.filter(x => x["Teleop"]["Trap"] != "ND").sort((a, b) => b["Teleop"]["Trap"] - a["Teleop"]["Trap"]).concat(ndTeams);
    } else if (sortingBasis.value == "Defense%") {
        let ndTeams = teams.value.filter(x => x["General"]["Defense%"] == "ND");
        teams.value = teams.value.filter(x => x["General"]["Defense%"] != "ND").sort((a, b) => Number(b["General"]["Defense%"].replace("%", "")) - Number(a["General"]["Defense%"].replace("%", ""))).concat(ndTeams);
    } else if (sortingBasis.value == "A Points") {
        let ndTeams = teams.value.filter(x => x["Auto"]["Points"] == "ND");
        teams.value = teams.value.filter(x => x["Auto"]["Points"] != "ND").sort((a, b) => b["Auto"]["Points"] - a["Auto"]["Points"]).concat(ndTeams);
    } else if (sortingBasis.value == "T Points") {
        let ndTeams = teams.value.filter(x => x["Teleop"]["Points"] == "ND");
        teams.value = teams.value.filter(x => x["Teleop"]["Points"] != "ND").sort((a, b) => b["Teleop"]["Points"] - a["Teleop"]["Points"]).concat(ndTeams);
    } else if (sortingBasis.value == "Points") {
        let ndTeams = teams.value.filter(x => x["General"]["Points"] == "ND");
        teams.value = teams.value.filter(x => x["General"]["Points"] != "ND").sort((a, b) => b["General"]["Points"] - a["General"]["Points"]).concat(ndTeams);
    }
}
</script>

<template>
    <v-container v-if="!loading" class="vueContainer">
        <v-container>
            <v-select 
                v-model="filters"
                @update:modelValue="filterTeams()"
                label="Filtering"
                :items="['Drivebase', 'UndStage', 'Climb', 'Trap', 'Defense', 'Min Points']"
                chips
                multiple>
            </v-select>
    
            <v-select 
                v-model="sortingBasis"
                @update:modelValue="sortTeams()"
                label="Sorting" 
                class="ml-10"
                :items="['Number', 'Total Ranking', 'Taxi', 'Auto Speaker', 'Auto Amp', 'TSpeaker', 'TAmp', 'Passed', 'Trap', 'Defense%', 'A Points', 'T Points', 'Points']">
            </v-select>
        </v-container>

        <v-container>
            <v-select 
                v-if="filters && filters.includes('Drivebase')"
                @update:modelValue="waitVarUpdate('db')"
                v-model="dbTypes"
                label="Drivebase Types"
                style="width: 25%;"
                :items="['Swerve', 'Tank', 'Mechanum', 'Other']"
                chips
                multiple>
            </v-select>

            <h1 class="errorText">{{ dbTypeErrorText }}</h1>

            <v-text-field
                v-if="filters && filters.includes('Min Points')"
                @update:modelValue="waitVarUpdate('mp')"
                v-model="minPoints"
                label="Min Points"
                variant="outlined"
                class="formInput mt-8 ml-5">
            </v-text-field>
            
            <h1 class="errorText">{{ minPointsErrorText }}</h1>
        </v-container>

        <v-container id="table">
            <v-container class="row">
                <v-container class="headerCell">
                    TEAM SORT
                </v-container>
            </v-container>

            <v-container v-for="team in teams" class="row">
                <teamSortSlot v-bind="{data: team, links: linkObj}"/>
            </v-container>
        </v-container>
    </v-container>

    <v-container v-else class="vueContainer">
        <h1 class="sectionTitle">Loading...</h1>
    </v-container>
</template>

<style>
#table {
    width: 100%;
}

.vueContainer {
  text-align: center;
  align-items: center;
  vertical-align: middle;
  margin: auto;
  margin-top: 0;
}

.row {
    display: flex
}

.headerCell {
    background-color: #2e2e2e;
    color: rgb(151, 151, 151);
    font-family:Verdana, Geneva, Tahoma, sans-serif;
    max-height: 100px;
    height: max(15vw, 20px);
    font-size: min(max(5vw, 6px), 40px);
    flex: 1;
    padding: 0;
    width: 100%;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
}

.dataCell, .teamCell {
    border-top: 1px solid black;
    background-color: #a19f9f;
    max-height: 60px;
    height: max(5vw, 20px);
    font-size: min(max(2vw, 6px), 16px);
    flex: 1;
    padding: 0;
    width: 100%;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif
}

.teamCell {
    font-weight: bold;
}

.v-text-field {
    color: white;
    width: 20vw;
    display: inline-block;
}

.v-container {
    padding: 0;
}

.v-select {
    width: 35%;
    margin: auto;
    color: white;
    max-width: 300px;
    margin-top: min(2vw, 20px);
    display: inline-block;
}
</style>