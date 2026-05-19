'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Fab,
  Paper,
  Typography,
  IconButton,
  Zoom,
  Fade,
  useTheme,
  TextField,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Bot,
  User,
  StopCircle,
} from 'lucide-react';
import { ollamaService, Message } from '@/lib/services/ollama-service';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Volume2, VolumeX, UserCircle, UserCircle2 } from 'lucide-react';

export const ChatWidget = ({
  isOpen,
  onToggle,
  gender,
  onGenderToggle
}: {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  gender: 'male' | 'female';
  onGenderToggle: () => void;
}) => {

  const [isExpanded, setIsExpanded] = useState(false);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Speech State
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isSpeechLoading, setIsSpeechLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAbortControllerRef = useRef<AbortController | null>(null);
  const lastSpokenRef = useRef<{ text: string; voice: string } | null>(null);

  const [serviceMode, setServiceMode] = useState<'local' | 'cloud' | 'offline' | 'checking'>('checking');

  const cancelSpeech = (keepCache = false) => {
    if (ttsAbortControllerRef.current) {
      ttsAbortControllerRef.current.abort();
      ttsAbortControllerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      if (!keepCache) {
        audioRef.current.src = '';
        audioRef.current = null;
        lastSpokenRef.current = null;
      }
    } else {
      if (!keepCache) {
        lastSpokenRef.current = null;
      }
    }
    setIsSpeechLoading(false);
  };

  useEffect(() => {
    const checkStatus = async () => {
      const mode = await ollamaService.checkStatus();
      setServiceMode(mode as 'local' | 'cloud' | 'offline');
    };
    checkStatus();
    const timer = setInterval(checkStatus, 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial greeting on mount if we don't have messages yet
  useEffect(() => {
    if (isOpen && messages.length === 0 && !isPreloading) {
      const fetchGreeting = async () => {
        setIsPreloading(true);
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
          const response = await ollamaService.generate({
            prompt: "Generate a short, professional greeting for a customer visiting the Boss Cargo Express website. Keep it under 20 words. Do not double quote the content of your response in the greeting."
          }, controller.signal);

          if (response && (response.response || response.content || response.message?.content)) {
            const greeting = response.response || response.content || response.message?.content;
            setMessages([{ role: 'assistant', content: greeting }]);
            if (isSpeechEnabled) speak(greeting);
          }
        } catch (error: any) {
          console.error('Greeting error:', error);
          const isFetchError = error.message?.includes('Failed to fetch') || error.toString().includes('Failed to fetch');
          if (isFetchError) {
            const errorMsg = "**Connection Error**: I'm unable to reach my AI service. Please try again later.";
            setMessages([{
              role: 'assistant',
              content: errorMsg
            }]);
            if (isSpeechEnabled) speak(errorMsg);
          }
        } finally {
          setIsPreloading(false);
          abortControllerRef.current = null;
        }
      };

      fetchGreeting();
    }
  }, [isOpen]);

  // Dictate latest message if speech is enabled or toggled on/changed
  useEffect(() => {
    if (isSpeechEnabled && messages.length > 0) {
      const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
      if (lastAssistantMessage) {
        speak(lastAssistantMessage.content);
      }
    } else if (!isSpeechEnabled) {
      cancelSpeech(true); // Keep cache to avoid redundant POST when toggled back on
    }
  }, [isSpeechEnabled, gender, isOpen]);

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);


  const speak = async (
    text: string,
    forceGender?: 'male' | 'female',
    forceEnabled?: boolean
  ) => {
    const activeEnabled = forceEnabled !== undefined ? forceEnabled : isSpeechEnabled;
    const activeGender = forceGender !== undefined ? forceGender : gender;

    if (!activeEnabled || typeof window === 'undefined') return;

    // 1. Thorough text clean
    const cleanText = text
      .replace(/[#*`_~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/⚠️|🤖|👤|✨|🚀|✅/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim();

    if (!cleanText) return;

    const voice = activeGender === 'male' ? 'bm_daniel' : 'bf_emma';

    // Avoid redundant POST methods: check if this is the exact same text and voice already loaded
    if (lastSpokenRef.current?.text === cleanText && lastSpokenRef.current?.voice === voice) {
      if (audioRef.current) {
        if (!audioRef.current.paused) {
          // Already playing this exact voice track, ignore redundant trigger
          return;
        }
        try {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
          return;
        } catch (e) {
          console.error("Failed to replay cached audio, refetching...", e);
        }
      }
    }

    // 2. Cancel any other active speech or ongoing fetch request
    cancelSpeech();

    // Create a new AbortController for this fetch
    const controller = new AbortController();
    ttsAbortControllerRef.current = controller;
    setIsSpeechLoading(true);

    try {
      const speechUrl = process.env.NEXT_PUBLIC_KOKORO_TTS_SPEECH_URL || 'http://localhost:8880/v1/audio/speech';
      const response = await fetch(speechUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: cleanText,
          voice: voice,
          response_format: 'mp3',
          speed: 1.0,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`TTS request failed with status ${response.status}`);
      }

      const blob = await response.blob();
      if (controller.signal.aborted) return;

      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      lastSpokenRef.current = { text: cleanText, voice };

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
      };

      await audio.play();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('TTS playback/fetch aborted');
      } else {
        console.error('Error in Kokoro TTS:', error);
      }
    } finally {
      if (ttsAbortControllerRef.current === controller) {
        ttsAbortControllerRef.current = null;
        setIsSpeechLoading(false);
      }
    }
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const toggleChat = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isOpen) {
      onToggle(false);
      setIsExpanded(false);
      cancelSpeech();
    } else {
      onToggle(true);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Sanitize messages to ensure strictly alternating user/assistant starting with user
      // This is required by certain strict cloud APIs
      const apiMessages = [...messages, userMessage].reduce((acc: Message[], curr) => {
        if (acc.length === 0) {
          if (curr.role === 'assistant') {
            // Prepend dummy user message if first message is assistant
            acc.push({ role: 'user', content: 'Hello' });
          }
          acc.push({ ...curr });
        } else {
          const last = acc[acc.length - 1];
          if (last.role === curr.role) {
            // Merge consecutive messages of the same role
            last.content += '\n\n' + curr.content;
          } else {
            acc.push({ ...curr });
          }
        }
        return acc;
      }, []);

      const response = await ollamaService.chat({
        prompt: userMessage.content,
        messages: apiMessages
      }, controller.signal);

      if (response && response.message) {
        setMessages(prev => [...prev, response.message]);
        if (isSpeechEnabled) speak(response.message.content);
      } else if (response && (response.content || response.response)) {
        const content = response.content || response.response;
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: content
        }]);
        if (isSpeechEnabled) speak(content);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Chat request aborted');
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "*Request cancelled.*"
        }]);
      } else {
        console.error('Chat error:', error);
        const isFetchError = error.message?.includes('Failed to fetch') || error.toString().includes('Failed to fetch');
        const errorMsg = isFetchError
          ? "**Connection Error**: I'm unable to reach my AI service. Please ensure the server is running and accessible, then try again."
          : "I'm sorry, I encountered an unexpected error. Please try again in a moment.";

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: errorMsg
        }]);
        if (isSpeechEnabled) speak(errorMsg);
      }

    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    cancelSpeech();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusDisplay = () => {
    switch (serviceMode) {
      case 'local':
        return { text: 'Server Online', color: '#4caf50' };
      case 'cloud':
        return { text: 'Cloud Server', color: '#2196f3' };
      case 'offline':
        return { text: 'Server Offline', color: '#f44336' };
      default:
        return { text: 'Checking status...', color: '#ff9800' };
    }
  };

  const currentStatus = getStatusDisplay();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 11000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1.5,
      }}
    >
      {/* Chat Window */}
      <Zoom in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={6}
          sx={{
            width: isExpanded ? { xs: 'calc(100vw - 48px)', sm: 500, md: 700 } : { xs: 'calc(100vw - 48px)', sm: 400 },
            height: isExpanded ? { xs: 'calc(100vh - 120px)', sm: '700px' } : { xs: '500px', sm: '600px' },
            maxHeight: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'bottom right',
            mb: 0.5,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={24} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  Bosco AI Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: currentStatus.color,
                      boxShadow: serviceMode !== 'offline' && serviceMode !== 'checking' ? `0 0 4px ${currentStatus.color}` : 'none',
                    }}
                  />
                  {currentStatus.text}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title={isSpeechLoading ? "Loading Voice..." : isSpeechEnabled ? "Turn Off Voice" : "Turn On Voice"} arrow placement="top">
                <span>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextEnabled = !isSpeechEnabled;
                      setIsSpeechEnabled(nextEnabled);
                      if (nextEnabled) {
                        const lastMsg = [...messages].reverse().find(m => m.role === 'assistant');
                        if (lastMsg) speak(lastMsg.content, gender, true);
                      } else {
                        cancelSpeech(true); // Keep cache to avoid redundant POST when toggled back on
                      }
                    }}
                    sx={{
                      color: isSpeechEnabled ? 'inherit' : 'rgba(255,255,255,0.5)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                      transition: 'all 0.2s'
                    }}
                  >
                    {isSpeechLoading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : isSpeechEnabled ? (
                      <Volume2 size={18} />
                    ) : (
                      <VolumeX size={18} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title={`Switch to ${gender === 'female' ? 'Male' : 'Female'} Narrator`} arrow placement="top">
                <span>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenderToggle();
                      if (isSpeechEnabled) {
                        const lastMsg = [...messages].reverse().find(m => m.role === 'assistant');
                        // Use the next gender for immediate feedback
                        const nextGender = gender === 'female' ? 'male' : 'female';
                        if (lastMsg) speak(lastMsg.content, nextGender, true);
                      }
                    }}
                    sx={{ color: 'inherit', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    {gender === 'female' ? <UserCircle2 size={18} /> : <UserCircle size={18} />}
                  </IconButton>
                </span>
              </Tooltip>


              <Box sx={{ width: 8 }} />

              <Tooltip title={isExpanded ? "Minimize Chat" : "Expand Chat"} arrow placement="top">
                <span>
                  <IconButton
                    size="small"
                    onClick={toggleExpand}
                    sx={{ color: 'inherit', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Close Chat" arrow placement="top">
                <span>
                  <IconButton
                    size="small"
                    onClick={(e) => toggleChat(e)}
                    sx={{ color: 'inherit', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    <X size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>

          {/* Chat Content */}
          <Box
            sx={{
              flexGrow: 1,
              p: 2,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
            }}
          >
            {messages.map((msg, index) => (
              <Fade in={true} key={index} timeout={300}>
                <Box
                  sx={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      bgcolor: msg.role === 'user' ? 'primary.main' : (
                        msg.content.includes('⚠️')
                          ? (theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.2)' : 'rgba(211, 47, 47, 0.05)')
                          : (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100')
                      ),
                      color: msg.role === 'user' ? 'primary.contrastText' : (
                        msg.content.includes('⚠️') ? 'error.main' : 'text.primary'
                      ),
                      border: msg.content.includes('⚠️') ? '1px solid' : 'none',
                      borderColor: 'error.main',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      overflowX: 'auto',
                      '& p': { m: 0 },
                      '& p + p': { mt: 1 },
                      '& ul': { mt: 1, mb: 1, pl: 2.5, listStyleType: 'disc', '& ul': { listStyleType: 'circle', '& ul': { listStyleType: 'square' } } },
                      '& ol': { mt: 1, mb: 1, pl: 2.5, listStyleType: 'decimal' },
                      '& li': { mb: 0.5, display: 'list-item' },
                      '& code': {
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        borderRadius: '4px',
                        px: 0.5,
                        py: 0.2,
                        bgcolor: msg.role === 'user'
                          ? 'rgba(255,255,255,0.2)'
                          : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                      },
                      '& pre': {
                        m: '12px 0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        fontSize: '0.8rem',
                      },
                      '& h1, & h2, & h3, & h4': {
                        mt: 2,
                        mb: 1,
                        fontWeight: 600,
                        fontSize: '1rem',
                      },
                      '& blockquote': {
                        borderLeft: '3px solid',
                        borderColor: 'primary.main',
                        pl: 1.5,
                        m: '8px 0',
                        opacity: 0.8,
                      }
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={theme.palette.mode === 'dark' ? vscDarkPlus : oneLight}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{ margin: 0, padding: '12px' }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </Box>
                  <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.5, fontSize: '0.65rem' }}>
                    {msg.role === 'user' ? 'You' : 'Assistant'}
                  </Typography>
                </Box>
              </Fade>
            ))}
            {(isLoading || isPreloading) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <CircularProgress size={16} color="primary" />
                <Typography variant="caption" color="text.secondary">
                  {isPreloading ? "Connecting..." : "Thinking..."}
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Footer / Input */}
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '24px',
                  pr: 1,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <Tooltip
                      title={isLoading ? "Stop Generating" : "Send Message"}
                      placement="top"
                      arrow
                      slotProps={{
                        popper: {
                          sx: { zIndex: 10001 }
                        }
                      }}
                    >
                      <span>
                        <IconButton
                          size="small"
                          color={isLoading ? "error" : "primary"}
                          disabled={!isLoading && !message.trim()}
                          onClick={isLoading ? handleStop : handleSend}
                          sx={{
                            bgcolor: (isLoading || message.trim()) ? (isLoading ? 'error.main' : 'primary.main') : 'transparent',
                            color: (isLoading || message.trim()) ? (isLoading ? 'error.contrastText' : 'primary.contrastText') : 'inherit',
                            '&:hover': {
                              bgcolor: isLoading ? 'error.dark' : (message.trim() ? 'primary.dark' : 'rgba(0,0,0,0.05)'),
                            },
                            transition: 'all 0.2s',
                            zIndex: 9999,
                          }}
                        >
                          {isLoading ? <StopCircle size={16} /> : <Send size={16} />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  ),
                },
              }}
            />
          </Box>
        </Paper>
      </Zoom>

      {/* Floating Button */}
      <Tooltip title={isOpen ? "Close Chat" : "Chat with Boss AI"} placement="left">
        <span>
          <Fab
            color="primary"
            aria-label="chat"
            onClick={toggleChat}
            disabled={isPreloading}
            sx={{
              width: 56,
              height: 56,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.1) rotate(5deg)',
              },
            }}
          >
            {isPreloading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              isOpen ? <X /> : <MessageCircle />
            )}
          </Fab>
        </span>
      </Tooltip>

      {/* Pulse Animation Styles */}
      {!isOpen && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            opacity: 0.4,
            zIndex: -1,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                opacity: 0.4,
              },
              '70%': {
                transform: 'scale(1.5)',
                opacity: 0,
              },
              '100%': {
                transform: 'scale(1.5)',
                opacity: 0,
              },
            },
          }}
        />
      )}
    </Box>
  );
};