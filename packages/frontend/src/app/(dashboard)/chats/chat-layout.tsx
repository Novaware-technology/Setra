// src/components/features/chat/chat-layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ConversationList } from './conversation-list';
import { MessageView } from './message-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MessageSquare, Users } from 'lucide-react';

export function ChatLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Detectar parâmetro de conversa na URL
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    if (conversationParam) {
      setSelectedConversationId(conversationParam);
    }
  }, [searchParams]);

  // Lógica para mostrar/ocultar painéis no mobile
  useEffect(() => {
    if (isMobile) {
      if (selectedConversationId) {
        setShowConversationList(false); // Ocultar lista quando há conversa selecionada
      } else {
        setShowConversationList(true); // Mostrar lista quando não há conversa selecionada
      }
    } else {
      setShowConversationList(true); // Sempre mostrar lista no desktop
    }
  }, [isMobile, selectedConversationId]);

  const handleBackToList = () => {
    setSelectedConversationId(null);
    setShowConversationList(true);
    // Limpar parâmetro da URL
    router.push('/chats');
  };

  const handleSelectConversation = (conversationId: string | null) => {
    setSelectedConversationId(conversationId);
    // Atualizar URL com o ID da conversa
    if (conversationId) {
      router.push(`/chats?conversation=${conversationId}`);
    } else {
      router.push('/chats');
    }
  };

  // Layout para mobile
  if (isMobile) {
    return (
      <div className="h-full max-h-screen bg-gradient-to-br from-background to-muted/20">
        <Card className="h-full border-0 shadow-none bg-transparent">
          <CardContent className="p-0 h-full">
            {showConversationList ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold text-lg">Conversas</h2>
                  </div>
                </div>
                <div className="flex-1">
                  <ConversationList
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={handleSelectConversation}
                  />
                </div>
              </div>
            ) : (
              <MessageView
                conversationId={selectedConversationId}
                onBackToList={handleBackToList}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Layout para desktop
  return (
    <div className="h-full max-h-screen bg-gradient-to-br from-background to-muted/20">
      <Card className="h-full border-0 shadow-none bg-transparent">
        <CardContent className="p-0 h-full">
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full items-stretch"
          >
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <div className="h-full flex flex-col border-r bg-card/30 backdrop-blur-sm">
                <div className="p-4 border-b bg-card/50 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold text-lg">Conversas</h2>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <ConversationList
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={handleSelectConversation}
                  />
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-border/50 hover:bg-border transition-colors" />
            <ResizablePanel defaultSize={75}>
              <div className="h-full bg-card/20 backdrop-blur-sm">
                <MessageView 
                  conversationId={selectedConversationId} 
                  onBackToList={undefined}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </CardContent>
      </Card>
    </div>
  );
}