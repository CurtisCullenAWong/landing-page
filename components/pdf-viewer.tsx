'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { X, FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@mui/material';
import { createClient } from '@/lib/supabase/client';

interface PDFViewerProps {
  url: string;
  fileName?: string;
  open: boolean;
  onClose: () => void;
}

export function PDFViewer({ url, fileName, open, onClose }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  // Check if URL is a storage path (format: "applicant-files:resumes/uuid.pdf")
  const isStoragePath = url.startsWith('applicant-files:');
  
  useEffect(() => {
    if (!open) {
      setSignedUrl(null);
      setLoading(true);
      setError(null);
      return;
    }

    const generateSignedUrl = async () => {
      if (isStoragePath) {
        try {
          const supabase = createClient();
          const filePath = url.replace('applicant-files:', '');
          const { data, error: urlError } = await supabase.storage
            .from('applicant-files')
            .createSignedUrl(filePath, 3600); // 1 hour expiry

          if (urlError || !data?.signedUrl) {
            setError('Failed to generate secure link. Please try again.');
            setLoading(false);
            return;
          }

          setSignedUrl(data.signedUrl);
        } catch (err) {
          setError('Failed to load PDF. Please try again.');
          setLoading(false);
        }
      } else {
        setSignedUrl(url);
      }
    };

    generateSignedUrl();
  }, [open, url, isStoragePath]);

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = () => {
    setLoading(false);
    setError('Failed to load PDF. Please try downloading it instead.');
  };

  const handleDownload = () => {
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    }
  };

  const handleOpenInNewTab = () => {
    if (signedUrl) {
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const displayUrl = signedUrl || url;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileText size={20} />
          <Box>
            <Box component="span" sx={{ fontWeight: 600 }}>
              {fileName || 'Resume PDF'}
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Download size={16} />}
            onClick={handleDownload}
            sx={{ mr: 1 }}
          >
            Download
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ExternalLink size={16} />}
            onClick={handleOpenInNewTab}
            sx={{ mr: 1 }}
          >
            Open in New Tab
          </Button>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0, position: 'relative', height: '100%' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.default',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Download size={16} />}
                onClick={handleDownload}
              >
                Download PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExternalLink size={16} />}
                onClick={handleOpenInNewTab}
              >
                Open in New Tab
              </Button>
            </Box>
          </Box>
        )}
        {displayUrl && (
          <Box
            component="iframe"
            src={`${displayUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            onLoad={handleLoad}
            onError={handleError}
            sx={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: loading || error ? 'none' : 'block',
            }}
            title={fileName || 'PDF Viewer'}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

