import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Initialize Gemini ────────────────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ─── Helper to call Gemini ────────────────────────────────────────────────────

const askGemini = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
};

// ─── Fallback JD Parser ───────────────────────────────────────────────────────

const parseFallbackJD = (jdText) => {
  const SKILL_LIST = [
    'React', 'Vue', 'Angular', 'Next.js', 'TypeScript', 'JavaScript',
    'Node.js', 'Python', 'Java', 'Go', 'AWS', 'GCP', 'Azure', 'Docker',
    'Kubernetes', 'GraphQL', 'REST', 'SQL', 'PostgreSQL', 'MongoDB',
    'Git', 'CI/CD', 'Agile', 'Figma', 'TailwindCSS', 'CSS', 'HTML',
  ];
  const skills = SKILL_LIST.filter(s =>
    new RegExp(`\\b${s}\\b`, 'i').test(jdText)
  ).slice(0, 8);
  const salaryMatch = jdText.match(/\$[\d,]+|\d+\s*(?:LPA|lpa|lac|lakhs?)|₹[\d,]+/);
  const expMatch = jdText.match(/(\d+)\+?\s*years?\s*(?:of\s+)?exp/i);
  const lower = jdText.toLowerCase();
  const roleType = lower.includes('remote') ? '🌐 Remote'
    : lower.includes('hybrid') ? '🏢 Hybrid'
    : lower.includes('on-site') || lower.includes('onsite') ? '🏙️ On-site'
    : '❓ Not specified';
  const sentences = jdText.split(/[.!?]+/).filter(s => s.trim().length > 30);
  const summary = sentences.length > 0
    ? sentences.slice(0, 2).join('. ').trim() + '.'
    : 'Could not generate summary. Please try again.';
  return {
    skills,
    summary,
    salary: salaryMatch ? salaryMatch[0] : 'Not mentioned',
    experience: expMatch ? `${expMatch[1]}+ years` : 'Not specified',
    roleType,
    culture: '',
  };
};

// ─── Clean Gemini JSON Response ───────────────────────────────────────────────

const cleanJSON = (response, type = 'object') => {
  let cleaned = response
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  if (type === 'object') {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) cleaned = match[0];
  } else {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) cleaned = match[0];
  }
  return cleaned;
};

// ─── JD Summarizer ────────────────────────────────────────────────────────────

export const summarizeJD = async (jdText) => {
  if (!jdText || jdText.trim().length < 20) {
    return {
      skills: [],
      summary: 'Paste a job description to see AI summary.',
      salary: '',
      experience: '',
      roleType: '',
      culture: '',
    };
  }

  const prompt = `
Analyze this job description and return ONLY a JSON object.
No explanations. No markdown. No code blocks. Just raw JSON.

Job Description:
${jdText}

Return this exact JSON structure:
{
  "skills": ["skill1", "skill2", "skill3"],
  "summary": "2-3 sentence summary of the role",
  "salary": "salary if mentioned or Not mentioned",
  "experience": "experience required or Not specified",
  "roleType": "Remote or Hybrid or On-site or Not specified",
  "culture": "one line about company culture"
}
`;

  try {
    const response = await askGemini(prompt);
    if (!response) throw new Error('No response');
    const cleaned = cleanJSON(response, 'object');
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('summarizeJD error:', err);
    return parseFallbackJD(jdText);
  }
};

// ─── Job Match Score ──────────────────────────────────────────────────────────

