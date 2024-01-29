import type client from '../index';
import type { CommandInteraction, GuildMember } from 'discord.js';
const { MessageAttachment } = require('discord.js');

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
            await interaction.deferReply({
                ephemeral: true // Set to true if you want the reply to be visible only to the user who triggered the command
            });

            const biliLink = interaction.options.get('value')?.value as string;

            const response = await fetch(`https://bilishare.tensormik.com/api/api?biliLink=${biliLink}`, {
                method: 'GET'
            });

            if (response.status === 200) {
                const responseData = await response.json(); // await added here
                console.log(responseData)
                const imageBuffer = Buffer.from(responseData.imageBase64, 'base64');
                const attachment = new MessageAttachment(imageBuffer, 'image.png');

                await interaction.followUp({
                    files: [attachment],
                });
            }
        })
    }
}