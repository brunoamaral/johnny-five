var config = require('./config');
var fs = require('fs');
var command = require('./commands');

const TelegramBot = require('node-telegram-bot-api');

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

bot.onText(/is\ the user \ home?|where\ is\ the\ user?|bruno?/i, (msg, match) => {
  const chatId = msg.chat.id;
  var resp;

    if (fs.existsSync(config.are_you_home_file)) {
      resp = 'The user is home.'; 
    }else{
      resp = 'The user is away.'; 
    }
  bot.sendMessage(chatId, resp);

});

bot.onText(/lights (.+)/i, function onEchoText(msg, match) {
  var resp;
  if (msg.from.username === config.telegramUser){
    resp = 'Turning the lights ' + match[1] + '!';
    command.lights(match[1])
    }else{
      resp = "I am sorry, I can't let you do that " + msg.from.first_name; 
    }
  bot.sendMessage(msg.chat.id, resp);
});

bot.onText(/tv (.+)/i, function onEchoText(msg, match) {
  var resp;
  if (msg.from.username === config.telegramUser){
  resp = 'Turning the TV ' + match[1] + '!';
  command.tv(match[1])
  }else{
    resp = "I am sorry, I can't let you do that " + msg.from.first_name; 
  }
  bot.sendMessage(msg.chat.id, resp);
});

bot.onText(/kodi (.+)/i, function onEchoText(msg, match) {
  var resp;
  if (msg.from.username === config.telegramUser){
    const resp = 'Turning kodi ' + match[1] + '!';
    command.kodi(match[1])
  }else{
    resp = "I am sorry, I can't let you do that " + msg.from.first_name; 
  }
  bot.sendMessage(msg.chat.id, resp);
});

bot.onText(/when was bruno home?/i, function onEchoText(msg, match){
  var resp = command.lastSeen();
  bot.sendMessage(msg.chat.id, resp);
});

module.exports = bot;