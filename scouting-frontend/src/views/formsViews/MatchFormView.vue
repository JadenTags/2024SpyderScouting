<script setup>
import { ref, computed, watch } from "vue";
import { useSubmitStore } from "@/stores/submit";
import { useTbaStore } from "@/stores/tba";
import { useReadStore } from "@/stores/read";
import router from "@/router/index";
import vars from "@/vars";
import toggleButton from "@/components/toggleButton.vue";
import doubleCheckButton from "@/components/doubleCheckButton.vue";

const submitStore = useSubmitStore();
const tbaStore = useTbaStore();
const readStore = useReadStore();

const typeTeam = ref(false);
const teamIndex = ref();

const genInfoErrorText = ref();
const playstyleErrorText = ref();
const endgameErrorText = ref();
const climbTimeErrorText = ref();
const buddyClimbOutcomeErrorText = ref();

const match = ref();
const team = ref();
const noAuto = ref();
const exited = ref();
const autoSpeakerMissed = ref(0);
const autoSpeakerMade = ref(0);
const autoAmpMissed = ref(0);
const autoAmpMade = ref(0);
const pickupsFailed = ref(0);
const teleopSpeakerMissed = ref(0);
const teleopSpeakerMade = ref(0);
const teleopAmpMissed = ref(0);
const teleopAmpMade = ref(0);
const roughDriving = ref();
const passed = ref(0);
const almostTipped = ref(0);
const playstyle = ref();
const endgame = ref();
const climbTime = ref();
const trap = ref();
const trapMade = ref(0);
const trapMissed = ref(0);
const ownHuman = ref(false);
const humanMade = ref(0);
const humanMissed = ref(0);
const buddyClimb = ref();
const buddyClimbOutcome = ref();
const failure = ref();
const notes = ref();

const formSubmitted = ref(false);
const windowWidth = ref(window.innerWidth);
const scoreStyle = computed(() => {
  if (windowWidth.value >= 650) {
    return "flex";
  } else {
    return "";
  }
});
window.addEventListener("resize", () => {
  windowWidth.value = window.innerWidth;
});

//0 IS AUTO AND 1 IS REST
const sectionsCounter = ref(0);
const sectionsObj = {
  "Auto": 0,
  "Teleop": 1,
  "Endgame": 1,
  "Other": 1
}
watch(sectionsCounter, () => {
  window.scrollTo(0,0);
});

const blueTeams = ref([0, 0, 0]);
const redTeams = ref([0, 0, 0]);
const changingTeams = ref(false);
async function changeTeams() {
  changingTeams.value = true;
  var invalid = false;

  if (![undefined, ""].includes(match.value)) {
    if (isNaN(Number(match.value))) {
      invalid = true;
      genInfoErrorText.value = "That is not a valid match number!";
    }
  } else {
    invalid = true;
    genInfoErrorText.value = "You didn't type a match number!";
  }

  if (!invalid) {
    genInfoErrorText.value = "";

    let temp = await tbaStore.getMatch(match.value);

    if (temp.Error) {
      genInfoErrorText.value = "Did you enter the match number correctly?";


    } else {
      if (!scoutedInfoFilled) {
        await waitScoutedInfo();
      }

      blueTeams.value = (temp.alliances.blue.team_keys).map(x => x.replace("frc", ""));
      redTeams.value = (temp.alliances.red.team_keys).map(x => x.replace("frc", ""));
      changingTeams.value = false;
    }
  }

  teamIndex.value = null;
}

function updateTeam() {
  if (teamIndex.value <= 2) {
    team.value = blueTeams.value[teamIndex.value];
  } else {
    team.value = redTeams.value[teamIndex.value % 3];
  }
}
watch(teamIndex, () => {
  updateTeam();
});

const scoutingWarmups = ref(false);
const noMatches = ref(false);
async function checkMatches() {
  if ((await tbaStore.getEventMatches()).length == 0) {
    noMatches.value = true;
  }
}
checkMatches();

var scoutedInfoFilled = false;
var scoutedInfo = {};
async function fillScoutedInfo() {
  const matchData = await readStore.getEventMatches(vars.dbEventId);

  matchData.map(x => [x.match_num, x.team]).forEach(info => {
    if (scoutedInfo[info[0]]) {
      scoutedInfo[info[0]].push(info[1]);
    } else {
      scoutedInfo[info[0]] = [info[1]];
    }
  });

  scoutedInfoFilled = true;
}
async function waitScoutedInfo() {
  while (!scoutedInfoFilled)
    await new Promise(resolve => setTimeout(resolve, 1000));
}
fillScoutedInfo();

