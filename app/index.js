import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";

// tick every second
clock.granularity = "seconds";

// get elements to update
const timeLabel = document.getElementById("timeLabel");

// update elements every tick
clock.ontick = (event) =>
{
  updateTimeLabel(timeLabel, event);
}

// update time label
function updateTimeLabel(_timeLabel, _event)
{
  // get hours, minutes and seconds
  let today = _event.date;
  let hours = today.getHours();
  let mins = today.getMinutes();
  let secs = today.getSeconds();
  
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
  _timeLabel.text = `${hours}:${mins}:${secs}`;
}
