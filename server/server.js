// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Groq = require('groq-sdk');

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://latex-ai.vercel.app/'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Route to handle solution generation
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

    const completion = await groq.chat.completions.create({
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
            The answer should be atleast 1500 words.
            `
        },
        {
          role: "user",
          content: formattedPrompt
        },
      ],
      model: "llama3-70b-8192",
    });
    

    const solutionContent = completion.choices[0]?.message?.content.trim() || '';

    res.json({
      question,
      solution: `${solutionContent}`
      
    });
  } catch (error) {
    console.error('Error generating solution:', error);
    res.status(500).json({ error: 'Failed to generate solution' });
  }
});

const PORT = process.env.PORT || 3000;

app.get("/api/health", (req, res) => res.json({ status: 'ok' }));

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express API
module.exports = app;