export interface ApiError {
  status: number;
  data: {
    message: string;
    errors?: Record<string, string[]>;
    code?: string;
  };
}

export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  AUTH = 'AUTH_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  SERVER = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN_ERROR',
}

export class AppError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'AppError';
  }

  static fromApiError(error: ApiError): AppError {
    if (error.status === 0) {
      return new AppError(
        ErrorType.NETWORK,
        'Network error. Please check your connection.',
        error
      );
    }
    if (error.status === 404) {
      return new AppError(ErrorType.NOT_FOUND, 'Resource not found', error);
    }
    if (error.status >= 500) {
      return new AppError(
        ErrorType.SERVER,
        error.data?.message || 'Server error occurred',
        error
      );
    }
    if (error.status === 401 || error.status === 403) {
      return new AppError(
        ErrorType.AUTH,
        error.data?.message || 'Authentication failed',
        error
      );
    }
    if (error.status === 422 || error.status === 400) {
      return new AppError(
        ErrorType.VALIDATION,
        error.data?.message || 'Validation failed',
        error
      );
    }
    return new AppError(
      ErrorType.UNKNOWN,
      error.data?.message || 'An unknown error occurred',
      error
    );
  }
}
