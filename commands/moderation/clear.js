const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Esse aqui é pra fazer a limpa no chat.
// Use com sabedoria, senão já viu né...
module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Apaga uma quantidade de mensagens no chat.')
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('O número de mensagens pra apagar (de 1 a 100)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const amount = interaction.options.getInteger('quantidade');
    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: 'Você precisa escolher um número entre 1 e 100.', flags: 64 });
    }
    await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({ content: `Pronto! ${amount} mensagens foram pro limbo.`, flags: 64 });
  },
};