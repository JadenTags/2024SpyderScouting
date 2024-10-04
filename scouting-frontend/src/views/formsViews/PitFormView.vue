<script setup>
import {ref} from 'vue';
import { useSubmitStore } from '@/stores/submit';
import { useReadStore } from '@/stores/read';
import { useTbaStore } from "@/stores/tba";
import { useDriveStore } from "@/stores/drive";
import config from '@/config';
import vars from "@/vars";
import router from "@/router/index";
import toggleButton from '@/components/toggleButton.vue';
import doubleCheckButton from "@/components/doubleCheckButton.vue";

const submitStore = useSubmitStore();
const readStore = useReadStore();
const tbaStore = useTbaStore();
const driveStore = useDriveStore();

const teamsLeft = ref([]);

const genInfoErrorText = ref();
const programmingLanguageErrorText = ref();
const dimensionsErrorText = ref();
const dbTypeErrorText = ref();
const motorInputsErrorText = ref();
const pickupsErrorText = ref();
const canShootErrorText = ref();
const shootingPosErrorText = ref();
const roboPicErrorText = ref();
const generalAutoErrorText = ref();
const curAutoErrorText = ref(0);
const autosErrorTexts = [ref()];

const team = ref();
const programmingLanguage = ref();
const length = ref();
const width = ref();
const fitUnderStage = ref();
const dbType = ref();
const dbTypeInput = ref();
const motorType = ref();
const gearRatio = ref();
const hasBuddyClimb = ref();
const pickups = ref();
const canShoot = ref();
const shootingPos = ref();
const roboPic = ref();
const noAuto = ref();
const otfPathPlanning = ref();
const hasCenterDisrupt = ref();
const autoProfiles = {};
const canClimb = ref();
const canHarmonize = ref();
const notes = ref();

//AUTO PROFILES
const preload = ref();
const exit = ref();
const nearNotes = ref();
const centerNotes = ref();
const curAuto = ref("Auto 1");
const autos = ref(["Auto 1"]);
function addAuto() {
    autosErrorTexts.push(ref());
    autos.value.push("Auto " + (autos.value.length + 1));

    autoProfiles[autos.value.length] = {
        preload: undefined,
        exit: undefined,
        nearNotes: undefined,
        centerNotes: undefined
    }

    updateForm();
    curAuto.value = "Auto " + autos.value.length;
}
async function removeAuto() {
    if (autos.value.length > 1) {
        if (Number(curAuto.value.split(' ')[1]) == autos.value.length) {
            updateForm();
            curAuto.value = "Auto " + (autos.value.length - 1);
            await waitSelectUpdate();
        }

        autos.value.pop();

        delete autoProfiles[autos.value.length + 1];

        autosErrorTexts.pop();
    }
}
function updateProfile() {
    autoProfiles[curAuto.value.split(' ')[1]] = {
        preload: preload.value,
        exit: exit.value,
        nearNotes: nearNotes.value,
        centerNotes: centerNotes.value
    }
}
async function updateForm() {
    await waitSelectUpdate();

    var autoProfile = autoProfiles[Number(curAuto.value.split(' ')[1])];

    if (autoProfile) {
        if ((exit.value == true) != (autoProfile.exit == true)) {
            document.getElementById("exitButton").click();
        }

        preload.value = autoProfile.preload;
        exit.value = autoProfile.exit;
        nearNotes.value = autoProfile.nearNotes;
        centerNotes.value = autoProfile.centerNotes;

        curAutoErrorText.value = Number(curAuto.value.split(' ')[1]) - 1;
    }
}
async function waitSelectUpdate() {
    var curVal = curAuto.value.split(' ')[1];

    while (curVal == curAuto.value.split(' ')[1]) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}
updateProfile();

const formSubmitted = ref(false);
const refreshPage = () => {
  location.reload();
};

const teamsAdded = ref(false);
async function addTeams() {
    var scoutedTeams = (await readStore.getEventPitList(vars.dbEventId)).map(x => x["team"]);
    var teamsHere = (await tbaStore.getEventTeams()).map(x => x.team_number);
    
    teamsLeft.value = teamsHere.filter(x => !scoutedTeams.includes(x));
    teamsAdded.value = true;
}
addTeams();

