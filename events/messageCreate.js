const { Events } = require('discord.js');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const config = require('../config.js');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const userAgentsPath = path.join(__dirname, '..', 'user_agents.json');

const configPath = path.join(__dirname, '..', 'config.json');

function readUserAgents() {
    try {
        const data = fs.readFileSync(userAgentsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {};
        }
        throw error;
    }
}

function readModel() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(data);
      return config.model || 'gemini-1.5-flash-latest';
    }
    return 'gemini-1.5-flash-latest';
  } catch (error) {
    console.error('Error reading model from config.json:', error);
    return 'gemini-1.5-flash-latest';
  }
}

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.mentions.has(message.client.user)) return;

    const userMessage = message.content.replace(/<@!?\d+>/, '').trim();
    const userAgents = readUserAgents();
    const userAgent = userAgents[message.author.id];

    const channelHistory = await message.channel.messages.fetch({ limit: 10, before: message.id });
    console.log('Fetched channel history:', channelHistory.map(msg => ({ author: msg.author.tag, content: msg.content })));
    let userHistory = [];

    channelHistory.reverse().forEach(msg => {
      if (msg.author.id === message.author.id || msg.author.bot) {
        const role = msg.author.bot ? 'model' : 'user';
        const text = msg.content.replace(/<@!?\d+>/, '').trim();
        if (text) {
          userHistory.push({ role, parts: [{ text }] });
        }
      }
    });

    if (userMessage) {
        userHistory.push({ role: 'user', parts: [{ text: userMessage }] });
    }

    // Clean up history to ensure it alternates and starts with a user message.
    const mergedHistory = [];
    if (userHistory.length > 0) {
        // Merge consecutive messages
        let currentRole = userHistory[0].role;
        let currentParts = [userHistory[0].parts[0].text];

        for (let i = 1; i < userHistory.length; i++) {
            if (userHistory[i].role === currentRole) {
                currentParts.push(userHistory[i].parts[0].text);
            } else {
                mergedHistory.push({ role: currentRole, parts: [{ text: currentParts.join('\n') }] });
                currentRole = userHistory[i].role;
                currentParts = [userHistory[i].parts[0].text];
            }
        }
        mergedHistory.push({ role: currentRole, parts: [{ text: currentParts.join('\n') }] });
    }

    // Ensure history starts with a user message
    while (mergedHistory.length > 0 && mergedHistory[0].role !== 'user') {
        mergedHistory.shift();
    }

    const cleanedHistory = mergedHistory;

    console.log('Populated user history:', cleanedHistory);

    

    await message.channel.sendTyping();

    try {
      const systemInstruction = userAgent?.prompt || "responda com uma linha, poucas palavras. você é um usuario de discord, idiota e de baixo intelecto";
      const modelName = readModel();
      const model = genAI.getGenerativeModel({
        model: modelName,
        safetySettings,
        systemInstruction,
      });

      console.log('History sent to Gemini:', cleanedHistory);
      const result = await model.generateContent({
        contents: cleanedHistory,
        generationConfig: { maxOutputTokens: 500 },
      });
      const response = await result.response;
      const text = response.text();

      if (!text) {
        await message.reply('I am a silly goose and the API returned nothing.');
        return;
      }

      if (userAgent?.name && userAgent?.avatar) {
        const webhook = await message.channel.createWebhook({
            name: userAgent.name,
            avatar: userAgent.avatar,
        });
        await webhook.send(text);
        await webhook.delete();
      } else {
        await message.reply(text);
      }
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      await message.reply('Desculpe, encontrei um erro ao tentar obter uma resposta.');
    }
  },
};