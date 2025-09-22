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
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';

async function fetchMessages(conversationId: string) {
  return api(`/conversations/${conversationId}/messages`);
}

async function fetchConversation(conversationId: string) {
  const conversations = await api('/conversations');
  return conversations.find((conv: any) => conv.id === conversationId);
}

export function MessageView({ 
  conversationId, 
  onBackToList 
}: { 
  conversationId: string | null;
  onBackToList?: () => void;
}) {
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

  const handleExportConversation = () => {
    if (!conversation || !messages) return;
    
    // Cabeçalho do CSV
    const headers = [
      'Data/Hora',
      'Origem',
      'Operador',
      'Mensagem'
    ];
    
    // Dados das mensagens
    const csvData = messages.map((message: any) => [
      new Date(message.createdAt).toLocaleString('pt-BR'),
      message.source === 'OPERATOR' ? 'Operador' : 'Cliente',
      message.operatorSender?.name || '',
      `"${message.content.replace(/"/g, '""')}"` // Escapa aspas duplas
    ]);
    
    // Combina cabeçalho com dados
    const csvContent = [
      headers.join(','),
      ...csvData.map((row: any) => row.join(','))
    ].join('\n');
    
    // Adiciona informações da conversa no início
    const [name, phone] = conversation.externalParticipantIdentifier.split(';');
    const formattedPhone = phone ? `+55 (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}` : '';
    const fullCsvContent = [
      `Conversa: ${formattedPhone} - ${name}`,
      `Data de Criação: ${new Date(conversation.createdAt).toLocaleString('pt-BR')}`,
      `Exportado em: ${new Date().toLocaleString('pt-BR')}`,
      '',
      csvContent
    ].join('\n');

    const blob = new Blob([fullCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversa-${conversation.externalParticipantIdentifier.split(';')[1] || conversation.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          <h2 className="font-semibold text-sm md:text-base">
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
          <h2 className="font-semibold text-base md:text-lg">
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
    <div className="flex flex-col h-full max-h-screen">
      {/* Cabeçalho da Conversa */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBackToList && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToList}
                className="p-1 h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h2 className="font-semibold text-base md:text-lg">
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
          
          {conversationId && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportConversation}
                    className="p-1 h-8 w-8"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600">
                  <p>Exportar conversa para CSV</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Área das Mensagens com Scroll */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full p-4">
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
      </div>
      
      {/* Área de informações sobre envio de mensagens */}
      <div className="p-4 border-t flex-shrink-0">
        <div className="text-center text-muted-foreground text-sm">
          <p>Você está vizualizando logs de conversa. Não é possível enviar mensagens por aqui.</p>
        </div>
      </div>
    </div>
  );
}