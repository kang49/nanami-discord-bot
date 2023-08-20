import type client from '../index';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export = (client: client) => {
    // ตั้งค่าตัวจัดการกิจกรรม
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return; // ตรวจสอบว่าเป็นปุ่มหรือไม่
        
        // ดึงข้อมูลเกี่ยวกับปุ่มที่ถูกกด
        const customId: string = interaction.customId;
        const customId_list = customId.split(',');
        if (customId_list[0] != 'animeGirl_Verify_Delete') return; //ถ้าคำสั่งที่มาไม่เกี่ยวกัย AnimeImage_Verify

        const verify_option: string = customId_list[0];
        const animeGirlImage_id: number = parseInt(customId_list[1], 10) as number;

        interaction.reply({
            content: 'รอสักครู่นะคะ หนูกำลังทำให้อยู่ค่ะ 💕',
            ephemeral: true // หากต้องการให้ข้อความนี้เป็นเพียงแค่ข้อความแชทที่เท่ากับผู้ใช้เท่านั้นที่เห็น (ephemeral)
        }).then( async () => {

            //ถ้า option ให้ลบก็ลบใน sql และ msg นั้นทิ้งด้วย
            if (verify_option === 'animeGirl_Verify_Delete') {
                try {
                    //Delete Msg is send for verify
                    const attachmentDel_sql = await prisma.attachment.findFirst({
                        where: {
                            id: animeGirlImage_id,
                        }
                    });
                    const animeGirlImage_Verify_Channel_Str: string = process.env.ANIME_IMAGE_VERIFY ?? '' as string;
                    //@ts-ignore
                    await client.channels.cache.get(animeGirlImage_Verify_Channel_Str)?.messages.delete(attachmentDel_sql?.sendVerify_id);
                    
                    await prisma.deleteMessage.deleteMany({
                        where: {
                            //@ts-ignore
                            messageId: attachmentDel_sql?.sendVerify_id,
                        },
                    });

                    //Delete Attatchment in SQL
                    await prisma.attachment.delete({
                        where: {
                            id: animeGirlImage_id,
                        }
                    })
                } catch (e) {
                    try {
                        await prisma.deleteMessage.deleteMany({
                            where: {
                                //@ts-ignore
                                messageId: attachmentDel_sql?.sendVerify_id,
                            },
                        });
                    } catch {
                        console.log(e, 'animeGirlImage_Verify_Res')
                    }
                }
            }
        })
    });
}