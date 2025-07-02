const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Veja a compatibilidade entre duas pessoas.')
    .addUserOption(option => option.setName('usuário1').setDescription('A primeira pessoa.').setRequired(true))
    .addUserOption(option => option.setName('usuário2').setDescription('A segunda pessoa.').setRequired(false)),

  async execute(interaction) {
    const user1 = interaction.options.getUser('usuário1');
    const user2 = interaction.options.getUser('usuário2') || interaction.user;

    // Evitar que o usuário se shippe consigo mesmo se não for a intenção
    if (user1.id === user2.id) {
        return interaction.reply({ content: 'Você não pode se shippar consigo mesmo! Escolha outro usuário.', ephemeral: true });
    }

    const shipName = user1.username.slice(0, Math.ceil(user1.username.length / 2)) + user2.username.slice(Math.floor(user2.username.length / 2));
    const compatibility = Math.floor(Math.random() * 101); // 0 a 100

    let emoji = '💔';
    if (compatibility > 75) {
      emoji = '💖';
    } else if (compatibility > 50) {
      emoji = '❤️';
    } else if (compatibility > 25) {
      emoji = '🤔';
    }

    const embed = {
      color: config.defaultEmbedColor,
      title: `Compatibilidade Amorosa 💘`,
      description: `Analisando a compatibilidade entre **${user1.username}** e **${user2.username}**...\n\n**Nome do Ship:** ${shipName}\n**Compatibilidade:** ${compatibility}% ${emoji}`,
      timestamp: new Date(),
      footer: {
        text: `Calculado por ${interaction.client.user.username}`,
      },
    };

    await interaction.reply({ embeds: [embed] });
  },
};
