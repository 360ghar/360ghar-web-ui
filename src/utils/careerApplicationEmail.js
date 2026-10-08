export const buildCareerApplicationMailto = (email, roleTitle) => {
  const subject = `Application for ${roleTitle} - Career at 360Ghar`;
  const body = [
    'Hello 360Ghar team,',
    '',
    `I am applying for the ${roleTitle} internship.`,
    '',
    'Current city: [Your answer]',
    'Availability for onsite work in Gurugram: [Yes / No / Please explain]',
    'How do you use AI tools, and approximately how much do you use them each day? [Your answer]',
    '',
    'I have attached my resume or portfolio for your review.',
    '',
    'Regards,',
    '[Your name]',
  ].join('\n');

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
