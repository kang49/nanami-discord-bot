import { SlashCommandBuilder } from "@discordjs/builders"
import discord from 'discord.js'

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping").setDescription("this is a ping command~!"),
    async execute(client:any, interaction:any) {
        await interaction.reply({ content: 'this is a pingpong!' });
    }
}