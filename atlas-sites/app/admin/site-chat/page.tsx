'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  timestamp: Date;
  isStreaming?: boolean;
  toolCalls?: string[];
}

interface Business {
  id: string;
  slug: string;
  name: string;
  template: string;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

// Custom Icons with distinctive design
const Icons = {
  neural: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="4" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="12" cy="20" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="20" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="6.5" cy="6.5" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="6.5" cy="17.5" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="17.5" cy="17.5" r="1.5" fill="currentColor" opacity="0.4" />
      <path d="M12 6v4M12 14v4M6 12h4M14 12h4M7.5 7.5l3 3M13.5 13.5l3 3M7.5 16.5l3-3M13.5 10.5l3-3" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <path d="M21 15L16 10L8 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 18L11 15L3 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C15.3019 3 18.1885 4.77814 19.7545 7.42909" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 3V8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  monitor: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 21H16M12 17V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  tablet: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sparkle: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M12 2L13.09 8.26L18 6L15.74 10.91L22 12L15.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L8.26 13.09L2 12L8.26 10.91L6 6L10.91 8.26L12 2Z" fill="currentColor" />
    </svg>
  ),
};

export default function SiteChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [chatOpen, setChatOpen] = useState(true);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  // Fetch businesses
  useEffect(() => {
    async function fetchBusinesses() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data } = await supabase
        .from('businesses')
        .select('id, slug, name, template')
        .order('name');

      if (data) {
        setBusinesses(data);
        if (data.length > 0) {
          setSelectedBusiness(data[0]);
        }
      }
    }

    fetchBusinesses();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Handle paste
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const base64 = evt.target?.result as string;
            setImages((prev) => [...prev, base64]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const base64 = evt.target?.result as string;
          setImages((prev) => [...prev, base64]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const base64 = evt.target?.result as string;
          setImages((prev) => [...prev, base64]);
        };
        reader.readAsDataURL(file);
      }
    });
  }, []);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Send message with streaming support
  const sendMessage = async () => {
    if (!input.trim() && images.length === 0) return;
    if (!selectedBusiness) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      images: images.length > 0 ? [...images] : undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setImages([]);
    setIsLoading(true);

    // Create placeholder for assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      toolCalls: [],
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const messageContent: any[] = [];

      if (userMessage.images) {
        for (const img of userMessage.images) {
          if (img.startsWith('data:')) {
            const mediaType = img.split(';')[0].split(':')[1];
            const base64Data = img.split(',')[1];
            messageContent.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            });
          }
        }
      }

      if (userMessage.content) {
        messageContent.push({ type: 'text', text: userMessage.content });
      }

      // Filter out messages with empty content (can happen during streaming)
      const apiMessages = messages
        .filter((msg) => msg.content && msg.content.trim() !== '')
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
      apiMessages.push({
        role: 'user',
        content: messageContent.length === 1 && messageContent[0].type === 'text'
          ? messageContent[0].text
          : messageContent,
      });

      const response = await fetch('/admin/api/site-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          business_slug: selectedBusiness.slug,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to get response');
      }

      // Read streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let toolCallsArray: string[] = [];
      let shouldRefreshPreview = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const msg = JSON.parse(line);

            switch (msg.type) {
              case 'text':
                if (msg.content) {
                  fullContent += msg.content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: fullContent, isStreaming: true }
                        : m
                    )
                  );
                }
                if (msg.session_id) {
                  setSessionId(msg.session_id);
                }
                break;

              case 'tool_call':
                if (msg.tool_name) {
                  toolCallsArray.push(msg.tool_name);
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, toolCalls: [...toolCallsArray] }
                        : m
                    )
                  );
                }
                break;

              case 'tool_result':
                // Tool executed - check if it was a modification
                if (msg.tool_name && ['update_section', 'add_section', 'remove_section', 'reorder_sections', 'update_theme'].includes(msg.tool_name)) {
                  shouldRefreshPreview = true;
                }
                break;

              case 'error':
                fullContent += `\n\nError: ${msg.content}`;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: fullContent, isStreaming: false }
                      : m
                  )
                );
                break;

              case 'done':
                // Streaming complete
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, isStreaming: false }
                      : m
                  )
                );
                if (msg.session_id) {
                  setSessionId(msg.session_id);
                }
                break;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }

      // Refresh preview if changes were made
      if (shouldRefreshPreview) {
        setTimeout(() => setPreviewKey((k) => k + 1), 500);
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, isStreaming: false }
            : m
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, isStreaming: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getPreviewUrl = () => {
    if (!selectedBusiness) return '';
    return `/${selectedBusiness.template}-${selectedBusiness.slug}`;
  };

  return (
    <>
      {/* Import fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap');

        .site-chat-container {
          font-family: 'Outfit', system-ui, sans-serif;
        }

        .site-chat-container code, .site-chat-container .mono {
          font-family: 'JetBrains Mono', monospace;
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes neural-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes thinking-dot {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }

        .neural-glow {
          animation: neural-pulse 2s ease-in-out infinite;
        }

        .thinking-dot:nth-child(1) { animation: thinking-dot 1.4s ease-in-out infinite; }
        .thinking-dot:nth-child(2) { animation: thinking-dot 1.4s ease-in-out 0.2s infinite; }
        .thinking-dot:nth-child(3) { animation: thinking-dot 1.4s ease-in-out 0.4s infinite; }

        .gradient-border {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.1));
        }

        .chat-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      <div className="site-chat-container h-[calc(100vh-3.5rem)] relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0a0c10 0%, #080a0e 50%, #0c0e14 100%)',
        }}
      >
        {/* Ambient background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.02]"
            style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Top Navigation Bar */}
        <header className="absolute top-0 left-0 right-0 h-14 z-20 flex items-center justify-between px-5"
          style={{
            background: 'linear-gradient(180deg, rgba(10,12,16,0.95) 0%, rgba(10,12,16,0.8) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Left: Logo + Business Selector */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-cyan-400"
                  style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)' }}
                >
                  {Icons.neural}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full neural-glow" />
              </div>
              <div>
                <span className="text-white/90 font-semibold text-sm tracking-tight">Site Studio</span>
                <span className="text-cyan-400/60 text-[10px] font-medium ml-1.5 tracking-wider uppercase">AI</span>
              </div>
            </div>

            <div className="h-6 w-px bg-white/5" />

            <select
              value={selectedBusiness?.slug || ''}
              onChange={(e) => {
                const biz = businesses.find((b) => b.slug === e.target.value);
                setSelectedBusiness(biz || null);
                setMessages([]);
                setSessionId(null);
                setPreviewKey((k) => k + 1);
                setIframeLoaded(false);
              }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-lg pl-3 pr-8 py-2 text-white/80 text-sm font-medium focus:outline-none focus:border-cyan-500/30 focus:bg-white/[0.05] transition-all cursor-pointer max-w-[260px] appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.3)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                backgroundSize: '16px',
              }}
            >
              {businesses.map((biz) => (
                <option key={biz.id} value={biz.slug} className="bg-[#1a1c22] text-white">
                  {biz.name}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Viewport + Refresh */}
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              {(['desktop', 'tablet', 'mobile'] as ViewportSize[]).map((size) => {
                const Icon = size === 'desktop' ? Icons.monitor : size === 'tablet' ? Icons.tablet : Icons.phone;
                const isActive = viewport === size;
                return (
                  <button
                    key={size}
                    onClick={() => setViewport(size)}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'text-white/30 hover:text-white/60 hover:bg-white/[0.03]'
                    }`}
                    style={isActive ? { boxShadow: '0 0 20px rgba(6, 182, 212, 0.1)' } : {}}
                  >
                    {Icon}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setIframeLoaded(false);
                setPreviewKey((k) => k + 1);
              }}
              className="p-2 text-white/30 hover:text-cyan-400 hover:bg-cyan-500/5 rounded-lg transition-all duration-200"
              title="Refresh preview"
            >
              {Icons.refresh}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="pt-14 h-full flex">
          {/* Preview Canvas */}
          <div className="flex-1 p-5 flex items-center justify-center relative">
            {selectedBusiness ? (
              <div
                className="relative h-full transition-all duration-500 ease-out"
                style={{
                  width: viewportWidths[viewport],
                  maxWidth: '100%',
                }}
              >
                {/* Device frame */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)',
                    padding: '1px',
                  }}
                >
                  <div className="w-full h-full rounded-2xl" style={{ background: '#0a0c10' }} />
                </div>

                {/* Preview iframe */}
                <div
                  className="relative h-full rounded-2xl overflow-hidden"
                  style={{
                    boxShadow: `
                      0 0 0 1px rgba(255,255,255,0.04),
                      0 20px 50px -10px rgba(0,0,0,0.5),
                      0 0 100px -20px rgba(6, 182, 212, 0.1)
                    `,
                  }}
                >
                  {!iframeLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0c0e14] z-10">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center text-cyan-400/60">
                            {Icons.sparkle}
                          </div>
                        </div>
                        <span className="text-white/30 text-sm font-medium">Loading preview...</span>
                      </div>
                    </div>
                  )}
                  <iframe
                    key={previewKey}
                    src={`${getPreviewUrl()}?preview=true&t=${previewKey}`}
                    className="w-full h-full border-0 bg-white"
                    title="Site Preview"
                    onLoad={() => setIframeLoaded(true)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white/10"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 100%)' }}
                >
                  {Icons.monitor}
                </div>
                <p className="text-white/20 text-sm">Select a business to preview</p>
              </div>
            )}
          </div>

          {/* Chat Panel */}
          <div
            className={`h-full flex flex-col transition-all duration-400 ease-out overflow-hidden ${
              chatOpen ? 'w-[400px] opacity-100' : 'w-0 opacity-0'
            }`}
            style={{
              background: 'linear-gradient(180deg, rgba(14,16,22,0.95) 0%, rgba(10,12,16,0.98) 100%)',
              borderLeft: chatOpen ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}
          >
            {chatOpen && (
              <>
                {/* Chat Header */}
                <div className="h-14 flex items-center justify-between px-4 flex-shrink-0"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-cyan-400">{Icons.chat}</div>
                    <span className="text-white/70 text-sm font-semibold tracking-tight">Command</span>
                  </div>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="p-1.5 text-white/30 hover:text-white/60 hover:bg-white/[0.03] rounded-lg transition-all"
                  >
                    {Icons.chevronRight}
                  </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto chat-scrollbar p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="py-10 animate-slide-up">
                      {/* Welcome state */}
                      <div className="flex justify-center mb-6">
                        <div className="relative">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-cyan-400"
                            style={{
                              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.02) 100%)',
                              boxShadow: '0 0 40px rgba(6, 182, 212, 0.1)',
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                              <circle cx="12" cy="12" r="3" fill="currentColor" />
                              <circle cx="12" cy="4" r="2" fill="currentColor" opacity="0.5" />
                              <circle cx="12" cy="20" r="2" fill="currentColor" opacity="0.5" />
                              <circle cx="4" cy="12" r="2" fill="currentColor" opacity="0.5" />
                              <circle cx="20" cy="12" r="2" fill="currentColor" opacity="0.5" />
                              <path d="M12 7V9M12 15V17M7 12H9M15 12H17" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
                            </svg>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-emerald-900">
                              <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <p className="text-white/60 text-sm text-center mb-2 font-medium">
                        AI Site Editor Ready
                      </p>
                      <p className="text-white/30 text-xs text-center mb-6 max-w-[280px] mx-auto leading-relaxed">
                        Describe changes in natural language. Upload screenshots for reference.
                      </p>

                      <div className="space-y-2">
                        {[
                          { text: 'Change the headline to something bold', icon: '✏️' },
                          { text: 'Make the colors more modern', icon: '🎨' },
                          { text: 'Show me all the sections', icon: '📋' },
                        ].map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => setInput(suggestion.text)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group"
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.04)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(6, 182, 212, 0.05)';
                              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                            }}
                          >
                            <span className="text-base opacity-70 group-hover:opacity-100 transition-opacity">{suggestion.icon}</span>
                            <span className="text-white/50 text-sm group-hover:text-white/80 transition-colors">{suggestion.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'rounded-br-md'
                            : 'rounded-bl-md'
                        }`}
                        style={
                          message.role === 'user'
                            ? {
                                background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                                boxShadow: '0 4px 20px rgba(6, 182, 212, 0.2)',
                              }
                            : {
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                              }
                        }
                      >
                        {message.images && message.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {message.images.map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt={`Upload ${i + 1}`}
                                className="max-w-[140px] max-h-[90px] rounded-lg object-cover"
                                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                              />
                            ))}
                          </div>
                        )}
                        {/* Tool calls indicator */}
                        {message.toolCalls && message.toolCalls.length > 0 && message.isStreaming && (
                          <div className="flex items-center gap-2 mb-2 text-cyan-400/70 text-xs">
                            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40" strokeDashoffset="10" />
                            </svg>
                            <span>Using {message.toolCalls[message.toolCalls.length - 1]}...</span>
                          </div>
                        )}
                        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${
                          message.role === 'user' ? 'text-white' : 'text-white/80'
                        }`}>
                          {message.content}
                          {message.isStreaming && message.content && (
                            <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-0.5 animate-pulse" />
                          )}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Show loading only when we have a streaming message with no content yet */}
                  {messages.length > 0 &&
                   messages[messages.length - 1].role === 'assistant' &&
                   messages[messages.length - 1].isStreaming &&
                   !messages[messages.length - 1].content && (
                    <div className="flex justify-start animate-slide-up">
                      <div
                        className="rounded-2xl rounded-bl-md px-5 py-4"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-2 h-2 rounded-full bg-cyan-400 thinking-dot"
                              />
                            ))}
                          </div>
                          <span className="text-white/40 text-sm">
                            {messages[messages.length - 1].toolCalls?.length
                              ? `Using ${messages[messages.length - 1].toolCalls![messages[messages.length - 1].toolCalls!.length - 1]}...`
                              : 'Thinking...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((img, i) => (
                        <div key={i} className="relative flex-shrink-0 group">
                          <img
                            src={img}
                            alt={`Upload ${i + 1}`}
                            className="h-16 w-16 object-cover rounded-xl"
                            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                          />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                          >
                            {Icons.close}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div
                  className="p-4 flex-shrink-0"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <div
                    className="flex items-end gap-2 p-2 rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 text-white/30 hover:text-cyan-400 hover:bg-cyan-500/5 rounded-xl transition-all flex-shrink-0"
                      title="Upload image"
                    >
                      {Icons.image}
                    </button>

                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Describe your changes..."
                      rows={1}
                      className="flex-1 bg-transparent text-white/90 text-sm placeholder:text-white/20 focus:outline-none resize-none py-2.5 px-1"
                      style={{ maxHeight: '120px' }}
                    />

                    <button
                      onClick={sendMessage}
                      disabled={isLoading || (!input.trim() && images.length === 0)}
                      className="p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        background: (!input.trim() && images.length === 0)
                          ? 'rgba(255,255,255,0.05)'
                          : 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                        color: 'white',
                        boxShadow: (input.trim() || images.length > 0) ? '0 4px 15px rgba(6, 182, 212, 0.3)' : 'none',
                      }}
                    >
                      {Icons.send}
                    </button>
                  </div>

                  <p className="text-white/20 text-[10px] text-center mt-3 tracking-wide">
                    Paste images or drop files • Press Enter to send
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Floating Chat Toggle */}
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              className="absolute right-6 bottom-6 w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-105 group"
              style={{
                background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                boxShadow: '0 8px 30px rgba(6, 182, 212, 0.4), 0 0 60px rgba(6, 182, 212, 0.2)',
              }}
            >
              {Icons.chat}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping absolute" />
                <div className="w-1.5 h-1.5 bg-emerald-900 rounded-full relative" />
              </div>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
