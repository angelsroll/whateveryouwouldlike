import { Intents } from 'discord.js';

export default {
  prefix: '!',
  token: '',
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
}
