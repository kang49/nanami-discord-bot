import client from '../index';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import fs from 'fs';
const Discord = require('discord.js');
import { ChannelType } from 'discord.js';

import { createCanvas, loadImage } from 'canvas';

export = (client: client) => {
    client.on('guildMemberAdd', async (member) => {
        const guild_sql = await prisma.guild.findFirst({
            where: {
                guild_id: member.guild.id,
                welcomeMsg: true
            }
        });
        if (!guild_sql?.inout) return;

        const displayName: string = member.user.username;
        let discriminator: string = `#${ member.user.discriminator}`
        const memberCount = member.guild.memberCount;
        let userAvatar = member.user.displayAvatarURL()?? ''
        const userFlags = member.user.flags;

        const _guildId = await client.guilds.fetch(`${guild_sql?.guild_id}`)
        const _welcomeChannelId = await _guildId.channels.fetch(`${guild_sql?.welcome_log_id}`)
        if (!_welcomeChannelId) return;
        if (_welcomeChannelId.type !== ChannelType.GuildText) return;

        //get png avatar
        userAvatar = userAvatar.replace('.webp', '.png');

        // Text to be centered
        if (discriminator === '#0') {discriminator = ''};
        const displayName_prepare = `${displayName}${discriminator}`;

        
        // Create canvas
        const canvas = createCanvas(800, 600);
        const ctx = canvas.getContext('2d');

        // Load image
        loadImage('assets/img/nanamiWelcome.png').then ( async (image) => {
            // Set canvas size
            canvas.width = image.width;
            canvas.height = image.height;

            // Draw image
            ctx.drawImage(image, 0, 0);

            // Set text color and font
            ctx.fillStyle = '#3a9ff4';
            ctx.font = 'bold 50px Arial';
            // Draw text at the centered position
            ctx.fillText(displayName_prepare, 310, 180);


            const memberCount_prepare = `เข้ามาเป็นคนที่: ${memberCount}`;
            ctx.fillStyle = '#3a9ff4';
            ctx.font = 'bold 25px Arial';
            // Draw text at the centered position
            ctx.fillText(memberCount_prepare, 310, 220);

            if (userFlags?.has('ActiveDeveloper')) {
                //Badge
                // Load image
                const badgeImage = await loadImage('assets/img/active_developer_icon.png');
                
                // Calculate avatar position and radius
                const badgeSize = 100;
                const badgeX = 750;
                const badgeY = 220;

                // Draw avatar image within the clipping path
                ctx.drawImage(badgeImage, badgeX, badgeY, badgeSize, badgeSize);

                ctx.fillStyle = 'white';
                ctx.font = 'bold 25px Arial';
                // Draw text at the centered position
                ctx.fillText(`Discord Developer`, 520, 278);
            } else if (userFlags?.has('PremiumEarlySupporter')) {
                //Badge
                // Load image
                const badgeImage = await loadImage('assets/img/nitro_icon.png');
                
                // Calculate avatar position and radius
                const badgeSize = 100;
                const badgeX = 750;
                const badgeY = 220;

                // Draw avatar image within the clipping path
                ctx.drawImage(badgeImage, badgeX, badgeY, badgeSize, badgeSize);

                ctx.fillStyle = 'white';
                ctx.font = 'bold 25px Arial';
                // Draw text at the centered position
                ctx.fillText(`Nitro Supporter`, 550, 278);
            } else if (member.user.bot) {
                //Badge
                // Load image
                const badgeImage = await loadImage('assets/img/bot_icon.png');
                
                // Calculate avatar position and radius
                const badgeSize = 60;
                const badgeX = 780;
                const badgeY = 237;

                // Draw avatar image within the clipping path
                ctx.drawImage(badgeImage, badgeX, badgeY, badgeSize, badgeSize);

                ctx.fillStyle = 'white';
                ctx.font = 'bold 25px Arial';
                // Draw text at the centered position
                ctx.fillText(`Discord`, 670, 278);
            }

            //Avatar
            // Load avatar image
            const avatar = await loadImage(userAvatar);
            
            // Calculate avatar position and radius
            const avatarSize = 220;
            const avatarX = 70;
            const avatarY = 47;
            const radius = avatarSize / 2;

            // Create clipping path for the circle
            ctx.beginPath();
            ctx.arc(avatarX + radius, avatarY + radius, radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            // Draw avatar image within the clipping path
            ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

            // const userRank_TextWidth = ctx.measureText(displayName_prepare).width;
            // Calculate X position for centering text
            // const centerX = (canvas.width - displayName_canvas) / 2;

            // Save image
            const welcomeBuffer = canvas.toBuffer();
            // fs.writeFileSync('assets/welcomeMsg.png', welcomeBuffer);

            //Send
            const attachment = new Discord.AttachmentBuilder(welcomeBuffer, { name: 'welcomeMsg.png' });

            _welcomeChannelId?.send({
                embeds: [
                    {
                        color: 0x0099ff,
                        title: `ยินดีต้อนรับเข้าสู่ ***${member.guild?.name}*** นะคะ`,
                        description: `คุณ **${displayName_prepare}** ได้เข้าสู่ Server!!`,
                        image: {
                            url: `attachment://welcomeMsg.png`
                        },
                        footer: {
                            text: `Nanami Welcome`
                        },
                        timestamp: new Date().toISOString(),
                    }
                ],
                files: [attachment],
            })
        });
    });
}