// events/ready.js
const { Events, REST, Routes } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Pronto! Logado como ${client.user.tag}`);

    // Registrar os slash commands na API do Discord
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
    try {
      console.log('Iniciando a atualização dos comandos de aplicação (/).');
      const commandsData = client.commands.map(command => command.data.toJSON());

      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commandsData },
      );

      console.log('Comandos de aplicação (/) recarregados com sucesso. O erick dá a bundinha xd');
    } catch (error) {
      console.error(error);
    }
  },
};