export interface Company {
  id: string;
  name: string;
  planMonths: number;
  planStartDate: Date;
  planEndDate: Date;
  active: boolean;
  config: CompanyConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyConfig {
  valorCargaPorToneladaCentavos: number;
  valorDescargaPorToneladaCentavos: number;
  whatsappEnabled: boolean;
  iaEnabled: boolean;
  iaProvider: 'openai' | 'gemini' | null;
  iaModel: string | null;
  iaPrompt: string | null;
  rateLimits: RateLimits;
  fallbackMessages: FallbackMessages;
}

export interface RateLimits {
  whatsappMessagesPerDay: number;
  whatsappMessagesPerMinute: number;
  whatsappCooldownSeconds: number;
  iaRequestsPerMinute: number;
  iaRequestsPerDayPerUser: number;
}

export interface FallbackMessages {
  iaFailure: string;
  whatsappDisconnected: string;
  messageNotUnderstood: string;
  rateLimitReached: string;
}
