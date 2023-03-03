/**
 * It's a open source software.
 * It's under MIT License as published.
 * You can modify and/or redistribute the code.
 * 
 * <ZhenniOpenAI_Bot>
 * Copyright (C) 2023 Jenxieny Alviana Christin Olivia
 * Github: https://github.com/jnxnyanna
 * Telegram: https://t.me/jnxnyanna
 * Telegram: https://t.me/ZhenniOpenAI_Bot
 */

// Base API URL for OpenAI.
// Change the admin id with your telegramid.
// You can get it from @userinfobot.
// You can add more than 1 id.
// Example: ["1234567890", "5577901126"];
const BASE_URL = "https://api.openai.com/v1/completions";
const ADMIN_LIST = ["1234567890"]; // Change this with your telegram id

// Defined the property in  Settings > Script Properties.
// Add properties with name "bot_token" & "api_key_openai".
// Get your "bot_token" from t.me/BotFather.
// Get your "api_key_openai" from https://beta.openai.com/account/api-keys.
// https://developers.google.com/apps-script/reference/properties?hl=en
const properties = PropertiesService.getScriptProperties();
const BOT_TOKEN = properties.getProperty("bot_token");
const OPENAI_API_KEY = properties.getProperty("api_key_openai");

// Replace <YOUR_APP_URL> with the URL of your deployed app.
// Go to Apply > New deployments > Choose a type > Web application
// Enter with this detail
// Version: New version
// Description: Your description (optional)
// Under the web application
// Run as: Me (yourname@gmail.com)
// Who has access: Anyone
const APP_URL = "<YOUR_APP_URL>";

// Init the project.
// Define variable bot with lumpia.
// Define variable client with bot.telegram or bot.tg.
const bot = new lumpia.init(BOT_TOKEN);
const client = bot.telegram;

function doPost(e) {
  // Only POST data will be processed.
  // Bot will be processing this POST data.
  bot.doPost(e);
}

function setWebhook() {
  // Set webhook for the bot.
  // If the bot receive for new updates, the data will be processed at doPost() function.
  let result = client.setWebhook(APP_URL);
  console.log(result);
}

function requestToOpenAi(text) {
  try {
    var options = {
      "method": "POST",
      "headers": {
        "Authorization": "Bearer " + OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      "payload": JSON.stringify({
        model: "text-davinci-003",
        prompt: text,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    }

    // Send the request to OpenAI and print the result on log.
    // Initialize the response text.
    var result = JSON.parse(UrlFetchApp.fetch(BASE_URL, options).getContentText());

    return result.choices[0].text;
  } catch (e) {
    // Catching error.
    // Print error to the console.
    console.log(e);
  }
}

function replyMsg(chatId, text, msgId, options) {
  // Send answer from OpenAI to user.
  return client.sendMessage(chatId, text, { reply_to_message_id: msgId, ...options });
}

function sendErrorToAdmin(error = Object) {
  for (var i in ADMIN_LIST) {
    client.sendMessage(ADMIN_LIST[i], "New error: " + error.message);
  }
}

// Let the bot to hear all messages.
bot.on("message", async (ctx) => {
  const text = ctx.message.text; // It's a text.

  // Only text allowed.
  // Check if user send another message types, like photo, document or etc.
  // Delete the message if the message types is not a text.
  if (!text) return ctx.deleteMessage();

  // Start command.
  // This command will be executed first.
  // Don't ask this text to OpenAI, so I put return on the end of block.
  if (text == "/start") return ctx.replyIt("Hello! I'm AI Bot. You can ask me anything.");

  try {
    // Ask to OpenAI.
    // Reply the result to user
    // Let the bot to send action with typing.
    // Use ctx.replyWithChatAction("typing");
    ctx.replyWithChatAction("typing");

    var resultText = await requestToOpenAi(text);
    replyMsg(ctx.chat.id, resultText, ctx.message.message_id);
  } catch (e) {
    sendErrorToAdmin(e);
    ctx.replyIt("Sorry, but I can't process your request right now. ;'(");
  }
});




