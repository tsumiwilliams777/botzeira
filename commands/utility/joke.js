const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');
const https = require('https');

// comando de piada. Puxa de uma API gringa, então as piadas são em inglês.
// e são ruins. Mas o que vale é a intenção, né?
module.exports = {
  data: new SlashCommandBuilder()
    .setName('piada')
    .setDescription('Conta uma piada aleatória (ruim e em inglês).'),

  async execute(interaction) {
    await interaction.deferReply();

    const options = {
      hostname: 'official-joke-api.appspot.com',
      path: '/random_joke',
      method: 'GET'
    };

    const req = https.request(options, res => {
      let data = '';

      res.on('data', d => {
        data += d;
      });

      res.on('end', () => {
        try {
          const joke = JSON.parse(data);
          const embed = {
            color: config.defaultEmbedColor,
            title: joke.setup,
            description: `||${joke.punchline}||` // Punchline in a spoiler
          };
          interaction.editReply({ embeds: [embed] });
        } catch (error) {
          console.error('Error parsing joke API response:', error);
          interaction.editReply({ content: 'Não consegui pensar numa piada agora.', ephemeral: true });
        }
      });
    });

    req.on('error', error => {
      console.error('Error with joke API request:', error);
      interaction.editReply({ content: 'Deu ruim aqui na hora de buscar a piada.', flags: 64 });
    });

    req.end();
  },
};