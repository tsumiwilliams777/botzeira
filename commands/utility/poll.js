const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Cria uma enquete com opções de voto.')
    .addStringOption(option =>
      option.setName('pergunta')
        .setDescription('A pergunta da enquete.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('opções')
        .setDescription('As opções da enquete, separadas por vírgulas (ex: Sim, Não, Talvez).')
        .setRequired(true)),

  async execute(interaction) {
    const question = interaction.options.getString('pergunta');
    const optionsString = interaction.options.getString('opções');
    const options = optionsString.split(',').map(opt => opt.trim());

    if (options.length < 2) {
      return interaction.reply({ content: 'Você precisa de pelo menos duas opções para a enquete.', ephemeral: true });
    }
    if (options.length > 5) {
      return interaction.reply({ content: 'Você pode ter no máximo 5 opções para a enquete.', ephemeral: true });
    }

    const pollResults = {};
    options.forEach(option => {
      pollResults[option] = 0;
    });

    const generatePollEmbed = () => {
      let description = `**${question}**\n\n`;
      options.forEach((option, index) => {
        description += `**${index + 1}.** ${option} (${pollResults[option]} votos)\n`;
      });

      return {
        color: config.defaultEmbedColor,
        title: '📊 Nova Enquete 📊',
        description: description,
        timestamp: new Date(),
        footer: {
          text: `Enquete criada por ${interaction.user.username}`,
          icon_url: interaction.user.displayAvatarURL(),
        },
      };
    };

    const buttons = new ActionRowBuilder();
    options.forEach((option, index) => {
      buttons.addComponents(
        new ButtonBuilder()
          .setCustomId(`poll_vote_${index}`)
          .setLabel(`${index + 1}`)
          .setStyle(ButtonStyle.Primary)
      );
    });

    const reply = await interaction.reply({ 
        embeds: [generatePollEmbed()], 
        components: [buttons], 
        fetchReply: true 
    });

    const voters = new Set();

    const collector = reply.createMessageComponentCollector({
      filter: i => i.customId.startsWith('poll_vote_'),
      time: 300000, // 5 minutes
    });

    collector.on('collect', async i => {
      if (voters.has(i.user.id)) {
        return i.reply({ content: 'Você já votou nesta enquete!', ephemeral: true });
      }
      voters.add(i.user.id);

      const optionIndex = parseInt(i.customId.split('_')[2]);
      const votedOption = options[optionIndex];

      pollResults[votedOption]++;

      await i.update({ embeds: [generatePollEmbed()], components: [buttons] });
    });

    collector.on('end', async () => {
      const finalEmbed = generatePollEmbed();
      finalEmbed.title = '📊 Enquete Encerrada 📊';
      await reply.edit({ embeds: [finalEmbed], components: [] });
    });
  },
};