import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured in Cloud Run.' }, 
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const systemInstruction = "You are CrowdBot, an official AI assistant for Wankhede Stadium's CrowdFlow queue management system. Keep answers helpful, concise, and related to stadium navigation, queues, rules, and waiting times. Maximum 2 sentences.";
    
    const result = await model.generateContent(`${systemInstruction}\n\nUser Question: ${prompt}`);
    const response = await result.response;
    
    return NextResponse.json({ reply: response.text() });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    // Extract a readable error message from the error object
    const errorMsg = error?.message || 'Unknown network error';
    
    return NextResponse.json(
      { error: `Failed: ${errorMsg}` }, 
      { status: 500 }
    );
  }
}
