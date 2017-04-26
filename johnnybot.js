var config = require('./config');
var fs = require('fs');
var command = require('./commands');
var database = require('./database.json');
var sqlite3 = require('sqlite3').verbose();

const TelegramBot = require('node-telegram-bot-api');

var Client = require('node-rest-client').Client;
 
var client = new Client();

// replace the value below with the Telegram token you receive from @BotFather
var token = config.token;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message');
// });

bot.onText(/olá/i, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = 'hello, my name is Number 5. Please to meet you '+ msg.from.first_name;

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

bot.onText(/is\ the user \ home?|where\ is\ the\ admin?|bruno?/i, (msg, match) => {
  const chatId = msg.chat.id;
  var resp;

    if (fs.existsSync(config.are_you_home_file)) {
      resp = 'Admin is home.'; 
    }else{
      resp = 'Admin is away.'; 
    }

    var db = new sqlite3.Database(database.prod.filename);

    var activity = { user: '' , action: '' , location: '' , datetime: '' }
    db.serialize(function() {

        db.all("SELECT * FROM activity ORDER BY id DESC LIMIT 1", function(err, rows) {

            if(err != null){
                console.log(err);
                callback(err);
            }
            
            activity = { 
              user: rows[0].user,
              action: rows[0].action,
              location: rows[0].location,
              datetime: rows[0].datetime
             };

             var saw_user = 'I last saw '+ activity.user + ' '+ activity.action+' at '+activity.location+'. It was '+ activity.datetime;
            bot.sendMessage(chatId, saw_user);

            
        });
        db.close();
      });

    bot.sendMessage(chatId, resp);

});

bot.onText(/home/i, function onEchoText(msg, match) {

  var db = new sqlite3.Database(database.prod.filename);
  var is_empty = null;
  db.serialize( function(){
     db.all('select is_empty from house;', function(err,rows){
      
      if ( rows[0].is_empty === 1 ){
        var resp = 'There is no one home ';
        bot.sendMessage(msg.chat.id, resp);   
      }else{
        var resp = 'There is someone home';
        bot.sendMessage(msg.chat.id, resp);
      }
    
     } );

  });
  db.close(); 

});

bot.onText(/^lights (on|off)$/i, function onEchoText(msg, match) {
  var resp;
  if (msg.from.username === config.telegramUser){
    resp = 'Turning the lights ' + match[1] + '!';
    command.lights(match[1])
    }else{
      resp = "I am sorry, I can't let you do that " + msg.from.first_name; 
    }
  bot.sendMessage(msg.chat.id, resp);
});

bot.onText(/tv (on|off)/i, function onEchoText(msg, match) {
  var resp;
  if (msg.from.username === config.telegramUser){
  resp = 'Turning the TV ' + match[1] + '!';
  command.tv(match[1])
  }else{
    resp = "I am sorry, I can't let you do that " + msg.from.first_name; 
  }
  bot.sendMessage(msg.chat.id, resp);
});

bot.onText(/kodi (on|off)/i, function onEchoText(msg, match) {
  var resp;
  if (msg.from.username === config.telegramUser){
    const resp = 'Turning kodi ' + match[1] + '!';
    command.kodi(match[1])
  }else{
    resp = "I am sorry, I can't let you do that " + msg.from.first_name; 
  }
  bot.sendMessage(msg.chat.id, resp);
});

bot.onText(/did you see ?/i, function onEchoText(msg, match){
  var resp = 'I last saw him at this time: ' + command.lastSeen();
  bot.sendMessage(msg.chat.id, resp);
});

bot.onText(/alert/i, function onEchoText(msg, match){
  var is_home = command.isHome();
  var resp;
  if (is_home === true ){
   	command.alert(); 
    resp = 'Sent an alert!!'
  }else{
    resp = 'The user isn\'t home';
  }
  bot.sendMessage(msg.chat.id, resp);
});

bot.onText(/lights status/i, function onEchoText(msg, match){
  var url = config.philipsbridge + 'api/' + config.philipsbridge_user + '/lights';
  client.get(url, function (data, response) {
      // parsed response body as js object 
      if (data[1].state.on === true ){
        var resp = 'The light is on'
      }else{
        var resp = 'The light is off'
      }
      bot.sendMessage(msg.chat.id, resp);

      // raw response 
//      console.log(response);
  });

});

module.exports = bot;
