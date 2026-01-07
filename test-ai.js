require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function startAI() {
  try {
    // Switching to a highly available preview model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview" });
    
    console.log("Waiting for rate limit reset... (Checking Gemini 2.0)...");
    
    const prompt = "Say: 'AI Connection Successful!'";

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("------------------------------------");
    console.log("SUCCESS! RESPONSE FROM AI:");
    console.log(text);
    console.log("------------------------------------");
  } catch (error) {
    if (error.message.includes("429")) {
        console.log("Still rate-limited. Please wait 2 more minutes before trying again.");
    } else {
        console.log("Error:", error.message);
    }
  }
}

startAI();