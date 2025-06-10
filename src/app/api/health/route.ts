import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const isDbConnected = await db.testConnection();
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: isDbConnected ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    return NextResponse.json(health, { 
      status: isDbConnected ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const health = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(health, { status: 503 });
  }
}