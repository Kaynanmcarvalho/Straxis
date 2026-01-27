import React from 'react';
import { MessageSquare } from 'lucide-react';
import { WhatsAppConfig } from '../components/whatsapp/WhatsAppConfig';
import { MessageList } from '../components/whatsapp/MessageList';
import { FadeInUp, StaggerList, StaggerItem } from '../components/ui/Animations';

const WhatsAppPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-100 dark:from-gray-950 dark:via-green-950/20 dark:to-gray-900 p-6 space-y-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 rounded-2xl shadow-lg shadow-green-500/50 dark:shadow-green-500/30">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-gray-800 dark:from-white dark:via-green-100 dark:to-gray-200 bg-clip-text text-transparent">
              Integração WhatsApp
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
              Configure e gerencie mensagens do WhatsApp
            </p>
          </div>
        </div>
      </FadeInUp>

      {/* Content */}
      <StaggerList className="space-y-6">
        <StaggerItem>
          <WhatsAppConfig />
        </StaggerItem>

        <StaggerItem>
          <MessageList />
        </StaggerItem>
      </StaggerList>
    </div>
  );
};

export default WhatsAppPage;
