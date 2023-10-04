import type client from '../index';
import { PrismaClient } from '@prisma/client';
import { TextChannel } from 'discord.js';
const prisma = new PrismaClient();

export = (client: client) => {
    client.once('ready', async () => {
        async function animeGirl_Verify() {
            try {
                //Rest image is not verify
                var animeGirlImage_sql = await prisma.attachment.findMany({
                    where: {
                        animeGirlImage_Verify: false,
                        animeGirlImage_Check: false
                    },
                    orderBy: {
                        create_time: 'asc'
                    }
                });
            } catch (e) {
                return console.log(e, 'animeGirlImage_Verify');
            }
            //Send image is not verify to verify admin channel
            const animeGirlImage_Verify_Channel_Str: string = process.env.ANIME_IMAGE_VERIFY ?? '' as string;
            const animeGirlImage_Verify_Channel: TextChannel | null = client.channels.cache.get(animeGirlImage_Verify_Channel_Str) as TextChannel | null;

            if (!animeGirlImage_Verify_Channel) return;

            for (let i = 0; i < animeGirlImage_sql.length; i++) {
                var sendMsgVerify = animeGirlImage_Verify_Channel.send(
                    {
                        embeds: [
                            {
                                color: 0x0099ff,
                                title: `**โปรดตรวจสอบภาพนี้ด้วยค่ะ ID: ${animeGirlImage_sql[i].id}**`,
                                description: `${animeGirlImage_sql[i].animeGirlImage}`,
                                image: {
                                    url: `${animeGirlImage_sql[i].animeGirlImage}`,
                                },
                            }
                        ],
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        style: 4,
                                        label: 'ลบ',
                                        custom_id: `animeGirl_Verify,Delete,${animeGirlImage_sql[i].id}`,
                                    },
                                ],
                            },
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        style: 3,
                                        label: 'แชร์ตอนนี้',
                                        custom_id: `animeGirl_Verify,SendNow,${animeGirlImage_sql[i].id}`,
                                    },
                                ],
                            },
                        ],
                    }
                )
                var sendMsgVerify_Str: string = (await sendMsgVerify).id as string
                //บันทึกว่าภาพไหนส่งให้ Verify แล้วบ้างลง SQL
                await prisma.attachment.update({
                    where: {
                        id: animeGirlImage_sql[i].id
                    },
                    data: {
                        sendVerify_id: sendMsgVerify_Str,
                        animeGirlImage_Verify: true,
                    }
                });
            }
        }

        animeGirl_Verify(); //First time run
        setInterval(async () => {
            const jobTime = new Date;
            jobTime.setHours(8, 0, 0, 0); //set jobTime in utc time
            let currentTime = new Date;
            
            // แปลงเวลาให้เป็นจำนวนวินาที
            const jobTimeInSeconds = Math.floor(jobTime.getTime() / 1000);
            const currentTimeInSeconds = Math.floor(currentTime.getTime() / 1000);

            if (jobTimeInSeconds !== currentTimeInSeconds) return

            animeGirl_Verify();
        }, 1 * 1 * 1 * 1000); // เช็คทุกๆ 1 วินาที
    });
}