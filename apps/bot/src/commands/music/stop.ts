import { Command } from "@/structures/command";
import { DangerEmbed, SuccessEmbed } from "@/utils/embed";
import { getGuild, updateGuild } from "@csmos/db";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default new Command({
  name: "stop",
  description: "Stop the queue in this server.",
  examples: [
    {
      description: "stop the queue",
    },
  ],
  run: async ({ client, message }) => {
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

    const guild = await getGuild(message.guild.id);
    if (guild && guild.nowPlayingMessage)
      queue
        .textChannel!.messages.fetch(guild.nowPlayingMessage)
        .then(async (msg) => {
          msg.edit({
            embeds: [
              new DangerEmbed()
                .setTitle("❌ Stopped")
                .setDescription(
                  `The queue was stopped by **${message.author.username}**.`
                ),
            ],
            components: [],
          });
          await updateGuild(message.guild.id, {
            nowPlayingMessage: null,
          });
        })
        .catch(() => null);
    await queue.stop();

    message.channel.send({
      embeds: [new SuccessEmbed().setDescription("Stopped the queue.")],
    });
  },
});
