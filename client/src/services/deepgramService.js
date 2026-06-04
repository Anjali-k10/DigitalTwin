import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function createDeepgramAssistantStream({ onListening, onTranscript, onError, onStatus }) {
  let socket = null;
  let mediaRecorder = null;
  let mediaStream = null;
  let manuallyStopped = false;
  let audioChunkCount = 0;
  let started = false;

  async function start() {
    if (started || socket?.connected || socket?.active) return;
    const token = localStorage.getItem('authToken');
    if (!token) {
      onError?.('Login is required before Twin Assistant can listen.');
      return;
    }

    manuallyStopped = false;
    started = true;
    onStatus?.('connecting');
    socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const handleListening = (payload) => {
      console.log('[Twin Assistant] Deepgram listening:', Boolean(payload.active));
      onStatus?.(payload.active ? 'listening' : 'connecting');
      onListening?.(Boolean(payload.active));
    };

    const handleTranscript = (payload) => {
      console.log('[Twin Assistant] Speech received:', payload);
      onTranscript?.(payload);
    };

    const handleError = (payload) => {
      console.warn('[Twin Assistant] Deepgram error:', payload.message || payload);
      onError?.(payload.message || 'Deepgram assistant error.');
    };

    socket.on('voice:connected', () => {
      console.log('Deepgram Connected');
      onStatus?.('listening');
      onListening?.(true);
    });
    socket.on('voice:disconnected', () => {
      console.log('Deepgram Disconnected');
      if (!manuallyStopped) onStatus?.('connecting');
      if (!manuallyStopped) onListening?.(false);
    });
    socket.on('voice:listening', handleListening);
    socket.on('voice:transcript', handleTranscript);
    socket.on('voice:error', handleError);
    socket.on('connect_error', (error) => {
      console.warn('[Twin Assistant] Socket connection error:', error.message);
      onStatus?.('error');
      onError?.('Unable to connect to voice service.');
    });
    socket.on('disconnect', (reason) => {
      console.log('[Twin Assistant] Socket disconnected:', reason);
      if (!manuallyStopped) onStatus?.('connecting');
      if (!manuallyStopped) onListening?.(false);
    });
    socket.on('connect', async () => {
      console.log('[Twin Assistant] Socket connected');
      onStatus?.('connecting');
      socket.emit('voice:start');
      await startMicrophone();
    });
  }

  async function startMicrophone() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') return;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      mediaRecorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);

      mediaRecorder.ondataavailable = async (event) => {
        if (!event.data?.size || !socket?.connected) return;
        console.log('MIC AUDIO DETECTED');
        const audioChunk = await event.data.arrayBuffer();
        socket.emit('voice:audio', audioChunk);
        audioChunkCount += 1;
        if (audioChunkCount <= 20 || audioChunkCount % 20 === 0) {
          console.log('AUDIO CHUNK SENT');
        }
      };

      mediaRecorder.start(250);
      console.log('[Twin Assistant] Microphone capture started');
      console.log('Audio Stream Started');
      onStatus?.('listening');
    } catch (error) {
      console.warn('[Twin Assistant] Microphone unavailable:', error.message);
      onStatus?.('error');
      onError?.(`Microphone access failed: ${error.message}`);
    }
  }

  function stop() {
    manuallyStopped = true;
    started = false;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    mediaStream?.getTracks().forEach((track) => track.stop());
    socket?.emit('voice:stop');
    socket?.disconnect();

    mediaRecorder = null;
    mediaStream = null;
    socket = null;
    onStatus?.('offline');
    onListening?.(false);
  }

  return { start, stop };
}

function pickMimeType() {
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
  return '';
}
