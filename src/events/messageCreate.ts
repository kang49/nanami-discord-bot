import type client from '../index';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export = (client: client) => {
    client.on('messageCreate', async (message) => {
        const guildId: string = message.guildId as string
        const channelId: string = message.channelId as string
        const messageId: string = message.id as string
        const messageAuthorId: string = message.author.id

        try {
            await prisma.deleteMessage.create({
                data: {
                    guildId: guildId,
                    channelId: channelId,
                    messageId: messageId,
                    messageAuthorId: messageAuthorId,
                }
            })
        } catch (e) {
            return;
        }
    });
};
