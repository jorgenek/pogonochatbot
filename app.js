var restify = require('restify');
var builder = require('botbuilder');
var dotenv = require('dotenv');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


dotenv.load();

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);

//var model = process.env.model || 'https://api.projectoxford.ai/luis/v2.0/apps/' + process.env.LUIS_APP_ID + '?subscription-key=' + process.env.LUIS_KEY;
//bot.recognizer(new builder.LuisRecognizer(model));

server.post('/api/messages', connector.listen());

var intents = new builder.IntentDialog();
bot.dialog('/', intents);

//=========================================================
// Bots Dialogs
//=========================================================

function getGyms() {
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "https://oslo.pogonorge.com/stopit?pokemon=false&pokestops=false&gyms=true&swLat=59.910890744391594&swLng=10.46924512326359&neLat=59.97915351474353&neLng=10.949553655978434", false);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send();
  var response = xhttp.responseText;
  if(response) {
    try {
        parsedResponse = JSON.parse(response);
    } catch(e) {
        console.log(e); // error in the above string (in this case, yes)!
    }
  }
  return parsedResponse ? parsedResponse.gyms : null;
}

intents.onDefault([
  function (session) {
    session.beginDialog('/gym');
  }
]);

bot.dialog('/gym', [
  function (session) {
      builder.Prompts.text(session, 'Hvilken gym ønsker du info om?');
  },
    function (session, results) {
        found = false;
        gyms = getGyms();

        for (gym in gyms) {
          if (gyms[gym].name) {
            if (gyms[gym].name.toLowerCase() === results.response.toLowerCase()) {
              found = true;
              session.send(gyms[gym].name + ' har score: ' + gyms[gym].gym_points);
            }
          }
        }
        if (!found) {
          session.send('Kunne dessverre ikke finne gym med det navnet. Prøv på nytt.');
        }
        session.beginDialog('/gym');
    }
]);
