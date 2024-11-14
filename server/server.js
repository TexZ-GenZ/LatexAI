// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Groq = require('groq-sdk');

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://latex-ai.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(null, false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());

const apiKeys = [
  process.env.GROQ_API_KEY1, // Your first API key
  process.env.GROQ_API_KEY2,  // Your second API key
  process.env.GROQ_API_KEY3,
];

let currentKeyIndex = 0;

function getNextApiKey() {
  const apiKey = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return apiKey;
}

async function requestWithRetry(apiCallFunction, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await apiCallFunction();
    } catch (error) {
      if (error?.code === 'rate_limit_exceeded') {
        console.error(`Rate limit hit, retrying in ${delay}ms (Attempt ${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
  throw new Error('Failed after max retries');
}

app.post('/api/generate', async (req, res) => {
  const { question, seed } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  if (!seed) {
    return res.status(400).json({ error: 'Seed is required' });
  }

  try {
    const apiKey = getNextApiKey();
    const groq = new Groq({ apiKey });

    const formattedPrompt = `
      \\question \\textbf{\\Large ${question}} \\\\
      \\begin{solution}
      \\end{solution}
    `;

    const promptWithSeed = `
      Generate the solution content only for the LaTeX \\begin{solution} and \\end{solution} block. Write the solution elaborately in LaTeX format using Design and Analysis of Algorithms knowledge. Use correct terminology and provide detailed, structured answers.

      Ensure:
      
      - The output should be directly copy-pasteable into the given LaTeX template without compile errors.
      - Specify additional packages if required at the top of the solution.
      - Avoid errors such as:
        - "Undefined control sequence"
        - "Not in outer par mode"
        - "Missing number, treated as zero"
      - Check for misplaced braces and ensure proper nesting.
      - Ensure consistency and detailed explanations that are easy to read.
      - The code should be indented and formatted properly to avoid underfull or overfull boxes.
      
      Seed: ${seed} - Use this to maintain a consistent style for this session.

      Packages already available:
     
      - \\usepackage{amssymb, latexsym, amsmath, forest, adjustbox}
      - \\usepackage[usenames, dvipsnames, svgnames, table]{xcolor}
      - \\usepackage{graphicx,listings}

      Example format for responses:
      \\begin{solution}
      % Full, detailed solution content here
      \\end{solution}

      don't use these packages - \\usepackage{algorithm} - \\usepackage{algpseudocode}
      Return only the content between \\begin{solution} and \\end{solution}. Avoid including any additional explanations outside of this block.
      The solution should be error free and properly formatted such that when it is placed inside the solution block it works properly.
      Use \\verb for code and provide explanations and outputs as needed.
      Ensure:
      - The response aligns with the seed style to maintain consistency across answers within this session.
      - Answers are detailed, correctly formatted, and align with the mathematical depth required.
      - If it's an Design analysis and algorithm question then include the time complexity analysis mathematically step by step, don't write the time complexity directly.
      - If you want to make code examples then use the pseudocode terminologies instead of normal programming languages.
      - The answer should be at least 2000 words .
      - Before giving the answer humanize the solution such that it's written by a college student in his assignment. Don't use cool or unprofessional language, humanize it but use professional languages students will use in their solution, and every way of writing and formulating
      the sentence will depend on the seed, every seed will write differently.
      - If it's an algorithm question give the pseudocode in code terminology.
      - Avoid 
    `;

    const completionStream = await requestWithRetry(() => groq.chat.completions.create({
      messages: [
        { role: "system", content: promptWithSeed },
        { role: "user", content: formattedPrompt }
      ],
      model: "llama3-70b-8192",
      stream: true
    }));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    for await (const chunk of completionStream) {
      const solutionPart = chunk.choices[0]?.delta?.content || '';
      if (solutionPart) {
        res.write(solutionPart);
      }
    }
    res.end();
  } catch (error) {
    console.error('Error generating solution:', error);
    res.status(500).json({ error: 'Failed to generate solution' });
  }
});

const PORT = process.env.PORT || 3000;

app.get("/api/health", (req, res) => res.json({ status: 'ok' }));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
