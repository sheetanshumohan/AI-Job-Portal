import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embedding for a given text using OpenAI
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
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
 * Convert similarity score (usually 0.7-1.0 for embeddings) to a readable percentage (0-100)
 * @param {number} similarity 
 * @returns {number}
 */
export const formatMatchScore = (similarity) => {
  // Map similarity from [0.7, 0.95] to [40, 99] for better user experience
  let score = ((similarity - 0.7) / (0.95 - 0.7)) * 60 + 40;
  score = Math.max(10, Math.min(99, score)); // Clamp
  return Math.round(score);
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
