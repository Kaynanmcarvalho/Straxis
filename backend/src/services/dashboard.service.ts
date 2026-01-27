import admin from 'firebase-admin';

interface DashboardIndicators {
  faturamentoMesAtualCentavos: number;
  custosMesAtualCentavos: number;
  lucroMesAtualCentavos: number;
  usoIAMesAtualCentavos: number;
  funcionariosAtivos: number;
}

class DashboardService {
  async getIndicators(companyId: string): Promise<DashboardIndicators> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Buscar trabalhos do mês atual
    const trabalhosSnapshot = await admin.firestore()
      .collection(`companies/${companyId}/trabalhos`)
      .where('data', '>=', startOfMonth)
      .where('data', '<=', endOfMonth)
      .where('deletedAt', '==', null)
      .get();

    let faturamentoMesAtualCentavos = 0;
    let custosMesAtualCentavos = 0;

    trabalhosSnapshot.forEach(doc => {
      const trabalho = doc.data();
      faturamentoMesAtualCentavos += trabalho.valorRecebidoCentavos || 0;
      custosMesAtualCentavos += trabalho.totalPagoCentavos || 0;
    });

    const lucroMesAtualCentavos = faturamentoMesAtualCentavos - custosMesAtualCentavos;

    // Buscar uso de IA do mês atual
    const iaUsageSnapshot = await admin.firestore()
      .collection(`companies/${companyId}/iaUsage`)
      .where('timestamp', '>=', startOfMonth)
      .where('timestamp', '<=', endOfMonth)
      .get();

    let usoIAMesAtualCentavos = 0;
    iaUsageSnapshot.forEach(doc => {
      const usage = doc.data();
      usoIAMesAtualCentavos += usage.estimatedCostCentavos || 0;
    });

    // Buscar funcionários ativos
    const funcionariosSnapshot = await admin.firestore()
      .collection(`companies/${companyId}/funcionarios`)
      .where('active', '==', true)
      .where('deletedAt', '==', null)
      .get();

    const funcionariosAtivos = funcionariosSnapshot.size;

    return {
      faturamentoMesAtualCentavos,
      custosMesAtualCentavos,
      lucroMesAtualCentavos,
      usoIAMesAtualCentavos,
      funcionariosAtivos
    };
  }

  async getMonthlyRevenue(companyId: string, months: number = 6): Promise<Array<{
    month: string;
    revenueCentavos: number;
  }>> {
    const now = new Date();
    const results = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const trabalhosSnapshot = await admin.firestore()
        .collection(`companies/${companyId}/trabalhos`)
        .where('data', '>=', startOfMonth)
        .where('data', '<=', endOfMonth)
        .where('deletedAt', '==', null)
        .get();

      let revenueCentavos = 0;
      trabalhosSnapshot.forEach(doc => {
        const trabalho = doc.data();
        revenueCentavos += trabalho.valorRecebidoCentavos || 0;
      });

      results.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        revenueCentavos
      });
    }

    return results;
  }

  async getRecentActivity(companyId: string, limit: number = 10): Promise<Array<{
    type: string;
    description: string;
    timestamp: Date;
  }>> {
    const logsSnapshot = await admin.firestore()
      .collection('logs')
      .where('companyId', '==', companyId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return logsSnapshot.docs.map(doc => {
      const log = doc.data();
      return {
        type: log.type,
        description: log.action,
        timestamp: log.timestamp.toDate()
      };
    });
  }
}

export const dashboardService = new DashboardService();