export const calculateMatchScore = async (jdText, mySkills = []) => {
  if (!jdText || jdText.trim().length < 20) {
    return { score: null, matched: [], missing: [], advice: '', breakdown: {} };
  }

  const prompt = `
Analyze how well this candidate matches the job description.
Return ONLY a JSON object. No explanations. No markdown. Just raw JSON.

Job Description:
${jdText}

Candidate Skills:
${mySkills.length > 0
    ? mySkills.join(', ')
    : 'React, JavaScript, TypeScript, Node.js, CSS, HTML, Git, REST APIs, SQL, Agile'
  }

Return this exact JSON structure:
{
  "score": 75,
  "matched": ["skill1", "skill2"],
  "missing": ["skill3", "skill4"],
  "verdict": "Good Match",
  "advice": "2-3 sentences of specific advice",
  "breakdown": {
    "skillsMatch": "6/8 skills matched",
    "experienceMatch": "Good fit",
    "overallFit": "Strong candidate with minor gaps"
  }
}
`;

  try {
    const response = await askGemini(prompt);
    if (!response) throw new Error('No response');
    const cleaned = cleanJSON(response, 'object');
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('calculateMatchScore error:', err);
    return {
      score: null,
      matched: [],
      missing: [],
      advice: 'Could not calculate match. Please try again.',
      breakdown: {},
    };
  }
};

// ─── Cover Letter Generator ───────────────────────────────────────────────────

export const generateCoverLetter = async (job, myName = 'Your Name') => {
  const { company, role, jobDescription, notes } = job;

  const prompt = `
You are a professional cover letter writer.
Write a compelling, personalized cover letter.

Job Details:
Company: ${company}
Role: ${role}
Job Description: ${jobDescription || 'Not provided'}
Candidate Notes: ${notes || 'Not provided'}
Candidate Name: ${myName}

Requirements:
- Make it specific to this company and role
- Professional but warm tone
- 3-4 paragraphs
- Highlight relevant skills from JD
- Show genuine interest in the company
- End with a strong call to action
- Do NOT use generic phrases like "I am writing to express my interest"
- Make it sound human and authentic
- Maximum 300 words

Write only the cover letter. No extra text.
`;

  try {
    const response = await askGemini(prompt);
    return response || generateFallbackCoverLetter(job, myName);
  } catch {
    return generateFallbackCoverLetter(job, myName);
  }
};

const generateFallbackCoverLetter = (job, myName) => {
  return `Dear Hiring Manager,

Having followed ${job.company}'s work closely, I was excited to see the ${job.role} opening. Your focus on building impactful products aligns perfectly with what drives me professionally.

In my work, I have consistently delivered high quality solutions while collaborating effectively with cross functional teams. I take pride in clean, maintainable code and thrive in fast paced environments.

I would love to bring this same dedication to ${job.company}. Thank you for considering my application.

Warm regards,
${myName}`;
};

// ─── Resume Analyzer ──────────────────────────────────────────────────────────

export const analyzeResume = async (resumeText) => {
  if (!resumeText || resumeText.trim().length < 50) {
    return {
      atsScore: 0,
      suggestions: ['Paste your resume text to get AI analysis'],
      keywords: [],
      strengths: [],
      grade: 'Needs Work',
      detailedFeedback: '',
      missingKeywords: [],
      bulletImprovements: [],
    };
  }

  const prompt = `
You are an expert resume reviewer and ATS specialist.
Analyze this resume and return ONLY raw JSON.
No markdown. No code blocks. No explanation. Just the JSON object.

Resume Text:
${resumeText.slice(0, 3000)}

Return exactly this JSON:
{
  "atsScore": 72,
  "grade": "Good",
  "strengths": [
    "Has clear work experience section",
    "Uses action verbs",
    "Has education section"
  ],
  "suggestions": [
    "Add LinkedIn profile link",
    "Quantify achievements with numbers",
    "Add a professional summary"
  ],
  "keywords": ["React", "JavaScript", "Node.js"],
  "detailedFeedback": "Your resume is well structured but needs more quantified achievements. Add metrics like percentages and user counts to make bullets stronger.",
  "missingKeywords": ["TypeScript", "Docker", "AWS"],
  "bulletImprovements": [
    {
      "original": "Worked on React app",
      "improved": "Built React dashboard used by 500+ users reducing load time by 40%"
    }
  ]
}

Rules:
- atsScore must be a NUMBER between 0 and 100
- grade must be exactly one of: Excellent, Good, Fair, Needs Work
- All arrays must have at least 2 items
- Return ONLY the JSON object nothing else
`;

  try {
    const raw = await askGemini(prompt);
    console.log('Gemini raw response:', raw);

    if (!raw) throw new Error('No response from Gemini');

    // ── Step 1: Remove all markdown ────────────────────────────────────────
    let cleaned = raw
      .replace(/```json/gi, '')
      .replace(/```/gi, '')
      .trim();

    // ── Step 2: Extract JSON object ────────────────────────────────────────
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start === -1 || end === -1) {
      throw new Error('No JSON object found in response');
    }

    cleaned = cleaned.slice(start, end + 1);

    // ── Step 3: Parse ──────────────────────────────────────────────────────
    const result = JSON.parse(cleaned);

    // ── Step 4: Validate required fields ──────────────────────────────────
    return {
      atsScore: typeof result.atsScore === 'number' ? result.atsScore : 50,
      grade: result.grade || 'Fair',
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
      keywords: Array.isArray(result.keywords) ? result.keywords : [],
      detailedFeedback: result.detailedFeedback || '',
      missingKeywords: Array.isArray(result.missingKeywords) ? result.missingKeywords : [],
      bulletImprovements: Array.isArray(result.bulletImprovements) ? result.bulletImprovements : [],
    };

  } catch (err) {
    console.error('analyzeResume error:', err);

    // ── Fallback: analyze locally without AI ───────────────────────────────
    return analyzeResumeLocally(resumeText);
  }
};

