export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      if (error && typeof error === 'object' && 'code' in error) {
        const apiError = error as { code: string; message: string };
        if (apiError.code === 'conflict_error') {
          console.warn(`Conflict error (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
          continue;
        }
      }

      throw error;
    }
  }

  throw lastError!;
}