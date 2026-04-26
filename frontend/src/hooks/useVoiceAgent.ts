import { useState, useRef, useCallback } from 'react';

export type CallStatus = 'idle' | 'initializing' | 'connecting' | 'active' | 'ended' | 'error';

interface UseVoiceAgentProps {
  apiBase?: string;
  onStatusChange?: (status: CallStatus) => void;
}

export function useVoiceAgent({ apiBase = '/api', onStatusChange }: UseVoiceAgentProps = {}) {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const stopCall = useCallback(async (publicKey?: string) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const finalDuration = startTimeRef.current 
      ? Math.round((Date.now() - startTimeRef.current) / 1000) 
      : 0;

    if (publicKey && startTimeRef.current) {
      fetch(`${apiBase}/public-widget/call/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_key: publicKey, duration: finalDuration })
      }).catch(console.error);
    }

    if (dcRef.current) dcRef.current.close();
    if (pcRef.current) pcRef.current.close();
    if (audioRef.current) {
      audioRef.current.srcObject = null;
      audioRef.current.remove();
      audioRef.current = null;
    }

    pcRef.current = null;
    dcRef.current = null;
    startTimeRef.current = null;
    
    setStatus('ended');
    onStatusChange?.('ended');
    setDuration(0);
  }, [apiBase, onStatusChange]);

  const startCall = useCallback(async (publicKey: string) => {
    try {
      setError(null);
      setStatus('initializing');
      onStatusChange?.('initializing');

      // 1. Setup Peer Connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;

      // 2. Setup Data Channel (Pipecat requirement)
      const dc = pc.createDataChannel("pipecat", { ordered: true });
      dcRef.current = dc;

      // 3. Get Media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // 4. Handle Remote Track
      pc.ontrack = (event) => {
        if (event.track.kind === 'audio') {
          if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.autoplay = true;
          }
          audioRef.current.srcObject = event.streams[0];
          setStatus('active');
          onStatusChange?.('active');
          
          startTimeRef.current = Date.now();
          timerRef.current = setInterval(() => {
            setDuration(Math.round((Date.now() - (startTimeRef.current || 0)) / 1000));
          }, 1000);
        }
      };

      // 5. Create Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 6. Wait for ICE gathering
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === 'complete') resolve();
        else {
          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === 'complete') resolve();
          };
          setTimeout(resolve, 3000); // Timeout fallback
        }
      });

      setStatus('connecting');
      onStatusChange?.('connecting');

      // 7. Signal to Billing Ramesh Core
      const response = await fetch(`${apiBase}/public-widget/call/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sdp: pc.localDescription?.sdp,
          type: pc.localDescription?.type,
          public_key: publicKey,
          user_name: "Demo Visitor"
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Billing Ramesh Core rejected the connection");
      }

      const answer = await response.json();
      await pc.setRemoteDescription(new RTCSessionDescription(answer));

    } catch (err: any) {
      console.error('[VoiceAgent] Call failed:', err);
      setError(err.message || 'Failed to establish voice connection');
      setStatus('error');
      onStatusChange?.('error');
      stopCall();
      throw err;
    }
  }, [apiBase, onStatusChange, stopCall]);

  return {
    status,
    duration,
    error,
    startCall,
    stopCall,
    isCalling: status === 'active' || status === 'connecting' || status === 'initializing'
  };
}
