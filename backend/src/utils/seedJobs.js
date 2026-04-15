import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.model.js';
import { getEmbedding, getJobEmbeddingText } from './matching.service.js';

dotenv.config();

const RECRUITER_ID = '69db2dac99a9e691223d8732'; // From DB check

const SAMPLE_JOBS = [
  {
    title: 'Senior Frontend Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    type: 'Full-time',
    salary: '$180k - $240k',
    level: 'Senior',
    requirements: ['React', 'TypeScript', 'Node.js', 'Next.js'],
    description: 'We are looking for an expert frontend engineer to lead our core UI team. You will be responsible for architecting scalable components and mentoring junior developers.',
    logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png',
    postedBy: RECRUITER_ID
  },
  {
    title: 'UI/UX Designer',
    company: 'Stripe',
    location: 'Remote',
    type: 'Full-time',
    salary: '$140k - $190k',
    level: 'Intermediate',
    requirements: ['Framer', 'Figma', 'System Design', 'React'],
    description: 'Stripe is looking for a designer who can bridge the gap between aesthetics and functionality. You will work closely with frontend engineers to build beautiful financial tools.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1024px-Stripe_Logo%2C_revised_2016.svg.png',
    postedBy: RECRUITER_ID
  },
  {
    title: 'Backend Developer',
    company: 'Microsoft',
    location: 'Seattle, WA',
    type: 'Contract',
    salary: '$120k - $160k',
    level: 'Intermediate',
    requirements: ['Go', 'Kubernetes', 'Azure', 'PostgreSQL'],
    description: 'Join the Azure team to build high-performance backend services. Experience with distributed systems and cloud infrastructure is key.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/480px-Microsoft_logo.svg.png',
    postedBy: RECRUITER_ID
  },
  {
    title: 'Full Stack Engineer',
    company: 'Meta',
    location: 'Menlo Park, CA',
    type: 'Full-time',
    salary: '$200k - $260k',
    level: 'Lead',
    requirements: ['React', 'Relay', 'GraphQL', 'PHP'],
    description: 'Build the future of social connection. As a Lead Full Stack Engineer at Meta, you will own entire product features from database schema to UI implementation.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/1024px-Meta_Platforms_Inc._logo.svg.png',
    postedBy: RECRUITER_ID
  },
  {
    title: 'Junior Mobile Developer',
    company: 'Airbnb',
    location: 'San Francisco, CA',
    type: 'Internship',
    salary: '$40k - $60k',
    level: 'Entry Level',
    requirements: ['React Native', 'Expo', 'Redux', 'Jest'],
    description: 'Perfect for current students or recent graduates. Learn how to build world-class mobile experiences using React Native and modern development practices.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_Belo.svg/1024px-Airbnb_Logo_Belo.svg.png',
    postedBy: RECRUITER_ID
  },
  {
    title: 'Cloud Architect',
    company: 'Amazon AWS',
    location: 'Austin, TX',
    type: 'Full-time',
    salary: '$220k - $300k',
    level: 'Senior',
    requirements: ['AWS', 'Terraform', 'Serverless', 'Python'],
    description: 'Help our largest enterprise customers migrate to the cloud. You will design complex architectures that leverage the full power of AWS.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1024px-Amazon_Web_Services_Logo.svg.png',
    postedBy: RECRUITER_ID
  }
];

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs.');

    // Generate embeddings and save jobs
    for (const jobData of SAMPLE_JOBS) {
      console.log(`Generating embedding for: ${jobData.title}...`);
      const embeddingText = getJobEmbeddingText(jobData);
      const embedding = await getEmbedding(embeddingText);
      
      const job = new Job({
        ...jobData,
        embedding
      });
      
      await job.save();
    }

    console.log('Successfully seeded jobs with embeddings!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedJobs();
