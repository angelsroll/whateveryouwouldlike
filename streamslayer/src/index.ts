import { Client } from 'discord.js';
import config from './config';
import helpCommand from './commands';
import WebSocket from 'ws';

const { intents, prefix, token } = config;
const WEB_SOCKET_URL = 'ws://localhost:3000';

const ws = new WebSocket(WEB_SOCKET_URL);

const client = new Client({
  intents,
  presence: {
    status: 'online',
    activities: [{
      name: `${prefix}help`,
      type: 'LISTENING'
    }]
  }
});


client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift();

    switch (command) {
      case 'ping':
        const msg = await message.reply('Pinging...');
        await msg.edit(`Pong! The round trip took ${Date.now() - msg.createdTimestamp}ms.`);
        break;

      case 'say':
      case 'repeat':
        if (args.length > 0) await message.channel.send(args.join(' '));
        else await message.reply('You did not send a message to repeat, cancelling command.');
        break;

      case 'help':
        const embed = helpCommand(message);
        embed.setThumbnail(client.user!.displayAvatarURL());
        await message.channel.send({ embeds: [embed] });
        break;

      case 'attack':
      case 'a':
        console.log('Received !a command');
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ action: 'update', content: 'Triggered by !a command' }));
            message.channel.send('Action triggered!');
        } else {
            message.channel.send('Failed to trigger action.');
        }
    }
  }
});

client.login(token);
