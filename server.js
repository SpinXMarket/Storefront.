require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*" }));
app.use(express.json());

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

function newOrderId() {
  return "SPX-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/reviews", async (_req, res) => {
  try {
    const channel = await client.channels.fetch(process.env.REVIEWS_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) return res.status(500).json([]);
    const messages = await channel.messages.fetch({ limit: 100 });
    const reviews = [];

    for (const message of messages.values()) {
      const embed = message.embeds[0];
      if (!embed) continue;

      const fields = Object.fromEntries((embed.fields || [])
        .map(f => [f.name.toLowerCase().trim(), f.value]));

      const ratingRaw = fields["rating"] || fields["stars"] || "";
      const product = fields["product"] || fields["product purchased"] || "";
      const comment =
        fields["review"] || fields["comment"] || fields["review/comment"] ||
        embed.description || "";

      const ratingMatch = String(ratingRaw).match(/[1-5]/);
      if (!product && !comment) continue;

      reviews.push({
        username: message.author.username,
        rating: ratingMatch ? Number(ratingMatch[0]) : 5,
        product,
        comment,
        createdAt: message.createdAt
      });
    }

    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(reviews.slice(0, 50));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load reviews." });
  }
});

app.post("/orders", async (req, res) => {
  const { productId, productName, price, discordUsername, paymentMethod } = req.body || {};

  if (!productId || !productName || !discordUsername || !paymentMethod) {
    return res.status(400).json({ message: "Missing required order information." });
  }

  const orderId = newOrderId();

  try {
    const channel = await client.channels.fetch(process.env.ORDERS_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) throw new Error("Orders channel unavailable");

    const embed = new EmbedBuilder()
      .setTitle("🛒 New SpinX Website Order")
      .setColor(0x8b5cf6)
      .addFields(
        { name: "Order", value: orderId, inline: true },
        { name: "Product", value: productName, inline: true },
        { name: "Price", value: `$${Number(price).toFixed(2)}`, inline: true },
        { name: "Discord", value: discordUsername, inline: true },
        { name: "Payment", value: paymentMethod, inline: true },
        { name: "Status", value: "Pending", inline: true }
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    res.status(201).json({
      orderId,
      message: `Order ${orderId} created. Please follow the SpinX payment instructions.`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Order was not created. Please contact SpinX support." });
  }
});

client.once("ready", () => {
  console.log(`SpinX API connected as ${client.user.tag}`);
  app.listen(process.env.PORT || 3000, () => {
    console.log(`SpinX API listening on port ${process.env.PORT || 3000}`);
  });
});

client.login(process.env.DISCORD_BOT_TOKEN);
