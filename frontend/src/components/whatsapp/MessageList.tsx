import React, { useState, useEffect } from 'react';
import { MessageCircle, RefreshCw, Send, Bot, User, Clock } from 'lucide-react';
import { whatsappService } from '../../services/whatsapp.service';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingState } from '../ui/LoadingState';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';

export const MessageList: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await whatsappService.getMessages();
      setMessages(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  if (loading) {
    return <LoadingState message="Carregando mensagens..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadMessages} />;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-500/10 to-teal-500/10 dark:from-green-500/20 dark:to-teal-500/20 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Mensagens WhatsApp</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Histórico de conversas e interações
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={loadMessages}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {messages.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="Nenhuma mensagem encontrada"
            description="As mensagens do WhatsApp aparecerão aqui"
          />
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                  msg.type === 'sent'
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 ml-8'
                    : 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-200 dark:border-gray-700 mr-8'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {msg.type === 'sent' ? (
                      <>
                        <div className="p-1.5 bg-blue-500 rounded-lg">
                          <Send className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          Para: {msg.to}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="p-1.5 bg-gray-500 rounded-lg">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          De: {msg.from}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {msg.processedByIA && (
                      <Badge variant="primary" className="flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        IA
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="pl-7">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
