import { createClient } from "redis";

const SCORES_KEY = "tis2_leaderboard";
const MAX_SCORES = 10;

let redis;
async function getRedis() {
  if (!redis) {
    redis = createClient({ url: process.env.REDIS_URL });
    redis.on("error", (err) => console.error("Redis error:", err));
    await redis.connect();
  }
  return redis;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const client = await getRedis();

    if (req.method === "GET") {
      const raw = await client.get(SCORES_KEY);
      const scores = raw ? JSON.parse(raw) : [];
      return res.status(200).json(scores);
    }

    if (req.method === "POST") {
      const { name, score } = req.body;

      if (
        typeof name !== "string" ||
        !name.trim() ||
        name.length > 30 ||
        typeof score !== "number" ||
        !Number.isFinite(score) ||
        score < 0 ||
        score > 1_000_000_000
      ) {
        return res.status(400).json({ error: "Invalid score data" });
      }

      const sanitizedName = name.trim().slice(0, 30);
      const raw = await client.get(SCORES_KEY);
      const scores = raw ? JSON.parse(raw) : [];

      scores.push({
        name: sanitizedName,
        score: Math.round(score),
        date: new Date().toLocaleDateString("he-IL"),
      });

      scores.sort((a, b) => b.score - a.score);
      const trimmed = scores.slice(0, MAX_SCORES);

      await client.set(SCORES_KEY, JSON.stringify(trimmed));
      return res.status(200).json(trimmed);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Scores API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
