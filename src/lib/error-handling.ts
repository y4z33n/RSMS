import { FirebaseError } from 'firebase/app';

// Custom error classes
export class AuthenticationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error handler function
export function handleFirebaseError(error: FirebaseError | Error): Error {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-email':
        return new AuthenticationError('Invalid email or password', error.code);
      case 'auth/email-already-in-use':
        return new AuthenticationError('Email already in use', error.code);
      case 'permission-denied':
        return new DatabaseError('Permission denied', error.code);
      default:
        return new Error('An unexpected error occurred');
    }
  }
  return error;
}

// Type guard for error types
export function isAuthError(error: Error): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

export function isDatabaseError(error: Error): error is DatabaseError {
  return error instanceof DatabaseError;
}

export function isValidationError(error: Error): error is ValidationError {
  return error instanceof ValidationError;
} 