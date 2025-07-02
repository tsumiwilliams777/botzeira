const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Mostra informações sobre um usuário.')
    .addUserOption(option => option.setName('user').setDescription('O usuário sobre o qual obter informações.')),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    const embed = {
      color: config.defaultEmbedColor,
      title: 'Informações do Usuário',
      thumbnail: { url: user.displayAvatarURL({ dynamic: true }) },
      fields: [
        { name: 'Usuário', value: user.username, inline: true },
        { name: 'ID', value: user.id, inline: true },
        { name: 'Entrou no Discord em', value: user.createdAt.toDateString(), inline: true },
        { name: 'Entrou no Servidor em', value: member ? member.joinedAt.toDateString() : 'N/A', inline: true },
        { name: 'É um bot?', value: user.bot ? 'Sim' : 'Não', inline: true },
      ],
      timestamp: new Date(),
    };
    await interaction.reply({ embeds: [embed] });
  },
};