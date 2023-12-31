import { Command } from "@/structures/command";
import { DangerEmbed, SuccessEmbed } from "@/utils/embed";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default new Command({
  name: "volume",
  description: "Change the volume of the current song.",
  usage: "volume <new volume percentage>",
  examples: [
    {
      example: "volume 50",
      description: "set the volume to 50%",
    },
  ],
  run: ({ client, message, args }) => {
    const { channel } = message.member.voice;
    const me = message.guild.members.me!;

    if (!channel)
      return message.channel.send({
        embeds: [
          new DangerEmbed().setDescription(
            "You need to be in a voice channel."
          ),
        ],
      });
    if (me.voice.channel && me.voice.channel.id !== channel.id)
      return message.channel.send({
        embeds: [
          new DangerEmbed().setDescription("I am in another voice channel."),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Link)
              .setLabel("Show me!")
              .setURL(
                `https://discord.com/channels/${message.guild.id}/${me.voice.channel.id}`
              )
          ),
        ],
      });
    if (!channel.members.has(me.id) && channel.userLimit !== 0 && channel.full)
      return message.channel.send({
        embeds: [
          new DangerEmbed().setDescription("Your voice channel is full."),
        ],
      });
    if (!channel.permissionsFor(me).has("Connect"))
      return message.channel.send({
        embeds: [
          new DangerEmbed().setDescription(
            "I do not have permission to connect to your voice channel."
          ),
        ],
      });
    if (!channel.permissionsFor(me).has("Speak"))
      return message.channel.send({
        embeds: [
          new DangerEmbed().setDescription(
            "I do not have permission to speak to your voice channel."
          ),
        ],
      });

    const queue = client.player.getQueue(message.guild.id);
    if (!queue || !queue.songs || queue.songs.length === 0)
      return message.channel.send({
        embeds: [
          new DangerEmbed().setDescription(
            "No music is being played in this server."
          ),
        ],
      });

    if (!args[0])
      return message.channel.send({
        embeds: [
          new DangerEmbed().setDescription(
            "The new volume percentage must be specified."
          ),
        ],
      });

    const volume = parseInt(args[0]);
    if (isNaN(volume))
      return message.channel.send({
        embeds: [
          new DangerEmbed().setDescription(
            "The new volume percentage must be a number."
          ),
        ],
      });
    if (volume <= 0)
      return message.channel.send({
        embeds: [
          new DangerEmbed().setDescription(
            "The new volume percentage must be lower than 0%."
          ),
        ],
      });
    if (volume >= 150)
      return message.channel.send({
        embeds: [
          new DangerEmbed().setDescription(
            "The new volume percentage must be lower than 150%."
          ),
        ],
      });

    queue.setVolume(volume);

    message.channel.send({
      embeds: [
        new SuccessEmbed().setDescription(`Updated volume to **${volume}%**.`),
      ],
    });
  },
});