// ─── Local Resume Analysis Fallback ──────────────────────────────────────────

const analyzeResumeLocally = (resumeText) => {
  const lower = resumeText.toLowerCase();
  const suggestions = [];
  const strengths = [];
  let atsScore = 40;

  if (lower.includes('experience') || lower.includes('work history')) {
    atsScore += 10;
    strengths.push('Has work experience section');
  } else {
    suggestions.push('Add a clear Work Experience section');
  }

  if (lower.includes('education')) {
    atsScore += 5;
    strengths.push('Has education section');
  } else {
    suggestions.push('Add an Education section');
  }

  if (lower.includes('skills')) {
    atsScore += 10;
    strengths.push('Has dedicated skills section');
  } else {
    suggestions.push('Add a Skills section for better ATS parsing');
  }

  if (lower.includes('summary') || lower.includes('objective')) {
    atsScore += 5;
    strengths.push('Has professional summary');
  } else {
    suggestions.push('Add a 2-3 line professional summary at the top');
  }

  if (/\d+%|\d+\+|\$\d+|\d+ (?:users|clients|projects)/i.test(resumeText)) {
    atsScore += 15;
    strengths.push('Uses quantified achievements');
  } else {
    suggestions.push('Add numbers to achievements e.g. "Improved performance by 40%"');
  }

  if (['built', 'developed', 'designed', 'led', 'created'].some(v => lower.includes(v))) {
    atsScore += 5;
    strengths.push('Uses strong action verbs');
  } else {
    suggestions.push('Start bullet points with action verbs like Built, Developed, Led');
  }

  if (lower.includes('github') || lower.includes('linkedin')) {
    atsScore += 5;
    strengths.push('Has online profile links');
  } else {
    suggestions.push('Add your GitHub and LinkedIn profile links');
  }

  const keywords = SKILL_KEYWORDS.filter(s =>
    new RegExp(`\\b${s}\\b`, 'i').test(resumeText)
  );

  if (keywords.length > 5) {
    atsScore += 5;
    strengths.push(`${keywords.length} technical skills detected`);
  }

  atsScore = Math.min(atsScore, 100);

  return {
    atsScore,
    grade: atsScore >= 80 ? 'Excellent' : atsScore >= 65 ? 'Good' : atsScore >= 50 ? 'Fair' : 'Needs Work',
    strengths,
    suggestions: suggestions.slice(0, 5),
    keywords,
    detailedFeedback: 'Analysis completed using local parser. For detailed AI feedback, try again.',
    missingKeywords: SKILL_KEYWORDS.filter(s => !keywords.includes(s)).slice(0, 8),
    bulletImprovements: [],
  };
};

// ─── Interview Question Generator ─────────────────────────────────────────────