// TODO TEST THIS SHIT OUTTA THIS
async function verifyForm() {
    var pitForm = JSON.parse(JSON.stringify(pitFormFormat));
    var submitForm = true;

    //VERIFY TEAM
    if (team.value && team.value != "") {
        if (isNaN(team.value)) {
        submitForm = false;
        genInfoErrorText.value = "That is not a valid team number! ";
        } else {
        genInfoErrorText.value = "";
        }
    } else {
        submitForm = false;
        genInfoErrorText.value = "You didn't select a team number! ";
    }

    //////////////////////////////////GENERAL

    //PROGRAMMING LANGUAGE
    if (programmingLanguage.value && programmingLanguage.value != "") {
        programmingLanguageErrorText.value = "";
        pitForm["general"]["programmingLanguage"] = programmingLanguage.value;
        submitForm = true;
    } else {
        programmingLanguageErrorText.value = "You did not input a programming language!";
        submitForm = false;
    }

    //DIMENSIONS
    var dims = [length.value, width.value];
    if (dims.includes(undefined) || dims.includes("")) {
        dimensionsErrorText.value = "You did not input all dimensions!";
        submitForm = false;
    } else if (dims.map(x => isNaN(x)).includes(true)) {
        dimensionsErrorText.value = "You inputted non numbers!";
        submitForm = false;
    } else {
        dimensionsErrorText.value = "";
        pitForm["general"]["dimensions"] = {
            length: Number(length.value),
            width: Number(width.value)
        }
    }

    //FIT UNDER STAGE
    pitForm["general"]["fitUnderStage"] = fitUnderStage.value == true;
    
    //DRIVE BASE TYPE
    if (!dbType.value) {
        dbTypeErrorText.value = "You did not select a drivebase type!";
        submitForm = false;
    } else if (dbType.value == "Other") {
        if (dbTypeInput.value && dbTypeInput.value != "") {
            dbTypeErrorText.value = "";
            pitForm["general"]["dbType"] = dbTypeInput.value;
        } else {
            dbTypeErrorText.value = "You did not elaborate!";
            submitForm = false;
        }
    } else {
        dbTypeErrorText.value = "";
        pitForm["general"]["dbType"] = dbType.value;
    }

    //MOTOR INPUTS
    if (motorType.value && motorType.value != "") {
        motorInputsErrorText.value = "";
        pitForm["general"]["motorType"] = motorType.value;
    } else {
        motorInputsErrorText.value = "You did not input a motor type! ";
        submitForm = false;
    } if (gearRatio.value && gearRatio.value != "") {
        pitForm["general"]["gearRatio"] = gearRatio.value;
    } else {
        motorInputsErrorText.value += "You did not input a gear ratio!";
        submitForm = false;
    }

    //BUDDY CLIMB
    pitForm["general"]["hasBuddyClimb"] = hasBuddyClimb.value == true;

    //PICKUPS
    if (!pickups.value || pickups.value.length == 0) {
        pickupsErrorText.value = "You did not select any pickups!";
        submitForm = false;
    } else {
        pickupsErrorText.value = "";
        pickups.value.forEach(x => {
            pitForm["general"]["pickups"].push(["under bumper", "over bumper", "source"][x]);
        });
    }

    //CAN SHOOT
    if (!canShoot.value || canShoot.value.length == 0) {
        canShootErrorText.value = "You did not select anywhere their robot can shoot!";
        submitForm = false;
    } else {
        canShootErrorText.value = "";
        canShoot.value.forEach(x => {
            pitForm["general"]["canShoot"].push(["speaker", "amp", "trap"][x]);
        });
    }

    //SHOOTING POSITIONS
    if (!shootingPos.value || shootingPos.value.length == 0) {
        shootingPosErrorText.value = "You did not select any shooting positions!";
        submitForm = false;
    } else {
        shootingPosErrorText.value = "";
        shootingPos.value.forEach(x => {
            pitForm["general"]["speakerShootingPositions"].push(["subwoofer", "podium", "under stage", "over robot"][x]);
        });
    }

    //ROBO PICTURE
    if (roboPic.value == undefined) {
        roboPicErrorText.value = "You did not submit a picture!";
        submitForm = false;
    } else {
        roboPicErrorText.value = "";
    }

    //NOTES
    pitForm["general"]["notes"] = notes.value;

    ////////////////////////////////////////////AUTO

    //NO AUTO
    pitForm["auto"]["noAuto"] = noAuto.value == true;

    if (!pitForm["auto"]["noAuto"]) {
        //ON THE FLY PATH PLANNING
        pitForm["general"]["otfPathPlanning"] = otfPathPlanning.value == true;

        //HAS CENTER DISRUPT
        pitForm["general"]["hasCenterDisrupt"] = hasCenterDisrupt.value == true;

        //PROFILES STUFFS
        var autoErrors = [];
        var curAutoProf = 0;
        Object.values(autoProfiles).forEach(x => {
            var autoObj = {
                preload: null,
                exit: x.exit == true,
                nearNotes: x.nearNotes,
                centerNotes: x.centerNotes
            }
            var error = false;

            if (x.preload == undefined) {
                autosErrorTexts[curAutoProf].value = "You did not select a preload! ";
                submitForm = false;
                error = true;
            } else {
                autosErrorTexts[curAutoProf].value = "";
                autoObj.preload = ["nothing", "dump", "shoot"][x.preload];
            }

            if (x.nearNotes && x.nearNotes != "") {
                if (isNaN(x.nearNotes)) {
                    autosErrorTexts[curAutoProf].value += "Your near notes value is not a number! ";
                    submitForm = false;
                    error = true;
                }
            } else {
                autosErrorTexts[curAutoProf].value += "You did not enter a near notes value! ";
                submitForm = false;
                error = true;
            } if (x.centerNotes && x.centerNotes != "") {
                if (isNaN(x.centerNotes)) {
                    autosErrorTexts[curAutoProf].value += "Your center notes value is not a number! ";
                    submitForm = false;
                    error = true;
                }
            } else {
                autosErrorTexts[curAutoProf].value += "You did not enter a center notes value! ";
                submitForm = false;
                error = true;
            }

            if (error) {
                autoErrors.push(curAutoProf + 1);
            } else {
                pitForm["auto"]["autos"].push(autoObj);
            }

            curAutoProf++;
        });
        
        if (autoErrors.length == 0) {
            generalAutoErrorText.value = "";
        } else if (autoErrors.length == 1) {
            generalAutoErrorText.value = "There are errors on auto " + autoErrors[0] + "!";
        } else if (autoErrors.length == 2) {
            generalAutoErrorText.value = "There are errors on autos " + autoErrors[0] + " and " + autoErrors[1] +  "!";
        } else {
            generalAutoErrorText.value = "There are errors on autos " + autoErrors.slice(0, -1).join(", ") + ", and " + autoErrors[autoErrors.length - 1] +  "!";
        }
    }

    //////////////////////////////////TELEOP

    //CAN CLIMB
    pitForm["teleop"]["canClimb"] = canClimb.value == true;

    //CAN HARMONIZE
    pitForm["teleop"]["canHarmonize"] = canHarmonize.value == true;

    // submitForm = false;
    if (submitForm && await submitStore.submitPitForm(team, pitForm)) {
        await driveStore.uploadFile(roboPic.value[0], vars.year + vars.tbaEventId + " team " + team.value, config.roboPicsFolder);
        formSubmitted.value = true;
    }
  
    window.scrollTo(0,0);
}

