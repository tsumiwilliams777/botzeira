const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');

// por algum motivo o Gif não aparece. requer debug
module.exports = {
  data: new SlashCommandBuilder()
    .setName('hug')
    .setDescription('Dê um abraço em alguém.')
    .addUserOption(option =>
      option.setName('usuário')
        .setDescription('A pessoa que você quer abraçar.')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('usuário');

    const embed = {
      color: config.defaultEmbedColor,
      description: `**${interaction.user.username}** deu um grande abraço em **${user.username}**! Que fofo! 🫂`,
      image: {
        url: 'https://i.gifer.com/origin/e0/e07243d055b0f9385167a54341ad6abd_w200.gif'
      },
      timestamp: new Date(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};