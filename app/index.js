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

// get elements to update
const timeLabel = document.getElementById("timeLabel");
const hrLabel = document.getElementById("hrLabel");
const stepsLabel = document.getElementById("stepsLabel");
const batteryLabel = document.getElementById("batteryLabel");

// get and setup heart rate sensor
if (HeartRateSensor)
{
  const hrm = new HeartRateSensor();
  hrm.addEventListener("reading", () =>
  {
    hrLabel.text = `${hrm.heartRate}`;
  });
  hrm.start();
}

// update time every tick
clock.ontick = (event) =>
{  
  // update time label
  updateTime(timeLabel, event);
  
  // set HR to -- if no heart rate sensor
  if (!HeartRateSensor)
  {
    hrLabel.text = "--";
  }
  
  // update steps
  if (appbit.permissions.granted("access_activity"))
  {
    stepsLabel.text = `${today.adjusted.steps}`;
  }
  
  // update battery
  batteryLabel.text = Math.floor(battery.chargeLevel) + "%";
}

// update time label
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
}