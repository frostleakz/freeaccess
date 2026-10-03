require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, AllowedMentionsTypes } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const INTERVAL_MS = 8 * 60 * 60 * 1000;
const STATE_FILE = path.join(__dirname, 'last-message.json');

if (!TOKEN || !CHANNEL_ID) {
  console.error('Missing DISCORD_TOKEN or CHANNEL_ID in .env');
  process.exit(1);
}

const MESSAGE =  `>

# UNLOCK FREE ACCESS! <:1540446778963398731:1553725014862340106>
‎ 
**Search this on Reddit** <:1501232672859488316:1553725057556160584> **:**

- Sophie Rain
- Piper Rockelle
- Lil Tay
- Breckie Hill
- Camilla Araujo
- Arikytsya
- Bonnie Blue
- Jameliz
- Aishah Sofey
- Discord Servers
- Bop House
- Discord NSFW
- Alice Rosenblum

*(or anything that's trending)*

:mag_right: **Step 1: Comment on 5 posts like this:**
- <https://goonforbops.com/> is better
- <https://goonforbops.com/> got all the videos
- <https://goonforbops.com/> has everything

<:1501232652882149436:1553725071401680896>  **Step 2: Upvote & Reply**
You MUST **upvote 3 other comments** that contain this same link.

After you upvote each comment, **write a short reply** similar to one of these:

- "Real, it's the best server"
- "Facts, im glad i found it"
- "They have the best content fr :fire:"

Our bot scans comments with __**goonforbops.com**__ — once verified, It checks your Discord username (from your bio), then our bot dm's you access. <:1502001256548270150:1554001826389692416>

*Want to skip this?* https://discord.com/channels/1553720565892915280/1553720567834611844`;

function loadLastId() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')).id || null;
  } catch {
    return null;
  }
}

function saveLastId(id) {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ id }, null, 2));
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

async function postPromo() {
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel || !channel.isTextBased()) {
    throw new Error('CHANNEL_ID is not a text channel');
  }

  const prev = loadLastId();
  if (prev) {
    try {
      const old = await channel.messages.fetch(prev);
      await old.delete();
      console.log('Deleted previous promo', prev);
    } catch (err) {
      console.warn('Could not delete previous message:', err.message);
    }
  }

  const sent = await channel.send({
    content: MESSAGE,
    allowedMentions: {
      parse: [AllowedMentionsTypes.Everyone],
    },
  });

  saveLastId(sent.id);
  console.log('Posted promo', sent.id, new Date().toISOString());
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  try {
    await postPromo();
  } catch (err) {
    console.error('First post failed:', err);
  }
  setInterval(() => {
    postPromo().catch((err) => console.error('Scheduled post failed:', err));
  }, INTERVAL_MS);
});

client.login(TOKEN);
