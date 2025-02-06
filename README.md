# CAPFIZZ NODE BOT

A Node.js automation tool for managing multiple Capfizz Sentry Node accounts with parallel mining and real-time monitoring dashboard.

## BOT FEATURE

- Multi-account parallel mining
- Automatic ping every 60 seconds per account
- Auto retry with rate limit handling
- Real-time statistics dashboard
- Activity logging for each account
- Easy configuration management
- Modular and maintainable structure

## PREREQUISITE

Before running the bot, you need to:

1. Register an account at [Capfizz Mainnet](https://mainnet.capfizz.com/)
2. Install the [Capfizz Sentry Node Extension](https://chromewebstore.google.com/detail/capfizz-sentry-node/agollninopbkafedoijcnbdopajjjmfa) in your Chrome browser

## SETUP & CONFIGURE BOT

1. Clone Project Repository
   ```bash
   git clone https://github.com/Rambeboy/capfizz-node-bot.git && cd capfizz-node-bot
   ```

2. Install Dependencies & Setup Accounts
   ```bash
   npm install && npm run setup
   ```

## CONFIGURATION

### Getting Your Account Cookie

1. Right-click on the Capfizz Sentry Node extension icon
2. Click "Inspect Popup"
3. Go to the "Network" tab
4. Copy the cookie from the request headers
5. Add the cookie to `config.js` (one cookie per line for multiple accounts)

## USAGE

1. Add your account cookie(s) to `config.js`:
   ```bash
   nano config/config.js
   ```

2. Run the bot:
   ```bash
   npm run start
   ```

## DASHBOARD INTERFACE

The dashboard shows:

- Account Activity Log: Real-time mining and ping activities
- Mining Statistics: Total points, successful mines, and failed mines
- Account List: Status of all configured accounts

## CONTROLS

- Press `q` to quit
- Press `Esc` to exit
- Press `Ctrl+C` to terminate

## LICENSE

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for more details.
