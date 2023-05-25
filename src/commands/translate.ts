import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import type client from '../index';
import type { CommandInteraction } from 'discord.js';
import { describe } from 'node:test';

const axios = require('axios');

export = {
  data: {
    name: "trns",
    description: "Translate your message",
    description_localizations: {
      'th': 'แปลภาษาของคุณ'
    },
    options: [
      {
        name: "channel",
        description: "translate all message to target channel",
        type: 1,
        options: [
          {
            "name": "main-channel",
            "description": "Select a main channel to get message to translate",
            "type": 7,
            "required": true
          },
          {
            "name": "target-channel",
            "description": "Select a target channel to send translated message",
            "type": 7,
            "required": true
          },
          {
            "name": "main-lang",
            "description": "Select a main language you use in main channel",
            "type": 3,
            "required": true,
            "choices": [
              {
                "name": "english",
                "value": "en"
              },
              {
                "name": "spanish",
                "value": "es"
              },
              {
                "name": "mandarin chinese",
                "value": "zh-CN"
              },
              {
                "name": "hindi",
                "value": "hi"
              },
              {
                "name": "arabic",
                "value": "ar"
              },
              {
                "name": "portuguese",
                "value": "pt"
              },
              {
                "name": "bengali",
                "value": "bn"
              },
              {
                "name": "russian",
                "value": "ru"
              },
              {
                "name": "japanese",
                "value": "ja"
              },
              {
                "name": "punjabi",
                "value": "pa"
              },
              {
                "name": "german",
                "value": "de"
              },
              {
                "name": "javanese",
                "value": "jv"
              },
              {
                "name": "korean",
                "value": "ko"
              },
              {
                "name": "french",
                "value": "fr"
              },
              {
                "name": "telugu",
                "value": "te"
              },
              {
                "name": "marathi",
                "value": "mr"
              },
              {
                "name": "turkish",
                "value": "tr"
              },
              {
                "name": "thai",
                "value": "th"
              },
              {
                "name": "tamil",
                "value": "ta"
              },
              {
                "name": "vietnamese",
                "value": "vi"
              },
              {
                "name": "urdu",
                "value": "ur"
              },
              {
                "name": "italian",
                "value": "it"
              },
              {
                "name": "gujarati",
                "value": "gu"
              },
              {
                "name": "polish",
                "value": "pl"
              },
              {
                "name": "ukrainian",
                "value": "uk"
              }
            ]
          },
          {
            "name": "target-lang",
            "description": "Select a target language you want to translate",
            "type": 3,
            "required": true,
            "choices": [
              {
                "name": "english",
                "value": "en"
              },
              {
                "name": "spanish",
                "value": "es"
              },
              {
                "name": "mandarin chinese",
                "value": "zh-CN"
              },
              {
                "name": "hindi",
                "value": "hi"
              },
              {
                "name": "arabic",
                "value": "ar"
              },
              {
                "name": "portuguese",
                "value": "pt"
              },
              {
                "name": "bengali",
                "value": "bn"
              },
              {
                "name": "russian",
                "value": "ru"
              },
              {
                "name": "japanese",
                "value": "ja"
              },
              {
                "name": "punjabi",
                "value": "pa"
              },
              {
                "name": "german",
                "value": "de"
              },
              {
                "name": "javanese",
                "value": "jv"
              },
              {
                "name": "korean",
                "value": "ko"
              },
              {
                "name": "french",
                "value": "fr"
              },
              {
                "name": "telugu",
                "value": "te"
              },
              {
                "name": "marathi",
                "value": "mr"
              },
              {
                "name": "turkish",
                "value": "tr"
              },
              {
                "name": "thai",
                "value": "th"
              },
              {
                "name": "tamil",
                "value": "ta"
              },
              {
                "name": "vietnamese",
                "value": "vi"
              },
              {
                "name": "urdu",
                "value": "ur"
              },
              {
                "name": "italian",
                "value": "it"
              },
              {
                "name": "gujarati",
                "value": "gu"
              },
              {
                "name": "polish",
                "value": "pl"
              },
              {
                "name": "ukrainian",
                "value": "uk"
              }
            ]

          },
        ]

      },
      {
        name: "cancel",
        description: "cancel target channel you set",
        type: 1,
        options: [
          {
            "name": "target-channel",
            "description": "Select target channel to cancel",
            "type": 7,
            required: true,
          },
        ]
      },
      {
        name: "message",
        description: "Translate your input message",
        type: 1,
        options: [
          {
            name: 'input',
            description: 'Enter your message',
            type: 3,
            required: true,
          },
          {
            name: 'target-lang',
            description: 'Enter your language you want',
            type: 3,
            required: true,
            choices: [
              {
                "name": "english",
                "value": "en"
              },
              {
                "name": "spanish",
                "value": "es"
              },
              {
                "name": "mandarin chinese",
                "value": "zh-CN"
              },
              {
                "name": "hindi",
                "value": "hi"
              },
              {
                "name": "arabic",
                "value": "ar"
              },
              {
                "name": "portuguese",
                "value": "pt"
              },
              {
                "name": "bengali",
                "value": "bn"
              },
              {
                "name": "russian",
                "value": "ru"
              },
              {
                "name": "japanese",
                "value": "ja"
              },
              {
                "name": "punjabi",
                "value": "pa"
              },
              {
                "name": "german",
                "value": "de"
              },
              {
                "name": "javanese",
                "value": "jv"
              },
              {
                "name": "korean",
                "value": "ko"
              },
              {
                "name": "french",
                "value": "fr"
              },
              {
                "name": "telugu",
                "value": "te"
              },
              {
                "name": "marathi",
                "value": "mr"
              },
              {
                "name": "turkish",
                "value": "tr"
              },
              {
                "name": "thai",
                "value": "th"
              },
              {
                "name": "tamil",
                "value": "ta"
              },
              {
                "name": "vietnamese",
                "value": "vi"
              },
              {
                "name": "urdu",
                "value": "ur"
              },
              {
                "name": "italian",
                "value": "it"
              },
              {
                "name": "gujarati",
                "value": "gu"
              },
              {
                "name": "polish",
                "value": "pl"
              },
              {
                "name": "ukrainian",
                "value": "uk"
              }
            ]
          },
          {
            name: 'attachment',
            description: 'Upload your attachment (Optional)',
            type: 11,
            required: false,
          },
        ]
      }
    ]
  },
  async execute(client: client, interaction: CommandInteraction) {
    if (!interaction.isCommand()) return; // Check if the interaction is a command
    //@ts-ignore
    const chanelOption = interaction?.options.getSubcommand(); // Get the channel subcommand name //channel
    //@ts-ignore
    const mainChannelOption = interaction?.options.getChannel('main-channel'); // Get the main-channel option value //main channel data
    //@ts-ignore
    const targetChannelOption = interaction?.options.getChannel('target-channel'); // Get the target-channel option value //target channel data
    const mainLangChoices = interaction.options.get('main-lang')?.value //ดึงค่าของ main-lang choices //en
    const targetLangChoices = interaction.options.get('target-lang')?.value //ดึงค่าของ target-lang choices //th

    const inputMessage = interaction.options.get('input')?.value //ดึงค่าของ input choices //message from user
    const targetLangMessage = interaction.options.get('target-lang')?.value // ดึงค่าของ target-lang ใน message // en
    try {
    //@ts-ignore
    var attachmentMessage = interaction.options.getAttachment('attachment').url
    //@ts-ignore
    } catch (e) {
      var attachmentMessage = ''
    }
    // console.log(mainLangChoices , targetLangChoices)

    if (chanelOption === 'channel') {
      if (!mainChannelOption || mainChannelOption.type !== 0) return interaction.reply({
        embeds: [
          {
            color: 0xFEED01,
            title: `***Error***`,
            description: `⚠️ **${mainChannelOption.name}** นี่ไม่ใช่ **Text Channel** นี่เจ้าคะ ⚠️

                        ⚠️ **${mainChannelOption.name}** is not **Text Channel** ⚠️`
          }
        ]
      })
      if (!targetChannelOption || targetChannelOption.type !== 0) return interaction.reply({
        embeds: [
          {
            color: 0xFEED01,
            title: `***Error***`,
            description: `⚠️ **${targetChannelOption.name}** นี่ไม่ใช่ **Text Channel** นี่เจ้าคะ ⚠️

                        ⚠️ **${targetChannelOption.name}** is not **Text Channel** ⚠️`
          }
        ]
      })
      //Insert regist translate channel
      try {
        //@ts-ignore
        await prisma.translateChannel.create({
          data: {
            guild: interaction.guildId ?? "",
            mainChannel: mainChannelOption.id ?? "",
            targetChannel: targetChannelOption.id ?? "",
            mainLanguage: mainLangChoices?.toString() ?? "",
            targetLanguage: targetLangChoices?.toString() ?? "",
          },
        })
      }
      catch (e) {
        return interaction.reply(
          {
            embeds: [
              {
                color: 0xFEED01,
                title: `***Error***`,
                description: `⚠️ Setup failed **${targetChannelOption.name}** is already set
                                
                                🪛 Please cancel translate channel in **${targetChannelOption.name}** before continue`
              }
            ]
          }
        )
      }
      return interaction.reply(
        {
          embeds: [
            {
              color: 0x0099ff,
              title: `🌐 ***Translate Channel Setup***`,
              description: `Setup translate channel from **${mainChannelOption.name} (${mainLangChoices})** to **${targetChannelOption.name} (${targetLangChoices})** Completed 🏳️‍🌈`
            }
          ]
        }
      )
    }
    else if (chanelOption === 'cancel') {
      if (!targetChannelOption || targetChannelOption.type !== 0) return interaction.reply({
        embeds: [
          {
            color: 0xE6ED20,
            title: `***Error***`,
            description: `⚠️ **${targetChannelOption.name}** นี่ไม่ใช่ **Text Channel** นี่เจ้าคะ ⚠️

                        ⚠️ **${targetChannelOption.name}** is not **Text Channel** ⚠️`
          }
        ]
      })
      //Delete target channel SQL
      try {
        //@ts-ignore
        await prisma.translateChannel.deleteMany({
          where: {
            targetChannel: targetChannelOption.id,
          }
        })
      } catch (e) {
        return interaction.reply(
          {
            embeds: [
              {
                color: 0xFEED01,
                title: `⭕️ ***Connection Error***`,
                description: `**Database** isn't response please try again later`
              }
            ]
          }
        )
      }
      return interaction.reply(
        {
          embeds: [
            {
              color: 0xFE0101,
              title: `⭕️ ***Translate Channel Cancelled***`,
              description: `Cancelled translate channel **${targetChannelOption.name}**`
            }
          ]
        }
      )
    }
    else if (chanelOption === 'message') {

      // Microsoft Translator API
      const options_microsoftTrAPI = {
        method: 'POST',
        url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
        params: {
          'to[0]': targetLangMessage,
          'api-version': '3.0',
          profanityAction: 'NoAction',
          textType: 'plain'
        },
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': process.env.X_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com'
        },
        data: [
          {
            Text: `${inputMessage}`
          }
        ]
      };

      try {
        const response_microsiftTR = await axios.request(options_microsoftTrAPI);
        const message_contentTR: string = response_microsiftTR.data[0].translations[0].text;
        if (inputMessage !== '') {
          interaction.reply({
            embeds: [
              {
                author: {
                  name: `${interaction.user.username}`,
                  icon_url: `${interaction.user.avatarURL()}`,
                },
                color: 0x0099ff,
                title: `**${message_contentTR}**`,
                image: {
                  url: attachmentMessage || '',
                },
                timestamp: new Date().toISOString(),
                footer: {
                  text: `Nanami Translate`
                }
              }
            ]
          });
        }
        else if (inputMessage === '') return;
      } catch (error) {
        console.error(error);
      }
    }
  }

}