export const generateInterviewQuestions = async (job) => {
  const prompt = `
You are an expert interview coach.
Generate specific interview questions for this job.

Company: ${job.company}
Role: ${job.role}
Job Description: ${job.jobDescription || 'Not provided'}

Return ONLY a JSON object. No extra text. No markdown. Just raw JSON.

{
  "technical": [
    {"question": "question here", "tip": "how to answer tip"},
    {"question": "question here", "tip": "how to answer tip"},
    {"question": "question here", "tip": "how to answer tip"}
  ],
  "behavioral": [
    {"question": "question here", "tip": "how to answer tip"},
    {"question": "question here", "tip": "how to answer tip"}
  ],
  "systemDesign": [
    {"question": "question here", "tip": "how to answer tip"}
  ],
  "companySpecific": [
    {"question": "question here", "tip": "how to answer tip"},
    {"question": "question here", "tip": "how to answer tip"}
  ],
  "preparationTips": ["tip1", "tip2", "tip3"]
}
`;

  try {
    const response = await askGemini(prompt);
    if (!response) throw new Error('No response');
    const cleaned = cleanJSON(response, 'object');
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('generateInterviewQuestions error:', err);
    return {
      technical: [],
      behavioral: [],
      systemDesign: [],
      companySpecific: [],
      preparationTips: [],
    };
  }
};

// ─── Notes Rewriter ────────────────────────────────────────────────────────────

export const rewriteNotes = async (notes) => {
  if (!notes || notes.trim().length === 0) {
    return 'No notes provided. Consider adding details about role requirements, company culture, interview format, and compensation range.';
  }

  const prompt = `
You are a professional writing assistant.
Rewrite these job application notes to be more professional,
clear and structured. Keep all the information but improve
the writing quality. Keep it concise under 100 words.

Original notes:
${notes}

Return only the rewritten notes. No extra text.
`;

  try {
    const response = await askGemini(prompt);
    return response || notes;
  } catch {
    return notes;
  }
};

// ─── Application Tips ──────────────────────────────────────────────────────────

export const generateTips = async (jobs) => {
  if (jobs.length === 0) {
    return [
      { icon: '🚀', text: 'Start tracking your first job application to get personalized insights.' },
      { icon: '📝', text: 'Tailor your resume for each role — quality beats quantity.' },
      { icon: '🤝', text: 'Reach out to employees at target companies before applying.' },
    ];
  }

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'Applied').length,
    interviews: jobs.filter(j => j.status === 'Interview').length,
    offers: jobs.filter(j => j.status === 'Offer').length,
    rejected: jobs.filter(j => j.status === 'Rejected').length,
    noFollowUp: jobs.filter(j => j.status === 'Applied' && !j.followedUp).length,
  };

  const prompt = `
You are a career coach analyzing someone's job search.

Their current stats:
Total Applications: ${stats.total}
Currently Applied (waiting): ${stats.applied}
In Interview Stage: ${stats.interviews}
Got Offers: ${stats.offers}
Rejected: ${stats.rejected}
Applications without follow up: ${stats.noFollowUp}

Give 3-4 specific actionable tips based on these stats.
Return ONLY a JSON array. No extra text. No markdown. Just raw JSON.

[
  {"icon": "emoji", "text": "specific tip here", "urgent": false},
  {"icon": "emoji", "text": "specific tip here", "urgent": true}
]

urgent should be true only if immediate action needed.
Make tips very specific to their actual numbers.
`;

  try {
    const response = await askGemini(prompt);
    if (!response) throw new Error('No response');
    const cleaned = cleanJSON(response, 'array');
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('generateTips error:', err);
    return [
      { icon: '📊', text: `You have ${jobs.length} applications tracked. Keep applying consistently.` },
      { icon: '🎯', text: 'Focus on quality applications with tailored resumes.' },
      { icon: '🤝', text: 'Network actively — referrals increase your chances 4x.' },
    ];
  }
};

// ─── Smart Insights ───────────────────────────────────────────────────────────

