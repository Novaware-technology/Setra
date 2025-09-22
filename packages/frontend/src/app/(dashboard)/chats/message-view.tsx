// src/components/features/chat/message-view.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/uth-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

async function fetchMessages(conversationId: string) {
  return api(`/conversations/${conversationId}/messages`);
}

async function fetchConversation(conversationId: string) {
  const conversations = await api('/conversations');
  return conversations.find((conv: any) => conv.id === conversationId);
}

export function MessageView({ conversationId }: { conversationId: string | null }) {
  const { user } = useAuth();
  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId, // Só busca as mensagens se um ID for selecionado
  });

  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => fetchConversation(conversationId!),
    enabled: !!conversationId,
  });

  if (!conversationId) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="mt-2">As mensagens da conversa serão exibidas aqui</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center"><Spinner /></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="font-semibold">
            {conversation?.externalParticipantIdentifier ? (() => {
              const [name, phone] = conversation.externalParticipantIdentifier.split(';');
              const formattedPhone = phone ? `+55 (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}` : '';
              return formattedPhone;
            })() : 'Conversa'}
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-destructive">
            <p>Erro ao carregar mensagens</p>
            <p className="text-xs mt-2">Tente recarregar a página</p>
          </div>
        </div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="font-semibold">
            {conversation?.externalParticipantIdentifier ? (() => {
              const [name, phone] = conversation.externalParticipantIdentifier.split(';');
              const formattedPhone = phone ? `+55 (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}` : '';
              return formattedPhone;
            })() : 'Conversa'}
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>Nenhuma mensagem encontrada</p>
            <p className="text-xs mt-2">As mensagens aparecerão aqui quando forem enviadas</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho da Conversa */}
      <div className="p-4 border-b">
        <h2 className="font-semibold">
          {conversation?.externalParticipantIdentifier ? (() => {
            const [name, phone] = conversation.externalParticipantIdentifier.split(';');
            const formattedPhone = phone ? `+55 (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}` : '';
            return (
              <span>
                <span className="font-semibold">{formattedPhone}</span>
                <span className="text-sm font-medium text-muted-foreground ml-2">- {name}</span>
              </span>
            );
          })() : 'Conversa'}
        </h2>
      </div>

      {/* Área das Mensagens */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages?.map((message: any) => (
            <div key={message.id} className={cn('flex items-end gap-2', message.source === 'OPERATOR' ? 'justify-end' : 'justify-start')}>
              {/* Avatar do Contato Externo */}
              {message.source === 'EXTERNAL' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
              )}

              {/* Balão da Mensagem */}
              <div
                className={cn('max-w-xs rounded-lg p-3 text-sm',
                  message.source === 'OPERATOR'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <div className="flex items-end justify-between gap-2">
                  <div className="flex-1">
                    {message.content}
                  </div>
                  <div className="flex items-center text-xs whitespace-nowrap">
                    <span className={cn(
                      message.source === 'OPERATOR'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    )}>
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Avatar do Operador */}
              {message.source === 'OPERATOR' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user?.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-gray-600">
                      <p>{user?.email}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Área de informações sobre envio de mensagens */}
      <div className="p-4 border-t">
        <div className="text-center text-muted-foreground text-sm">
          <p>Você está vizualizando logs de conversa. Não é possível enviar mensagens por aqui.</p>
        </div>
      </div>
    </div>
  );
}