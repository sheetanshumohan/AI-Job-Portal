import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateProfessionalSummary = async (userData) => {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not found, returning placeholder summary');
    return `Dynamic professional summary for ${userData.firstName}. (Please add OPENAI_API_KEY for real AI generation)`;
  }

  const prompt = `
    Generate a concise, professional summary (max 3-4 sentences) for a job seeker profile based on the following details:
    Name: ${userData.firstName} ${userData.lastName}
    Headline: ${userData.headline}
    Skills: ${userData.skills?.join(', ')}
    Education: ${userData.degree} from ${userData.collegeName}
    Experiences: ${userData.experiences?.map(e => `${e.role} at ${e.company}`).join('; ')}
    
    The tone should be professional and highlighting their key strengths.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI summary:', error);
    throw new Error('Failed to generate AI summary');
  }
};

export const generateInterviewQuestions = async (jobData, userData, count = 10) => {
  const prompt = `
    You are an expert technical recruiter. Based on the job description and the candidate's profile below, generate ${count} challenging interview questions.
    Mix behavioral and technical questions based on their skills.

    Job Title: ${jobData.title}
    Job Requirements: ${jobData.requirements?.join(', ')}
    Job Description: ${jobData.description}

    Candidate Profile:
    Name: ${userData.firstName}
    Headline: ${userData.headline}
    Skills: ${userData.skills?.join(', ')}
    
    Return the response as a JSON object with a "questions" key containing an array of ${count} strings.
    Example: { "questions": ["Question 1", "Question 2", ...] }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = JSON.parse(response.choices[0].message.content);
    const questions = content.questions || (Array.isArray(content) ? content : Object.values(content).find(val => Array.isArray(val)));
    
    if (!questions || !Array.isArray(questions)) {
      throw new Error('Could not find questions array in AI response');
    }
    
    return questions;
  } catch (error) {
    console.error('Error generating interview questions:', error);
    // Fallback questions
    return [
      `Tell me about yourself and your experience with ${jobData.title} roles.`,
      `How would you handle a difficult situation with a teammate?`,
      `What are your greatest strengths and how would they benefit our company?`,
      `Describe a challenging project you worked on and how you overcame obstacles.`,
      `Why do you want to work for ${jobData.company}?`,
      `What technical skills do you have that make you a good fit for this role?`,
      `How do you stay updated with the latest trends in your field?`,
      `Can you describe a time you had to learn a new technology quickly?`,
      `What is your approach to problem-solving in a technical environment?`,
      `Where do you see yourself in terms of technical growth over the next 2-3 years?`
    ];
  }
};

export const evaluateInterviewAnswer = async (question, answer) => {
  const prompt = `
    You are a high-level technical interviewer for a Fortune 500 company. Your goal is to critically evaluate candidate responses.
    
    Evaluate the following interview answer based on:
    1. Technical Accuracy: Is the answer factually correct?
    2. Depth & Detail: Does it provide specific examples or deep technical understanding?
    3. Relevance: Does it directly address the question?
    4. Professionalism: Is the tone appropriate?

    SCORING RUBRIC (BE STRICT):
    - 0-3: Answer is completely wrong, irrelevant, or too brief (e.g., "I don't know", "Yes").
    - 4-5: Answer is technically surface-level, very vague, or missing key details.
    - 6-7: Good answer but lacks specific examples or could be more detailed.
    - 8-9: Excellent, detailed, and technically accurate answer with examples.
    - 10: Perfect, comprehensive response that shows expert-level knowledge.

    Question: ${question}
    Answer: ${answer}

    Return the response in JSON format.
    Example: { "feedback": "Brief critique (max 2 sentences).", "score": 5 }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error evaluating interview answer:', error);
    return { feedback: "Could not evaluate at this time.", score: 0 };
  }
};

export const generateOverallInterviewFeedback = async (questionsData) => {
  const dataString = questionsData.map(q => `Q: ${q.question}\nA: ${q.answer}\nScore: ${q.score}/10`).join('\n\n');
  
  const prompt = `
    Analyze the following mock interview results and provide an overall professional summary.
    Highlight key strengths and specific areas for improvement.
    
    Results:
    ${dataString}

    Provide a concise, encouraging, and professional summary (3-5 sentences).
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating overall feedback:', error);
    return "Great effort on your interview! Focus on providing more detailed technical examples in your future responses.";
  }
};

export const analyzeApplication = async (jobData, userData) => {
  if (!process.env.OPENAI_API_KEY) {
    return {
      strengths: ["Strong matching potential", "Relevant skills identified"],
      gaps: ["Detailed AI analysis requires API key"]
    };
  }

  const prompt = `
    You are an AI specialized in candidate screening. Compare the Candidate Profile with the Job Description below.
    Identify exactly 3 specific "Strengths" and 2-3 specific "Gaps/Areas for Improvement" for this candidate relative to this job.
    
    Job Description:
    Title: ${jobData.title}
    Requirements: ${jobData.requirements?.join(', ')}
    Company: ${jobData.company}
    
    Candidate Profile:
    Name: ${userData.firstName}
    Headline: ${userData.headline}
    Skills: ${userData.skills?.join(', ')}
    Summary: ${userData.bio}
    Experiences: ${userData.experiences?.map(e => `${e.role} at ${e.company} (${e.period})`).join('; ')}
    
    Return the analysis as a JSON object with two keys: "strengths" (array of strings) and "gaps" (array of strings).
    Be specific and technical. Do not use generic praise.
    Example: { "strengths": ["Advanced proficiency in React hooks", ...], "gaps": ["Lacks experience with Kubernetes", ...] }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error in AI Application Analysis:', error);
    return {
      strengths: ["Solid professional background", "Matched core technical requirements"],
      gaps: ["AI analysis failed to generate detailed feedback"]
    };
  }
};

export const analyzeResume = async (userData) => {
  if (!process.env.OPENAI_API_KEY) {
    return {
      score: 75,
      strengths: ["Clean profile layout", "Good educational background", "Relevant technologies mentioned"],
      gaps: ["Detailed AI analysis requires API key", "Could use more quantified results", "Missing deeper technical descriptions"],
      tips: ["Add specific achievements to your experiences", "Expand your summary to include long-term goals", "Include links to your portfolio projects"]
    };
  }

  const prompt = `
    You are an AI specialized in professional resume critique. Analyze the student profile below and provide a detailed assessment.
    
    Student Profile:
    Name: ${userData.firstName}
    Headline: ${userData.headline}
    Skills: ${userData.skills?.join(', ')}
    Summary: ${userData.bio}
    Experiences: ${userData.experiences?.map(e => `${e.role} at ${e.company} (${e.period})`).join('; ')}
    Education: ${userData.degree} from ${userData.collegeName}
    
    Return the analysis as a JSON object with the following keys:
    - "score": A number from 1 to 100 reflecting profile strength.
    - "strengths": An array of 3 specific professional highlights.
    - "gaps": An array of 3 specific areas needing more detail or skills.
    - "tips": An array of 3 actionable career growth tips.

    Be constructive, technical, and specific.
    Example: { "score": 85, "strengths": ["...", "...", "..."], "gaps": ["...", "...", "..."], "tips": ["...", "...", "..."] }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error in AI Resume Analysis:', error);
    return {
      score: 60,
      strengths: ["Professional background exists", "Skills identified"],
      gaps: ["AI evaluation failed temporarily"],
      tips: ["Try again in a few minutes", "Ensure your bio is at least 3 sentences long"]
    };
  }
};
