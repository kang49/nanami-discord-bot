import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import type client from '../index';
import type { CommandInteraction, GuildMember } from 'discord.js';
const Discord = require('discord.js');

import { createCanvas, loadImage } from 'canvas';
const axios = require('axios');

export = {
    data: {
        name: "profile",
        description: "Create your profile card",
        description_localizations: {
            'th': 'สร้าง Profile Card ของคุณ'
        },
        options: [
            {
                name: "user",
                description: "Select user",
                type: 6,
                required: true,
            },
        ]
    },
    async execute(client: client, interaction: CommandInteraction) {
        if (!interaction.isCommand()) return // Check if the interaction is a command

        //@ts-ignore
        const userOption = interaction.options.get('user'); // Get the user option // user data

        interaction.reply({
            content: 'รอสักครู่นะคะ หนูกำลังทำให้อยู่ค่ะ 💕',
            ephemeral: true // หากต้องการให้ข้อความนี้เป็นเพียงแค่ข้อความแชทที่เท่ากับผู้ใช้เท่านั้นที่เห็น (ephemeral)
        }).then( async () => {

            if (!userOption) return; //Check if no user data
            
            // user info
            const guildId: string = interaction.guildId as string;
            const userId: string = userOption.user?.id as string
            const user_sql = await prisma.user.findFirst({
                where: {
                    guildId: guildId,
                    userId: userId,
                }
            })
            if (!user_sql) return interaction.followUp({ 
                embeds: [
                    {
                        color: 0xE6ED20,
                        title: `***Error***`,
                        description: `⚠️ ไม่พบข้อมูลของคุณใน Sever นี้เลยค่ะ ลองพูดคุยใน Server ก่อนนะคะ ⚠️`
                    }
                ],
                ephemeral: true,
            });
            //@ts-ignore
            let userAvatar: string = userOption.member?.displayAvatarURL({ size: 4096 })  as string;
            const guildName: string = user_sql.guildName as string;

            var userLevel: any = Math.floor(user_sql.guildMsgCount as number / 10)
            if (userLevel >= 100) {
                var userLevel: any = 'MAX' as string;
            }

            const userName: string = user_sql.userName as string;
            let userTag: string = `#${user_sql.userTag}` as string;
            if (userTag === '#0') {userTag = ''};
            const userFullName: string = `${userName}${userTag}`
            const userFlags = userOption.user?.flags;

            //@ts-ignore
            const userJoinDate = userOption.member?.joinedTimestamp;
            const joinDate = new Date(userJoinDate??'');
            const userCreateDate = userOption.user?.createdTimestamp;
            const createDate = new Date(userCreateDate??'')
            const userFormattedJoinDate = joinDate.toLocaleDateString('en-GB'); // 'dd/mm/yyyy' format
            const userFormattedCreareDate = createDate.toLocaleDateString('en-GB'); // 'dd/mm/yyyy' format
            
            const guildMember = await interaction.guild?.members.fetch(userId);
            const userRoles = guildMember?.roles.cache;
            const sortedRoles = userRoles?.sort((a, b) => b.rawPosition - a.rawPosition);
            let roleNameList: string[] = [];
            sortedRoles?.forEach((role) => {
                roleNameList.push(role.name);
            });
            
            //get png avatar
            userAvatar = userAvatar.replace('.webp', '.png');
            
            //Check UserBanner for check user has Nitro
            axios.get(`https://discord.com/api/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bot ${client.token}`
                    }
                }
            ).then((res:any) => {
                const {banner} = res.data;

                //Create Canvas
                const canvas = createCanvas(800, 600);
                const ctx = canvas.getContext('2d');

                //Load Image
                loadImage('assets/img/ProfileCard.png').then ( async (image) => {
                    //Set canvas size
                    canvas.width = image.width;
                    canvas.height= image.height;

                    //Draw Image
                    ctx.drawImage(image, 0, 0);

                    //Set text color and font
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.font = 'bold 40px Arial';
                    // Draw text at the centered position
                    ctx.fillText(userFullName, 280, 130);

                    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                    ctx.font = 'bold 28.5px Arial';
                    ctx.fillText(roleNameList[0], 280, 160);

                    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                    ctx.font = 'bold 30px Arial';
                    var TextWidth = ctx.measureText(guildName).width;
                    // Calculate X position for centering text
                    var centerX = (canvas.width - TextWidth) / 2;
                    ctx.fillText(guildName, centerX-150, 290);

                    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                    ctx.font = 'bold 30px Arial';
                    var TextWidth = ctx.measureText(`ID: ${userId}`).width;
                    // Calculate X position for centering text
                    var centerX = (canvas.width - TextWidth) / 2;
                    ctx.fillText(`ID: ${userId}`, centerX-170, 350);

                    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                    ctx.font = 'bold 30px Arial';
                    var TextWidth = ctx.measureText(`Join: ${userFormattedJoinDate}`).width;
                    // Calculate X position for centering text
                    var centerX = (canvas.width - TextWidth) / 2;
                    ctx.fillText(`Join: ${userFormattedJoinDate}`, centerX-145, 410);

                    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                    ctx.font = 'bold 30px Arial';
                    var TextWidth = ctx.measureText(`Create: ${userFormattedCreareDate}`).width;
                    // Calculate X position for centering text
                    var centerX = (canvas.width - TextWidth) / 2;
                    ctx.fillText(`Create: ${userFormattedCreareDate}`, centerX-250, 470);

                    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                    ctx.font = 'bold 50px Arial';
                    var TextWidth = ctx.measureText(`Level`).width;
                    // Calculate X position for centering text
                    var centerX = (canvas.width - TextWidth) / 2;
                    ctx.fillText(`Level`, centerX+295, 370);

                    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                    ctx.font = 'bold 100px Arial';
                    var TextWidth = ctx.measureText(userLevel).width;
                    // Calculate X position for centering text
                    var centerX = (canvas.width - TextWidth) / 2;
                    ctx.fillText(userLevel, centerX+295, 470);


                    // Badge drawer
                    if (userFlags?.has('ActiveDeveloper')) {
                        //Badge
                        // Load image
                        const badgeImage = await loadImage('assets/img/active_developer_icon.png');
                        
                        // Calculate avatar position and radius
                        const badgeSize = 250;
                        const badgeX = 650;
                        const badgeY = -10;

                        // Draw avatar image within the clipping path
                        ctx.drawImage(badgeImage, badgeX, badgeY, badgeSize, badgeSize);
                    } else if (userFlags?.has('PremiumEarlySupporter') || (banner)) {
                        //Badge
                        // Load image
                        const badgeImage = await loadImage('assets/img/nitro_icon.png');
                        
                        // Calculate avatar position and radius
                        const badgeSize = 250;
                        const badgeX = 650;
                        const badgeY = -10;
                        
                        // Draw avatar image within the clipping path
                        ctx.drawImage(badgeImage, badgeX, badgeY, badgeSize, badgeSize);
                    } else if (userOption.user?.bot) {
                        //Badge
                        // Load image
                        const badgeImage = await loadImage('assets/img/bot_icon.png');
                        
                        // Calculate avatar position and radius
                        const badgeSize = 200;
                        const badgeX = 670;
                        const badgeY = 0;

                        // Draw avatar image within the clipping path
                        ctx.drawImage(badgeImage, badgeX, badgeY, badgeSize, badgeSize);
                    }

                    
                    // Load avatar image
                    const avatar = await loadImage(userAvatar);
                    
                    // Calculate avatar position and radius
                    const avatarSize = 202;
                    const avatarX = 44;
                    const avatarY = 32;
                    const radius = avatarSize / 2;

                    // Create clipping path for the circle
                    ctx.beginPath();
                    ctx.arc(avatarX + radius, avatarY + radius, radius, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.clip();

                    // Draw avatar image within the clipping path
                    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

                    // Save image
                    const profileCardBuffer = canvas.toBuffer();
                    // fs.writeFileSync('assets/test.png', profileCardBuffer);

                    //Send
                    const attachment = new Discord.AttachmentBuilder(profileCardBuffer, { name: 'ProfileCard.png' });

                    interaction.followUp({
                        content: `**${userFullName}** ได้สร้าง **Profile Card** ของ **${guildName} Server**`,
                        files: [attachment],
                    })
                });
            });
        });
    }
};