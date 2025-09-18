import OpenAI from "openai";

// Initialize OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Common model config (fine-tune as needed)
const modelConfig = {
  model: "gpt-4o",               // Best current OpenAI GPT model
  temperature: 0.7,              // Balanced creativity
  max_tokens: 4000,              // Expand if longer outputs needed
  top_p: 1,                      // Controls randomness (1 = full range)
  frequency_penalty: 0,          // Discourage repetition
  presence_penalty: 0,           // Encourage introducing new ideas
  response_format: { type: "json_object" } // Force JSON if needed
};

// ---------------------------
// Course Outline Generator
// ---------------------------
export const generateCourseOutline = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      ...modelConfig,
      messages: [
        {
          "role": "system",
          "content": "You are a senior curriculum architect with 20+ years of experience in designing advanced technical education programs for elite coding interviews and university-level computer science. Your role is to produce highly detailed, rigorously structured course outlines in strict JSON format. \
        Guidelines: \
        - Always include a compelling course_title, accurate difficulty level, and a 50–100 word CourseSummary written with professional clarity. \
        - Break content into at least 8 chapters, each containing: ChapterTitle, ChapterSummary (≥100 words), and a topics array of ≥5 topics. Each topic must include a clear, practical description (2–3 sentences) with examples or applications. \
        - Ensure technical accuracy, clarity, and depth suitable for advanced learners. \
        - Never include extra text, explanations, or formatting outside valid JSON. \
        - Act as if the output will be directly parsed by software — consistency and validity are critical."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating course outline:", error);
    throw error;
  }
};

// ---------------------------
// Notes / Exam Material Generator
// ---------------------------
export const generateNotes = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",              // Use a more stable model
      temperature: 0.7,              // Balanced creativity
      max_tokens: 30000,              // Expand if longer outputs needed
      top_p: 1,                      // Controls randomness (1 = full range)
      frequency_penalty: 0,          // Discourage repetition
      presence_penalty: 0,           // Encourage introducing new ideas
      // Remove response_format for HTML generation
      messages: [
        {
          "role": "system",
          "content": "You are an authoritative educational content creator and technical writing specialist. Your task is to transform structured outlines into fully developed, detailed instructional material in clean, semantic HTML. \
        Guidelines: \
        - Do not include <html>, <head>, <body>, or <title> tags. Only return structured content (<h3>, <h4>, <p>, <ul>, <li>, <code>, etc.). \
        - For each chapter and topic: \
           * Provide in-depth explanations (≥150 words per topic). \
           * Use structured HTML hierarchy: <h3> for chapters, <h4> for topics, <p> for detailed narrative, <ul>/<li> for subpoints, and <code> blocks where examples or pseudocode are relevant. \
        - Emphasize clarity, accuracy, and thoroughness, targeting an advanced technical audience. \
        - Expand on algorithms, data structures, complexities, and use-cases with professional depth. \
        - Never output plain text or Markdown — only valid, professional-grade HTML."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating notes:", error);
    throw error;
  }
};

export const generateStudyTypeContentAIModel = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",              // Strong reasoning, good output size
      temperature: 0.6,             // Focused, less randomness
      max_tokens: 8000,             // Safe buffer for 20 detailed cards
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      messages: [
        {
          role: "system",
          content: `Generate exactly 20 flashcards in a JSON array format.

Return only this JSON structure:
[
  {"front": "question", "back": "answer"},
  {"front": "question", "back": "answer"}
]

Requirements:
- Create exactly 20 flashcard objects
- Each object has "front" (question) and "back" (answer) 
- Focus on key concepts, definitions, and practical applications
- Keep questions clear and answers concise but complete`
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return JSON.parse(response.choices[0].message.content);

  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
};
