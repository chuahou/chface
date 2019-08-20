import clock from "clock";
import document from "document";
import { HeartRateSensor } from "heart-rate";
import { today } from "user-activity";
import { me as appbit } from "appbit";
import { battery } from "power";
import { preferences } from "user-settings";
import * as util from "../common/utils";

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

// get elements to update
const timeLabel = document.getElementById("timeLabel");
const hrLabel = document.getElementById("hrLabel");
const stepsLabel = document.getElementById("stepsLabel");
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

// get and setup heart rate sensor
if (HeartRateSensor)
{
    const hrm = new HeartRateSensor();
    hrm.addEventListener("reading", () =>
    {
        hrLabel.text = `${hrm.heartRate}`;
        hrFill.width = (hrm.heartRate / maxHr) * initWidth;
    });
    hrm.start();
}

// update every tick
clock.ontick = (event) =>
{    
    // update time label
    updateTime(timeLabel, event);
    
    // set HR to -- if no heart rate sensor
    if (!HeartRateSensor)
    {
        hrLabel.text = "--";
        hrFill.width = 0;
    }
    
    // update steps
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
    
    // update battery
    batteryLabel.text = Math.floor(battery.chargeLevel) + "%";
    let batteryWidth = initWidth * battery.chargeLevel / 100.0;
    batteryFill1.width = (battery.chargeLevel < batteryThreshold) ? 0 : batteryWidth;
    batteryFill2.width = batteryWidth;
}

// update time label and fill
function updateTime(label, event)
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
    label.text = `${hours}:${mins}:${secs}`;
    
    // get midnight
    let midnight = new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate(), 0, 0, 0);
    
    // get time since midnight
    let diff = event.date.getTime() - midnight.getTime();
    
    // update fill
    timeFill.width = initWidth * diff / msPerDay;
}
