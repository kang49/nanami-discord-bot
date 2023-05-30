import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import type client from '../index';
import type { CommandInteraction } from 'discord.js';
const Discord = require('discord.js');

import generatePayload = require('promptpay-qr');
import * as qr from 'qrcode';
import * as fs from 'fs';
import sharp from 'sharp';
const axios = require('axios');

export = {
    data: {
        name: "pay",
        description: "Generate payments",
        description_localizations: {
            'th': 'สร้างช่องทางการชำระเงิน'
        },
        options: [
            {
                name: "promptpay",
                description: "Generate QR Promtpay",
                type: 1,
                options: [
                    {
                        "name": "phone-or-id",
                        "description": "enter your phone number or id or wallet id you use",
                        description_localizations: {
                            'th': 'ใส่เบอร์โทรศัพท์หรือ id ที่คุณผูกไว้กับ promptpay'
                        },
                        "type": 3,
                        "required": true
                    },
                    {
                        "name": "amount",
                        "description": "enter your amount of this QR",
                        description_localizations: {
                            'th': 'จำนวนเงิน (ใส่ 0 ถ้าไม่กำหนด)'
                        },
                        "type": 10,
                        "required": true
                    },
                ]
            },
            {
                name: 'debtor-list',
                description: 'Record your accounts receivable as list',
                description_localizations: {
                    'th': 'บันทึกลูกหนี้ที่ค้างเงินไว้ในลิสต์'
                },
                type: 1,
                options: [
                    {
                        name: 'debtor',
                        description: 'Enter user is your debtor',
                        description_localizations: {
                            'th': 'ใครติดเงินเหรอคะ?'
                        },
                        type: 6,
                        required: true,
                    },
                    {
                        "name": "amount",
                        "description": "The amount the debtor owes you or a negative amount to reduce the debt owed",
                        description_localizations: {
                            'th': 'จำนวนเงินที่ลูกหนี้ติดค้างคุณอยู่ หรือจำนวนติดลบเพื่อลดหนี้ที่ติดไว้'
                        },
                        "type": 10,
                        "required": true
                    },
                ]
            },
            {
                name: 'paid',
                description: `Tell the creditor that you've paid.`,
                description_localizations: {
                    'th': 'จะคืนเงินที่ยืมมาเหรอคะ?'
                },
                type: 1,
                options: [
                    {
                        name: 'creditor',
                        description: 'Enter user is your creditor',
                        description_localizations: {
                            'th': 'จะคืนเงินให้ใครเหรอคะ?'
                        },
                        type: 6,
                        required: true,
                    },
                    {
                        "name": "amount",
                        "description": "Amount to be returned to the creditor",
                        description_localizations: {
                            'th': 'จะคืนเท่าไหร่เหรอคะ?'
                        },
                        "type": 10,
                        "required": true
                    },
                    {
                        name: 'slip-img',
                        description: 'Upload your transfer slip (Optional)',
                        description_localizations: {
                            'th': 'อัพโหลดสลิปหน่อยไหมคะ? (ไม่บังคับ)'
                        },
                        type: 11,
                        required: false,
                    },
                ]
            }
        ]
    },
    async execute(client: client, interaction: CommandInteraction) {
        if (!interaction.isCommand()) return; // Check if the interaction is a command

        //main options
        //@ts-ignore
        const payOptions = interaction?.options.getSubcommand(); // Get the pay subcommand name //promptpay

        //Input User info
        const guildId: string = interaction.guildId ?? ""
        const userID: string = interaction.user.id;
        const userName: string = interaction.user.username
        const userTag: string = interaction.user.discriminator

        //promptpay
        const promptpayID: string = interaction.options.get('phone-or-id')?.value as string //ดึงค่าของ phone-or-id ใน promptpay // wallet id เป็น str
        const promptpayAmount: number = interaction.options.get('amount')!.value as number; //ดึงค่าของ amount ใน promptpay //amount number double

        //debtor-list
        const debtorUser = interaction.options.get('debtor') //ดึงค่าของ debtor ใน debtorList // debtorUser info
        const debtorAmount: number = interaction.options.get('amount')?.value as number //ดึงค่าของ amount ใน debtor // debtorAmount number double
         //debtor info
        const debtorUserID: string = debtorUser?.user?.id as string
        const debtorUserName: string = debtorUser?.user?.username as string
        const debtorUserTag: string = debtorUser?.user?.discriminator as string

        //paid
        const creditorUser = interaction.options.get('creditor') //ดึงค่าของ creditor ใน paid // creditor info
        const paidAmount: number = interaction.options.get('amount')?.value as number //ดึงค่าของ amount ใน paid // paidAmount number double
        try{
            //@ts-ignore
            var paidSlip: string = interaction.options.getAttachment('slip-img').url as string //ดึงภาพ slip จาก paid
        } catch {
            var paidSlip: string = ''
        }

        //Creditor info
        const creditorUserID: string = creditorUser?.user?.id as string
        const creditorUserName: string = creditorUser?.user?.username as string
        const creditorUserTag: string = creditorUser?.user?.discriminator as string
        
        if (payOptions === 'promptpay') {
            //push user info to database
            try {
                await prisma.userPayments.upsert({
                    //@ts-ignore
                    where: { userId: userID },
                    create: {
                      guild: guildId ?? "",
                      userId: userID ?? "",
                      userName: userName ?? "",
                      userTag: userTag ?? "",
                      //@ts-ignore
                      promptpay: promptpayID ?? "",
                    },
                    update: {
                      guild: guildId ?? undefined,
                      userName: userName ?? undefined,
                      userTag: userTag ?? undefined,
                      //@ts-ignore
                      promptpay: promptpayID ?? undefined,
                    },
                  });
            }
            catch (e) {
                console.log(e)
            }
            //@ts-ignore
            const promptpayPayload = generatePayload(promptpayID, { amount: promptpayAmount });

            // Generate the QR code image
            const promptpayQRImage = await qr.toDataURL(promptpayPayload);

            // Create the image buffer from the data URL
            const image_PromptPay_Buffer = Buffer.from(promptpayQRImage.split(',')[1], 'base64');

            // Load the image frame
            const imageFramePath = 'assets/img/Nanami Promptpay frame.png';
            const imageFrameData = fs.readFileSync(imageFramePath);

            // Send the initial reply or defer the reply
            interaction.reply({
                content: 'รอสักครู่นะเจ้าคะ หนูกำลังทำให้อยู่ค่ะ 💕',
                ephemeral: true // หากต้องการให้ข้อความนี้เป็นเพียงแค่ข้อความแชทที่เท่ากับผู้ใช้เท่านั้นที่เห็น (ephemeral)
            }).then(() => { //หลังจากตอบ processing แล้วค่อยทำ
                // Resize and overlay the image with text
                sharp(image_PromptPay_Buffer)
                    .resize(250, 250)
                    .toBuffer((err, image_PromptPay_Buffer_resize) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        sharp(imageFrameData)
                            .composite([{ input: image_PromptPay_Buffer_resize, left: 1480, top: 140 }])
                            .toBuffer((err, image_PromptPay_Buffer_overray) => {
                                if (err) {
                                    console.error(err);
                                    return;
                                }

                                // Add text overlay
                                const textOptions = {
                                    text: `${userName} | ${promptpayAmount} บาท`,
                                    font: 'Kanit, sans-serif',
                                    fontSize: 20,
                                    fill: '#97A7B8',
                                    gravity: 'center',
                                    x: -1,
                                    y: 15,
                                };
                                // sharp(image_PromptPay_Buffer_overray)
                                //     .composite([{ 
                                //         input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg">
                                //         <text x="${textOptions.x}" y="${textOptions.y}" font-family="${textOptions.font}" font-size="${textOptions.fontSize}" fill="${textOptions.fill}" font-weight="bold" text-anchor="start">${textOptions.text}</text>
                                //         </svg>`), 
                                //         top: 480, 
                                //         left: 1420
                                //     }])
                                //     .toBuffer((err, promptpay_image_final) => {
                                //         if (err) {
                                //             console.error(err);
                                //             return;
                                //         }
                                        // Create an Attachment from the edited image data
                                        const attachment = new Discord.AttachmentBuilder(image_PromptPay_Buffer_overray, { name: 'promptpayqr.png' });

                                        // Send the Embed message with the edited image
                                        interaction.followUp({
                                            embeds: [
                                                {
                                                    author: {
                                                        name: `${interaction.user.username}`,
                                                        icon_url: `${interaction.user.avatarURL()}`,
                                                    },
                                                    color: 0x0099ff,
                                                    title: 'สร้างการชำระเงินผ่าน **Promptpay QR** สำเร็จแล้วเจ้าค่ะ',
                                                    description: `เจ้าของ: **${userName}** | จำนวน **${promptpayAmount}** บาท`,
                                                    image: {
                                                        url: `attachment://promptpayqr.png`,
                                                    },
                                                },
                                            ],
                                            files: [attachment],
                                        });
                                    // });
                            });
                    });
            });
        }
        else if (payOptions === 'debtor-list') {
            try {
                //Get debtorCheck data
                const debtorCheck = await prisma.debtorCheck.findMany({
                    where: {
                        debtorUserId: debtorUserID,
                        creditorUserId: userID
                    }
                });
                if (debtorCheck.length === 0) { //กรณีไม่เคยมียอดค้าง
                    if (debtorAmount <= 0) {
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
                        return interaction.reply(
                            {
                                embeds: [
                                    {
                                        author: {
                                            name: `${userName}#${userTag}`,
                                            icon_url: `${interaction.user.displayAvatarURL()}`,
                                        },
                                        color: 0xFE0101,
                                        title: `⭕️ **ลบคุณ @${debtorUserName}#${debtorUserTag} | ไม่มียอดค้างชำระนะคะ**`,
                                        description: `จากที่หนูตรวจดู คุณ **${debtorUserName}#${debtorUserTag}** ไม่มีหนี้ที่ต้องจ่ายให้คุณ **${userName}#${userTag}** นะคะ งั้นหนูลบออกจาก List เลยละกันค่ะ`,
                                        thumbnail: {
                                            url: `${debtorUser?.user?.displayAvatarURL()}`
                                        }
                                    }
                                ],
                                ephemeral: true,
                            }
                        )
                    }
                    try {
                        await prisma.debtorCheck.create({
                            data: {
                                guild: guildId ?? "",
                                creditorUserId: userID ?? "",
                                creditorUserName: userName ?? "",
                                creditorUserTag: userTag ?? "",

                                debtorUserId: debtorUserID ?? "",
                                debtorUserName: debtorUserName ?? "",
                                debtorUserTag: debtorUserTag ?? "",
                                debtorAmount: debtorAmount
                            }
                        })
                    } catch (e) {
                        console.log(e)
                        return;
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
                                    title: `🟦 **บันทึกผู้ที่ติดเงินคุณไว้เรียบร้อยแล้วค่ะ**`,
                                    description: `**${debtorUserName}#${debtorUserTag}** เพิ่งจะติดเงินคุณ **${userName}#${userTag}** จำนวน **${debtorAmount}** บาท`,
                                    thumbnail: {
                                        url: `${debtorUser?.user?.displayAvatarURL()}`
                                    }
                                }
                            ]
                        }
                    )
                }
                else if (debtorCheck.length === 1) { //กรณีมียอดค้างอยู่แล้ว
                    let oldDebt: number = debtorCheck[0].debtorAmount as number
                    
                    //Sum oldDebt and newDebt
                    const allDebt: number = oldDebt + debtorAmount //All Debt // number

                    if (allDebt === 0) {
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
                        interaction.reply(
                            {
                              embeds: [
                                {   author: {
                                        name: `${userName}#${userTag}`,
                                        icon_url: `${interaction.user.displayAvatarURL()}`,
                                    },
                                    color: 0xFE0101,
                                    title: `⭕️ **ลบคุณ @${debtorUserName}#${debtorUserTag} | ไม่มียอดค้างชำระนะคะ**`,
                                    description: `จากที่หนูตรวจดู คุณ **${debtorUserName}#${debtorUserTag}** ไม่มีหนี้ที่ต้องจ่ายให้คุณ **${userName}#${userTag}** นะคะ งั้นหนูลบออกจาก List เลยละกันค่ะ`,
                                    thumbnail: {
                                        url: `${debtorUser?.user?.displayAvatarURL()}`
                                    }
                                }
                              ],
                              ephemeral: true,
                            }
                        )
                    } else if (allDebt <= 0) {
                        return;
                    }
                    else {
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
                        interaction.reply(
                            {
                              embeds: [
                                {
                                    author: {
                                        name: `${userName}#${userTag}`,
                                        icon_url: `${interaction.user.displayAvatarURL()}`,
                                    },
                                    color: 0x0099ff,
                                    title: `🟦 **บันทึกผู้ที่ติดเงินคุณไว้เรียบร้อยแล้วค่ะ**`,
                                    description: `**${debtorUserName}#${debtorUserTag}** ติดเงินคุณ **${userName}#${userTag}** เพิ่ม
                                    จำนวน **${debtorAmount}** บาท รวมเป็น **${allDebt}** บาท แล้วนะคะ
                                    
                                    อย่าลืมจ่ายของงวดที่แล้วด้วยน้า 💕`,
                                    thumbnail: {
                                        url: `${debtorUser?.user?.displayAvatarURL()}`
                                    }
                                }
                              ]
                            }
                        )
                    }
                }
                else if (debtorCheck.length >= 1) {
                    console.log(debtorCheck)
                    console.log('Error: Have dublicate data in database')
                }
            } catch (e) {
                console.log(e)
                return;
            }
        }
        else if (payOptions === 'paid') {
            try {
                //Get debtorCheck data
                const debtorCheck = await prisma.debtorCheck.findMany({
                    where: {
                        debtorUserId: userID,
                        creditorUserId: creditorUserID
                    }
                });
                if (debtorCheck.length === 0) { //กรณีผู้ใช้คนนี้ไม่ใช่ลูกหนี้
                    return interaction.reply(
                        {
                            embeds: [
                                {
                                    color: 0xF6FE01,
                                    title: `⚠️ **Error** ⚠️`,
                                    description: `จากที่หนูตรวจดู คุณ **${userName}#${userTag}** ไม่มีหนี้ที่ต้องจ่ายให้คุณ **${creditorUserName}#${creditorUserTag}** นะคะ`,
                                }
                            ],
                            ephemeral: true,
                        }
                    )
                }
                else if (debtorCheck.length === 1) {
                    let oldDebt: number = debtorCheck[0].debtorAmount as number

                    //Minus oldDebt and paidAmount
                    const allDebt: number = oldDebt - paidAmount //number

                    if (paidSlip !== '') {
                        interaction.reply(
                            {
                                embeds: [
                                    {
                                        author: {
                                            name: `${userName}#${userTag}`,
                                            icon_url: `${interaction.user.displayAvatarURL()}`,
                                        },
                                        color: 0x0099ff,
                                        title: `💵 **${userName}#${userTag}** ได้คืนเงิน`,
                                        description: `**${userName}#${userTag}** ได้คืนเงินจำนวน **${paidAmount}** บาท
                                        และมียอดคงเหลืออีก ${allDebt} บาท ตุณ **@${creditorUserName}#${creditorUserTag}** จะอนุมัติการชำระครั้งนี้หรือไม่คะ?`,
                                        thumbnail: {
                                            url: `${creditorUser?.user?.displayAvatarURL()}`
                                        },
                                        fields: [
                                            {
                                                //@ts-ignore
                                                name: 'หลักฐานสลิปเงินโอน',
                                                value: ''
                                            }
                                        ],
                                        image: {
                                            url: paidSlip
                                        }
                                    }
                                ],
                                components: [
                                    {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2,
                                            style: 1,
                                            label: 'อนุมัติ',
                                            custom_id: `creditor_approve_transfering,${userID},${userName},${userTag},${allDebt}`,
                                        },
                                        {
                                            type: 2,
                                            style: 4,
                                            label: 'ปฏิเสธ',
                                            custom_id: `creditor_reject_transfering,${userID},${userName},${userTag},${allDebt}`,
                                        },
                                    ],
                                    },
                                ],
                            }
                        )
                    } else {
                        interaction.reply(
                            {
                                embeds: [
                                    {
                                        author: {
                                            name: `${userName}#${userTag}`,
                                            icon_url: `${interaction.user.displayAvatarURL()}`,
                                        },
                                        color: 0x0099ff,
                                        title: `💵 **${userName}#${userTag}** ได้คืนเงิน`,
                                        description: `**${userName}#${userTag}** ได้คืนเงินจำนวน **${paidAmount}** บาท
                                        และมียอดคงเหลืออีก ${allDebt} บาท คุณ **@${creditorUserName}#${creditorUserTag}** จะอนุมัติการชำระครั้งนี้หรือไม่คะ?`,
                                        thumbnail: {
                                            url: `${creditorUser?.user?.displayAvatarURL()}`
                                        },
                                    }
                                ],
                                components: [
                                    {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2,
                                            style: 1,
                                            label: 'อนุมัติ',
                                            custom_id: `creditor_approve_transfering,${userID},${userName},${userTag},${allDebt}`,
                                        },
                                        {
                                            type: 2,
                                            style: 4,
                                            label: 'ปฏิเสธ',
                                            custom_id: `creditor_reject_transfering,${userID},${userName},${userTag},${allDebt}`,
                                        },
                                    ],
                                    },
                                ],
                            }
                        )
                    }
                }
            } catch (e) {
                console.log(e);
                return;
            }
        }
    }
}