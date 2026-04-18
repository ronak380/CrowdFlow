import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Vertex AI / Gemini API Configuration Missing. Please ensure GEMINI_API_KEY is set in Cloud Run.' }, 
        { status: 503 }
      );
    }

    // Upgraded to 2.5-flash as requested (Stable and robust for 2026)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const systemInstruction = "You are CrowdBot, an official AI assistant for Wankhede Stadium's CrowdFlow queue management system. Keep answers helpful, concise, and related to stadium navigation, queues, rules, and waiting times. Maximum 2 sentences.";
    
    const result = await model.generateContent(`${systemInstruction}\n\nUser Question: ${prompt}`);
    const response = await result.response;
    
    return NextResponse.json({ reply: response.text() });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const errorMsg = error?.message || 'Unknown network error';
    
    return NextResponse.json(
      { error: `Failed: ${errorMsg}` }, 
      { status: 500 }
    );
  }
}
