// commands/utility/say.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Faz o bot dizer algo no canal.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('A mensagem que o bot deve dizer.')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages) // Apenas membros com permissão de gerenciar mensagens podem usar
    .setDMPermission(false), // Não pode ser usado em DMs

  async execute(interaction) {
    const message = interaction.options.getString('message');
    
    // Envia a mensagem no canal
    await interaction.channel.send(message);

    // Responde ao usuário de forma efêmera para confirmar que a ação foi concluída
    await interaction.reply({ content: 'Mensagem enviada!', flags: 64 });
  },
};