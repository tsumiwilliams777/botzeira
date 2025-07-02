const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.js');

const quotesPath = path.join(__dirname, '..', '..', 'quotes.json');

function readQuotes() {
    try {
        const data = fs.readFileSync(quotesPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {}; // Return empty object if file doesn't exist
        }
        throw error;
    }
}

function writeQuotes(data) {
    fs.writeFileSync(quotesPath, JSON.stringify(data, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Salve e veja citações de usuários no servidor.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Adiciona uma nova citação.')
                .addUserOption(option => option.setName('usuário').setDescription('O usuário a ser citado.').setRequired(true))
                .addStringOption(option => option.setName('citação').setDescription('A citação a ser salva.').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('get')
                .setDescription('Mostra uma citação aleatória de um usuário.')
                .addUserOption(option => option.setName('usuário').setDescription('O usuário de quem você quer ver a citação.').setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const quotes = readQuotes();

        if (subcommand === 'add') {
            const user = interaction.options.getUser('usuário');
            const quoteText = interaction.options.getString('citação');
            const userId = user.id;

            if (!quotes[userId]) {
                quotes[userId] = [];
            }

            quotes[userId].push(quoteText);
            writeQuotes(quotes);

            await interaction.reply({ content: `Citação de **${user.username}** salva com sucesso!`, ephemeral: true });

        } else if (subcommand === 'get') {
            const user = interaction.options.getUser('usuário');
            const userId = user.id;

            if (!quotes[userId] || quotes[userId].length === 0) {
                return interaction.reply({ content: `**${user.username}** ainda não tem nenhuma citação salva.`, flags: 64 });
            }

            const userQuotes = quotes[userId];
            const randomIndex = Math.floor(Math.random() * userQuotes.length);
            const randomQuote = userQuotes[randomIndex];

            const embed = {
                color: config.defaultEmbedColor,
                author: {
                    name: `Citação de ${user.username}`,
                    icon_url: user.displayAvatarURL(),
                },
                description: `> ${randomQuote}`,
                timestamp: new Date(),
            };

            await interaction.reply({ embeds: [embed] });
        }
    },
};