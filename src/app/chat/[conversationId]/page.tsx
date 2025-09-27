"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { useParams } from 'next/navigation';
import { clientApi } from '@/trpc/react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VoiceChatService } from '@/services/voice-chat.service';
import { Mic, MicOff, PhoneOff, Send, ArrowLeft, DollarSign } from 'lucide-react';
import { ThemeToggler } from '@/components/ui/theme-toggler';
import { ChatBottomDrawers, MandatoryFeedbackModal, RatingFeedback } from '@/components/features';
import Link from 'next/link';
import { supabaseBrowser } from '@/util/supabase/browser';

type Message = {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string | Date;
  isOptimistic?: boolean;
  sender?: {
    name: string;
    id: string;
  };
};

// Memoized Message Component for better performance
const MessageItem = memo(({ message, isCurrentUser }: { message: Message; isCurrentUser: boolean }) => (
  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[85%] sm:max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
      isCurrentUser 
        ? 'bg-primary text-primary-foreground rounded-br-md' 
        : 'bg-muted text-muted-foreground rounded-bl-md'
    } ${message.isOptimistic ? 'opacity-70 animate-pulse' : ''}`}>
      <p className="text-sm leading-relaxed break-words">{message.content}</p>
      <div className="flex items-center gap-1 mt-1">
        <p className={`text-xs ${
          isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
        }`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        {message.isOptimistic && (
          <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  </div>
));
MessageItem.displayName = 'MessageItem';

// Memoized Header Component
const ChatHeader = memo(({ 
  otherUser, 
  voiceRoomUsers, 
  userData,
  isRequestEnded,
  onJoinVoice,
  onLeaveVoice,
  onToggleMute,
  isVoiceConnected,
  isMuted
}: {
  otherUser: any;
  voiceRoomUsers: string[];
  userData: any;
  isRequestEnded: boolean;
  onJoinVoice: () => void;
  onLeaveVoice: () => void;
  onToggleMute: () => void;
  isVoiceConnected: boolean;
  isMuted: boolean;
}) => (
  <div className="flex-shrink-0 border-b border-border bg-card/50 backdrop-blur-sm z-10">
    <div className="flex items-center justify-between p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <Link href="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
            {otherUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">{otherUser.name}</h1>
            {voiceRoomUsers.length > 0 && (
              <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                <span className="truncate">
                  {voiceRoomUsers.includes(userData?.id || '') 
                    ? `Voice connected (${voiceRoomUsers.length} users)`
                    : `${otherUser.name} in voice room`
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <ThemeToggler className="h-8 w-8 sm:h-9 sm:w-9" />
        {!isRequestEnded && (
          !isVoiceConnected ? (
            <Button onClick={onJoinVoice} size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-2 sm:px-3">
              <Mic className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Join Voice</span>
              <span className="sm:hidden">Voice</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button 
                onClick={onToggleMute} 
                size="icon" 
                variant={isMuted ? 'destructive' : 'outline'}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                {isMuted ? <MicOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Mic className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>
              <Button 
                onClick={onLeaveVoice} 
                size="icon" 
                variant="destructive"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <PhoneOff className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  </div>
));
ChatHeader.displayName = 'ChatHeader';

// Memoized Status Cards Component
const StatusCards = memo(({ currentBargain, serviceTransaction }: {
  currentBargain: any;
  serviceTransaction: any;
}) => (
  <>
    {currentBargain && currentBargain.status !== 'CONFIRMED' && (
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">
              Bargaining in progress: ${currentBargain.currentAmount}
            </p>
            <p className="text-xs text-blue-700">
              Use the bargain panel below to continue negotiations
            </p>
          </div>
        </div>
      </div>
    )}

    {currentBargain?.status === 'CONFIRMED' && serviceTransaction && (
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-900">
              Deal confirmed: ${currentBargain.currentAmount}
            </p>
            <p className="text-xs text-green-700">
              {serviceTransaction.paymentStatus === 'COMPLETED' 
                ? 'Payment completed - use panels below for location sharing'
                : 'Complete payment to proceed with service'
              }
            </p>
          </div>
        </div>
      </div>
    )}
  </>
));
StatusCards.displayName = 'StatusCards';

export default function ChatPage() {
  const { conversationId } = useParams();
  const { userData } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const voiceChatServiceRef = useRef<VoiceChatService | null>(null);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceRoomUsers, setVoiceRoomUsers] = useState<string[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const supabase = useMemo(() => supabaseBrowser(), []);

  const conversationIdString = conversationId as string;
  
  const { data: conversation, isLoading, error, refetch: refetchConversation } = clientApi.chat.getConversation.useQuery(
    { conversationId: conversationIdString },
    { 
      enabled: !!conversationIdString,
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false
    }
  );

  const sendMessageMutation = clientApi.chat.sendMessage.useMutation();

  const { data: currentBargain, refetch: refetchBargain } = clientApi.bargain.getCurrentBargain.useQuery(
    { conversationId: conversationIdString },
    { 
      enabled: !!conversationIdString,
      staleTime: 10000, // 10 seconds
      refetchOnWindowFocus: false
    }
  );

  const { data: serviceTransaction, refetch: refetchTransaction } = clientApi.payment.getServiceTransaction.useQuery(
    { conversationId: conversationIdString },
    { 
      enabled: !!conversationIdString && currentBargain?.status === 'CONFIRMED',
      staleTime: 10000,
      refetchOnWindowFocus: false
    }
  );

  const { data: locationData, refetch: refetchLocationData } = clientApi.locationSharing.getLocationSharing.useQuery(
    { conversationId: conversationIdString },
    { 
      enabled: !!conversationIdString,
      staleTime: 15000,
      refetchOnWindowFocus: false
    }
  );

  // Memoized computed values to prevent unnecessary recalculations
  const serverMessages = useMemo(() => conversation?.messages || [], [conversation?.messages]);
  const messages = useMemo(() => [...serverMessages, ...optimisticMessages], [serverMessages, optimisticMessages]);
  
  const isRequestEnded = useMemo(() => 
    Boolean(conversation?.request?.status && ['COMPLETED', 'CANCELLED', 'CLOSED'].includes(conversation.request.status)),
    [conversation?.request?.status]
  );
  
  const requestStatus = conversation?.request?.status;
  const isSeeker = useMemo(() => Boolean(conversation?.seeker.id === userData?.id), [conversation?.seeker.id, userData?.id]);
  const otherUser = useMemo(() => 
    isSeeker ? conversation?.helper : conversation?.seeker,
    [isSeeker, conversation?.helper, conversation?.seeker]
  );
  
  const requiresMandatoryFeedback = useMemo(() => 
    serviceTransaction && 
    serviceTransaction.serviceStatus === 'COMPLETED' &&
    ((isSeeker && !serviceTransaction.seekerFeedbackProvided) ||
     (!isSeeker && !serviceTransaction.helperFeedbackProvided)),
    [serviceTransaction, isSeeker]
  );

  // Optimized real-time subscription with debouncing and batched updates
  useEffect(() => {
    if (!conversationIdString) return;

    let refetchTimeout: NodeJS.Timeout;
    const debouncedRefetch = (refetchFn: () => Promise<any>) => {
      clearTimeout(refetchTimeout);
      refetchTimeout = setTimeout(() => refetchFn(), 100); // 100ms debounce
    };

    const channel = supabase
      .channel(`chat:${conversationIdString}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `conversationId=eq.${conversationIdString}`
        },
        async (payload) => {
          await refetchConversation();

          if (payload.new.senderId === userData?.id) {
            setOptimisticMessages(prev => 
              prev.filter(msg => 
                !(msg.content === payload.new.content && msg.senderId === payload.new.senderId)
              )
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Bargain',
          filter: `conversationId=eq.${conversationIdString}`
        },
        () => debouncedRefetch(refetchBargain)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'BargainOffer',
        },
        () => debouncedRefetch(refetchBargain)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ServiceTransaction',
          filter: `conversationId=eq.${conversationIdString}`
        },
        () => debouncedRefetch(refetchTransaction)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ConversationLocationSharing',
          filter: `conversationId=eq.${conversationIdString}`
        },
        () => debouncedRefetch(refetchLocationData)
      )
      .subscribe();

    return () => {
      clearTimeout(refetchTimeout);
      supabase.removeChannel(channel);
    };
  }, [conversationIdString, userData?.id, refetchConversation, refetchBargain, refetchTransaction, refetchLocationData, supabase]);

  // Optimized scroll effect with requestAnimationFrame and intersection observer
  const scrollToBottomRef = useRef<() => void>(() => {});
  
  scrollToBottomRef.current = useCallback(() => {
    if (scrollAreaRef.current) {
      const chatArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (chatArea) {
        requestAnimationFrame(() => {
          chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: "smooth" });
        });
      }
    }
  }, []);
  
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottomRef.current?.();
    }
  }, [messages.length]);

  useEffect(() => {
    return () => {
      voiceChatServiceRef.current?.disconnect();
    };
  }, []);

  // Memoized handlers to prevent unnecessary re-renders
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userData?.id) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      senderId: userData.id,
      conversationId: conversationIdString,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      await sendMessageMutation.mutateAsync({ 
        conversationId: conversationIdString, 
        content: messageContent 
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
      setNewMessage(messageContent);
    }
  }, [newMessage, userData?.id, conversationIdString, sendMessageMutation]);

  const handleJoinVoice = useCallback(async () => {
    if (!voiceChatServiceRef.current && userData) {
      const service = new VoiceChatService({
        conversationId: conversationIdString,
        userId: userData.id,
        onPeerConnected: () => {}, // Simplified - removed unused state
        onPeerDisconnected: () => {},
        onPresenceUpdate: setVoiceRoomUsers,
      });
      voiceChatServiceRef.current = service;
      try {
        await service.initialize();
        setIsVoiceConnected(true);
      } catch (err) {
        console.error('Failed to start voice chat', err);
        voiceChatServiceRef.current = null;
      }
    }
  }, [userData, conversationIdString]);

  const handleLeaveVoice = useCallback(async () => {
    if (voiceChatServiceRef.current) {
      await voiceChatServiceRef.current.disconnect();
      voiceChatServiceRef.current = null;
      setIsVoiceConnected(false);
      setVoiceRoomUsers([]);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    if (voiceChatServiceRef.current) {
      if (isMuted) {
        voiceChatServiceRef.current.unmute();
        setIsMuted(false);
      } else {
        voiceChatServiceRef.current.mute();
        setIsMuted(true);
      }
    }
  }, [isMuted]);

  // Early returns after all hooks - memoized loading states
  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 bg-destructive rounded-full"></div>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Error</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
  
  if (!conversation || !otherUser) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 bg-muted-foreground rounded-full"></div>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Conversation not found</h2>
        <p className="text-muted-foreground">This conversation may have been deleted or you don&apos;t have access to it.</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader
        otherUser={otherUser}
        voiceRoomUsers={voiceRoomUsers}
        userData={userData}
        isRequestEnded={isRequestEnded}
        onJoinVoice={handleJoinVoice}
        onLeaveVoice={handleLeaveVoice}
        onToggleMute={handleToggleMute}
        isVoiceConnected={isVoiceConnected}
        isMuted={isMuted}
      />

      {/* Read-Only Mode Banner */}
      {isRequestEnded && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-amber-800">
            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
            <span className="text-sm font-medium">
              Request {requestStatus?.toLowerCase()} - This conversation is now read-only
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-2 sm:p-4" ref={scrollAreaRef}>
          <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
            <StatusCards 
              currentBargain={currentBargain}
              serviceTransaction={serviceTransaction}
            />
            
            {messages.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted-foreground rounded-full"></div>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">Start the conversation</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Send a message to begin chatting with {otherUser.name}</p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageItem 
                  key={msg.id}
                  message={{
                    ...msg,
                    createdAt: typeof msg.createdAt === 'string' ? msg.createdAt : msg.createdAt.toISOString()
                  } as Message}
                  isCurrentUser={msg.senderId === userData?.id}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <ChatBottomDrawers
        conversationId={conversationIdString}
        isSeeker={isSeeker}
        otherUserName={otherUser.name}
        currentBargain={currentBargain}
        serviceTransaction={serviceTransaction}
        locationData={locationData}
        isRequestEnded={isRequestEnded}
      />

      {/* Fixed Footer - Message Input */}
      {!isRequestEnded ? (
        <div className="flex-shrink-0 border-t border-border bg-card/50 backdrop-blur-sm p-2 sm:p-4 z-10">
          <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="pr-10 sm:pr-12 h-10 sm:h-12 rounded-full border-2 focus:border-primary/50 bg-background/80 backdrop-blur-sm text-sm sm:text-base"
                disabled={sendMessageMutation.isPending}
                autoComplete="off"
              />
            </div>
            <Button 
              type="submit" 
              disabled={sendMessageMutation.isPending || !newMessage.trim()}
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {sendMessageMutation.isPending ? (
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-primary-foreground"></div>
              ) : (
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex-shrink-0 border-t border-border bg-muted/30 backdrop-blur-sm p-2 sm:p-4 z-10">
          <div className="flex items-center justify-center gap-2 text-muted-foreground max-w-4xl mx-auto">
            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
            <span className="text-sm">This conversation has ended - messaging is disabled</span>
          </div>
        </div>
      )}

      {serviceTransaction && (
        <RatingFeedback
          isOpen={isRatingDialogOpen}
          onOpenChange={setIsRatingDialogOpen}
          transactionId={serviceTransaction.id}
          otherUser={otherUser}
          isSeeker={isSeeker}
          onRatingSubmitted={refetchTransaction}
        />
      )}

      {requiresMandatoryFeedback && serviceTransaction && (
        <MandatoryFeedbackModal
          isOpen={true}
          onClose={() => {}}
          transactionId={serviceTransaction.id}
          otherUser={otherUser}
          role={isSeeker ? 'seeker' : 'helper'}
          requestTitle={conversation?.request?.title || undefined}
          onFeedbackSubmitted={refetchTransaction}
        />
      )}
    </div>
  );
}
