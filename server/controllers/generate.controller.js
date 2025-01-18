// const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const generateResponse = async (req, res) => {
  const { prompt } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  console.log(result);
  res.status(200).json(result);
};

module.exports = { generateResponse };
