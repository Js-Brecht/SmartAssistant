import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface EmailAnalysis {
  priority: "high" | "medium" | "low";
  category: string;
  summary: string;
  responseNeeded: boolean;
  urgencyScore: number;
  sentiment: "positive" | "neutral" | "negative";
  actionItems: string[];
  suggestedTasks: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    dueDate?: string;
  }>;
}

export interface DraftResponse {
  subject: string;
  content: string;
  tone: "professional" | "friendly" | "formal" | "casual";
  confidence: number;
}

export async function analyzeEmail(emailContent: string, subject: string, sender: string): Promise<EmailAnalysis> {
  try {
    const prompt = `Analyze the following email and provide a comprehensive analysis in JSON format:

Subject: ${subject}
From: ${sender}
Content: ${emailContent}

Provide analysis with the following structure:
{
  "priority": "high|medium|low",
  "category": "business|finance|hr|personal|vendor|client|legal|technical|other",
  "summary": "Brief 1-2 sentence summary",
  "responseNeeded": true|false,
  "urgencyScore": 1-10,
  "sentiment": "positive|neutral|negative", 
  "actionItems": ["action1", "action2"],
  "suggestedTasks": [
    {
      "title": "Task title",
      "description": "Task description", 
      "priority": "high|medium|low",
      "dueDate": "YYYY-MM-DD" // optional, only if time sensitive
    }
  ]
}

Consider urgency indicators, deadlines, sender importance, and content criticality.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert email analyst. Analyze emails thoroughly and provide structured insights to help with productivity and prioritization."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    return analysis as EmailAnalysis;
  } catch (error) {
    console.error("Email analysis failed:", error);
    // Return default analysis on error
    return {
      priority: "medium",
      category: "general",
      summary: "Email analysis unavailable",
      responseNeeded: false,
      urgencyScore: 5,
      sentiment: "neutral",
      actionItems: [],
      suggestedTasks: []
    };
  }
}

export async function generateEmailResponse(
  originalSubject: string,
  originalContent: string,
  senderName: string,
  context?: string,
  tone: "professional" | "friendly" | "formal" | "casual" = "professional"
): Promise<DraftResponse> {
  try {
    const prompt = `Generate a professional email response based on the original email:

Original Subject: ${originalSubject}
Original Content: ${originalContent}
Sender: ${senderName}
Requested Tone: ${tone}
${context ? `Additional Context: ${context}` : ""}

Generate a response with the following JSON structure:
{
  "subject": "Re: [appropriate subject line]",
  "content": "Complete email response with proper greeting, body, and closing",
  "tone": "${tone}",
  "confidence": 85
}

The response should be:
- Professional and appropriate for business communication
- Address key points from the original email
- Include proper email etiquette (greeting, body, closing)
- Be concise but complete
- Match the requested tone while remaining professional`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert email assistant. Generate professional, contextually appropriate email responses that maintain proper business etiquette while addressing the key points from the original message."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4
    });

    const draft = JSON.parse(response.choices[0].message.content || "{}");
    return draft as DraftResponse;
  } catch (error) {
    console.error("Email draft generation failed:", error);
    // Return default response on error
    return {
      subject: `Re: ${originalSubject}`,
      content: "Thank you for your email. I will review the details and get back to you shortly.\n\nBest regards",
      tone,
      confidence: 50
    };
  }
}

export async function summarizeEmails(emails: Array<{ subject: string; content: string; sender: string }>): Promise<string> {
  try {
    const emailSummaries = emails.map((email, index) => 
      `Email ${index + 1}:\nFrom: ${email.sender}\nSubject: ${email.subject}\nContent: ${email.content.substring(0, 500)}\n---`
    ).join('\n');

    const prompt = `Summarize the following emails into a concise daily digest:

${emailSummaries}

Provide a summary that includes:
- Key themes and topics
- Important deadlines or time-sensitive items  
- Action items that need attention
- Any concerning or high-priority communications

Format as a brief, organized summary suitable for a daily briefing.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an executive assistant providing daily email summaries. Focus on actionable insights and priorities."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3
    });

    return response.choices[0].message.content || "Email summary unavailable";
  } catch (error) {
    console.error("Email summarization failed:", error);
    return "Email summary currently unavailable due to AI service error.";
  }
}
