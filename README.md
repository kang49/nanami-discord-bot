# nanami-discord-bot
 management your discord server | build with typescript
## Development

- Copy the `.env.example` to `.env`

  ```bash
  cp .env.example .env
  ```

- Then, set all variables in `.env` file

  <details>
    <summary>ENV Variables</summary>

  - `BOT_TOKEN` Discord bot token
  - `GUILD_ID` Discord server ID
  - `MOD_CHANNEL_ID` Discord channel ID for bot to report moderation actions
  - `DATABASE_URL` Prisma database URL, you can use SQLite for development, set it to `file:./dev.db`
  </details>

- To run the bot in development mode

  ```bash
  npm run dev
  ```

## Deploy

- Run with Docker
  ```bash
  docker build -t nanami-discord-bot .
  docker run -d --env-file=.env --name nanami-discord-bot nanami-discord-bot
  ```
- Run with pnpm
  ```
  pnpm install
  pnpm build
  pnpm start
  ```