export const generateSmartInsights = async (jobs) => {
  if (jobs.length < 2) return [];

  const jobSummary = jobs.map(j => ({
    company: j.company,
    role: j.role,
    status: j.status,
    date: j.date,
  }));

  const prompt = `
You are a data analyst specializing in job search optimization.
Analyze this person's job search data and give smart insights.

Job Applications:
${JSON.stringify(jobSummary)}

Return ONLY a JSON array. No extra text. No markdown. Just raw JSON.
Give 3-4 insights based on patterns you see.

[
  {"icon": "emoji", "text": "specific insight based on actual data"},
  {"icon": "emoji", "text": "specific insight based on actual data"}
]

Look for patterns like:
- Which company types respond more
- Which roles have better success
- Application frequency patterns
- Any concerning patterns
`;

  try {
    const response = await askGemini(prompt);
    if (!response) throw new Error('No response');
    const cleaned = cleanJSON(response, 'array');
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('generateSmartInsights error:', err);
    return [];
  }
};

// ─── Application Strength Score ────────────────────────────────────────────────

export const scoreApplicationStrength = (job) => {
  let score = 0;
  const feedback = [];
  if (job.notes && job.notes.length > 50) score += 20;
  else feedback.push('Add detailed notes about the role');
  if (job.resume) score += 20;
  else feedback.push('Attach your resume version');
  if (job.reminderDate) score += 20;
  else feedback.push('Set a follow up reminder');
  if (job.company && job.role && job.date) score += 20;
  else feedback.push('Fill all required fields');
  if (job.jobDescription && job.jobDescription.length > 30) score += 20;
  else feedback.push('Paste the job description for AI match scoring');
  return {
    score,
    feedback,
    grade: score >= 80 ? 'Strong' : score >= 50 ? 'Moderate' : 'Weak',
  };
};

// ─── Suggest Roles ─────────────────────────────────────────────────────────────

export const suggestRoles = (jobs) => {
  if (jobs.length === 0) return ['Software Engineer', 'Frontend Developer', 'Full Stack Developer'];
  const roleCounts = {};
  jobs.forEach(j => {
    const role = j.role?.toLowerCase() || '';
    if (role.includes('frontend') || role.includes('react')) roleCounts['frontend'] = (roleCounts['frontend'] || 0) + 1;
    if (role.includes('backend') || role.includes('node')) roleCounts['backend'] = (roleCounts['backend'] || 0) + 1;
    if (role.includes('full stack') || role.includes('fullstack')) roleCounts['fullstack'] = (roleCounts['fullstack'] || 0) + 1;
  });
  const top = Object.entries(roleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'fullstack';
  const suggestions = {
    frontend: ['Senior Frontend Developer', 'React Developer', 'UI Engineer'],
    backend: ['Backend Engineer', 'Node.js Developer', 'API Developer'],
    fullstack: ['Full Stack Developer', 'Software Engineer', 'Product Engineer'],
  };
  return suggestions[top] || suggestions.fullstack;
};

// ─── Export CSV ───────────────────────────────────────────────────────────────

export const exportToCSV = (jobs) => {
  const headers = ['Company', 'Role', 'Status', 'Date Applied', 'Salary', 'Deadline', 'Notes', 'Reminder Date', 'Followed Up', 'Resume'];
  const rows = jobs.map(j => [
    j.company, j.role, j.status, j.date,
    j.salary || '', j.deadline || '',
    (j.notes || '').replace(/"/g, "'"),
    j.reminderDate || '',
    j.followedUp ? 'Yes' : 'No',
    j.resume || '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `traqr-jobs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Skill Keywords ───────────────────────────────────────────────────────────

export const SKILL_KEYWORDS = [
  'React', 'Vue', 'Angular', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js',
  'Python', 'Java', 'Go', 'Rust', 'AWS', 'GCP', 'Azure', 'Docker',
  'Kubernetes', 'GraphQL', 'REST', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis',
  'Git', 'CI/CD', 'Agile', 'Scrum', 'Figma', 'TailwindCSS', 'CSS', 'HTML',
  'Express', 'Django', 'Spring', 'Microservices', 'System Design', 'Linux',
];
