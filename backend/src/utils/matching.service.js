import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getEmbedding = async (text) => {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not found, returning placeholder embedding');
    return new Array(1536).fill(0).map(() => Math.random()); // Random vectors as fallback
  }

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.replace(/\n/g, " "),
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
};

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number}
 */
export const calculateSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Convert similarity score to a readable percentage (0-100)
 * Tailored for text-embedding-3-small baseline values
 * @param {number} similarity 
 * @returns {number}
 */
export const formatMatchScore = (similarity) => {
  if (!similarity || similarity <= 0.3) {
    return 0;
  }
  
  let score;
  if (similarity >= 0.75) {
    score = 95 + ((similarity - 0.75) / (1.0 - 0.75)) * 4; // 0.75 - 1.0 -> 95% - 99%
  } else if (similarity >= 0.5) {
    score = 55 + ((similarity - 0.5) / (0.75 - 0.5)) * 40; // 0.5 - 0.75 -> 55% - 95%
  } else {
    score = ((similarity - 0.3) / (0.5 - 0.3)) * 55; // 0.3 - 0.5 -> 0% - 55%
  }
  
  return Math.max(0, Math.min(99, Math.round(score)));
};

/**
 * Get embedding text for a job
 */
export const getJobEmbeddingText = (job) => {
  return `${job.title} ${job.company} ${job.description} ${job.requirements.join(' ')} ${job.level} ${job.type}`;
};

/**
 * Get embedding text for a user profile
 */
export const getUserEmbeddingText = (user) => {
  return `${user.headline} ${user.bio} ${user.skills.join(' ')} ${user.firstName} ${user.lastName}`;
};
