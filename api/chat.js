const SYSTEM_PROMPT = `You are the AAMS Help Assistant for a live AICTE Activity Management System.
AAMS lets students submit activity certificates for review, faculty approve or reject submissions, and admins view aggregate reports.
The user is authenticated and their verified application role is provided with each request. Tailor guidance to that role: students may need help with submissions and status, faculty with reviewing activities, and admins with reports and oversight.
Answer only questions about using AAMS, AICTE's 100-point activity requirement, and practical guidance related to those workflows.
Do not answer unrelated general-knowledge questions. If a question is outside this scope, politely explain that you can only help with AAMS and AICTE activity points.
Keep answers concise, clear, and actionable. Never invent access, policy, or account details.`;

const MODEL = 'gemini-2.0-flash';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Please send a POST request to the chat assistant.' });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    response.status(503).json({
      error: 'The AAMS assistant is temporarily unavailable. Please try again later.',
    });
    return;
  }

  const body = request.body || {};
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const role = typeof body.role === 'string' ? body.role.trim().toLowerCase() : '';
  const validRoles = new Set(['student', 'faculty', 'admin']);

  if (!message || message.length > 2000 || !validRoles.has(role)) {
    response.status(400).json({
      error: 'Please send a valid dashboard question and authenticated AAMS role.',
    });
    return;
  }

  const prompt = `${SYSTEM_PROMPT}\nVerified application role: ${role}\n\nUser question: ${message}`;

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
        }),
      },
    );

    if (geminiResponse.status === 429) {
      response.status(429).json({
        error: 'The assistant is busy right now. Please wait a moment and try again.',
      });
      return;
    }

    if (!geminiResponse.ok) {
      response.status(502).json({
        error: 'The assistant could not respond right now. Please try again shortly.',
      });
      return;
    }

    const data = await geminiResponse.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof answer !== 'string' || !answer.trim()) {
      response.status(502).json({
        error: 'The assistant returned an empty response. Please try again.',
      });
      return;
    }

    response.status(200).json({ response: answer.trim() });
  } catch {
    response.status(502).json({
      error: 'We could not reach the assistant. Please check your connection and try again.',
    });
  }
}