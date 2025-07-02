const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');

// 
// Basicamente, um gerador de número aleatório com frases prontas.
module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Pergunta algo para a bola 8 mágica.')
    .addStringOption(option =>
      option.setName('pergunta')
        .setDescription('A pergunta que você quer fazer.')
        .setRequired(true)),

  async execute(interaction) {
    const question = interaction.options.getString('pergunta');

    const answers = [
      // Afirmativas
      'É certo.',
      'É decididamente assim.',
      'Sem dúvida.',
      'Sim, definitivamente.',
      'Você pode contar com isso.',
      'A meu ver, sim.',
      'Provavelmente.',
      'As perspectivas são boas.',
      'Sim.',
      'Os sinais apontam que sim.',

      // Não conclusivas
      'Resposta nebulosa, tente novamente.',
      'Pergunte novamente mais tarde.',
      'Melhor não te dizer agora.',
      'Não é possível prever agora.',
      'Concentre-se e pergunte novamente.',

      // Negativas
      'Não conte com isso.',
      'Minha resposta é não.',
      'Minhas fontes dizem não.',
      'As perspectivas não são tão boas.',
      'Muito duvidoso.'
    ];

    const randomIndex = Math.floor(Math.random() * answers.length);
    const answer = answers[randomIndex];

    const embed = {
      color: config.defaultEmbedColor,
      title: '🎱 Bola 8 Mágica 🎱',
      fields: [
        { name: 'Sua Pergunta', value: question },
        { name: 'Minha Resposta', value: answer }
      ],
      timestamp: new Date(),
      footer: {
        text: `Perguntado por ${interaction.user.username}`,
        icon_url: interaction.user.displayAvatarURL(),
      },
    };

    await interaction.reply({ embeds: [embed] });
  },
};