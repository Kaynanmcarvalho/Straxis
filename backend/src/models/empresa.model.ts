import { Company, CompanyConfig, RateLimits, FallbackMessages } from '../types';

export class EmpresaModel {
  static createDefaultConfig(): CompanyConfig {
    return {
      valorCargaPorToneladaCentavos: 0,
      valorDescargaPorToneladaCentavos: 0,
      whatsappEnabled: false,
      iaEnabled: false,
      iaProvider: null,
      iaModel: null,
      iaPrompt: null,
      rateLimits: {
        whatsappMessagesPerDay: 1000,
        whatsappMessagesPerMinute: 10,
        whatsappCooldownSeconds: 30,
        iaRequestsPerMinute: 60,
        iaRequestsPerDayPerUser: 500,
      },
      fallbackMessages: {
        iaFailure: 'Desculpe, não consegui processar sua solicitação no momento. Tente novamente mais tarde.',
        whatsappDisconnected: 'WhatsApp foi desconectado. Por favor, reconecte escaneando o QR Code.',
        messageNotUnderstood: 'Desculpe, não entendi sua mensagem. Pode reformular?',
        rateLimitReached: 'Limite de requisições atingido. Aguarde alguns minutos e tente novamente.',
      },
    };
  }

  static create(data: Partial<Company>): Company {
    const now = new Date();
    const planStartDate = data.planStartDate || now;
    const planMonths = data.planMonths || 1;
    const planEndDate = new Date(planStartDate);
    planEndDate.setMonth(planEndDate.getMonth() + planMonths);

    return {
      id: data.id || '',
      name: data.name || '',
      planMonths,
      planStartDate,
      planEndDate,
      active: data.active !== undefined ? data.active : true,
      config: data.config || this.createDefaultConfig(),
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
  }

  static validate(company: Partial<Company>): string[] {
    const errors: string[] = [];

    if (!company.name) {
      errors.push('Nome da empresa é obrigatório');
    }

    if (!company.planMonths || company.planMonths <= 0) {
      errors.push('Plano em meses deve ser maior que zero');
    }

    return errors;
  }

  static toFirestore(company: Company): Record<string, any> {
    return {
      name: company.name,
      planMonths: company.planMonths,
      planStartDate: company.planStartDate,
      planEndDate: company.planEndDate,
      active: company.active,
      config: company.config,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  static fromFirestore(id: string, data: any): Company {
    return {
      id,
      name: data.name,
      planMonths: data.planMonths,
      planStartDate: data.planStartDate?.toDate() || new Date(),
      planEndDate: data.planEndDate?.toDate() || new Date(),
      active: data.active,
      config: data.config || this.createDefaultConfig(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  static isPlanActive(company: Company): boolean {
    return company.active && company.planEndDate > new Date();
  }
}
