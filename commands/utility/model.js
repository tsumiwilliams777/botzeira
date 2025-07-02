const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', '..', 'config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('model')
    .setDescription('Changes the AI model.')
    .addStringOption(option =>
      option.setName('model_name')
        .setDescription('The name of the model to use.')
        .setRequired(true)),

  async execute(interaction) {
    const modelName = interaction.options.getString('model_name');

    try {
      let config = {};
      if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(data);
      }

      config.model = modelName;

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      await interaction.reply(`Model updated to: ${modelName}`);
    } catch (error) {
      console.error('Error updating model:', error);
      await interaction.reply({ content: 'There was an error while updating the model.', ephemeral: true });
    }
  },
};
