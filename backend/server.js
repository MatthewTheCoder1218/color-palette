const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const port = process.env.PORT || 5000;

dotenv.config();

// Initialize the Generative AI client (outside the route handler)
let genAI;
let model;
try {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // Use environment variable for API key
  model = genAI.getGenerativeModel({ model: "gemini-pro" });
} catch (error) {
  console.error("Error initializing Generative AI:", error);
  process.exit(1);
}

async function generatePaletteFromPrompt(prompt) {
  try {
    if (!model) {
      throw new Error("Gemini model not initialized.");
    }

    const geminiPrompt = `Generate a 5 rhyming hex color palette based on the following description: "${prompt}" `;

    const result = await model.generateContent(geminiPrompt);
    const response = result.response;
    const geminiResponse = response.candidates[0].content.parts[0].text;
    console.log("Gemini Response:", geminiResponse);
    const hexCodes = extractHexCodes(geminiResponse);
    return hexCodes;
  } catch (error) {
    console.error("Error with Gemini API:", error);
    throw error;
  }
}

function extractHexCodes(text) {
  if (!text) return [];
  const regex = /#([0-9A-Fa-f]{6})\b/g;
  let match;
  const hexCodes = [];
  while ((match = regex.exec(text)) !== null) {
    hexCodes.push(match[0]);
  }
  return hexCodes;
}

app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const palette = await generatePaletteFromPrompt(prompt);
    if (palette.length === 0) {
      return res.status(400).json({
        error:
          "Could not extract any hex colors from Gemini's response. Please try a different prompt.",
      });
    } else if (palette.length > 0) {
      console.log(`Generated Palette: ${palette}`);
    }
    res.json(palette);
  } catch (error) {
    console.error("Error generating palette:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to generate palette." });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "An unexpected error occurred." });
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
