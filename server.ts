import express, { Request, Response } from 'express';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Enable JSON parsing with 25MB limit for attachments/code files
app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey && apiKey.length > 5),
    timestamp: new Date().toISOString(),
    model: 'gemini-3.8-flash',
  });
});

// Ingest Web Page URL Endpoint for Knowledge Base
app.post('/api/knowledge/fetch-url', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    const targetUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const pageRes = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) DakshIntelligence/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    clearTimeout(timeout);

    if (!pageRes.ok) {
      return res.status(pageRes.status).json({ error: `Failed to fetch URL. HTTP status: ${pageRes.status}` });
    }

    const html = await pageRes.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : new URL(targetUrl).hostname;

    // Strip scripts, styles, noscript, svg, nav, footer
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    // Truncate if excessively long (keep first ~15,000 characters for high quality extraction)
    if (text.length > 15000) {
      text = text.slice(0, 15000) + '... [Content truncated for ingestion]';
    }

    const words = text.split(/\s+/).filter(Boolean).length;

    res.json({
      title,
      url: targetUrl,
      content: text,
      wordCount: words,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('URL Fetch error:', err);
    res.status(500).json({ error: err.name === 'AbortError' ? 'URL request timed out (8s limit)' : (err?.message || 'Failed to scrape URL') });
  }
});

// Streaming Chat API Endpoint with Short-term Memory & Knowledge Base Grounding
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, systemInstruction, temperature = 0.7, fileAttachment, knowledgeContext, taskContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
      });
    }

    // Short-Term Memory: Retain up to the last 10 conversational turns (20 messages max)
    const memoryMessages = messages.slice(-12);

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    // Build system instruction with Knowledge Base and Tasks injection
    let effectiveSystem = systemInstruction || `You are Daksh Intelligence, a state-of-the-art PC Desktop AI Assistant and Workstation Copilot, engineered and owned by Daksh Bugalia.
You specialize in helping users on their personal computers with:
1. Answering questions using your built-in knowledge base, citing ingested source documents and URLs accurately.
2. Short-term conversational memory: recall earlier user statements, questions, code, and preferences within this session.
3. Managing user tasks, deadlines, and reminders.
4. Programming, script automation (PowerShell, Bash, Python, JS, C++, Rust, etc.), debugging, and software architecture.
5. System workflows, shortcuts, file organization, terminal commands, and productivity.
When asked who built or owns you, proudly state that you are Daksh Intelligence, personal PC copilot created and owned by Daksh Bugalia. Maintain a polite, razor-sharp, and resourceful PC assistant demeanor.`;

    if (knowledgeContext && typeof knowledgeContext === 'string' && knowledgeContext.trim().length > 0) {
      effectiveSystem += `\n\n=== INGESTED KNOWLEDGE BASE CONTEXT ===
The user has provided the following verified knowledge base documents/URLs. Always reference and prioritize this information when answering user questions relevant to these topics, and cite the document title or source URL:
${knowledgeContext}
=======================================`;
    }

    if (taskContext && typeof taskContext === 'string' && taskContext.trim().length > 0) {
      effectiveSystem += `\n\n=== USER'S ACTIVE TASKS & REMINDERS ===
${taskContext}
If the user asks about their tasks or asks you to modify/add a task, refer to this list.
=======================================`;
    }

    // Format messages for @google/genai
    const formattedContents = memoryMessages.map((msg: any, index: number) => {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      const parts: any[] = [];

      // If user message is the last one and includes an attachment
      if (index === memoryMessages.length - 1 && fileAttachment && fileAttachment.data && fileAttachment.mimeType) {
        if (fileAttachment.mimeType.startsWith('image/')) {
          parts.push({
            inlineData: {
              mimeType: fileAttachment.mimeType,
              data: fileAttachment.data,
            },
          });
        } else if (fileAttachment.text) {
          parts.push({
            text: `[Attached File: ${fileAttachment.name || 'document'}]\n\`\`\`\n${fileAttachment.text}\n\`\`\`\n\n`,
          });
        }
      }

      parts.push({ text: msg.content || '' });
      return { role, parts };
    });

    // Multi-tier model fallback for resilient answering without 503 downtime
    const candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-3.8-flash',
    ];

    let activeStream: { firstChunk: any; iterator: AsyncIterator<any> } | null = null;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const config: any = {
          systemInstruction: effectiveSystem,
          temperature: Math.max(0, Math.min(1.5, Number(temperature) || 0.7)),
        };
        // Apply low thinking level for models that support it
        if (model.includes('3.') || model.includes('4-')) {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const candidateStream = await ai.models.generateContentStream({
          model,
          contents: formattedContents,
          config,
        });

        // Test iterator readiness: if 503 or overload occurs, it catches here before writing to client
        const iterator = candidateStream[Symbol.asyncIterator]();
        const first = await iterator.next();

        activeStream = {
          firstChunk: first.done ? null : first.value,
          iterator,
        };
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} unavailable (falling back):`, err?.message || err);
      }
    }

    if (!activeStream) {
      throw lastError || new Error('All AI models are temporarily busy. Please try again.');
    }

    if (activeStream.firstChunk?.text) {
      res.write(`data: ${JSON.stringify({ text: activeStream.firstChunk.text })}\n\n`);
    }

    while (true) {
      const { done, value } = await activeStream.iterator.next();
      if (done) break;
      const text = value?.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err: any) {
    let rawError = err?.message || 'Error communicating with AI Assistant';
    try {
      const parsed = JSON.parse(rawError);
      if (parsed.error?.message) {
        rawError = parsed.error.message;
        try {
          const inner = JSON.parse(rawError);
          if (inner.error?.message) rawError = inner.error.message;
        } catch {}
      }
    } catch {}

    if (rawError.includes('503') || rawError.toLowerCase().includes('high demand')) {
      rawError = 'The AI model is experiencing a temporary spike in global demand. Please try sending your message again in a moment.';
    }

    console.error('Chat generation error:', rawError);
    if (!res.headersSent) {
      res.status(500).json({ error: rawError });
    } else {
      res.write(`data: ${JSON.stringify({ error: rawError })}\n\n`);
      res.end();
    }
  }
});

// PC Assistant Quick Tool Runner
app.post('/api/quick-tool', async (req: Request, res: Response) => {
  try {
    const { toolType, input, context } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input text is required' });
    }

    let prompt = '';
    let systemInstruction = 'You are a specialized PC desktop productivity utility.';

    switch (toolType) {
      case 'powershell_generator':
        systemInstruction = 'You are a Windows PowerShell and Command Line automation expert.';
        prompt = `Generate a safe, robust PowerShell script for the following task. Include comments and safety flags:\n\nTask: ${input}\nContext: ${context || 'Windows PC'}`;
        break;
      case 'bash_generator':
        systemInstruction = 'You are a Linux/macOS Bash terminal automation expert.';
        prompt = `Generate an efficient, robust shell/Bash script for the following task. Include error handling (set -euo pipefail if appropriate) and usage comments:\n\nTask: ${input}\nContext: ${context || 'Unix PC'}`;
        break;
      case 'code_debugger':
        systemInstruction = 'You are a senior code architect and debugger.';
        prompt = `Analyze this code snippet or error stack trace. Identify root cause, provide fixed code, and explain why:\n\n${input}`;
        break;
      case 'regex_builder':
        systemInstruction = 'You are a Regular Expression specialist.';
        prompt = `Create a regex matching the following requirements, explain each token, and provide test sample matches:\n\nRequirement: ${input}`;
        break;
      case 'summarizer':
        systemInstruction = 'You are a concise executive summarizer.';
        prompt = `Provide a structured summary of the following content with key takeaways and actionable points:\n\n${input}`;
        break;
      default:
        prompt = input;
    }

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
    let response: any = null;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });
        if (response) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Quick-tool model ${model} failed, trying fallback:`, err?.message || err);
      }
    }

    if (!response) {
      throw lastError || new Error('Failed to process quick tool');
    }

    res.json({ result: response.text || '' });
  } catch (err: any) {
    let rawError = err?.message || 'Failed to process quick tool';
    try {
      const parsed = JSON.parse(rawError);
      if (parsed.error?.message) {
        rawError = parsed.error.message;
        try {
          const inner = JSON.parse(rawError);
          if (inner.error?.message) rawError = inner.error.message;
        } catch {}
      }
    } catch {}

    if (rawError.includes('503') || rawError.toLowerCase().includes('high demand')) {
      rawError = 'The AI model is experiencing a temporary spike in global demand. Please try again in a moment.';
    }

    console.error('Quick tool error:', rawError);
    res.status(500).json({ error: rawError });
  }
});

