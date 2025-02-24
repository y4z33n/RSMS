import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { customerId, aadhaarNumber } = await request.json();

    if (!customerId || !aadhaarNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a custom token with customer claims
    const token = await adminAuth.createCustomToken(customerId, {
      role: 'customer',
      aadhaarNumber
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating customer token:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication token' },
      { status: 500 }
    );
  }
} 