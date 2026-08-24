import { Resend } from 'resend';

const sendEmail = async (options) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not configured in environment variables.');
  }

  const resend = new Resend(resendApiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  const { data, error } = await resend.emails.send({
    from: `AI Resume Analyzer <${fromEmail}>`,
    to: [options.email],
    subject: options.subject,
    text: options.message || '',
    html: options.html || `<p>${options.message}</p>`,
  });

  if (error) {
    console.error('Resend email error:', error);
    throw new Error(error.message || 'Failed to send email via Resend');
  }

  return data;
};

export default sendEmail;
