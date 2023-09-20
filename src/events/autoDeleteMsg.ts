import type client from '../index';
import { PrismaClient } from '@prisma/client';
import { TextChannel } from 'discord.js';
const prisma = new PrismaClient();

export = (client: client) => {
  client.once('ready', async () => {
    let funcIsRunning = false;

    async function deleteMessages(messages: any[], auDelChannelId: string, auDelTimeLimit: number) {
      const currentTime = new Date();
      for (const msg of messages) {
        const msgCreateTime = msg.create_time as Date;
        const msgId = msg.messageId as string;
        if (msgCreateTime) {
          const timeDifference = (currentTime.getTime() - msgCreateTime.getTime()) / 1000; // Convert nanoSec to Sec
          if (timeDifference < auDelTimeLimit) continue;
          try {
            const channel = client.channels.cache.get(auDelChannelId) as TextChannel;
            if (channel) await channel.messages.delete(msgId);
            await prisma.deleteMessage.deleteMany({
              where: { messageId: msgId },
            });
          } catch (e) {
            console.log(e, 'autoDelMsg');
            continue;
          }
        }
      }
    }

    async function autoDeleteMsg(workCount: number) {
      if (funcIsRunning) return;
      funcIsRunning = true;

      const auDelCh = await prisma.autoDeleteMsg.findMany();
      if (auDelCh.length === 0) {
        funcIsRunning = false;
        return;
      }

      for (const autoDelChannel of auDelCh) {
        const auDelChannelId: string = autoDelChannel.channelId as string;
        const auDelTimeLimit = autoDelChannel.deleteLimit || 0; // Default to 0 if deleteLimit is not set

        const auDelMsg = await prisma.deleteMessage.findMany({
          where: { channelId: auDelChannelId },
        });

        if (auDelMsg.length === 0) continue;

        const messagesPerWork = Math.ceil(auDelMsg.length / workCount);
        const workProcesses: any[][] = [];

        // Distribute messages among work processes
        for (let i = 0; i < workCount; i++) {
          const startIdx = i * messagesPerWork;
          const endIdx = startIdx + messagesPerWork;
          workProcesses.push(auDelMsg.slice(startIdx, endIdx));
        }

        // Process messages in parallel using Promise.all
        await Promise.all(
          workProcesses.map((workMsgs) => deleteMessages(workMsgs, auDelChannelId, auDelTimeLimit))
        );
      }

      funcIsRunning = false;
    }

    const numberOfWorkProcesses = 10; // Change this value to adjust the number of work processes

    autoDeleteMsg(numberOfWorkProcesses); // First time run

    setInterval(() => autoDeleteMsg(numberOfWorkProcesses), 1000); // Check every 1 second (adjust this value if needed)
  });
};