const teamScouted = ref([false, false, false, false, false, false]);
watch(blueTeams, async () => {
  if (!scoutedInfoFilled) {
    await waitScoutedInfo();
  }

  if (scoutedInfo[match.value]) {
    teamScouted.value = [
      scoutedInfo[match.value].includes(Number(blueTeams.value[0])),
      scoutedInfo[match.value].includes(Number(blueTeams.value[1])),
      scoutedInfo[match.value].includes(Number(blueTeams.value[2])),
      scoutedInfo[match.value].includes(Number(redTeams.value[0])),
      scoutedInfo[match.value].includes(Number(redTeams.value[1])),
      scoutedInfo[match.value].includes(Number(redTeams.value[2])),
    ];
  } else {
    teamScouted.value = [false, false, false, false, false, false];
  }
});

async function verifyForm() {
  var matchForm = JSON.parse(JSON.stringify(matchFormFormat));
  var submitForm = true;

  //VERIFY TEAM AND MATCH
  if (![undefined, ""].includes(team.value)) {
    if (isNaN(Number(team.value))) {
      submitForm = false;
      genInfoErrorText.value = "That is not a valid team number! ";
    } else {
      genInfoErrorText.value = "";
    }
  } else {
    submitForm = false;
    genInfoErrorText.value = "You didn't type a team number! ";
  } if (!scoutingWarmups) {
    if (![undefined, ""].includes(match.value)) {
      if (isNaN(Number(match.value))) {
        submitForm = false;
        genInfoErrorText.value += "That is not a valid match number!";
      }
    } else {
      submitForm = false;
      genInfoErrorText.value += "You didn't type a match number!";
    }
  } 

  //////////////////////////////////AUTO

  //NO AUTO
  matchForm["auto"]["noAuto"] = noAuto.value == true;

  //EXITED
  matchForm["auto"]["exited"] = exited.value == true;

  //AUTO SPEAKER
  matchForm["auto"]["speaker"] = {
    missed: autoSpeakerMissed.value,
    made: autoSpeakerMade.value,
  };

  //AUTO AMP
  matchForm["auto"]["amp"] = {
    missed: autoAmpMissed.value,
    made: autoAmpMade.value,
  };

  //PICKUPS FAILED
  matchForm["auto"]["failedPickups"] = pickupsFailed.value;

  //////////////////////////////////TELEOP

  //TELEOP SPEAKER
  matchForm["teleop"]["speaker"] = {
    missed: teleopSpeakerMissed.value,
    made: teleopSpeakerMade.value,
  };

  //TELEOP AMP
  matchForm["teleop"]["amp"] = {
    missed: teleopAmpMissed.value,
    made: teleopAmpMade.value,
  };

  //PASSED
  matchForm["teleop"]["passed"] = passed.value;

  //ALMOST TIPPED
  matchForm["teleop"]["almostTipped"] = almostTipped.value;


  //DRIVER MAKES A LOT OF MISTAKES
  matchForm["teleop"]["roughDriving"] = roughDriving.value == true;

  //PLAYSTYLE
  if (isNaN(playstyle.value)) {
    playstyleErrorText.value = "Pick a playstyle!";
    submitForm = false;
  } else {
    playstyleErrorText.value = "";
    matchForm["teleop"]["playstyle"] = ["Defense", "Hybrid", "Offense", "IDK"][playstyle.value]
  }

  //////////////////////////////////ENDGAME

  //ENDGAME
  if (isNaN(endgame.value)) {
    endgameErrorText.value = "Pick an endgame!";
    submitForm = false;
  } else {
    endgameErrorText.value = "";
    matchForm["endgame"]["endgame"] = ["Scoring", "Climbing", "Defending"][endgame.value]
  }

  //CLIMB TIME
  if (isNaN(climbTime.value)) {
    climbTimeErrorText.value = "Pick a Climb Time!";

    if (matchForm["endgame"]["endgame"] == "Climbing") {
      submitForm = false;
    }
  } else {
    climbTimeErrorText.value = "";
    matchForm["endgame"]["climbTime"] = ["5<", "10<", "10+"][climbTime.value];
  }

  //TRAP
  matchForm["endgame"]["trap"] = trap.value == true;

  //TRAP SCORE
  matchForm["endgame"]["trapScore"] = {
    missed: trapMissed.value,
    made: trapMade.value,
  };

  //OWN HUMAN
  matchForm["endgame"]["ownHuman"] = trap.value == true;

  //HUMAN SCORE
  matchForm["endgame"]["humanScore"] = {
    missed: humanMissed.value,
    made: humanMade.value,
  };

  //BUDDY CLIMB
  matchForm["endgame"]["buddyClimb"] = buddyClimb.value == true;

  //BUDDY CLIMB OUTCOME
  if (isNaN(buddyClimbOutcome.value)) {
    buddyClimbOutcomeErrorText.value = "Pick an outcome!";

    if (matchForm["endgame"]["buddyClimb"]) {
      submitForm = false;
    }
  } else {
    buddyClimbOutcomeErrorText.value = "";
    matchForm["endgame"]["buddyClimbOutcome"] = ["Fail", "Success"][buddyClimbOutcome.value];
  }

  ///////////////////////////OTHER

  //FAILURES
  if (!isNaN(failure.value)) {
    matchForm["other"]["failure"] = ["Mech", "Comms", "Tipped", "Stuttering", "No Show"][failure.value];
  }

  //NOTES
  matchForm["other"]["notes"] = notes.value;

  // submitForm = false;
  if (scoutingWarmups.value) {
    match.value = 0;
  }

  if (submitForm && await submitStore.submitMatchForm(team, match, matchForm, scoutingWarmups)) {
    formSubmitted.value = true;
  }
  
  window.scrollTo(0,0);
}
</script>

