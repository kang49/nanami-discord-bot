import type client from '../index';
import { PrismaClient } from '@prisma/client';
import { TextChannel } from 'discord.js';
const prisma = new PrismaClient();

export = (client: client) => {
    client.once('ready', async () => {
        let databaseOnline = true;
        async function animeGirlDaily_Send() {
            //check database is online
            try {
                await prisma.$connect();
            } catch (error) {
                databaseOnline = false;
                console.error('Error pinging the database cancel AnimeImgUpdate');
            }
            try {
                //Check latest send time is over 6hr
                const latest_sendAnimeGirl_sql = await prisma.attachment.findFirst({
                    where: {
                        animeGirlImage_Check: true,
                        send_time: { not: null },
                    },
                    orderBy: {
                        send_time: "desc"
                    }
                })
                //Feedback check database
                if (databaseOnline === false) {
                    databaseOnline = true;
                }

                const latest_sendAnimeGirl: Date | null = latest_sendAnimeGirl_sql?.send_time as Date | null;
                const limit_sendTime: number = 6 * 60 * 60 * 1000 as number; //กำหนดความถี่ที่จะส่ง

                if (latest_sendAnimeGirl) {
                    const currentTime = new Date();
                    const timeDifference = currentTime.getTime() - latest_sendAnimeGirl.getTime();

                    if (timeDifference < limit_sendTime) return;
                }


                const animeGirlImage_sql = await prisma.attachment.findFirst({
                    where: {
                        animeGirlImage_Check: false,
                    }
                });

                if (!animeGirlImage_sql) return;

                const animeGirlImageUrl: string = animeGirlImage_sql.animeGirlImage ?? '' as string;

                const guild_sql = await prisma.guild.findMany({
                    where: {
                        animeGirlDaily: true,
                    }
                });

                for (let i = 0; i < guild_sql.length; i++) {
                    const animeGirlImage_channel_sql: string = guild_sql[i].animeGirlDaily_log_id ?? '' as string;
                    const animeGirlImage_channel: TextChannel | null = client.channels.cache.get(animeGirlImage_channel_sql) as TextChannel | null;

                    if (!animeGirlImage_channel) return;

                    animeGirlImage_channel.send(animeGirlImageUrl);

                    const send_time = new Date();
                    send_time.setSeconds(0); // กำหนดเศษวินาทีให้เป็น 0 เพื่อ support delay ที่อาจเกิดขึ้นระหว่างส่ง
                    await prisma.attachment.update({
                        where: {
                            animeGirlImage: animeGirlImageUrl,
                        },
                        data: {
                            animeGirlImage_Check: true,
                            send_time: send_time,
                        }
                    });
                }
            } catch (e) {
                return databaseOnline = false;
            }
        }


        animeGirlDaily_Send(); //First time run
        setInterval(async () => {
            animeGirlDaily_Send();
        }, 1 * 1 * 10 * 1000); // เช็คทุกๆ 10 วินาที
    });
}