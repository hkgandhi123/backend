import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ TEXT moderation (username, bio, caption, post text)
export const moderateText = async (req, res, next) => {
  try {
    const { username, bio, caption, text } = req.body;

    const content = username || bio || caption || text;
    if (!content) return next();

    const response = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: content,
    });

    const flagged = response.results[0].flagged;

    if (flagged) {
      return res.status(400).json({
        error: "❌ Offensive, nude, sexual, violent, or harmful text is not allowed.",
      });
    }

    return next();
  } catch (err) {
    console.error("Text moderation error:", err.message);
    return res.status(500).json({ error: "Moderation system error" });
  }
};

// ✅ IMAGE moderation (profile, post, story)
export const moderateImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const imageBuffer = req.file.buffer;
    if (!imageBuffer) return next();

    const response = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: [
        {
          image: imageBuffer.toString("base64"),
        },
      ],
    });

    const flagged = response.results[0].flagged;

    if (flagged) {
      return res.status(400).json({
        error: "❌ Nude / sexual / violent images are not allowed.",
      });
    }

    return next();
  } catch (err) {
    console.error("Image moderation error:", err.message);
    return res.status(500).json({ error: "Image moderation failed" });
  }
};
