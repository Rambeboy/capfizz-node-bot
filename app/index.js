const fs = require("fs");
const blessed = require("blessed");
const contrib = require("blessed-contrib");
const dashboardConfig = require("./src/services/dashboard");
const { bannerConfig } = require("./src/utils/twist");
const CapfizzMiner = require("./src/services/CapfizzMiner");
const logger = require("./src/utils/logger");
const { delay } = require("./src/utils/helpers");

const screen = blessed.screen(dashboardConfig.screen);
const grid = new contrib.grid({ ...dashboardConfig.grid, screen });

bannerConfig.parent = screen;
const bannerBox = blessed.box(bannerConfig);

const accountLog = grid.set(
  ...dashboardConfig.components.accountLog.position,
  contrib.log,
  dashboardConfig.components.accountLog.config
);

const miningStats = grid.set(
  ...dashboardConfig.components.miningStats.position,
  contrib.table,
  dashboardConfig.components.miningStats.config
);

const accountList = grid.set(
  ...dashboardConfig.components.accountList.position,
  contrib.table,
  dashboardConfig.components.accountList.config
);

logger.setLogger(accountLog);

const miners = new Map();

screen.key(["escape", "q", "C-c"], function (ch, key) {
  miners.forEach((miner) => miner.stopPing());
  return process.exit(0);
});

function updateDashboard(accounts) {
  const accountData = accounts.map((account) => [
    account.email || "N/A",
    account.status || "N/A",
    account.nodeId || "N/A",
    `${account.stats.totalPoints.toFixed(2)} pts`,
  ]);

  accountList.setData({
    headers: ["Email", "Status", "Node ID", "Total Points"],
    data: accountData,
  });

  const totalStats = accounts.reduce(
    (acc, account) => {
      acc.totalPoints += account.stats.totalPoints;
      acc.successfulMines += account.stats.successfulMines;
      acc.failedMines += account.stats.failedMines;
      return acc;
    },
    { totalPoints: 0, successfulMines: 0, failedMines: 0 }
  );

  miningStats.setData({
    headers: ["Metric", "Value"],
    data: [
      ["Total Points", totalStats.totalPoints.toFixed(2)],
      ["Successful Mines", totalStats.successfulMines.toString()],
      ["Failed Mines", totalStats.failedMines.toString()],
    ],
  });

  screen.render();
}

async function startMining(miner, accounts) {
  while (true) {
    try {
      const isAuth = await miner.checkAuth();
      if (!isAuth) {
        logger.log(
          `{red-fg}Authentication failed for ${miner.userEmail}{/red-fg}`
        );
        await delay(30000);
        continue;
      }

      logger.log(
        `{yellow-fg}Attempting to mine for ${miner.userEmail}...{/yellow-fg}`
      );
      const miningResult = await miner.mine();

      if (miningResult) {
        if (miningResult.success) {
          logger.log(
            `{green-fg}Mining successful for ${miner.userEmail}: ${miningResult.message}{/green-fg}`
          );
          logger.log(
            `{green-fg}Points earned for ${miner.userEmail}: ${miningResult.points}{/green-fg}`
          );
        } else {
          logger.log(
            `{red-fg}Mining failed for ${miner.userEmail}: ${miningResult.message}{/red-fg}`
          );
        }
        updateDashboard(accounts);
      }
    } catch (error) {
      logger.log(
        `{red-fg}Error mining for ${miner.userEmail}: ${error.message}{/red-fg}`
      );
      await delay(10000);
    }
  }
}

async function main() {
  const uniqueCookies = [
      ...new Set(rawCookies.map((cookie) => cookie.trim())),];

    logger.log(
      `{green-fg}Found ${uniqueCookies.length} unique accounts to process{/green-fg}`
    );

    const accounts = [];
    const miningPromises = [];

    for (const cookie of uniqueCookies) {
      try {
        const miner = new CapfizzMiner(cookie);
        miners.set(cookie, miner);

        const isAuth = await miner.checkAuth();
        if (!isAuth) {
          logger.log(
            `{red-fg}Authentication failed, skipping account{/red-fg}`
          );
          continue;
        }
        logger.log(`{green-fg}Authentication successful{/green-fg}`);

        const userInfo = await miner.getUserInfo();
        if (userInfo) {
          const account = {
            email: userInfo.data.userInfo.email,
            status: userInfo.data.status,
            nodeId: userInfo.data.nodeInfo.nodeId,
            stats: miner.stats,
            cookie: cookie,
          };
          accounts.push(account);
          miner.setUserEmail(userInfo.data.userInfo.email);

          miner.startPing();

          miningPromises.push(startMining(miner, accounts));
        }
      } catch (error) {
        logger.log(
          `{red-fg}Error initializing account: ${error.message}{/red-fg}`
        );
      }
    }

    updateDashboard(accounts);

    await Promise.all(miningPromises);
  } catch (error) {
    logger.log(`{red-fg}Main process failed: ${error.message}{/red-fg}`);
  }
}

screen.render();
main();
