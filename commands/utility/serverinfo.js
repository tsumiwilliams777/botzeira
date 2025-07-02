// commands/utility/serverinfo.js
const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js'); // Importa a configuração para usar a cor padrão

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Mostra informações sobre o servidor atual.'),

  async execute(interaction) {
    const { guild } = interaction;
    const owner = await guild.fetchOwner();

    const embed = {
      color: config.defaultEmbedColor,
      title: `Informações do Servidor: ${guild.name}`,
      thumbnail: { url: guild.iconURL({ dynamic: true, size: 1024 }) },
      fields: [
        { name: 'Nome do Servidor', value: guild.name, inline: true },
        { name: 'ID do Servidor', value: guild.id, inline: true },
        { name: 'Dono', value: owner.user.tag, inline: true },
        { name: 'Membros', value: guild.memberCount.toString(), inline: true },
        { name: 'Canais', value: guild.channels.cache.size.toString(), inline: true },
        { name: 'Cargos (Roles)', value: guild.roles.cache.size.toString(), inline: true },
        { name: 'Data de Criação', value: `<t:${parseInt(guild.createdAt / 1000)}:F>`, inline: false }, // Formato de data do Discord
        { name: 'Nível de Boost', value: `Nível ${guild.premiumTier || 0}`, inline: true },
        { name: 'Boosts', value: (guild.premiumSubscriptionCount || 0).toString(), inline: true },
      ],
      timestamp: new Date(),
      footer: { text: `Solicitado por ${interaction.user.username}` },
    };

    await interaction.reply({ embeds: [embed] });
  },
};