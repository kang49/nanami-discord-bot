import type client from '../index';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export = (client: client) => {
    // ตั้งค่าตัวจัดการกิจกรรม
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return; // ตรวจสอบว่าเป็นปุ่มหรือไม่
    
        // ดึงข้อมูลเกี่ยวกับปุ่มที่ถูกกด
        const customId: string = interaction.customId;
        const guildId: string = interaction.guildId ?? ""
        const userID: string = interaction.user.id;
        const userName: string = interaction.user.username
        const userTag: string = interaction.user.discriminator

        const customId_list = customId.split(','); //[ 'creditor_..._transfering', 'userid' ]
        const debtorUserID: string = customId_list[1]
        const debtorUserName: string = customId_list[2]
        const debtorUserTag: string = customId_list[3]
        const allDebt = parseFloat(customId_list[4]); //หนี้ที่ค้างไว้ คำนวนเสร็จเรียบร้อยแล้วตอน generate paid ไม่สามารถกดซ้ำเพื่อลดได้

        try {
            //Get debtorCheck data
            const debtorCheck = await prisma.debtorCheck.findMany({
                where: {
                    debtorUserId: debtorUserID,
                    creditorUserId: userID
                }
            });

                if (debtorCheck.length === 0 || userID === debtorUserID) { //เช็คถ้าคนที่กดปุ่มเป็นลูกหนี้เองหรือคนนอก
                    interaction.reply(
                        {
                            embeds: [
                                {
                                    color: 0xF6FE01,
                                    title: `⚠️ **Error** ⚠️`,
                                    description: `จากที่หนูตรวจดู คุณ **${debtorUserName}#${debtorUserTag}** ไม่มีหนี้ที่ต้องจ่ายให้คุณ **${userName}#${userTag}** นะคะ`,
                                }
                            ],
                            ephemeral: true,
                        }
                    )
                    return;
                }
        } catch (e) {
            console.log(e)
            return;
        }
    
        // ตรวจสอบว่าปุ่มที่ถูกกดเป็นปุ่มใด
        if (customId_list[0] === 'creditor_approve_transfering') {
            if (allDebt <= 0) {
                try {
                    await prisma.debtorCheck.deleteMany({
                        where: {
                        debtorUserId: debtorUserID,
                        creditorUserId: userID,
                        },
                    });
                } catch (e) {
                    console.log(e)
                    return;
                }
            }
            else{
                try {
                    await prisma.debtorCheck.updateMany({
                        where: {
                        debtorUserId: debtorUserID,
                        creditorUserId: userID,
                        },
                        data: {
                        debtorAmount: allDebt,
                        },
                    });                                                
                } catch (e) {
                    console.log(e)
                    return;
                }
            }
            interaction.reply(
                {
                    embeds: [
                        {
                            author: {
                                name: `${userName}#${userTag}`,
                                icon_url: `${interaction.user.displayAvatarURL()}`,
                            },
                            color: 0x0099ff,
                            title: `✅ **${userName}#${userTag}** อนุมัติการคืนเงิน`,
                            description: `**${userName}#${userTag}** ได้อนุมัติการคืนเงินของคุณ **@${debtorUserName}#${debtorUserTag}** เรียบร้อยแล้วค่ะ 🩷
                            
                            มียอดคงเหลืออีก **${allDebt}** บาทนะคะ`,
                        }
                    ],
                }
            );
    
        } else if (customId_list[0] === 'creditor_reject_transfering') {
            interaction.reply(
                {
                    embeds: [
                        {
                            author: {
                                name: `${userName}#${userTag}`,
                                icon_url: `${interaction.user.displayAvatarURL()}`,
                            },
                            color: 0xFE0101,
                            title: `❌ **${userName}#${userTag}** ปฏิเสธการคืนเงิน`,
                            description: `**${userName}#${userTag}** ได้ปฏิเสธการคืนเงินของคุณ **@${debtorUserName}#${debtorUserTag}** ลองติดต่อคุยกันดูนะคะ`,
                        }
                    ],
                }
            );
        }
    });
};