</script>

<script>
export const pitFormFormat = {
    general: {
        programmingLanguage: "",
        dimensions: {
            length: 0,
            width: 0
        },
        fitUnderStage: false,
        dbType: "",
        dbTypeInput: "",
        motorType: "",
        gearRatio: 0,
        hasBuddyClimb: false,
        pickups: [],
        canShoot: [],
        speakerShootingPositions: [],
        notes: ""
    },
    auto: {
        noAuto: false,
        otfPathPlanning: false,
        hasCenterDisrupt: false,
        autos: []
    },
    teleop: {
        canClimb: false,
        canHarmonize: false
    }
}
</script>

<template>
  <div v-if="teamsLeft.length == 0 && teamsAdded" class="vueContainer">
    <doubleCheckButton
      text="SWITCH"
      :fnc="router.push"
      :args="['/forms/match']"/>

    <h1 class="sectionTitle">There are no more teams to pit scout!</h1>
  </div>

  <div v-else-if="!formSubmitted" class="vueContainer">
    <doubleCheckButton
      text="SWITCH"
      :fnc="router.push"
      :args="['/forms/match']"/>
      
    <h1 class="sectionTitle">Pit Form</h1>

    <div id="general">
        <v-divider class="formSectionDivider" :thickness="10"></v-divider>
        <h1 class="sectionTitle">General</h1>
        <v-divider class="formSectionDivider" :thickness="10"></v-divider>

        <v-select
            class="select"
            v-model="team"
            label="Team"
            :items="teamsLeft"></v-select>
        
        <h1 class="errorText">{{ genInfoErrorText }}</h1>

        <v-text-field
            v-model="programmingLanguage"
            label="Programming Language"
            variant="outlined"
            class="formInput pitInput mt-5"
            style="width: min(40vw, 300px);">
        </v-text-field>

        <h1 class="errorText"> {{ programmingLanguageErrorText }} </h1>

        <h2 class="subtitle">DIMENSIONS (NO BUMPERS)</h2>

        <v-text-field
            v-model="length"
            label="L"
            variant="outlined"
            class="formInput dimensionInput inline-block">
        </v-text-field>

        <v-text-field
            v-model="width"
            label="W"
            variant="outlined"
            class="formInput dimensionInput inline-block">
        </v-text-field>

        <h1 class="errorText"> {{ dimensionsErrorText }} </h1>
            
        <toggleButton 
            v-model="fitUnderStage"
            @click="fitUnderStage = !fitUnderStage"
            text="Fit Under Stage"/>

        <v-select 
            v-model="dbType"
            class="select"
            label="Drivebase Type" 
            style="width: min(40vw, 600px);"
            :items="['Swerve', 'Tank', 'Mechanum', 'Other']">
        </v-select>
        
        <v-text-field
            v-model="dbTypeInput"
            v-if="dbType == 'Other'"
            label="Elaborate"
            variant="outlined"
            class="formInput pitInput mt-5"
            style="width: min(60vw, 800px);">
        </v-text-field>

        <h1 class="errorText"> {{ dbTypeErrorText }} </h1>

        <h2 class="subtitle">DRIVEBASE MOTORS</h2>
        <v-text-field
            v-model="motorType"
            label="Type"
            variant="outlined"
            hint="Only for Drivebase"
            class="formInput motorInput inline-block">
        </v-text-field>

        <v-text-field
            v-model="gearRatio"
            label="Gear Ratio"
            variant="outlined"
            hint="Only for Drivebase"
            class="formInput motorInput inline-block">
        </v-text-field>
        
        <h1 class="errorText"> {{ motorInputsErrorText }} </h1>

        <toggleButton 
            v-model="hasBuddyClimb"
            @click="hasBuddyClimb = !hasBuddyClimb"
            text="Has Buddy Climb"/>

        <h2 class="subtitle">PICKUPS</h2>
        <v-btn-toggle class="pitButtonGroup" v-model="pickups" multiple>
            <v-btn class="pitGroupedButton">Under Bumper</v-btn>
            <v-btn class="pitGroupedButton">Over Bumper</v-btn>
            <v-btn class="pitGroupedButton">Source</v-btn>
        </v-btn-toggle>
        <h1 class="errorText"> {{ pickupsErrorText }} </h1>

        <h2 class="subtitle">CAN SHOOT</h2>
        <v-btn-toggle class="pitButtonGroup" v-model="canShoot" multiple>
            <v-btn class="pitGroupedButton">Amp</v-btn>
            <v-btn class="pitGroupedButton">Speaker</v-btn>
            <v-btn class="pitGroupedButton">Trap</v-btn>
        </v-btn-toggle>
        <h1 class="errorText"> {{ canShootErrorText }} </h1>

        <h2 class="subtitle">SHOOTING POSITIONS</h2>
        <v-btn-toggle class="pitButtonGroup" v-model="shootingPos" multiple>
            <v-btn class="pitGroupedButton">Subwoofer</v-btn>
            <v-btn class="pitGroupedButton">Podium</v-btn>
            <v-btn class="pitGroupedButton">Under Stage</v-btn>
        </v-btn-toggle>
        <h1 class="errorText"> {{ shootingPosErrorText }} </h1>

        <h2 class="subtitle">VERTICAL ROBO PIC</h2>
        <v-file-input v-model="roboPic" class="picInput mt-10" label="Robot Picture"></v-file-input>

        <h1 class="errorText"> {{ roboPicErrorText }} </h1>
    </div>

    <div id="auto">
        <v-divider class="formSectionDivider" :thickness="10"></v-divider>
        <h1 class="sectionTitle">Auto</h1>
        <v-divider class="formSectionDivider mb-8" :thickness="10"></v-divider>

        <toggleButton 
            v-model="noAuto"
            @click="noAuto = !noAuto"
            text="No Auto"/>

        <div v-show="!noAuto">
            <toggleButton 
                v-model="otfPathPlanning"
                @click="otfPathPlanning = !otfPathPlanning"
                text="OTF Path Planning"/>
                
            <toggleButton 
                v-model="hasCenterDisrupt"
                @click="hasCenterDisrupt = !hasCenterDisrupt"
                text="Has Center Disrupt"/>
 
            <h1 @click="removeAuto()" class="autoSymbol mr-4">-</h1>
            <v-select 
                @update:modelValue="updateForm()"
                v-model="curAuto"
                id="autoSelect"
                class="select inline-block"
                label="Autos" 
                style="width: min(40vw, 600px);"
                :items="autos">
            </v-select>
            <h1 @click="addAuto()" class="autoSymbol ml-4">+</h1>
            
            <h1 class="errorText"> {{ generalAutoErrorText }} </h1>

            <v-divider class="formSectionDivider mb-8" :thickness="1"></v-divider>

            <div @click="updateProfile()">
                <h2 class="subtitle">Preload</h2>
                <v-btn-toggle class="pitButtonGroup" v-model="preload">
                    <v-btn class="pitGroupedButton">Nothing...</v-btn>
                    <v-btn class="pitGroupedButton">Dump</v-btn>
                    <v-btn class="pitGroupedButton">Shoot</v-btn>
                </v-btn-toggle>

                <br>
                
                <toggleButton 
                    id="exitButton"
                    v-model="exit"
                    @click="exit = !exit"
                    text="Exit"
                    class="mt-5"/>

                <h2 class="subtitle">Notes</h2>
                <v-text-field
                    v-model="nearNotes"
                    label="Near"
                    variant="outlined"
                    class="formInput inline-block autoProfileInput">
                </v-text-field>
                <v-text-field
                    v-model="centerNotes"
                    label="Center"
                    variant="outlined"
                    class="formInput inline-block ml-5 autoProfileInput">
                </v-text-field>
                
                <h1 class="errorText"> {{ autosErrorTexts[curAutoErrorText].value }} </h1>
            </div>
        </div>
    </div>

    <div id="teleop">
        <v-divider class="formSectionDivider" :thickness="10"></v-divider>
        <h1 class="sectionTitle">Teleop</h1>
        <v-divider class="formSectionDivider mb-8" :thickness="10"></v-divider>

        <toggleButton 
            v-model="canClimb"
            @click="canClimb = !canClimb"
            text="Can Climb"/>

        <toggleButton 
            v-model="canHarmonize"
            @click="canHarmonize = !canHarmonize"
            text="Can Harmonize"/>

        <v-text-field
            v-model="notes"
            label="Notes"
            variant="outlined"
            class="notes">
        </v-text-field>
    </div>

    <doubleCheckButton text="SUBMIT" :fnc="verifyForm" :args="[]" />
  </div>

  <div v-else class="vueContainer">
    <h1 class="sectionTitle">Thank you for submitting a form!</h1>

    <v-btn @click="refreshPage()" id="anotherButton">Submit Another</v-btn>
  </div>
