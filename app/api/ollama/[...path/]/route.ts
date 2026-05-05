import { NextRequest, NextResponse } from 'next/server';
import { OllamaController } from '../../../../../backend/app/Controllers/OllamaController';

const controller = new OllamaController();

function getEndpoint(request: NextRequest) {
  const segments = new URL(request.url).pathname.split('/').filter(Boolean);
  return segments[segments.length - 1];
}

export async function GET(request: NextRequest) {
  const endpoint = getEndpoint(request);

  try {
    switch (endpoint) {
      case 'status':
        return NextResponse.json(await controller.status());
      case 'models':
        return NextResponse.json(await controller.models());
      default:
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const endpoint = getEndpoint(request);
  const body = await request.json();

  try {
    switch (endpoint) {
      case 'chat':
        return NextResponse.json(await controller.chat(body));
      case 'generate':
        return NextResponse.json(await controller.generate(body));
      case 'pull':
        return NextResponse.json(await controller.pull(body));
      case 'train':
        return NextResponse.json(await controller.train(body));
      default:
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
