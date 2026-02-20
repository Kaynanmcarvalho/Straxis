/**
 * Timezone Utilities - Correção de Bloqueador Crítico
 * Garante consistência de datas em todo o sistema
 */

/**
 * Obtém a data/hora atual no timezone do usuário
 */
export function getNow(): Date {
  return new Date();
}

/**
 * Obtém o início do dia atual no timezone do usuário
 */
export function getStartOfToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * Obtém o fim do dia atual no timezone do usuário
 */
export function getEndOfToday(): Date {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
}

/**
 * Verifica se uma data é hoje
 */
export function isToday(date: Date): boolean {
  const today = getStartOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return date >= today && date < tomorrow;
}

/**
 * Obtém o início de uma data específica
 */
export function getStartOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Obtém o fim de uma data específica
 */
export function getEndOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Adiciona dias a uma data
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Formata data para exibição
 */
export function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
  if (format === 'short') {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formata hora para exibição
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

/**
 * Formata data e hora para exibição
 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Calcula diferença em dias entre duas datas
 */
export function daysBetween(date1: Date, date2: Date): number {
  const start = getStartOfDay(date1);
  const end = getStartOfDay(date2);
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Obtém o timezone offset do usuário
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

/**
 * Converte Firestore Timestamp para Date com timezone correto
 */
export function fromFirestoreTimestamp(timestamp: any): Date {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
}
