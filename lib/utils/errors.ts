/**
 * Base application error with structured error information.
 * Never expose stack traces to clients — use code and message only.
 */
export class AppError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Validation error for invalid input data.
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

/**
 * Authentication/authorization error.
 */
export class AuthError extends AppError {
  constructor(message: string = "Non autorizzato") {
    super(message, "AUTH_ERROR", 401);
    this.name = "AuthError";
  }
}

/**
 * Resource not found error.
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Risorsa non trovata") {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

/**
 * Forbidden action error (user authenticated but not authorized).
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Accesso negato") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}
