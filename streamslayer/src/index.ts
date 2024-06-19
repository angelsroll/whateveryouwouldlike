import { Client } from 'discord.js';
import config from './config';
import helpCommand from './commands';

const { intents, prefix, token } = config;


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
      case 'a': {
        //@ts-expect-error
        const req  = await fetch("http://localhost:3000/update", {
          method: 'POST',
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ update: {}})
        })
        await message.channel.send('```js\n' + await req.text() + '\n```')
      }
    }
  }
});

client.login(token);
