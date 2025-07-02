const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const userAgentsPath = path.join(__dirname, '..', 'user_agents.json');

function readUserAgents() {
    try {
        const data = fs.readFileSync(userAgentsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {};
        }
        console.error('Error reading user_agents.json:', error);
        return {};
    }
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    console.log(`Received interaction: ${interaction.commandName}`);
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    const agentDependentCommands = []; // Add commands that require an agent here

    if (agentDependentCommands.includes(interaction.commandName)) {
        const userAgents = readUserAgents();
        const userId = interaction.user.id;

        if (!userAgents[userId] || !userAgents[userId].prompt) {
            await interaction.reply({ content: 'You need to set up a custom agent before using this command. Use `/agent prompt` to create one!', ephemeral: true });
            return;
        }
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', flags: 64 });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', flags: 64 });
      }
    }
  },
};