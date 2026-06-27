const asyncHandler = require('express-async-handler');
const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key'
});

// @desc    Rank hospitals based on patient details using Claude
// @route   POST /api/ai/hospital-rank
// @access  Private/Driver
const rankHospitals = asyncHandler(async (req, res) => {
  const { patientDetails, hospitals } = req.body;
  
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.json({
      ranked: hospitals,
      reasoning: "Mock: Anthropic API Key missing. Returning unchanged list."
    });
  }

  try {
    const prompt = `You are a medical dispatch AI. Given these patient details: "${patientDetails}", rank the following hospitals from best to worst suited: ${JSON.stringify(hospitals)}. Return a JSON array of hospital names and a short reasoning string.`;
    
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }]
    });

    res.json({
      result: msg.content[0].text
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI ranking failed" });
  }
});

// @desc    Generate incident report
// @route   POST /api/ai/incident-report
// @access  Private
const generateReport = asyncHandler(async (req, res) => {
  const { logs } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.json({ report: "Mock Incident Report: API Key missing." });
  }

  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      messages: [{ role: "user", content: `Generate a concise traffic and medical incident report from these logs: ${JSON.stringify(logs)}` }]
    });

    res.json({ report: msg.content[0].text });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate report" });
  }
});

module.exports = { rankHospitals, generateReport };
