import type client from '../index'
const Discord = require(`discord.js`)
const os = require('os');
const pm2 = require('pm2');

import type { CommandInteraction } from 'discord.js';

export = {
    data: {
        name: 'status',
        description: 'check server status info'
    },
    async execute(client: client, interaction: CommandInteraction) {
        let seconds = Math.floor(interaction.client.uptime / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);

        seconds %= 60;
        minutes %= 60;
        hours %= 24;

        pm2.connect(function(err: string) {
            if (err) {
                console.error(err);
                process.exit(2);
            }
            
            pm2.describe('nanami-bot', function(err: string, description: any) {
                if (err) {
                    console.error(err);
                    pm2.disconnect();
                    return;
                }
                
                if (!description[0]) {
                    console.error('Process nanami-bot not found.');
                    pm2.disconnect();
                    return;
                }
                
                const nanamiBotProcess = description[0];
                
                interaction.reply({
                    embeds: [
                        {
                            color: 0x0099ff,
                            author: {
                                name: 'ข้อมูลสถานะเซิร์ฟเวอร์ Nanami Bot',
                                icon_url: 'https://img.icons8.com/color/96/000000/document--v2.png'
                            },
                            thumbnail: {
                                url: `https://img5.pic.in.th/file/secure-sv1/nanami_study.png`,
                            },
                            fields: [
                                {
                                    name: '🟢 **Node**',
                                    value: `\`${os.hostname}\``,
                                    inline: true
                                },
                                {
                                    name: '🌐 **ใช้ใน**',
                                    value: `\`${client.guilds.cache.size} Servers\``,
                                    inline: true
                                },
                                {
                                    name: '↕ **Ping**',
                                    value: `\`${client.ws.ping}ms\``,
                                    inline: false
                                },
                                {
                                    name: '💠 **หน่วยประมวลผล**',
                                    value: `\`${os.cpus().map((i: any) => `${i.model}`)[0]}\``,
                                    inline: true
                                },
                                {
                                    name: '⌘ **สถาปัตยกรรม**',
                                    value: `\`${os.machine()}\``,
                                    inline: true
                                },
                                {
                                    name: '🄾🆂 **ระบบปฏิบัติการ**',
                                    value: `\`${os.platform()}\``,
                                    inline: true
                                },
                                {
                                    name: '📈 **CPU Usage**',
                                    value: `\`${nanamiBotProcess.monit.cpu}%\``,
                                    inline: true
                                },
                                {
                                    name: '📏 **RAM Usage**',
                                    value: `\`${(nanamiBotProcess.monit.memory / (1024 * 1024)).toFixed(2)}MB\``,
                                    inline: true
                                },
                                {
                                    name: '🔄 **Error Restart**',
                                    value: `\`${nanamiBotProcess.pm2_env.restart_time}\``,
                                    inline: true
                                },
                                {
                                    name: '🟢 **UpTime**',
                                    value: `\`${days} วัน, ${hours} ชั่วโมง, ${minutes} นาที\``,
                                    inline: true
                                },
                                {
                                    name: '📚 **Discord.js**',
                                    value: `\`${Discord.version}\``,
                                    inline: true
                                },
                                {
                                    name: '💕 **ระดับความน่ารัก**',
                                    value: `\`MAX\``,
                                    inline: true
                                },
                            ],
                            timestamp: new Date().toISOString(),
                            footer: {
                                text: `Nanami Status`
                            }
                        }
                    ]
                });
                
                pm2.disconnect();
            });
        });
    }
}
