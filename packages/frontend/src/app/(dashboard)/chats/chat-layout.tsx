// src/components/features/chat/chat-layout.tsx
'use client';

import { useState } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ConversationList } from './conversation-list';
import { MessageView } from './message-view';

export function ChatLayout() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

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
        <MessageView conversationId={selectedConversationId} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}