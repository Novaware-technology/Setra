// src/app/(dashboard)/chats/page.tsx
import { ChatLayout } from "@/app/(dashboard)/chats/chat-layout";

export default function ChatsPage() {
  // A página em si só precisa renderizar o layout do chat
  // que por sua vez fica dentro do layout principal do dashboard
  return <ChatLayout />;
}