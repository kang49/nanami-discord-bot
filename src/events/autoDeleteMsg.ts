import type client from '../index';
import { PrismaClient } from '@prisma/client';
import { TextChannel } from 'discord.js';
const prisma = new PrismaClient();

export = (client: client) => {
    client.once('ready', async () => {
        async function AutoDeleteMsg() {
            //check channel is set to autoDelete
            const auDelCh = await prisma.autoDeleteMsg.findMany()
            if (auDelCh.length === 0) return; //กรณีไม่มีใครตั้งค่า autoDelMsg ให้ return ทิ้ง
            for (let i = 0; i < auDelCh.length; i++) {
                let auDelChannelId: string = auDelCh[i].channelId as string;
                let auDelTimeLimit: number = auDelCh[i].deleteLimit as number; //sec

                //check msg is set to autoDelete
                const auDelMsg = await prisma.deleteMessage.findMany({
                    where: {
                        channelId: auDelChannelId,
                    }
                });
                if (auDelMsg.length === 0) return; //กรณีไม่มี Msg ให้ลบ ให้ return ทิ้ง
                for (let ii = 0; ii < auDelMsg.length; ii++) {
                    let msgCreateTime: Date = auDelMsg[ii].create_time  as Date;
                    let msgId: string = auDelMsg[ii].messageId as string;

                    if (msgCreateTime) {
                        let currentTime = new Date();
                        let timeDifference = currentTime.getTime() - msgCreateTime.getTime();

                        timeDifference = timeDifference / 1000 //convert nanoSec to Sec

                        //check this msg is overLimit or not
                        if (timeDifference < auDelTimeLimit) return;
                        else {
                            try {
                                // Delete the message using the message's ID
                                //@ts-ignore
                                await client.channels.cache.get(auDelChannelId)?.messages.delete(msgId);
                                
                                await prisma.deleteMessage.deleteMany({
                                    where: {
                                        //@ts-ignore
                                        messageId: msgId,
                                    },
                                });
                            } catch (e) {
                                try {
                                    await prisma.deleteMessage.deleteMany({
                                        where: {
                                            //@ts-ignore
                                            messageId: msgId,
                                        },
                                    });
                                } catch {
                                    console.log(e, 'autoDelMsg')
                                    continue;
                                }
                            };
                        };
                    };
                };
            };
        };

        AutoDeleteMsg(); //Frist time run
        setInterval( async () => {
            AutoDeleteMsg();
        }, 1 * 1 * 10 * 1000); // เช็คทุกๆ 10 วินาที
    });
}