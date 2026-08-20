import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = process.env.NUTRITION_API_KEY || process.env.VITE_NUTRITION_API_KEY || 'rMVu4aYBEzDZBvY5OHio1vk9tObxaIIxd0G4Ld0k';
    const upstreamUrl = 'https://nutriplan-api.vercel.app/api/nutrition/analyze';

    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Nutrition API Route error:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with NutriPlan Nutrition API' },
      { status: 500 }
    );
  }
}
