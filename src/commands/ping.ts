import { SlashCommandBuilder } from "@discordjs/builders"

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping").setDescription("this is a ping command~!"),
    async execute(client:any, interaction:any) {
        await interaction.reply({ content: `${client.ws.ping}ms` });
    }
}