</template>

<style>
#anotherButton {
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

#formSwitchButton {
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

#autoTitle {
  font-size: min(7vw, 50px);
  margin-left: auto;
  color: white;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}

.autoSymbol {
  font-size: min(12vw, 50px);
  display: inline-block;
  color:#7a7373;
}

.picInput {
    width: 60%;
    margin: auto;
    color: white;
}

.select {
    width: 60%;
    margin: auto;
    color: white;
    max-width: 300px;
    margin-top: min(2vw, 20px);
}

.dimensionInput{
    width: 50px;
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 10px;
}

.motorInput {
    width: max(30vw, 80px);
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 10px;
}

.pitInput {
    width: min(20vw, 450px);
    margin: auto;
}

.pitButtonGroup {
    min-height: 50px;
    height: 12vw;
    max-height: 100px;
}

.v-input__details {
    display: none;
}

.pitGroupedButton {
    display: inline-block; 
    background-color: #353535;
    color: white;
    min-height: 50px;
    height: 12vw;
    max-height: 100px;
    font-size: min(2.5vw, 20px);
    width: 25vw;
    max-width: 220px;
    display: block;
    margin: auto;
    margin-left: 4vw;
    margin-top: 0;
}

.autoProfileInput {
    max-width: 250px;
    width: 40vw;
}
</style>

