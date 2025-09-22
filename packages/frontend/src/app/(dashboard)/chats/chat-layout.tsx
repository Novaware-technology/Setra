// src/components/features/chat/chat-layout.tsx
'use client';

import { useState, useEffect } from 'react';
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
  };

  // Layout para mobile
  if (isMobile) {
    return (
      <div className="h-full max-h-screen">
        {showConversationList ? (
          <ConversationList
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
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
          onSelectConversation={setSelectedConversationId}
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