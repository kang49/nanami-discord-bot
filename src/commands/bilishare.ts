import type client from '../index';
import type { CommandInteraction, GuildMember } from 'discord.js';
const Discord = require('discord.js');

export = {
    data: {
        name: "animecard",
        description: "Create anime card from Bilibili",
        description_localizations: {
            'th': 'สร้างการ์ดอนิเมะจาก Bilibili'
        },
        options: [
            {
                name: "value",
                description: "Video url or name",
                description_localizations: {
                    'th': 'url หรือชื่ออนิเมะ'
                },
                type: 3,
                required: true
            },
        ]
    },
    async execute(client: client, interaction: CommandInteraction) {
        if (!interaction.isCommand()) return; // Check if the interaction is a command
        interaction.reply({
            content: 'รอสักครู่นะคะ หนูกำลังทำให้อยู่ค่ะ 💕',
            ephemeral: true // หากต้องการให้ข้อความนี้เป็นเพียงแค่ข้อความแชทที่เท่ากับผู้ใช้เท่านั้นที่เห็น (ephemeral)
        }).then(async () => {
            const biliLink = interaction.options.get('value')?.value as string;

            let response: any = await fetch(`https://bilishare.tensormik.com/api/api?biliLink=${biliLink}`, {
                method: 'GET'
            });
            
            if (response.status === 200) {
                let responseData = await response.json(); // await added here
                response = null;
                console.log(responseData)
                let imageBuffer: any = Buffer.from(responseData.imageBase64, 'base64');
                responseData = null;
                let attachment = new Discord.AttachmentBuilder(imageBuffer, { name: 'animeCard.png' });
                imageBuffer = null;

                await interaction.followUp({
                    files: [attachment],
                });
                attachment = null;
            } else if (response.status === 400) {
                let responseData = await response.json(); // await added here
                response = null;
                
                await interaction.followUp({
                    content: `ขอโทษในความผิดพลาดด้วยนะคะ หนูหาข้อมูลอนิเมะเรื่องนั้นไม่เจอเลยค่ะ 🥺`,
                    ephemeral: true
                });
                await interaction.followUp({
                    embeds: [
                        {
                            color: 0xB6B6B6,
                            title: `⚠️ **Error** ⚠️`,
                            description: `${responseData.error}`
                        }
                    ],
                    ephemeral: true
                });
                responseData = null;
            }
        })
    }
} 