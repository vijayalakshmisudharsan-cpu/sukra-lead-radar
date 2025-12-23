import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { platform = "unknown", author = "unknown", text = "", link = "" } = req.body || {};

  // Simple scoring (MVP)
  const t = (text || "").toLowerCase();
  let confidence = 0;
  if (t.includes("need") || t.includes("looking for") || t.includes("recommend")) confidence += 0.4;
  if (t.includes("app") || t.includes("website") || t.includes("developer") || t.includes("software")) confidence += 0.4;
  if (t.includes("budget") || t.includes("quote") || t.includes("hire")) confidence += 0.2;

  const category =
    t.includes("app") ? "Mobile App" :
    t.includes("website") ? "Website" :
    t.includes("ui") || t.includes("ux") ? "UI/UX" :
    t.includes("iot") ? "IoT" :
    t.includes("ai") ? "AI" :
    "Software";

  const { error } = await supabase.from("leads").insert([{
    platform, author, text, link, confidence, category
  }]);

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ status: "Lead captured", confidence, category });
}
