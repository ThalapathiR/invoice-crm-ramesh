import { useState, useCallback, useRef } from 'react';
import { CommonHelper } from '../helper/helper';
import { toast } from "@/hooks/use-toast";
// import Swal from 'sweetalert2';

export interface WebRTCMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  isFinal?: boolean;
  timestamp: Date;
  // Advanced Metrics (Senior Level)
  stt_latency?: number;
  llm_ttfb?: number;
  tts_ttfb?: number;
  e2e_latency?: number;
  llm_tokens?: number;
  tts_chars?: number;
}

export interface WebRTCState {
  status: 'idle' | 'connecting' | 'connected' | 'error';
  error?: string;
  messages: WebRTCMessage[];
  thinking: boolean;
  currentCallId?: string | null;
  performance?: {
    avg_stt: number;
    avg_llm: number;
    avg_tts: number;
    avg_e2e: number;
    latest_tts?: number;
  };
  limitReached?: boolean;
  limitWarning?: number | null;
  isMicMuted: boolean;
  isSpeakerMuted: boolean;
}

export const useWebRTC = () => {
  const [state, setState] = useState<WebRTCState>({ 
    status: 'idle', 
    messages: [], 
    thinking: false, 
    currentCallId: null,
    isMicMuted: false,
    isSpeakerMuted: false
  });
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const startCall = useCallback(async (agentId: string, metadata: any = {}) => {
    try {
      console.log("🚀 [WebRTC] Starting call for agent:", agentId);
      if (!agentId) {
        console.error("❌ [WebRTC] agentId is missing!");
        setState((prev: WebRTCState) => ({ ...prev, status: 'error', error: 'Agent ID is missing' }));
        return;
      }
      setState((prev: WebRTCState) => ({ ...prev, status: 'connecting', messages: [], thinking: false, currentCallId: null }));

      // Get API token from local storage via helper
      const userData = CommonHelper.GetUserData();
      const token = typeof userData === 'object' ? userData?.api_token : userData;
      console.log("🔑 [WebRTC] Auth Token Found:", !!token);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;

      // 1.5 Create Data Channel for Transcripts
      const dc = pc.createDataChannel("pipecat", { ordered: true });
      dcRef.current = dc;

      dc.onopen = () => {
        console.log("📡 [WebRTC] Data Channel Opened");
      };

      dc.onmessage = (event) => {
        try {
          console.log("📨 [WebRTC] Received DC Message:", event.data);
          const msg = JSON.parse(event.data);

          if (msg.type === "transcript") {
            const role = msg.role || "assistant";
            const text = msg.text;
            const isFinal = msg.isFinal !== undefined ? msg.isFinal : msg.is_final;
            const msgId = msg.id || Date.now().toString();
            const timestamp = msg.timestamp ? new Date(msg.timestamp * 1000) : new Date();

            setState((prev: WebRTCState) => {
              const index = prev.messages.findIndex(m => m.id === msgId);
              let newMessages = [...prev.messages];

              if (index !== -1) {
                // Update existing message
                newMessages[index] = {
                  ...newMessages[index],
                  text: text,
                  isFinal: isFinal,
                  timestamp: msg.timestamp ? timestamp : newMessages[index].timestamp
                };
              } else {
                // Add new message
                newMessages.push({
                  id: msgId,
                  role: role as any,
                  text: text,
                  isFinal: isFinal,
                  timestamp: timestamp,
                  // Inject Metrics
                  stt_latency: msg.stt_latency,
                  llm_ttfb: msg.llm_ttfb,
                  tts_ttfb: msg.tts_ttfb,
                  e2e_latency: msg.e2e_latency,
                  llm_tokens: msg.llm_tokens,
                  tts_chars: msg.tts_chars
                });
              }

              // Always sort by timestamp to handle out-of-order or late-arriving frames
              newMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

              // Robust Metric Extraction (Flattened or Nested)
              const metrics = msg.metrics || {};
              
              return {
                ...prev,
                thinking: false,
                messages: newMessages.map(m => m.id === msgId ? {
                  ...m,
                  // Prioritize flattened values, fallback to nested
                  stt_latency: msg.stt_latency ?? metrics.stt_latency,
                  llm_ttfb: msg.llm_ttfb ?? metrics.llm_ttfb,
                  tts_ttfb: msg.tts_ttfb ?? metrics.tts_ttfb,
                  e2e_latency: msg.e2e_latency ?? metrics.e2e_latency,
                  llm_tokens: msg.llm_tokens ?? metrics.prompt_tokens ?? metrics.total_tokens, // Flexible token mapping
                  tts_chars: msg.tts_chars ?? metrics.tts_characters
                } : m)
              };
            });
          } else if (msg.label === "rtvi-ai") {
            // Legacy/RTVI support - now largely handled by the "transcript" type above.
            // We only keep this for non-transcript telemetry if needed, 
            // but for now, we ignore to avoid duplication and flickering.
            if (msg.type === "error") {
               // Handle RTVI-style errors if they come this way
               console.error("❌ [WebRTC] RTVI Error:", msg.data || msg);
            }
          } else if (msg.type === "status") {
            console.log("ℹ️ [WebRTC] Agent Status:", msg.status);
            if (msg.status === "thinking") {
              setState((prev: WebRTCState) => ({ ...prev, thinking: true }));
            }
          } else if (msg.type === "system_status") {
            console.log("ℹ️ [WebRTC] Received System Status:", msg.message, "Call ID:", msg.call_id);
            if (msg.call_id) {
              setState((prev: WebRTCState) => ({ ...prev, currentCallId: msg.call_id }));
              console.log("✅ [WebRTC] currentCallId updated to:", msg.call_id);
            }
            setState((prev: WebRTCState) => ({
              ...prev,
              performance: msg.metrics
            }));
          } else if (msg.type === "limit_warning") {
            console.log("⚠️ [WebRTC] Limit Warning:", msg.remaining);
            setState((prev: WebRTCState) => ({ ...prev, limitWarning: msg.remaining }));
            toast({
              title: "Call Limit Warning",
              description: `You have ${msg.remaining} seconds remaining for this call.`,
              variant: "default",
            });
          } else if (msg.type === "limit_reached") {
            console.log("🛑 [WebRTC] Limit Reached!");
            setState((prev: WebRTCState) => ({ ...prev, limitReached: true }));
            // Trigger popup handled by component or toast
            toast({
              title: "Call Terminated",
              description: "Your call limit has been reached. Please upgrade your plan.",
              variant: "destructive",
            });
            // Optional: Hard disconnect if bot hasn't already
            // stopCall();
          } else if (msg.type === "error") {
            console.error("❌ [WebRTC] Bot Error Received:", msg);
            
            let errorMsg = msg.message;
            if (typeof errorMsg === 'object' && errorMsg !== null) {
              errorMsg = errorMsg.error?.message || errorMsg.message || JSON.stringify(errorMsg);
            } else if (!errorMsg) {
              errorMsg = msg.text || `Bot error (raw): ${JSON.stringify(msg)}`;
            }

            if (String(errorMsg).toLowerCase().includes("quota")) {
               errorMsg = "Your AI quota is over. Please check your plan.";
            }

            toast({
              title: "Agent Assistant Error",
              description: String(errorMsg),
              variant: "destructive",
            });
            setState((prev: WebRTCState) => ({ ...prev, status: 'error', error: String(errorMsg) }));
          } 
        } catch (e) {
          console.warn("Failed to parse DC message:", e);
        }
      };



      // Handle cases where the backend creates the data channel
      pc.ondatachannel = (event) => {
        console.log("📡 [WebRTC] External Data Channel received");
        const receiveChannel = event.channel;
        receiveChannel.onmessage = dc.onmessage;
        dcRef.current = receiveChannel;
      };

      console.log("🎤 [WebRTC] Requesting microphone access...");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone access is not supported in this browser or requires a Secure Context (HTTPS or localhost).");
      }
      // 2. Add local audio track
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      console.log("✅ [WebRTC] Microphone access granted");
      stream.getTracks().forEach(track => {
        if (track.kind === 'audio') {
          track.enabled = !state.isMicMuted;
        }
        pc.addTrack(track, stream);
      });

      // 3. Handle remote track
      pc.ontrack = (event) => {
        console.log("🎵 [WebRTC] Remote track received:", event.track.kind);
        if (event.track.kind === 'audio') {
          const remoteStream = event.streams[0];

          if (!audioRef.current) {
            console.log("🔈 [WebRTC] Creating internal Audio element");
            audioRef.current = new Audio();
          }

          audioRef.current.srcObject = remoteStream;
          audioRef.current.autoplay = true;
          audioRef.current.muted = state.isSpeakerMuted;

          // Ensure playback starts (browsers often require explicit .play() after interaction)
          audioRef.current.play().catch(e => console.warn("🔇 Audio play blocked:", e));

          console.log("🔊 [WebRTC] Remote audio attached and playing");
        }
      };

      // 4. Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait for ICE gathering to complete before sending offer
      // This is crucial for environments without trickle candidate support
      if (pc.iceGatheringState !== 'complete') {
        console.log("⏳ [WebRTC] Waiting for local ICE gathering...");
        await new Promise((resolve) => {
          const checkState = () => {
            if (pc.iceGatheringState === 'complete') {
              pc.removeEventListener('icegatheringstatechange', checkState);
              resolve(void 0);
            }
          };
          pc.addEventListener('icegatheringstatechange', checkState);
          // Safety timeout
          setTimeout(() => {
            pc.removeEventListener('icegatheringstatechange', checkState);
            resolve(void 0);
          }, 5000);
        });
        console.log("✅ [WebRTC] Local ICE gathering complete");
      }

      // 5. Send offer to backend (via proxy to resolve protocol/port issues)
      const botUrl = `/api/PublicAgent/webcall/offer`;
      console.log("📡 [WebRTC] Sending offer to:", botUrl);

      const response = await fetch(botUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sdp: pc.localDescription?.sdp,
          type: pc.localDescription?.type,
          agent_id: agentId,
          api_token: token,
          ...metadata
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get offer: ${response.statusText}`);
      }

      const answer = await response.json();
      console.log("📡 [WebRTC] Received answer from bot. Call ID:", answer.call_id);

      // Instantly set the call_id from the HTTP response
      if (answer.call_id) {
        setState((prev: WebRTCState) => ({ ...prev, currentCallId: answer.call_id }));
      }

      // 6. Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      setState((prev: WebRTCState) => ({ ...prev, status: 'connected' }));

      pc.onconnectionstatechange = () => {
        console.log("🌐 [WebRTC] Connection State Changed:", pc.connectionState);
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          setState((prev: WebRTCState) => ({ ...prev, status: 'idle' }));
        }
      };

    } catch (err: any) {
      console.error('WebRTC Error:', err);
      toast({
        title: "WebRTC Call Failed",
        description: err.message,
        variant: "destructive",
      });
      // Swal.fire({
      //   icon: 'error',
      //   title: 'WebRTC Call Failed',
      //   text: err.message,
      //   confirmButtonColor: '#3085d6',
      // });
      setState((prev: WebRTCState) => ({ ...prev, status: 'error', error: err.message }));
      stopCall();
    }
  }, []);

  const stopCall = useCallback(() => {
    // [GRACEFUL] Notify bot of intentional disconnect via DC if open
    if (dcRef.current && dcRef.current.readyState === 'open') {
       try {
          dcRef.current.send(JSON.stringify({ type: "disconnect" }));
          console.log("📤 [WebRTC] Sent explicit disconnect signal to bot");
       } catch (e) {
          console.warn("Failed to send disconnect signal:", e);
       }
    }

    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setState((prev: WebRTCState) => ({ ...prev, status: 'idle' }));
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (dcRef.current && dcRef.current.readyState === 'open') {
      const msg = {
        id: crypto.randomUUID(),
        label: "rtvi-ai",
        type: "user-chat",
        data: {
          text: text
        }
      };
      console.log("📤 [WebRTC] Sending Text Message:", msg);
      dcRef.current.send(JSON.stringify(msg));

      // Manually add user message to state so it appears in chat history
      setState((prev: WebRTCState) => ({
        ...prev,
        messages: [...prev.messages, { id: msg.id, role: 'user', text: text, isFinal: true, timestamp: new Date() }]
      }));
    } else {
      console.warn("⚠️ [WebRTC] Cannot send message: Data Channel is not open");
    }
  }, []);

  const toggleMic = useCallback(() => {
    setState((prev) => {
      const newState = !prev.isMicMuted;
      
      // 1. Toggle tracks in local stream ref
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          if (track.kind === 'audio') {
            track.enabled = !newState;
          }
        });
      }

      // 2. Toggle senders in PeerConnection
      if (pcRef.current) {
        pcRef.current.getSenders().forEach((sender) => {
          if (sender.track && sender.track.kind === 'audio') {
            sender.track.enabled = !newState;
          }
        });
      }
      return { ...prev, isMicMuted: newState };
    });
  }, []);

  const toggleSpeaker = useCallback(() => {
    setState((prev) => {
      const newState = !prev.isSpeakerMuted;
      if (audioRef.current) {
        audioRef.current.muted = newState;
      }
      return { ...prev, isSpeakerMuted: newState };
    });
  }, []);

  return {
    ...state,
    startCall,
    stopCall,
    sendTextMessage,
    toggleMic,
    toggleSpeaker,
    audioRef
  };
};
