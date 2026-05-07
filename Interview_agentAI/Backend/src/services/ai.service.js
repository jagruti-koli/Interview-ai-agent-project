const axios = require("axios");
const { z } = require("zod");
const puppeteer = require("puppeteer");


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e.")
    })).describe("List of skill gaps in the candidate's profile algon with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g data structure, system design, mock interviews etc"),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plane, e.g. read specific book or roadmap"),
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job position applied for, e.g. Senior Frontend Engineer")
})

/**
 * Generate Interview Report (AI)
 */
async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    try {
        const prompt = `
You MUST return ONLY valid JSON.

{
  "matchScore": 80,
  "technicalQuestions": [
    { "question": "string", "intention": "string", "answer": "string" }
  ],
  "behavioralQuestions": [
    { "question": "string", "intention": "string", "answer": "string" }
  ],
  "skillGaps": [
    { "skill": "string", "severity": "low" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "string", "tasks": ["task"] }
  ],
  "title": "MERN Developer"
}

Candidate:
Resume: ${resume}
Self: ${selfDescription}
Job: ${jobDescription}
`;

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        let text = response.data.choices[0].message.content;

        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            return JSON.parse(text);
        } catch (err) {
            console.log("❌ JSON PARSE FAILED:", text);
            return null;
        }

    } catch (error) {
        console.log("❌ AI ERROR:", error.response?.data || error.message);
        return null;
    }
}

/**
 * Convert HTML → PDF
 */
async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();
    return pdfBuffer;
}

/**
 * Generate Resume PDF via AI
 */
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    try {
        const prompt = `
You are a senior resume writer and professional UI designer.

Generate a PREMIUM, ATS-friendly resume in HTML format that looks like a real company resume.

========================
STRICT RULES
========================
- Return ONLY valid JSON
- No explanation
- No markdown
- No extra text

FORMAT:
{"html":"<html>...</html>"}

========================
DESIGN REQUIREMENTS
========================
- Clean, modern, professional layout (like top tech company resumes)
- Single-column layout (ATS-friendly)
- Strong typography hierarchy
- Proper spacing and alignment
- Visually polished but minimal (NOT fancy)

COLORS:
- Primary: #1f2937 (dark gray)
- Accent: #2563eb (professional blue)
- Text: #374151
- Background: #ffffff

FONT:
- Arial, sans-serif

SPACING:
- Page padding: 40px
- Section spacing: 20px–28px
- Line height: 1.5

========================
STRUCTURE (FOLLOW EXACTLY)
========================

1. HEADER
- Full Name (large, bold)
- Job Title / Role (below name, blue accent)
- Contact: Email | Phone | Location | LinkedIn | GitHub

2. PROFESSIONAL SUMMARY
- 2–3 strong, impactful lines
- Tailored to job description

3. TECHNICAL SKILLS
- Grouped:
  Frontend:
  Backend:
  Database:
  Tools:
  Concepts:

4. EXPERIENCE / PROJECTS
- Title + Company/Project
- Duration (aligned right feel)
- 4–5 bullet points:
  - Start with action verbs
  - Show impact
  - Use metrics if possible

5. EDUCATION
- Degree, College, Year, CGPA

6. KEY STRENGTHS
- 4–6 bullet points

========================
STYLE RULES
========================
- Use inline CSS ONLY
- Use <div>, <p>, <h1>, <h2>, <ul>, <li>
- No tables
- No grids
- No images/icons
- Add subtle bottom borders for section headings
- Maintain consistent spacing and alignment

========================
CONTENT RULES
========================
- Make it sound HUMAN (not AI-generated)
- Tailor everything to the job description
- Use strong action verbs (Developed, Built, Designed, Improved)
- Avoid generic phrases
- Keep it concise (1–2 pages max)

========================
INPUT
========================
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        let text = response.data.choices[0].message.content;

        // ✅ simple cleanup
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        // ✅ FIX: remove line breaks (THIS SOLVES YOUR ERROR)
        text = text.replace(/\n/g, "").replace(/\r/g, "");

        const parsed = JSON.parse(text);

        if (!parsed.html) {
            console.log("❌ HTML missing");
            return null;
        }

        const buffer = await generatePdfFromHtml(parsed.html);

        return buffer;

    } catch (error) {
        console.log("❌ PDF ERROR:", error.message);
        return null;
    }
}

module.exports = {
    generateInterviewReport,
    generateResumePdf
};