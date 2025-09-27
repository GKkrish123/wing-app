"use client";

import { clientApi } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function MyConversations() {
  const { data: conversations, isLoading } = clientApi.chat.getMyHelperConversations.useQuery();

  if (isLoading) return <div>Loading conversations...</div>;

  return (
    <div className="space-y-4">
      {conversations?.map((convo) => (
        <div key={convo.id} className="p-4 border rounded-lg">
          <h3 className="font-bold">Chat for: {convo.request.title || 'Help Request'}</h3>
          <p>With: {convo.seeker.name}</p>
          <Link href={`/chat/${convo.id}`} passHref>
            <Button>Go to Chat</Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
