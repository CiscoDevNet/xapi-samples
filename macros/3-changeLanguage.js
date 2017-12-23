const xapi = require('xapi');


function onGui(event) {

  console.log("new event");
  
   if ((event.Type == 'clicked') && (event.WidgetId == 'toFrench')) {
      xapi.config.set('UserInterface Language', 'French');
   }
   
   if ((event.Type == 'clicked') && (event.WidgetId == 'toEnglish')) {
      xapi.config.set('UserInterface Language', 'English');
   }
}


xapi.event.on('UserInterface Extensions Widget Action', onGui);
  