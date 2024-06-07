const { Client, Intents } = require('discord.js');
const fetch = require('node-fetch');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const BOT_TOKEN = ''; // Replace with your actual bot token
const WEB_SERVER_URL = 'http://localhost:3000/update';

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    console.log('Received a message:', message.content);
    if (message.content === '!update') {
        console.log('Received !update command'); // Debug log
        try {
            const response = await fetch(WEB_SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ update: 'New update from Discord bot!' })
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const responseData = await response.json();
            console.log('Server response:', responseData); // Debug log
            message.channel.send('Webpage updated!');
        } catch (error) {
            console.error('Error updating webpage:', error); // Debug log
            message.channel.send('Failed to update webpage.');
        }
    }
});

client.login(BOT_TOKEN);