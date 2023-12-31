import { Command } from "@/structures/command";
import { DangerEmbed, SuccessEmbed } from "@/utils/embed";
import { updateGuild } from "@csmos/db";

export default new Command({
  name: "defaultvolume",
  description: "Update the default volume for a server.",
  aliases: ["default-volume"],
  usage: "defaultvolume <new volume percentage>",
  examples: [
    {
      example: "defaultvolume 50",
      description: "set the default volume to 50%",
    },
  ],
  run: async ({ message, args }) => {
    if (!args[0])
      return message.channel.send({
        embeds: [
          new DangerEmbed().setDescription(
            "The new default volume percentage must be specified."
          ),
        ],
      });

    const volume = parseInt(args[0]);
    if (isNaN(volume))
      return message.channel.send({
        embeds: [
          new DangerEmbed().setDescription(
            "The new default volume percentage must be a number."
          ),
        ],
      });
    if (volume <= 0)
      return message.channel.send({
        embeds: [
          new DangerEmbed().setDescription(
            "The new default volume percentage must be lower than 0%."
          ),
        ],
      });
    if (volume >= 150)
      return message.channel.send({
        embeds: [
          new DangerEmbed().setDescription(
            "The new default volume percentage must be lower than 150%."
          ),
        ],
      });

    await updateGuild(message.guild.id, {
      defaultVolume: volume,
    });

    message.channel.send({
      embeds: [
        new SuccessEmbed().setDescription(
          `Updated default volume to **${volume}%**.`
        ),
      ],
    });
  },
});
