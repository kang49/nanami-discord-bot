import type client from '../index'

export = {
    data: {
        name: 'ping',
        description: 'this is a ping command~!'
    },
    async execute(client: client, interaction: any) {
        await interaction.reply({ content: `${client.ws.ping}ms` });
    }
}