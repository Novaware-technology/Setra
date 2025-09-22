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
import { ArrowLeft } from 'lucide-react';

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
      <div className="h-full max-h-screen">
            {showConversationList ? (
              <ConversationList
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
              />
            ) : (
              <MessageView
                conversationId={selectedConversationId}
                onBackToList={handleBackToList}
              />
            )}
      </div>
    );
  }

  // Layout para desktop
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full max-h-screen items-stretch"
    >
          <ResizablePanel defaultSize={25} minSize={20}>
            <ConversationList
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
            />
          </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <MessageView 
          conversationId={selectedConversationId} 
          onBackToList={undefined}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}