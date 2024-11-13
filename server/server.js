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

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const API_URL = 'http://localhost:3000';

app.post('/api/generate', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const formattedPrompt = `
      \\question \\textbf{\\Large ${question}} \\\\
      \\begin{solution}

      \\end{solution}
    `;

    const completionStream = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
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

            Packages already available:
           
            - \\usepackage{amssymb, latexsym, amsmath, forest, adjustbox}
            - \\usepackage[usenames, dvipsnames, svgnames, table]{xcolor}
            - \\usepackage{graphicx}

            Example format for responses:
            \\begin{solution}
            % Full, detailed solution content here
            \\end{solution}

            don't use these packages  - \\usepackage{algorithm} - \\usepackage{algpseudocode}
            Return only the content between \\begin{solution} and \\end{solution}. Avoid including any additional explanations outside of this block.
            The solution should be error free and properly formatted such that when it is placed inside the solution block it works properly
            user verbatim for code 
            When giving the answer 
            give the code and the output and time complexity and everything required if it's a code related question and explain in detail how every part works.
            Use mathematics and algorithms to solve . Don't assume anything.
            The answer should be atleast 3000 words.
            `
        },
        {
          role: "user",
          content: formattedPrompt
        },
      ],
      model: "llama3-70b-8192",
      // Additional options can be added here, like temperature, max_tokens, etc.
      stream: true,
    });

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
