import type client from '../index';
import { PrismaClient } from '@prisma/client';
import { TextChannel } from 'discord.js';
const prisma = new PrismaClient();

export = (client: client) => {
    client.once('ready', async () => {
        let funcIsRuning: boolean = false as boolean;


        async function AutoDeleteMsg() {
            //Worker running Management
            let work0_IsOn = false;
            let work1_IsOn = false;

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
                if (auDelMsg.length === 0) continue; //กรณีไม่มี Msg ให้ลบ ให้ไปหา guild ถัดไป

                //Parallel Management
                let work0_Value: number = auDelMsg.length / 2 as number;
                let work1_Value: number = work0_Value as number;

                if  (work0_Value % 1 === 0.5) {
                    work0_Value + 0.5;
                    work1_Value - 0.5;
                }

                const work0_auDelMsg = auDelMsg.slice(0, work0_Value);
                const work1_auDelMsg = auDelMsg.slice(work1_Value);

                const work0 = new Promise<void>(async (resolve) => {
                    if (!work0_IsOn) {
                        work0_IsOn = true;
                        for (let ii_work0 = 0; ii_work0 < work0_auDelMsg.length; ii_work0++) {
                            let msgCreateTime: Date = work0_auDelMsg[ii_work0].create_time  as Date;
                            let msgId: string = work0_auDelMsg[ii_work0].messageId as string;

                            if (msgCreateTime) {
                                let currentTime = new Date();
                                let timeDifference = currentTime.getTime() - msgCreateTime.getTime();

                                timeDifference = timeDifference / 1000 //convert nanoSec to Sec

                                // check this msg is overLimit or not
                                if (timeDifference < auDelTimeLimit) continue;
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
                        work0_IsOn = false;
                    };
                    resolve();
                });
                const work1 = new Promise<void>(async (resolve) => {
                    if (!work1_IsOn) {
                        work1_IsOn = true;
                        for (let ii_work1 = 0; ii_work1 < work1_auDelMsg.length; ii_work1++) {
                            let msgCreateTime: Date = work1_auDelMsg[ii_work1].create_time  as Date;
                            let msgId: string = work1_auDelMsg[ii_work1].messageId as string;

                            if (msgCreateTime) {
                                let currentTime = new Date();
                                let timeDifference = currentTime.getTime() - msgCreateTime.getTime();

                                timeDifference = timeDifference / 1000 //convert nanoSec to Sec

                                // check this msg is overLimit or not
                                if (timeDifference < auDelTimeLimit) continue;
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
                        work1_IsOn = false;
                    };
                    resolve();
                });
                await Promise.all([work0, work1]);
            };
            return funcIsRuning = true;
        };
        AutoDeleteMsg(); //Frist time run

        setInterval( async () => {
            if (funcIsRuning === true) {
                funcIsRuning = false
                AutoDeleteMsg();
            }
        }, 1 * 1 * 1 * 1000); // เช็คทุกๆ 1 วินาที
    });
}