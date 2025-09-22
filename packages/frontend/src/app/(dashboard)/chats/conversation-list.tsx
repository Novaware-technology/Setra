// src/components/features/chat/conversation-list.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

async function fetchConversations() {
  return api('/conversations');
}

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
  });

  if (isLoading) return <div className="p-4 text-center"><Spinner /></div>;

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        <p>Erro ao carregar conversas</p>
        <p className="text-xs mt-2">Tente recarregar a página</p>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col">
        <div className="p-4 pb-2">
          <h2 className="font-semibold text-lg">Conversas</h2>
        </div>
        <div className="p-4 text-center text-muted-foreground">
          <p className="text-xs mt-2">As conversas aparecerão aqui quando forem iniciadas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="p-4 pb-2">
        <h2 className="font-semibold text-lg">Conversas</h2>
      </div>
      <div className="flex flex-col gap-2 p-4 pt-0">
        {conversations?.map((convo: any) => (
        <button
          key={convo.id}
          onClick={() => onSelectConversation(convo.id)}
          className={cn(
            'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
            selectedConversationId === convo.id && 'bg-accent'
          )}
        >
          <div className="flex w-full flex-col gap-1">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="font-semibold">
                  {(() => {
                    const [name, phone] = convo.externalParticipantIdentifier.split(';');
                    const formattedPhone = phone ? `+55 (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}` : '';
                    return <span className="font-semibold">{formattedPhone}</span>;
                  })()}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Conversa iniciada em {new Date(convo.createdAt).toLocaleDateString()}</span>
              <span>{new Date(convo.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </button>
        ))}
      </div>
    </div>
  );
}