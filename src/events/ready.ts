import { Events } from 'discord.js';
import type client from '../index';
import { PrismaClient } from '@prisma/client';
import { TextChannel } from 'discord.js';
const prisma = new PrismaClient();

const statusList = [
    { name: 'เค้าชื่อนานามินะ 💕' },
    { name: 'เธอว่างเล่นกับเค้ามั้ยคะ?' },
    { name: 'เธอทำไรอยู่เหรอ?' },
    { name: 'ไอต้าวบ้าา 💓' },
    { name: 'ขอกอดเธอได้ไหมคะ 🥺' },
    { name: 'คืนนี้อย่าลืมฝันถึงเค้าบ้างนะ 💤' },
    { name: 'ใครจะน่ารักเท่าเธอ 💕' },
    { name: 'ตั้งใจเรียนนะคะเธอ 📚' },
    { name: 'วันนี้เหนื่อยไหมคะ?' },
    // Add more status messages as needed
];

export = (client: client) => {
    let currentStatusIndex = 0;

    function updateStatus() {
        const status = statusList[currentStatusIndex];
        client.user?.setPresence({
            activities: [status]
        });
        currentStatusIndex = (currentStatusIndex + 1) % statusList.length;
    }

    client.once("ready", c => {
        updateStatus();
        setInterval(updateStatus, 5000); // Update status every 5sec 

        console.log(`Ready! Logged in as ${c.user.tag}`);
        client.guilds.cache.forEach(async (guild) => {
            try {
                guild.commands.cache.forEach(command => guild.commands.delete(command.id));
                guild.commands?.set(client.commandArray);
            } catch (e) {
                console.log(e);
            }
        });
    });

    client.on("guildCreate", c => {
        client.guilds.cache.forEach(async (guild) => {
            try {
                guild.commands.cache.forEach(command => guild.commands.delete(command.id));
                guild.commands?.set(client.commandArray);
            } catch (error) {
                return;
            }
        });
    });


    //Functions
    client.once('ready', async () => {
        setInterval(async () => {
          // Anime Daily Image Send
          const animeGirlImage_sql = await prisma.attachment.findFirst({
            where: {
              animeGirlImage_Check: false,
            }
          });
      
          if (!animeGirlImage_sql) return;
      
          const animeGirlImageUrl = animeGirlImage_sql.animeGirlImage ?? '';
      
          const guild_sql = await prisma.guild.findMany({
            where: {
              animeGirlDaily: true,
            }
          });
      
          for (let i = 0; i < guild_sql.length; i++) {
            const animeGirlImage_channel_sql = guild_sql[i].animeGirlDaily_log_id ?? '';
            const animeGirlImage_channel = client.channels.cache.get(animeGirlImage_channel_sql) as TextChannel | null;
      
            if (!animeGirlImage_channel) {
              console.error('Main channel not found.');
              return;
            }
      
            animeGirlImage_channel.send(animeGirlImageUrl);
          }
      
          await prisma.attachment.update({
            where: {
              animeGirlImage: animeGirlImageUrl,
            },
            data: {
              animeGirlImage_Check: true,
            }
          });
        }, 10 * 60 * 60 * 1000); // ทำงานทุกๆ 10 ชั่วโมง
      });        
}