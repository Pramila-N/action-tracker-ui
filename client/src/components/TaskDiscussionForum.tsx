import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TaskForumMessage, TaskForumStatus } from '@/types';

interface TaskDiscussionForumProps {
  taskId: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const normalizeMessage = (message: TaskForumMessage): TaskForumMessage => ({
  ...message,
  createdAt: new Date(message.createdAt),
});

const normalizeStatus = (status: TaskForumStatus): TaskForumStatus => ({
  ...status,
  expiresAt: new Date(status.expiresAt),
});

export function TaskDiscussionForum({ taskId }: TaskDiscussionForumProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const currentUserId = (user as { id?: string; _id?: string } | null)?.id
    || (user as { id?: string; _id?: string } | null)?._id
    || '';
  const [messages, setMessages] = useState<TaskForumMessage[]>([]);
  const [status, setStatus] = useState<TaskForumStatus | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const senderName = useCallback((message: TaskForumMessage) => {
    if (message.sender?.name) return message.sender.name;
    return message.senderRole === 'faculty' ? 'Faculty' : 'Student';
  }, []);

  const canPost = useMemo(() => {
    if (!status) return false;
    if (!status.isOpen) return false;
    if (status.userRole === 'student' && (status.dailyMessagesRemaining ?? 0) <= 0) return false;
    return true;
  }, [status]);

  const loadForum = useCallback(async () => {
    if (!user || !currentUserId) {
      setAccessError('Unable to identify the current user. Please log out and log in again.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setAccessError(null);

      const [statusResponse, messagesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/forum/status/${taskId}?userId=${currentUserId}`),
        fetch(`${API_BASE_URL}/api/forum/messages/${taskId}?userId=${currentUserId}`),
      ]);

      const statusData = await statusResponse.json().catch(() => null);
      const messagesData = await messagesResponse.json().catch(() => null);

      if (!statusResponse.ok) {
        throw new Error(statusData?.message || 'Failed to load forum status.');
      }

      if (!messagesResponse.ok) {
        throw new Error(messagesData?.message || 'Failed to load forum messages.');
      }

      setStatus(normalizeStatus(statusData));
      setMessages((messagesData.messages || []).map(normalizeMessage));
    } catch (error: any) {
      setAccessError(error.message || 'Unable to load this discussion forum.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, taskId, user]);

  useEffect(() => {
    loadForum();
  }, [loadForum]);

  useEffect(() => {
    if (!canPost) return;

    const intervalId = window.setInterval(() => {
      loadForum();
    }, 20000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [canPost, loadForum]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !currentUserId || !newMessage.trim() || !canPost) {
      return;
    }

    try {
      setIsSending(true);
      const response = await fetch(`${API_BASE_URL}/api/forum/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          senderId: currentUserId,
          message: newMessage.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to send message.');
      }

      setMessages((previous) => [...previous, normalizeMessage(data.message)]);
      setNewMessage('');

      const statusResponse = await fetch(`${API_BASE_URL}/api/forum/status/${taskId}?userId=${currentUserId}`);
      const statusData = await statusResponse.json().catch(() => null);
      if (statusResponse.ok) {
        setStatus(normalizeStatus(statusData));
      }
    } catch (error: any) {
      toast({
        title: 'Message not sent',
        description: error.message || 'Unable to send message right now.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading discussion forum...</p>
        </CardContent>
      </Card>
    );
  }

  if (accessError) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{accessError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Discussion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && !status.isOpen && (
          <Alert>
            <AlertDescription>Discussion is read-only. Task is completed.</AlertDescription>
          </Alert>
        )}

        {status?.userRole === 'student' && (
          <p className="text-sm text-muted-foreground">
            Daily messages: {status.dailyMessagesSent}/{status.dailyMessageLimit}
            {typeof status.dailyMessagesRemaining === 'number' ? ` (${status.dailyMessagesRemaining} remaining today)` : ''}
          </p>
        )}

        <ScrollArea className="h-72 rounded-md border">
          <div ref={listRef} className="space-y-3 p-3 max-h-72 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
            ) : (
              messages.map((message) => {
                const ownMessage = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={cn('flex', ownMessage ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-lg border px-3 py-2 text-sm',
                        ownMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}
                    >
                      <div className={cn('mb-1 text-xs', ownMessage ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                        {senderName(message)}
                      </div>
                      <p className="whitespace-pre-wrap break-words">{message.message}</p>
                      <div className={cn('mt-1 text-[11px]', ownMessage ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {status?.userRole === 'student' && (status.dailyMessagesRemaining ?? 0) <= 0 && status.isOpen && (
          <Alert>
            <AlertDescription>
              Daily message limit reached. You can send more messages tomorrow.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            placeholder={status?.isOpen ? 'Write a message...' : 'Forum closed'}
            disabled={!canPost || isSending}
            maxLength={2000}
          />
          <Button type="submit" className="gap-2" disabled={!canPost || isSending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