// Text to Speech endpoint using gemini-3.8-flash-lite-tts
app.post('/api/voice/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // Truncate to reasonable length for instant playback
    const cleanText = text.slice(0, 800);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: cleanText }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice || 'Kore',
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audio: base64Audio, mimeType: 'audio/wav' });
    }

    return res.status(500).json({ error: 'No audio generated by model' });
  } catch (err: any) {
    console.warn('TTS error (fallback available in frontend):', err?.message);
    res.status(500).json({ error: err?.message || 'TTS generation failed' });
  }
});

// Audio Transcription endpoint using gemini-3.5-transcribe
app.post('/api/voice/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;
    if (!audioData || typeof audioData !== 'string') {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const cleanBase64 = audioData.includes(',') ? audioData.split(',')[1] : audioData;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: cleanBase64,
            },
          },
          {
            text: 'Transcribe this spoken speech accurately. Return ONLY the transcribed text in the language spoken. Do not add quotes, introductory tags, or extra commentary.',
          },
        ],
      },
    });

    const transcript = response.text ? response.text.trim() : '';
    res.json({ transcript });
  } catch (err: any) {
    console.error('Audio transcription error:', err);
    res.status(500).json({ error: err?.message || 'Speech transcription failed' });
  }
});

// Vite Middleware Mounting / Static Asset Serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aura PC AI Assistant Server active on port ${PORT} [${isDev ? 'development' : 'production'}]`);
  });
}

startServer();
