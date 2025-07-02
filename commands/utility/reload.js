const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Recarrega um comando.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('O comando para recarregar.')
                .setRequired(true)),
    async execute(interaction) {
        const commandName = interaction.options.getString('command', true).toLowerCase();
        const command = interaction.client.commands.get(commandName);

        if (!command) {
            return interaction.reply(`Não há nenhum comando com o nome \`${commandName}\`!`);
        }

        const commandFolders = fs.readdirSync(path.join(__dirname, '..'));
        let commandPath;

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(path.join(__dirname, '..', folder)).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                if (file.slice(0, -3) === commandName) {
                    commandPath = path.join(__dirname, '..', folder, file);
                    break;
                }
            }
            if (commandPath) break;
        }

        if (!commandPath) {
            return interaction.reply(`Não foi possível encontrar o arquivo do comando \`${commandName}\`.`);
        }

        delete require.cache[require.resolve(commandPath)];

        try {
            interaction.client.commands.delete(command.data.name);
            const newCommand = require(commandPath);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply(`Comando \`${newCommand.data.name}\` foi recarregado!`);
        } catch (error) {
            console.error(error);
            await interaction.reply(`Houve um erro ao recarregar o comando \`${command.data.name}\`:\n\`${error.message}\``);
        }
    },
};