const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { status } = require('minecraft-server-util');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

const PREFIX = '!';
const SERVER_IP = 'твой-ip-сервера'; // ЗАМЕНИ
const PORT = 25565;

client.once('ready', () => {
    console.log(`✅ Бот запущен!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    
    const command = message.content.slice(PREFIX.length).split(/ +/)[0].toLowerCase();
    
    if (command === 'status') {
        try {
            const response = await status(SERVER_IP, PORT);
            
            const embed = new EmbedBuilder()
                .setTitle(`🏠 Статус сервера ${SERVER_IP}`)
                .setColor(0x00FF00)
                .addFields(
                    { name: '🟢 Статус', value: 'Сервер работает', inline: true },
                    { name: '👥 Онлайн', value: `${response.players.online}/${response.players.max}`, inline: true },
                    { name: '📡 Версия', value: response.version.name, inline: true }
                );

            if (response.players.online > 0) {
                if (response.players.sample && response.players.sample.length > 0) {
                    const maxPlayersToShow = 6;
                    const playersToShow = response.players.sample.slice(0, maxPlayersToShow);
                    const playerList = playersToShow.map(player => `• ${player.name}`).join('\n');
                    
                    let playerField = `**Игроки онлайн (${response.players.online}):**\n${playerList}`;
                    
                    if (response.players.online > maxPlayersToShow) {
                        const remaining = response.players.online - maxPlayersToShow;
                        playerField += `\n\n...и ещё ${remaining} игроков`;
                    }
                    
                    embed.addFields({ 
                        name: '🎮 Список игроков', 
                        value: playerField 
                    });
                } else {
                    embed.addFields({ 
                        name: '🎮 Игроки онлайн', 
                        value: `На сервере **${response.players.online}** игроков` 
                    });
                }
            }

            message.channel.send({ embeds: [embed] });
            
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle(`🔴 Статус сервера ${SERVER_IP}`)
                .setColor(0xFF0000)
                .setDescription('Сервер недоступен');
            
            message.channel.send({ embeds: [embed] });
        }
    }
});

client.login(process.env.TOKEN);
