import React from 'react';

interface Activity {
  type: string;
  description: string;
  timestamp: Date;
}

interface RecentActivityProps {
  activities: Activity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      'access': '🔐',
      'ia_usage': '🤖',
      'whatsapp': '💬',
      'critical_change': '⚠️'
    };
    return icons[type] || '📝';
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      'access': 'blue',
      'ia_usage': 'purple',
      'whatsapp': 'green',
      'critical_change': 'red'
    };
    return colors[type] || 'gray';
  };

  return (
    <div className="recent-activity">
      <h3>Atividades Recentes</h3>
      
      <div className="activity-list">
        {activities.length === 0 ? (
          <p className="no-activity">Nenhuma atividade recente</p>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className={`activity-item activity-${getActivityColor(activity.type)}`}>
              <span className="activity-icon">{getActivityIcon(activity.type)}</span>
              <div className="activity-content">
                <p className="activity-description">{activity.description}</p>
                <span className="activity-time">{formatDate(activity.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
