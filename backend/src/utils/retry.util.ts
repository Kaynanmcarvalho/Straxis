/**
 * Retry Utility
 * 
 * Implementa retry com backoff exponencial para serviços externos
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  onRetry: () => {}
};

/**
 * Executa uma função com retry e backoff exponencial
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Se for a última tentativa, lançar o erro
      if (attempt === opts.maxAttempts) {
        throw lastError;
      }

      // Calcular delay com backoff exponencial
      const delay = Math.min(
        opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelayMs
      );

      // Callback de retry
      opts.onRetry(attempt, lastError);

      // Aguardar antes de tentar novamente
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Aguarda por um período de tempo
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifica se um erro é recuperável (deve tentar novamente)
 */
export function isRetryableError(error: any): boolean {
  // Erros de rede
  if (error.code === 'ECONNRESET' || 
      error.code === 'ETIMEDOUT' || 
      error.code === 'ENOTFOUND') {
    return true;
  }

  // Erros HTTP 5xx (servidor)
  if (error.response?.status >= 500 && error.response?.status < 600) {
    return true;
  }

  // Erros HTTP 429 (rate limit)
  if (error.response?.status === 429) {
    return true;
  }

  // Timeout
  if (error.message?.includes('timeout')) {
    return true;
  }

  return false;
}

/**
 * Wrapper para retry apenas em erros recuperáveis
 */
export async function retryOnRecoverableError<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return retryWithBackoff(async () => {
    try {
      return await fn();
    } catch (error) {
      // Se não for recuperável, lançar imediatamente
      if (!isRetryableError(error)) {
        throw error;
      }
      throw error;
    }
  }, options);
}
