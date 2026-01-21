import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useSocket } from "@/hooks/useSocket";
import { useEffect, useState, useRef } from "react";
import { Send, Paperclip, Image as ImageIcon, Loader2, Video, X } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  type: "text" | "image" | "video" | "file";
  fileUrl: string | null;
  isRead: number;
  createdAt: Date;
}

export default function Messages() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { socket, isConnected } = useSocket(user?.id);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: conversations, refetch: refetchConversations } = trpc.messaging.getConversations.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: conversationMessages, refetch: refetchMessages } = trpc.messaging.getMessages.useQuery(
    { conversationId: selectedConversationId! },
    { enabled: !!selectedConversationId }
  );

  const { data: unreadCount } = trpc.messaging.getUnreadCount.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchInterval: 5000 }
  );

  const uploadMediaMutation = trpc.messaging.uploadMedia.useMutation();

  // Initialize messages when conversation is selected
  useEffect(() => {
    if (conversationMessages) {
      setMessages(conversationMessages as Message[]);
    }
  }, [conversationMessages]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket || !selectedConversationId) return;

    // Join conversation room
    socket.emit('join_conversation', selectedConversationId);

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
      
      // Mark as read if it's from the other party
      if (message.senderId !== user?.id) {
        socket.emit('mark_as_read', {
          conversationId: selectedConversationId,
          userId: user?.id,
        });
      }
    };

    // Listen for typing indicator
    const handleUserTyping = (data: { userId: number; isTyping: boolean }) => {
      if (data.userId !== user?.id) {
        setIsTyping(data.isTyping);
      }
    };

    // Listen for messages read
    const handleMessagesRead = () => {
      refetchConversations();
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('messages_read', handleMessagesRead);
      socket.emit('leave_conversation', selectedConversationId);
    };
  }, [socket, selectedConversationId, user?.id, refetchConversations]);

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (socket && selectedConversationId && user?.id) {
      socket.emit('mark_as_read', {
        conversationId: selectedConversationId,
        userId: user.id,
      });
    }
  }, [socket, selectedConversationId, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !socket || !selectedConversationId || !user) return;

    socket.emit('send_message', {
      conversationId: selectedConversationId,
      senderId: user.id,
      content: messageInput.trim(),
      type: 'text',
    });

    setMessageInput("");
    
    // Stop typing indicator
    socket.emit('typing', {
      conversationId: selectedConversationId,
      userId: user.id,
      isTyping: false,
    });
  };

  const handleTyping = (value: string) => {
    setMessageInput(value);

    if (!socket || !selectedConversationId || !user) return;

    // Send typing indicator
    socket.emit('typing', {
      conversationId: selectedConversationId,
      userId: user.id,
      isTyping: true,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        conversationId: selectedConversationId,
        userId: user.id,
        isTyping: false,
      });
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast.error("Format non supporté. Utilisez JPG, PNG, GIF, WEBP, MP4, WEBM ou MOV.");
      return;
    }

    // Validate file size (max 16MB)
    if (file.size > 16 * 1024 * 1024) {
      toast.error("Fichier trop volumineux. Maximum 16 MB.");
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMedia = async () => {
    if (!selectedFile || !socket || !selectedConversationId || !user) return;

    setUploadingMedia(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const base64Content = base64Data.split(',')[1]; // Remove data:image/jpeg;base64, prefix

        // Upload to S3
        const result = await uploadMediaMutation.mutateAsync({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileData: base64Content,
        });

        if (result.success && result.fileUrl) {
          // Send message with media
          const messageType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
          
          socket.emit('send_message', {
            conversationId: selectedConversationId,
            senderId: user.id,
            content: messageType === 'image' ? '📷 Photo' : '🎥 Vidéo',
            type: messageType,
            fileUrl: result.fileUrl,
          });

          toast.success("Média envoyé !");
          handleCancelFile();
        } else {
          toast.error("Erreur lors de l'envoi du média");
        }
      };

      reader.onerror = () => {
        toast.error("Erreur lors de la lecture du fichier");
      };
    } catch (error) {
      console.error('Error sending media:', error);
      toast.error("Erreur lors de l'envoi du média");
    } finally {
      setUploadingMedia(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation('/');
    return null;
  }

  const selectedConversation = conversations?.find(c => c.id === selectedConversationId);

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif font-bold text-gold">Messagerie</h1>
          {unreadCount !== undefined && unreadCount > 0 && (
            <div className="bg-gold text-black px-3 py-1 rounded-full text-sm font-bold">
              {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Conversations List */}
          <Card className="bg-zinc-900 border-gold/20 p-4">
            <h2 className="text-xl font-semibold text-gold mb-4">Conversations</h2>
            <ScrollArea className="h-full">
              {conversations && conversations.length > 0 ? (
                <div className="space-y-2">
                  {conversations.map((conv) => {
                    const isCoach = user?.role === 'admin';
                    const unread = isCoach ? conv.unreadCountCoach : conv.unreadCountClient;
                    
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversationId(conv.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedConversationId === conv.id
                            ? 'bg-gold/20 border border-gold'
                            : 'bg-zinc-800 hover:bg-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-white">
                              {conv.otherUser?.name || 'Utilisateur'}
                            </p>
                            <p className="text-sm text-gray-400 truncate">
                              {new Date(conv.lastMessageAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          {unread > 0 && (
                            <div className="bg-gold text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              {unread}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">Aucune conversation</p>
              )}
            </ScrollArea>
          </Card>

          {/* Messages Area */}
          <Card className="bg-zinc-900 border-gold/20 p-4 md:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="pb-4 border-b border-gold/20">
                  <h2 className="text-xl font-semibold text-gold">
                    {selectedConversation.otherUser?.name || 'Utilisateur'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <p className="text-sm text-gray-400">
                      {isConnected ? 'En ligne' : 'Hors ligne'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 py-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.senderId === user?.id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isOwn
                                ? 'bg-gold text-black'
                                : 'bg-zinc-800 text-white'
                            }`}
                          >
                            {message.type === 'image' && message.fileUrl ? (
                              <div>
                                <img
                                  src={message.fileUrl}
                                  alt="Image"
                                  className="rounded-lg max-w-full h-auto mb-2 cursor-pointer"
                                  onClick={() => window.open(message.fileUrl!, '_blank')}
                                />
                                <p className="text-sm">{message.content}</p>
                              </div>
                            ) : message.type === 'video' && message.fileUrl ? (
                              <div>
                                <video
                                  src={message.fileUrl}
                                  controls
                                  className="rounded-lg max-w-full h-auto mb-2"
                                  style={{ maxHeight: '300px' }}
                                />
                                <p className="text-sm">{message.content}</p>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            )}
                            <p className={`text-xs mt-1 ${isOwn ? 'text-black/70' : 'text-gray-400'}`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-zinc-800 text-white rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="pt-4 border-t border-gold/20">
                  {/* Preview sélection fichier */}
                  {selectedFile && previewUrl && (
                    <div className="mb-3 p-3 bg-zinc-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          {selectedFile.type.startsWith('image/') ? (
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="rounded-lg max-h-32 object-cover"
                            />
                          ) : (
                            <video
                              src={previewUrl}
                              className="rounded-lg max-h-32"
                              controls
                            />
                          )}
                          <p className="text-sm text-gray-400 mt-2">{selectedFile.name}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSendMedia}
                            disabled={uploadingMedia}
                            className="bg-gold text-black hover:bg-gold/90"
                          >
                            {uploadingMedia ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelFile}
                            disabled={uploadingMedia}
                            className="border-gold/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-gold/20 hover:bg-gold/10"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!isConnected || uploadingMedia}
                      title="Envoyer une image"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-gold/20 hover:bg-gold/10"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!isConnected || uploadingMedia}
                      title="Envoyer une vidéo"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                    <Input
                      value={messageInput}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Écrivez votre message..."
                      className="flex-1 bg-zinc-800 border-gold/20 text-white"
                      disabled={!isConnected || uploadingMedia}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || !isConnected || uploadingMedia}
                      className="bg-gold text-black hover:bg-gold/90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400">Sélectionnez une conversation pour commencer</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
