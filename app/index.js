// --- IMPORTS ---

import clock from "clock";
import document from "document";
import { HeartRateSensor } from "heart-rate";
import { today } from "user-activity";
import { me as appbit } from "appbit";
import { battery } from "power";
import { preferences } from "user-settings";
import * as util from "../common/utils";



// --- CONSTANTS ---

// tick every second
clock.granularity = "seconds";

// ms in a day
const msPerDay = 86400000.0;

// max HR
const maxHr = 220.0;

// step boundaries
const stepBoundary1 = 10000.0;
const stepBoundary2 = 15000.0;
const stepBoundary3 = 20000.0;

// battery threshold to turn red
const batteryThreshold = 40.0;



// --- GUI elements ---

// get elements to update
const timeLabel = document.getElementById("timeLabel");
const hrLabel = document.getElementById("hrLabel");
const stepsLabel = document.getElementById("stepsLabel");
const prevStepsLabel = document.getElementById("prevStepsLabel");
const dateLabel = document.getElementById("dateLabel");
const batteryLabel = document.getElementById("batteryLabel");
const timeFill = document.getElementById("timeFill");
const hrFill = document.getElementById("hrFill");
const stepsFill1 = document.getElementById("stepsFill1");
const stepsFill2 = document.getElementById("stepsFill2");
const stepsFill3 = document.getElementById("stepsFill3");
const batteryFill1 = document.getElementById("batteryFill1");
const batteryFill2 = document.getElementById("batteryFill2");

// get initial widths
const initWidth = timeFill.width;



// --- MAIN ROUTINE ---

// get and setup heart rate sensor
if (HeartRateSensor)
{
    const hrm = new HeartRateSensor();
    hrm.addEventListener("reading", () =>
    {
        // update label and fill every reading
        hrLabel.text = `${hrm.heartRate}`;
        hrFill.width = (hrm.heartRate / maxHr) * initWidth;
    });
    hrm.start();
}
// set HR to -- if no heart rate sensor
else
{
    hrLabel.text = "--";
    hrFill.width = 0;
}

// set initial date
setDate(new Date());

// update every tick
clock.ontick = (event) =>
{    
    // update time label
    updateTime(event);
    
    // update steps
    updateSteps();
    
    // update battery
    updateBattery();
};



// --- HELPER FUNCTIONS ---

// update time label and fill
var prevMidnight = null;
function updateTime(event)
{
    // get hours, minutes and seconds
    let hours = event.date.getHours();
    let mins = event.date.getMinutes();
    let secs = event.date.getSeconds();
    
    // convert to 12h clock if necessary
    if (preferences.clockDisplay === "12h")
    {
        hours = hours % 12;
        hours = (hours == 0) ? 12 : hours; // convert 0 to 12
    }
    
    // zero pad every number
    hours = util.zeroPad(hours);
    mins = util.zeroPad(mins);
    secs = util.zeroPad(secs);
    
    // set text
    timeLabel.text = `${hours}:${mins}:${secs}`;
    
    // get midnight
    let midnight = new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate(), 0, 0, 0);

    // check if date has changed
    if (prevMidnight == null)
    {
        prevMidnight = midnight;
    }
    else if (midnight.getDate() != prevMidnight.getDate())
    {
        prevStepsLabel.text = "PREV: ( " + stepsLabel.text + " )";
        setDate(event.date);
        prevMidnight = midnight;
    }
    
    // get time since midnight
    let diff = event.date.getTime() - midnight.getTime();
    
    // update fill
    timeFill.width = initWidth * diff / msPerDay;
}

// set date label
function setDate(date)
{
    var week = new Array(7);
    week[0] = "SUN";
    week[1] = "MON";
    week[2] = "TUE";
    week[3] = "WED";
    week[4] = "THU";
    week[5] = "FRI";
    week[6] = "SAT";

    dateLabel.text = (date.getMonth() + 1) + "/" + date.getDate() + " [" +
        week[date.getDay()] +"]";
}

// update steps label and fill
function updateSteps()
{
    if (appbit.permissions.granted("access_activity"))
    {
        stepsLabel.text = `${today.adjusted.steps}`;
        let steps = today.adjusted.steps;
        if (steps < stepBoundary1)
        {
            stepsFill1.width = (steps / stepBoundary1) * initWidth;
            stepsFill2.width = 0;
            stepsFill3.width = 0;
        }
        else if (steps < stepBoundary2)
        {
            stepsFill1.width = initWidth;
            stepsFill2.width = ((steps - stepBoundary1) / (stepBoundary2 - stepBoundary1)) * initWidth;
            stepsFill3.width = 0;
        }
        else
        {
            stepsFill1.width = initWidth;
            stepsFill2.width = initWidth;
            stepsFill3.width = ((steps - stepBoundary2) / (stepBoundary3 - stepBoundary2)) * initWidth;
            stepsFill3.width = (stepsFill3.width > initWidth) ? initWidth : stepsFill3.width;
        }
    }
}

// update battery label and fill
function updateBattery()
{
    batteryLabel.text = Math.floor(battery.chargeLevel) + "%";
    let batteryWidth = initWidth * battery.chargeLevel / 100.0;
    batteryFill1.width = (battery.chargeLevel < batteryThreshold) ? 0 : batteryWidth;
    batteryFill2.width = batteryWidth;
}
