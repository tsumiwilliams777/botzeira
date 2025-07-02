const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('Jogue uma partida de Jogo da Velha.')
    .addUserOption(option =>
      option.setName('oponente')
        .setDescription('O usuário que você quer desafiar.')
        .setRequired(true)),

  async execute(interaction) {
    const opponent = interaction.options.getUser('oponente');
    const challenger = interaction.user;

    if (opponent.bot) {
      return interaction.reply({ content: 'Você não pode jogar com um bot!', ephemeral: true });
    }
    if (opponent.id === challenger.id) {
      return interaction.reply({ content: 'Você não pode jogar consigo mesmo!', flags: 64 });
    }

    // Confirmation from the opponent
    const confirmationRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('tictactoe_accept').setLabel('Aceitar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('tictactoe_decline').setLabel('Recusar').setStyle(ButtonStyle.Danger)
      );

    const confirmationEmbed = {
        color: config.defaultEmbedColor,
        title: 'Desafio de Jogo da Velha!',
        description: `${challenger.username} desafiou ${opponent.username} para uma partida!\n${opponent.username}, você aceita?`,
    };

    const confirmationMessage = await interaction.reply({ 
        content: `<@${opponent.id}>`,
        embeds: [confirmationEmbed],
        components: [confirmationRow], 
        withResponse: true 
    });

    const filter = i => i.user.id === opponent.id;
    try {
        const confirmation = await confirmationMessage.awaitMessageComponent({ filter, time: 60000 });

        if (confirmation.customId === 'tictactoe_accept') {
            await confirmation.update({ content: 'Desafio aceito! Iniciando o jogo...', components: [] });
            await startGame(interaction, challenger, opponent);
        } else {
            await confirmation.update({ content: 'Desafio recusado.', components: [] });
        }
    } catch (e) {
        await interaction.editReply({ content: 'O oponente não respondeu a tempo.', components: [] });
    }
  },
};

async function startGame(interaction, player1, player2) {
    let board = Array(9).fill(null);
    let currentPlayer = player1;
    let symbol = '❌';

    const generateComponents = () => {
        const rows = [];
        for (let i = 0; i < 3; i++) {
            const row = new ActionRowBuilder();
            for (let j = 0; j < 3; j++) {
                const index = i * 3 + j;
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`tictactoe_play_${index}`)
                        .setLabel(board[index] || ' ')
                        .setStyle(board[index] ? (board[index] === '❌' ? ButtonStyle.Danger : ButtonStyle.Primary) : ButtonStyle.Secondary)
                        .setDisabled(board[index] !== null)
                );
            }
            rows.push(row);
        }
        return rows;
    };

    const gameEmbed = () => ({
        color: config.defaultEmbedColor,
        title: 'Jogo da Velha',
        description: `É a vez de **${currentPlayer.username}** (${symbol})`,
    });

    const gameMessage = await interaction.editReply({ embeds: [gameEmbed()], components: generateComponents() });

    const gameFilter = i => i.user.id === currentPlayer.id;
    const collector = gameMessage.createMessageComponentCollector({ filter: gameFilter, time: 300000 });

    collector.on('collect', async i => {
        const index = parseInt(i.customId.split('_')[2]);
        if (board[index] === null) {
            board[index] = symbol;

            const winner = checkWinner(board);
            if (winner) {
                collector.stop();
                const winningPlayer = winner === '❌' ? player1 : player2;
                await i.update({ 
                    embeds: [{
                        color: config.defaultEmbedColor,
                        title: 'Fim de Jogo!',
                        description: `**${winningPlayer.username}** venceu a partida!`
                    }], 
                    components: generateComponents().map(row => row.components.forEach(c => c.setDisabled(true))) 
                });
                return;
            }

            if (board.every(cell => cell !== null)) {
                collector.stop();
                await i.update({ 
                    embeds: [{
                        color: config.defaultEmbedColor,
                        title: 'Fim de Jogo!',
                        description: 'A partida terminou em empate!'
                    }], 
                    components: generateComponents().map(row => row.components.forEach(c => c.setDisabled(true))) 
                });
                return;
            }

            currentPlayer = currentPlayer.id === player1.id ? player2 : player1;
            symbol = symbol === '❌' ? '⭕' : '❌';

            await i.update({ embeds: [gameEmbed()], components: generateComponents() });
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            interaction.editReply({ content: 'O jogo terminou por inatividade.', components: [] });
        }
    });
}

function checkWinner(board) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const line of lines) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}