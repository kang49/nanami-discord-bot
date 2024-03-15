import type client from '../index';
import type { CommandInteraction } from 'discord.js';
const Discord = require('discord.js');

const malScraper = require('mal-scraper');

export = {
    data: {
        name: "anime",
        description: "Anime Commands",
        description_localizations: {
            'th': 'คำสั่งเกี่ยวกับอนิเมะ'
        },
        options: [
            {
                name: 'search',
                description: "Search anime info by title",
                description_localizations: {
                    'th': 'ค้นหาข้อมูลอนิเมะด้วยชื่อเรื่อง'
                },
                type: 1,
                options: [
                    {
                        name: 'title',
                        description: "title name",
                        description_localizations: {
                            'th': 'ชื่อเรื่อง'
                        },
                        type: 3,
                        required: true
                    }
                ]
            },
            {
                name: 'bilibili-card',
                description: "Create anime card from Bilibili",
                description_localizations: {
                    'th': 'สร้างการ์ดอนิเมะจาก Bilibili'
                },
                type: 1,
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
            }
        ]
    },
    async execute(client: client, interaction: CommandInteraction) {
        if (!interaction.isCommand()) return; // Check if the interaction is a command
        await interaction.reply({
            content: 'รอสักครู่นะคะ หนูกำลังทำให้อยู่ค่ะ 💕',
            ephemeral: true // หากต้องการให้ข้อความนี้เป็นเพียงแค่ข้อความแชทที่เท่ากับผู้ใช้เท่านั้นที่เห็น (ephemeral)
        });

        //@ts-ignore
        const animeoption: string = interaction.options.getSubcommand() as string; // Get subcommand name //animesearch
        //animesearch
        if (animeoption === 'search') {
            const animename: string = interaction.options.get('title')?.value as string;

            malScraper.getInfoFromName(animename).then(async (data: any) => {

                await interaction.followUp({
                    embeds: [
                        {
                            color: 0xB6B6B6,
                            title: `ข้อมูลอนิเมะเรื่อง **${animename}**`,
                            image: {
                                url: data.picture
                            },
                            fields: [
                                {
                                    name: 'ชื่ออังกฤษ',
                                    value: data.englishTitle,
                                    inline: true
                                },
                                {
                                    name: 'ชื่อญี่ปุ่น',
                                    value: data.japaneseTitle,
                                    inline: true
                                },
                                {
                                    name: 'ประเภท',
                                    value: data.type,
                                    inline: true
                                },
                                {
                                    name: 'ตอน',
                                    value: data.episodes,
                                    inline: true
                                },
                                {
                                    name: 'เรท',
                                    value: data.rating,
                                    inline: true
                                },
                                {
                                    name: 'ออกอากาศ',
                                    value: data.aired,
                                    inline: true
                                },
                                {
                                    name: 'คะแนน',
                                    value: data.score,
                                    inline: true
                                },
                                {
                                    name: 'จำนวนผู้ให้คะแนน',
                                    value: data.scoreStats,
                                    inline: true
                                },
                                {
                                    name: 'ลิงค์',
                                    value: data.url,
                                    inline: false
                                },
                            ]
                        }
                    ]
                })
            });
        }

        //bilibili-card
        else if (animeoption === 'bilibili-card') {
            const biliLink = interaction.options.get('value')?.value as string;

            let response: any = await fetch(`https://bilishare.tensormik.com/api/api?biliLink=${biliLink}`, {
                method: 'GET'
            });

            if (response.status === 200) {
                let responseData = await response.json(); // await added here
                response = null;
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
        }
    }
}