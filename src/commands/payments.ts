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
                        "type": 3,
                        "required": true
                    },
                    {
                        "name": "amount",
                        "description": "enter your amount of this QR",
                        "type": 10,
                        "required": true
                    },
                ]
            },
        ]
    },
    async execute(client: client, interaction: CommandInteraction) {
        if (!interaction.isCommand()) return; // Check if the interaction is a command

        //main options
        //@ts-ignore
        const payOptions = interaction?.options.getSubcommand(); // Get the pay subcommand name //promptpay

        //User info
        const guildId: string = interaction.guildId ?? ""
        const userID: string = interaction.user.id;
        const userName: string = interaction.user.username
        const userTag: string = interaction.user.discriminator

        //promptpay
        const promptpayID = interaction.options.get('phone-or-id')?.value //ดึงค่าของ phone-or-id ใน promptpay // wallet id เป็น str
        const promptpayAmount = interaction.options.get('amount')?.value //ดึงค่าของ amount ใน promptpay //amount int

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
            const promptpayPayload = generatePayload(promptpayID, { promptpayAmount });

            // Generate the QR code image
            const promptpayQRImage = await qr.toDataURL(promptpayPayload);

            // Create the image buffer from the data URL
            const image_PromptPay_Data = promptpayQRImage.split(',')[1];
            const image_PromptPay_Buffer = Buffer.from(image_PromptPay_Data, 'base64');

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

                                sharp(image_PromptPay_Buffer_overray)
                                    .composite([{ 
                                        input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg">
                                        <text x="${textOptions.x}" y="${textOptions.y}" font-family="${textOptions.font}" font-size="${textOptions.fontSize}" fill="${textOptions.fill}" font-weight="bold" text-anchor="start">${textOptions.text}</text>
                                        </svg>`), 
                                        top: 480, 
                                        left: 1420
                                    }])
                                    .toBuffer((err, promptpay_image_final) => {
                                        if (err) {
                                            console.error(err);
                                            return;
                                        }

                                        // Create an Attachment from the edited image data
                                        const attachment = new Discord.AttachmentBuilder(promptpay_image_final, { name: 'promptpayqr.png' });

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
                                    });
                            });
                    });
            });
        }
    }
}