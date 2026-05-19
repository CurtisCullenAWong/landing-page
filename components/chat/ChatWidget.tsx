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
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your Boss Cargo Express assistant. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Speech State
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const [isServiceOnline, setIsServiceOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const online = await ollamaService.checkStatus();
      setIsServiceOnline(online);
    };
    checkStatus();
    const timer = setInterval(checkStatus, 30000);
    return () => clearInterval(timer);
  }, []);

  // Dictate latest message if speech is enabled or toggled on/changed
  useEffect(() => {
    if (isSpeechEnabled && messages.length > 0) {
      const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
      if (lastAssistantMessage) {
        speak(lastAssistantMessage.content);
      }
    } else if (!isSpeechEnabled) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isSpeechEnabled, gender, isOpen]);


  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);


  const speak = (
    text: string,
    forceGender?: 'male' | 'female',
    forceEnabled?: boolean
  ) => {
    const activeEnabled = forceEnabled !== undefined ? forceEnabled : isSpeechEnabled;
    const activeGender = forceGender !== undefined ? forceGender : gender;


    if (!activeEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    // 1. Always get the freshest voice list directly from the API
    const freshVoices = window.speechSynthesis.getVoices();
    const voicePool = freshVoices.length > 0 ? freshVoices : availableVoices;

    // Sync state if needed
    if (freshVoices.length > 0 && availableVoices.length === 0) {
      setAvailableVoices(freshVoices);
    }

    // 2. Thorough text clean
    const cleanText = text
      .replace(/[#*`_~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/⚠️|🤖|👤|✨|🚀|✅/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim();

    // 3. Language detection
    let detectedLang = 'en';
    const tlWords = ['mga', 'ang', 'ng', 'sa', 'ay', 'para', 'na', 'may', 'ni', 'po', 'opo', 'kumusta', 'salamat', 'kayo', 'ikaw', 'tayo', 'kami'];
    const lowerText = cleanText.toLowerCase();
    const tlMatchCount = tlWords.filter(w => new RegExp(`\\b${w}\\b`).test(lowerText)).length;
    const hasStrongIndicator = /\b(po|opo|kumusta|salamat|mga)\b/i.test(lowerText);

    if (tlMatchCount >= 2 || (tlMatchCount >= 1 && (hasStrongIndicator || cleanText.length < 40))) {
      detectedLang = 'fil';
    }

    window.speechSynthesis.cancel();

    // 4. Sentence splitting
    const sentences = cleanText.split(/(?<=[.!?])\s+/);

    // 5. Voice selection (Language + Gender priority)
    let targetVoice: SpeechSynthesisVoice | undefined;

    if (detectedLang === 'fil') {
      // Priority 1: Native Filipino voices
      targetVoice = voicePool.find(v =>
        v.lang.startsWith('fil') || v.lang.startsWith('tl')
      ) ||
        // Priority 2: Spanish voices (Spanish phonetics are much closer to Filipino than English)
        voicePool.find(v => v.lang.startsWith('es'));
    }


    if (!targetVoice) {
      const isAmericanEnglish = (v: SpeechSynthesisVoice) =>
        v.lang === 'en-US' || v.lang === 'en_US';

      // Female voice name keywords (American neural/natural voices)
      const femaleKeywords = ['aria', 'jenny', 'ana', 'zira', 'samantha', 'emma', 'michelle',
        'monica', 'ava', 'allison', 'susan', 'victoria', 'female'];

      // Male voice name keywords (American neural/natural voices)
      const maleKeywords = ['guy', 'davis', 'david', 'daniel', 'brian', 'andrew', 'ryan',
        'jason', 'mark', 'eric', 'james', 'male', 'stefan'];

      const genderKeywords = activeGender === 'female' ? femaleKeywords : maleKeywords;

      const genderMatch = (v: SpeechSynthesisVoice) => {
        const n = v.name.toLowerCase();
        return genderKeywords.some(k => n.includes(k));
      };

      const isNeural = (v: SpeechSynthesisVoice) => {
        const n = v.name.toLowerCase();
        return n.includes('google') || n.includes('natural') ||
          n.includes('neural') || n.includes('online');
      };

      const usVoices = voicePool.filter(isAmericanEnglish);
      const googleUSVoices = usVoices.filter(v => v.name.toLowerCase().includes('google'));
      const neuralUSVoices = usVoices.filter(isNeural);
      const anyEnglish = voicePool.filter(v => v.lang.startsWith('en'));

      // Priority order: Google US + gender → Google US any → Neural US + gender →
      //                 Neural US any → US + gender → US any → English any
      targetVoice =
        googleUSVoices.find(genderMatch) ||
        googleUSVoices[0] ||
        neuralUSVoices.find(genderMatch) ||
        neuralUSVoices[0] ||
        usVoices.find(genderMatch) ||
        usVoices[0] ||
        anyEnglish.find(genderMatch) ||
        anyEnglish[0] ||
        voicePool[0];
    }

    // 6. Sequential playback with natural prosody
    sentences.forEach((sentence) => {
      if (!sentence.trim()) return;

      const utterance = new SpeechSynthesisUtterance(sentence);
      if (targetVoice) utterance.voice = targetVoice;

      utterance.lang = targetVoice?.lang || (detectedLang === 'fil' ? 'fil-PH' : 'en-US');

      // Slightly varied rate/pitch per sentence for more natural delivery
      utterance.rate = 0.90 + (Math.random() * 0.08);
      utterance.pitch = (activeGender === 'female' ? 1.05 : 0.92) + (Math.random() * 0.06);
      utterance.volume = 1.0;

      window.speechSynthesis.speak(utterance);
    });
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const toggleChat = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isOpen) {
      onToggle(false);
      setIsExpanded(false);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    // If it's the first time and we only have the default placeholder message
    if (messages.length === 1 && messages[0].role === 'assistant' && messages[0].content.includes("Hello! I'm your Boss Cargo Express assistant")) {
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

        onToggle(true);
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

        onToggle(true);
      } finally {
        setIsPreloading(false);
        abortControllerRef.current = null;
      }
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
      const response = await ollamaService.chat({
        prompt: userMessage.content,
        messages: [...messages, userMessage]
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
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
            width: isExpanded ? { xs: 'calc(100vw - 48px)', sm: 500, md: 700 } : 400,
            height: isExpanded ? '700px' : '600px',
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
                      bgcolor: isServiceOnline === true ? '#4caf50' : (isServiceOnline === false ? '#f44336' : '#ff9800'),
                      boxShadow: isServiceOnline === true ? '0 0 4px #4caf50' : 'none',
                    }}
                  />
                  {isServiceOnline === true ? 'Always active' : (isServiceOnline === false ? 'Service offline' : 'Checking status...')}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title={isSpeechEnabled ? "Turn Off Voice" : "Turn On Voice"} arrow placement="top">
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

                        window.speechSynthesis.cancel();
                      }
                    }}
                    sx={{
                      color: isSpeechEnabled ? 'inherit' : 'rgba(255,255,255,0.5)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                      transition: 'all 0.2s'
                    }}
                  >
                    {isSpeechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
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
            {isLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <CircularProgress size={16} color="primary" />
                <Typography variant="caption" color="text.secondary">
                  Thinking...
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