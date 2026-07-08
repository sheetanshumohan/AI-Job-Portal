import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

export const extractTextFromResumeUrl = async (resumeUrl) => {
  if (!resumeUrl) {
    console.warn('No resume URL provided for text extraction');
    return null;
  }

  try {
    console.log(`Fetching resume from: ${resumeUrl}`);
    const response = await fetch(resumeUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch resume PDF. Status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('Parsing resume PDF...');
    const pdfData = await pdf(buffer);
    
    if (pdfData && pdfData.text) {
      // Clean up whitespace/newlines slightly but preserve structure
      return pdfData?.text.trim();
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing resume PDF:', error);
    return null;
  }
};
