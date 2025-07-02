const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Esse comando é pra galera criar o próprio bot dentro do bot.
// usa o webhook do Discord
// basicamente, o usuário pode definir um nome, avatar e o sysprompt da IA.
// A IA vai usar essas configs pra responder o usuário.
const userAgentsPath = path.join(__dirname, '..', '..', 'user_agents.json');

function readUserAgents() {
    try {
        const data = fs.readFileSync(userAgentsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {};
        }
        throw error;
    }
}

function writeUserAgents(data) {
    fs.writeFileSync(userAgentsPath, JSON.stringify(data, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('agent')
        .setDescription('Configure seu agente de IA pessoal.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('nome')
                .setDescription('Defina o nome do seu agente.')
                .addStringOption(option =>
                    option.setName('nome')
                        .setDescription('O nome que seu agente vai ter.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('avatar')
                .setDescription('Defina o avatar do seu agente.')
                .addAttachmentOption(option =>
                    option.setName('avatar')
                        .setDescription('A foto do seu agente (PNG, JPG, WEBP).')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('prompt')
                .setDescription('Defina a personalidade do seu agente.')
                .addStringOption(option =>
                    option.setName('prompt')
                        .setDescription('O texto que define como seu agente vai agir.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ver')
                .setDescription('Veja a configuração atual do seu agente.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('deletar')
                .setDescription('Delete seu agente personalizado.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('listar')
                .setDescription('Liste seus agentes personalizados.')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const userAgents = readUserAgents();

        if (!userAgents[userId]) {
            userAgents[userId] = {};
        }

        switch (subcommand) {
            case 'nome':
                const name = interaction.options.getString('nome');
                userAgents[userId].name = name;
                writeUserAgents(userAgents);
                await interaction.reply({ content: `O nome do seu agente agora é: **${name}**`, ephemeral: true });
                break;
            case 'avatar':
                const attachment = interaction.options.getAttachment('avatar');
                if (!['image/png', 'image/jpeg', 'image/webp'].includes(attachment.contentType)) {
                    return interaction.reply({ content: 'Por favor, envie um arquivo PNG, JPG ou WEBP.', ephemeral: true });
                }
                userAgents[userId].avatar = attachment.url;
                writeUserAgents(userAgents);
                await interaction.reply({ content: 'Avatar do agente atualizado!', ephemeral: true });
                break;
            case 'prompt':
                const prompt = interaction.options.getString('prompt');
                userAgents[userId].prompt = prompt;
                writeUserAgents(userAgents);
                await interaction.reply({ content: 'Personalidade do agente atualizada!', ephemeral: true });
                break;
            case 'ver':
                if (userAgents[userId] && userAgents[userId].prompt) {
                    let replyContent = `**Sua Configuração de Agente Atual:**\n`;
                    if (userAgents[userId].name) {
                        replyContent += `Nome: **${userAgents[userId].name}**\n`;
                    }
                    if (userAgents[userId].avatar) {
                        replyContent += `Avatar: ${userAgents[userId].avatar}\n`;
                    }
                    replyContent += 'Personalidade: ```' + userAgents[userId].prompt + '```';
                    await interaction.reply({ content: replyContent, ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Você ainda não configurou um agente. Use `/agent prompt` para criar um!', ephemeral: true });
                }
                break;
            case 'deletar':
                if (userAgents[userId]) {
                    delete userAgents[userId];
                    writeUserAgents(userAgents);
                    await interaction.reply({ content: 'Seu agente personalizado foi deletado.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Você não tem um agente personalizado para deletar.', flags: 64 });
                }
                break;
            case 'listar':
                if (userAgents[userId] && userAgents[userId].prompt) {
                    await interaction.reply({ content: 'Você tem um agente personalizado configurado. Use `/agent ver` para ver os detalhes.', flags: 64 });
                } else {
                    await interaction.reply({ content: "Você não tem nenhum agente personalizado. Use `/agent prompt` para criar o seu primeiro!", flags: 64 });
                }
                break;
        }
    },
};