<script>
export const matchFormFormat = {
  auto: {
    noAuto: null,
    exited: null,
    speaker: {
      missed: 0,
      made: 0,
    },
    amp: {
      missed: 0,
      made: 0,
    },
    failedPickups: 0,
  },
  teleop: {
    speaker: {
      missed: 0,
      made: 0,
    },
    amp: {
      missed: 0,
      made: 0,
    },
    passed: 0,
    almostTipped: 0,
    roughDriving: null,
    playstyle: null,
  },
  endgame: {
    endgame: null,
    climbTime: null,
    trap: null,
    trapScore: {
      missed: 0,
      made: 0,
    },
    ownHuman: false,
    humanScore: {
      missed: 0,
      made: 0,
    },
    buddyClimb: null,
    buddyClimbOutcome: null,
  },
  other: {
    failure: null,
    notes: null,
  },
};
</script>

<template>
  <div v-if="noMatches && !scoutingWarmups" class="vueContainer">
    <h1 class="sectionTitle">There are no matches to scout.</h1>

    <v-btn @click="scoutingWarmups = true" id="warmupsButton">Scouting Warmups?</v-btn>
  </div>

  <div v-else-if="!formSubmitted" class="vueContainer">
    <doubleCheckButton
    text="SWITCH"
    :fnc="router.push"
    :args="['/forms/pit']"/>

    <h1 class="sectionTitle">Match Form</h1>
    
    <div id="general">
      <v-divider class="w-screen" :thickness="10"></v-divider>
      <h1 class="sectionTitle">General</h1>
      <v-divider class="w-screen" :thickness="10"></v-divider>

      <v-text-field
        v-if="!scoutingWarmups"
        v-model="match"
        @change="changeTeams()"
        label="Match#"
        variant="outlined"
        style="width: max(100px, 10%)"
        class="formInput inline-block mt-8">
      </v-text-field>

      <br>

      <v-btn-toggle v-if="blueTeams[0] != 0 && !changingTeams && !typeTeam && !scoutingWarmups" class="buttonGroup mb-10" v-model="teamIndex">
        <v-btn :disabled="teamScouted[0]" class="groupedButton blueTeamButton">{{ blueTeams[0] }}</v-btn>
        <v-btn :disabled="teamScouted[1]" class="groupedButton blueTeamButton">{{ blueTeams[1] }}</v-btn>
        <v-btn :disabled="teamScouted[2]" class="groupedButton blueTeamButton">{{ blueTeams[2] }}</v-btn>
        <v-btn :disabled="teamScouted[3]" class="groupedButton redTeamButton">{{ redTeams[0] }}</v-btn>
        <v-btn :disabled="teamScouted[4]" class="groupedButton redTeamButton">{{ redTeams[1] }}</v-btn>
        <v-btn :disabled="teamScouted[5]" class="groupedButton redTeamButton">{{ redTeams[2] }}</v-btn>
      </v-btn-toggle>

      <v-text-field
        v-if="typeTeam || scoutingWarmups"
        v-model="team"
        label="Team#"
        variant="outlined"
        style="width: max(100px, 10%)"
        class="formInput inline-block w-1/12">
      </v-text-field>

      <toggleButton
        v-if="!scoutingWarmups"
        v-model="typeTeam"
        @click="typeTeam ? updateTeam(): null ;typeTeam = !typeTeam"
        text="Type Team"/>

      <h1 class="errorText">{{ genInfoErrorText }}</h1>
    </div>

    <div id="auto" v-show="sectionsCounter == sectionsObj['Auto']">
      <v-divider class="w-screen" :thickness="10"></v-divider>
      <h1 class="sectionTitle">Auto</h1>
      <v-divider class="w-screen" :thickness="10"></v-divider>

      <toggleButton
        v-model="noAuto"
        @click="noAuto = !noAuto"
        text="No Auto"
        class="mt-5"/>

      <div v-if="!noAuto">
        <toggleButton
          v-model="exited"
          @click="exited = !exited"
          text="Exited"/>

        <div :class="scoreStyle">
          <div class="flex-1">
            <h2 class="scoreTitle">Speaker</h2>
            <div class="flex">
              <div class="scoreDiv">
                <h2 class="subtitle">Missed</h2>
    
                <h2 class="counter">{{ autoSpeakerMissed }}</h2>
    
                <v-btn @click="autoSpeakerMissed != 0 ? autoSpeakerMissed-- : null" class="counterButton">-</v-btn>
                <v-btn @click="autoSpeakerMissed++" class="counterButton">+</v-btn>
              </div>
    
              <div class="scoreDiv">
                <h2 class="subtitle">Made</h2>
    
                <h2 class="counter">{{ autoSpeakerMade }}</h2>
    
                <v-btn @click="autoSpeakerMade != 0 ? autoSpeakerMade-- : null" class="counterButton">-</v-btn>
                <v-btn @click="autoSpeakerMade++" class="counterButton">+</v-btn>
              </div>
            </div>
          </div>

          <div class="flex-1">
            <h2 class="scoreTitle">Amp</h2>
            <div class="flex">
              <div class="scoreDiv">
                <h2 class="subtitle">Missed</h2>
    
                <h2 class="counter">{{ autoAmpMissed }}</h2>
    
                <v-btn @click="autoAmpMissed != 0 ? autoAmpMissed-- : null" class="counterButton">-</v-btn>
                <v-btn @click="autoAmpMissed++" class="counterButton">+</v-btn>
              </div>
    
              <div class="scoreDiv">
                <h2 class="subtitle">Made</h2>
    
                <h2 class="counter">{{ autoAmpMade }}</h2>
    
                <v-btn @click="autoAmpMade != 0 ? autoAmpMade-- : null" class="counterButton">-</v-btn>
                <v-btn @click="autoAmpMade++" class="counterButton">+</v-btn>
              </div>
            </div>
          </div>
        </div>

        <h2 class="subtitle">Pickups Failed</h2>
        <div>
          <h2 class="counter">{{ pickupsFailed }}</h2>
  
          <v-btn @click="pickupsFailed != 0 ? pickupsFailed-- : null" class="counterButton">-</v-btn>
          <v-btn @click="pickupsFailed++" class="counterButton">+</v-btn> 
        </div>
      </div>
    </div>
    
    <v-btn @click="sectionsCounter++;" v-show="sectionsCounter == sectionsObj['Auto']" class="btn float-right mr-10">Next ></v-btn>

    <div id="teleop" v-show="sectionsCounter == sectionsObj['Teleop']">
      <v-divider class="formSectionDivider" :thickness="10"></v-divider>
      <h1 class="sectionTitle">Teleop</h1>
      <v-divider class="formSectionDivider mb-15" :thickness="10"></v-divider>

      <div :class="scoreStyle">
        <div class="flex-1">
          <h2 class="scoreTitle">Speaker</h2>
          <div class="flex">
            <div class="scoreDiv">
              <h2 class="subtitle">Missed</h2>
  
              <h2 class="counter">{{ teleopSpeakerMissed }}</h2>
  
              <v-btn @click="teleopSpeakerMissed != 0 ? teleopSpeakerMissed-- : null" class="counterButton">-</v-btn>
              <v-btn @click="teleopSpeakerMissed++" class="counterButton">+</v-btn>
            </div>
  
            <div class="scoreDiv">
              <h2 class="subtitle">Made</h2>
  
              <h2 class="counter">{{ teleopSpeakerMade }}</h2>
  
              <v-btn @click="teleopSpeakerMade != 0 ? teleopSpeakerMade-- : null" class="counterButton">-</v-btn>
              <v-btn @click="teleopSpeakerMade++" class="counterButton">+</v-btn>
            </div>
          </div>
        </div>

        <div class="flex-1">
          <h2 class="scoreTitle">Amp</h2>
          <div class="flex">
            <div class="scoreDiv">
              <h2 class="subtitle">Missed</h2>
  
              <h2 class="counter">{{ teleopAmpMissed }}</h2>
  
              <v-btn @click="teleopAmpMissed != 0 ? teleopAmpMissed-- : null" class="counterButton">-</v-btn>
              <v-btn @click="teleopAmpMissed++" class="counterButton">+</v-btn>
            </div>
  
            <div class="scoreDiv">
              <h2 class="subtitle">Made</h2>
  
              <h2 class="counter">{{ teleopAmpMade }}</h2>
  
              <v-btn @click="teleopAmpMade != 0 ? teleopAmpMade-- : null" class="counterButton">-</v-btn>
              <v-btn @click="teleopAmpMade++" class="counterButton">+</v-btn>
            </div>
          </div>
        </div>
      </div>

      <h2 class="scoreTitle">Other</h2>
      <div class="flex mt-10">
        <div class="flex-1">
          <h2 class="subtitle">Shots Passed</h2>
          <h2 class="counter">{{ passed }}</h2>
    
          <v-btn @click="passed != 0 ? passed-- : null" class="counterButton">-</v-btn>
          <v-btn @click="passed++" class="counterButton">+</v-btn>
        </div>

        <div class="flex-1">
          <h2 class="subtitle">Times Almost Tipped</h2>
          <h2 class="counter">{{ almostTipped }}</h2>
    
          <v-btn @click="almostTipped != 0 ? almostTipped-- : null" class="counterButton">-</v-btn>
          <v-btn @click="almostTipped++" class="counterButton">+</v-btn>
        </div>
      </div>

      <toggleButton
      v-model="roughDriving"
      @click="roughDriving = !roughDriving"
      text="Rough Driving"
      class="mt-15"/>

      <h2 class="subtitle">Playstyle</h2>
      <v-btn-toggle class="buttonGroup mb-10" v-model="playstyle">
        <v-btn class="groupedButton">Defense</v-btn>
        <v-btn class="groupedButton">Hybrid</v-btn>
        <v-btn class="groupedButton">Offense</v-btn>
        <v-btn class="groupedButton">Idk</v-btn>
      </v-btn-toggle>

      <h1 class="errorText">{{ playstyleErrorText }}</h1>
    </div>

    <div id="endgame" v-show="sectionsCounter == sectionsObj['Endgame']">
      <v-divider class="formSectionDivider" :thickness="10"></v-divider>
      <h1 class="sectionTitle">Endgame</h1>
      <v-divider class="formSectionDivider mb-10" :thickness="10"></v-divider>

      <h2 class="subtitle">Endgame</h2>
      <v-btn-toggle class="buttonGroup" v-model="endgame">
        <v-btn class="groupedButton">Scoring</v-btn>
        <v-btn class="groupedButton">Climbing</v-btn>
        <v-btn class="groupedButton">Defending</v-btn>
      </v-btn-toggle>

      <h1 class="errorText">{{ endgameErrorText }}</h1>

      <div v-if="endgame == 1">
        <h2 class="subtitle">Climb Time</h2>
        <v-btn-toggle class="buttonGroup" v-model="climbTime">
          <v-btn class="groupedButton">5&lt;</v-btn>
          <v-btn class="groupedButton">10&lt;</v-btn>
          <v-btn class="groupedButton">10+</v-btn>
        </v-btn-toggle>

        <h1 class="errorText">{{ climbTimeErrorText }}</h1>
      </div>

      <toggleButton
      v-model="trap"
      @click="trap = !trap"
      text="Trap"
      class="mt-10"/>

      <div v-if="trap">
        <h2 class="subtitle">Trap Score</h2>
        <div class="flex">
          <div class="scoreDiv">
            <h2 class="subtitle">Missed</h2>

            <h2 class="counter">{{ trapMissed }}</h2>

            <v-btn @click="trapMissed != 0 ? trapMissed-- : null" class="counterButton">-</v-btn>
            <v-btn @click="trapMissed++" class="counterButton">+</v-btn>
          </div>

          <div class="scoreDiv">
            <h2 class="subtitle">Made</h2>

            <h2 class="counter">{{ trapMade }}</h2>

            <v-btn @click="trapMade != 0 ? trapMade-- : null" class="counterButton">-</v-btn>
            <v-btn @click="trapMade++" class="counterButton">+</v-btn>
          </div>
        </div>
      </div>

      <toggleButton
      v-model="ownHuman"
      @click="ownHuman = !ownHuman"
      text="Their Human Player"
      class="mt-10"
      style="max-width: 300px; width: 70vw"/>
    
      <div v-if="ownHuman">
        <h2 class="subtitle">Human Score</h2>
        <div class="flex">
          <div class="scoreDiv">
            <h2 class="subtitle">Missed</h2>

            <h2 class="counter">{{ humanMissed }}</h2>

            <v-btn @click="humanMissed != 0 ? humanMissed-- : null" class="counterButton">-</v-btn>
            <v-btn @click="humanMissed++" class="counterButton">+</v-btn>
          </div>

          <div class="scoreDiv">
            <h2 class="subtitle">Made</h2>

            <h2 class="counter">{{ humanMade }}</h2>

            <v-btn @click="humanMade != 0 ? humanMade-- : null" class="counterButton">-</v-btn>
            <v-btn @click="humanMade++" class="counterButton">+</v-btn>
          </div>
        </div>
      </div>

      <toggleButton
      v-model="buddyClimb"
      @click="buddyClimb = !buddyClimb"
      text="Buddy Climb"
      class="mt-10"/>

      <div v-if="buddyClimb">
        <h2 class="subtitle">Outcome</h2>
        <v-btn-toggle class="buttonGroup" v-model="buddyClimbOutcome">
          <v-btn class="groupedButton">Fail</v-btn>
          <v-btn class="groupedButton">Success</v-btn>
        </v-btn-toggle>

        <h1 class="errorText">{{ buddyClimbOutcomeErrorText }}</h1>
      </div>
    </div>

    <div id="other" v-show="sectionsCounter == sectionsObj['Other']">
      <v-divider class="formSectionDivider" :thickness="10"></v-divider>
      <h1 class="sectionTitle">Other</h1>
      <v-divider class="formSectionDivider mb-10" :thickness="10"></v-divider>

      <h2 class="subtitle">Failure</h2>
      <v-btn-toggle v-model="failure" class="buttonGroup mb-10">
        <v-btn class="groupedButton">Mech</v-btn>
        <v-btn class="groupedButton">Comms</v-btn>
        <v-btn class="groupedButton">Tipped</v-btn>
        <v-btn class="groupedButton">Stuttering</v-btn>
        <v-btn class="groupedButton">No Show</v-btn>
      </v-btn-toggle>

      <v-text-field
      v-model="notes"
      label="Notes"
      variant="outlined"
      class="notes"></v-text-field>
      
      <v-btn @click="sectionsCounter--;" class="btn float-left ml-10">< Previous</v-btn>
      
      <doubleCheckButton class="float-right mr-10" text="SUBMIT" :fnc="verifyForm" :args="[]" />
    </div>
  </div>

  <div v-else class="vueContainer">
    <h1 class="sectionTitle">Thank you for submitting a form!</h1>

    <v-btn @click="$router.go()" id="anotherButton">Submit Another</v-btn>
  </div>
</template>

<style>
#anotherButton, #warmupsButton {
  color: white;
  max-height: 60px;
  max-width: 200px;
  font-size: min(2vw, 20px);
  width: 20vw;
  background-color: #353535;
  height: 8vw;
  margin: auto;
  margin-top: 2vw;
  margin-bottom: 7vw;
}

#warmupsButton {
  max-width: 1000vw;
  width: 40vw;
}

.blueTeamButton, .redTeamButton {
  min-width: 50px;
  width: 10vw;
  font-size: min(2.5vw, 25px);
}

.blueTeamButton {
  background-color: rgb(68, 68, 131);
}

.redTeamButton {
  background-color: rgb(88, 46, 46);
}

.redTeamButton:disabled, .blueTeamButton:disabled {
  background-color: #353535;
  color: white;
}

.scoreDiv {
  display: inline-block;
  flex: 1;
}

.counter {
  font-size: min(8vw, 90px);
  font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  color: white;
  margin-top: 30px;
}

.counterButton {
  min-height: min(8vw, 80px);
  color: white;
  font-size: min(2vw, 20px);
  width: 8vw;
  background-color: #353535;
  margin: auto;
  margin-left: 1vw;
  display: inline-block;
}
</style>
