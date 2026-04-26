/**
 * Sharyx Voice Bot SDK
 * A standalone, high-performance voice bot widget for real-time AI conversations.
 * 
 * Usage:
 * const bot = new HoomanVoiceBot({
 *   agentId: "your-id",
 *   parent: document.getElementById("container"),
 *   ...options
 * });
 */

class HoomanVoiceBot {
  constructor(options) {
    this.options = {
      agentId: options.agentId,
      parent: options.parent || document.body,
      context: options.context || "{}",
      onCallId: options.onCallId,
      fg: options.fg || "#DEE2E6",
      bg: options.bg || "#141414",
      accent: options.accent || "#F80759",
      light: options.light || false,
      border: options.border || 'rgba(255,255,255,0.1)',
      apiBase: options.apiBase,
      onMessage: options.onMessage
    };

    this.status = 'idle'; // idle | starting | listening | thinking | speaking | error
    this.pc = null;
    this.dc = null;
    this.audio = null;
    this.callId = null;
    this.stream = null;
    
    // Automatically detect CRM URL from the script source
    this.apiBase = this.options.apiBase || this._getApiBase();
    
    this._init();
  }

  _getApiBase() {
    // Priority 1: Check script tags (if script is loaded from production)
    const SCRIPT_NAME = 'sharyx-voice-bot.js';
    const scripts = document.getElementsByTagName('script');
    for (let s of scripts) {
      if (s.src.includes(SCRIPT_NAME) || s.src.includes('scripts/web.js')) {
        try {
          const url = new URL(s.src);
          // Return the actual origin where the script was loaded from
          return url.origin + '/api';
        } catch (e) {}
      }
    }

    // Priority 2: Fallback to current origin
    return window.location.origin + '/api';
  }

  async _init() {
    this._injectStyles();
    this._render();
    console.log("🚀 [Sharyx] Voice Bot initialized for Agent:", this.options.agentId);
  }

  _injectStyles() {
    if (document.getElementById('sharyx-sdk-styles')) return;

    const { fg, bg, accent, border, light } = this.options;
    const styleEl = document.createElement('style');
    styleEl.id = 'sharyx-sdk-styles';
    styleEl.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      .sharyx-sdk-widget {
        font-family: 'Inter', -apple-system, sans-serif;
        width: 100%;
        height: 100%;
        min-height: 200px;
        background: ${bg};
        color: ${fg};
        border-radius: 24px;
        border: 1px solid ${border};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        user-select: none;
      }

      .sharyx-sdk-visualizer {
        position: relative;
        width: 120px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .sharyx-sdk-visualizer:active {
        transform: scale(0.95);
      }

      .sharyx-sdk-ring {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: ${accent};
        opacity: 0.15;
        transform: scale(1);
      }

      /* Pulse animations for different states */
      .sharyx-status-listening .sharyx-sdk-ring {
        animation: sharyx-pulse-soft 2s infinite;
      }

      .sharyx-status-speaking .sharyx-sdk-ring {
        animation: sharyx-pulse-hard 1.5s infinite;
        opacity: 0.3;
      }

      .sharyx-status-thinking .sharyx-sdk-ring {
        animation: sharyx-rotate 2s infinite linear;
        border: 2px dashed ${accent};
        background: transparent;
        opacity: 0.5;
      }

      @keyframes sharyx-pulse-soft {
        0% { transform: scale(1); opacity: 0.2; }
        50% { transform: scale(1.3); opacity: 0.1; }
        100% { transform: scale(1); opacity: 0.2; }
      }

      @keyframes sharyx-pulse-hard {
        0% { transform: scale(1); opacity: 0.4; }
        50% { transform: scale(1.5); opacity: 0.1; }
        100% { transform: scale(1); opacity: 0.4; }
      }

      @keyframes sharyx-rotate {
        from { transform: rotate(0deg) scale(1.1); }
        to { transform: rotate(360deg) scale(1.1); }
      }

      .sharyx-sdk-icon {
        width: 60px;
        height: 60px;
        background: ${accent};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        box-shadow: 0 10px 20px -5px ${accent}66;
      }

      .sharyx-sdk-icon svg {
        width: 28px;
        height: 28px;
        fill: white;
      }

      .sharyx-sdk-status-text {
        margin-top: 24px;
        font-size: 14px;
        font-weight: 600;
        opacity: 0.8;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .sharyx-sdk-subtext {
        margin-top: 8px;
        font-size: 12px;
        opacity: 0.5;
      }

      .sharyx-sdk-stop-btn {
        margin-top: 20px;
        background: transparent;
        border: 1px solid ${fg}33;
        color: ${fg};
        padding: 8px 16px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        opacity: 0.7;
        transition: all 0.2s;
      }

      .sharyx-sdk-stop-btn:hover {
        background: #ef4444;
        border-color: #ef4444;
        color: white;
        opacity: 1;
      }

      .sharyx-sdk-error {
        color: #ef4444;
        font-size: 12px;
        margin-top: 10px;
        font-weight: 500;
      }
    `;
    document.head.appendChild(styleEl);
  }

  _render() {
    const container = document.createElement('div');
    container.className = `sharyx-sdk-widget sharyx-status-idle`;
    this.dom = container;

    this._updateUI();
    this.options.parent.appendChild(container);
  }

  _updateUI() {
    const { accent } = this.options;
    
    let iconContent = `<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>`;
    let statusLabel = "Click to Start";
    let subLabel = "AI is ready to talk";

    if (this.status === 'starting') {
      statusLabel = "Connecting...";
      subLabel = "Establishing secure link";
    } else if (this.status === 'listening') {
      statusLabel = "Listening...";
      subLabel = "Talk to me";
    } else if (this.status === 'thinking') {
      statusLabel = "Thinking...";
      subLabel = "Processing response";
    } else if (this.status === 'speaking') {
      statusLabel = "Speaking...";
      subLabel = "Playing AI response";
    } else if (this.status === 'error') {
      statusLabel = "System Error";
      subLabel = this.errorMessage || "Check your connection";
    }

    this.dom.className = `sharyx-sdk-widget sharyx-status-${this.status}`;
    this.dom.innerHTML = `
      <div class="sharyx-sdk-visualizer" id="sharyx-trigger">
        <div class="sharyx-sdk-ring"></div>
        <div class="sharyx-sdk-icon">${iconContent}</div>
      </div>
      <div class="sharyx-sdk-status-text">${statusLabel}</div>
      <div class="sharyx-sdk-subtext">${subLabel}</div>
      ${this.status !== 'idle' ? `<button class="sharyx-sdk-stop-btn" id="sharyx-stop">End Session</button>` : ''}
    `;

    const trigger = this.dom.querySelector('#sharyx-trigger');
    if (trigger) {
      trigger.onclick = () => {
        if (this.status === 'idle') this.startCall();
      };
    }

    const stopBtn = this.dom.querySelector('#sharyx-stop');
    if (stopBtn) {
      stopBtn.onclick = () => this.stopCall();
    }
  }

  setStatus(status, error = null) {
    this.status = status;
    this.errorMessage = error;
    this._updateUI();
  }

  async startCall() {
    this.setStatus('starting');
    console.log("☎️ [Sharyx] Starting call to API:", this.apiBase);
    
    try {
      this.pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          { urls: 'stun:stun.cloudflare.com:3478' },
          { urls: 'stun:stun.voiparound.com:3478' }
        ]
      });

      // Debug WebRTC status
      this.pc.oniceconnectionstatechange = () => {
        console.log("🌐 [WebRTC] ICE Connection State:", this.pc.iceConnectionState);
        if (this.pc.iceConnectionState === 'connected') {
          console.log("✅ [WebRTC] Peer connected successfully");
        }
      };

      this.pc.onconnectionstatechange = () => {
        console.log("🌐 [WebRTC] Connection State:", this.pc.connectionState);
        if (['disconnected', 'failed', 'closed'].includes(this.pc.connectionState)) {
          this.stopCall();
        }
      };

      // Data channel for transcripts/state
      this.dc = this.pc.createDataChannel("pipecat", { ordered: true });
      this.dc.onmessage = (e) => this._handleDataMessage(e);

      // Microphone
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.stream.getTracks().forEach(track => this.pc.addTrack(track, this.stream));

      // Remote Audio
      this.pc.ontrack = (event) => {
        console.log("🎙️ [WebRTC] Remote track received:", event.track.kind);
        if (event.track.kind === 'audio') {
          if (!this.audio) {
            this.audio = new Audio();
            this.audio.autoplay = true;
            this.audio.style.display = 'none';
            document.body.appendChild(this.audio); // Add to DOM for autoplay stability
          }
          this.audio.srcObject = event.streams[0] || new MediaStream([event.track]);
          this.setStatus('listening');
          console.log("🔊 [Sharyx] Audio setup complete and playing.");
        }
      };

      // signaling
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // Wait for ICE gathering to complete or timeout
      console.log("⏳ [WebRTC] Gathering ICE candidates...");
      await new Promise(r => {
        if (this.pc.iceGatheringState === 'complete') r();
        else {
          const check = () => { 
            if (this.pc.iceGatheringState === 'complete') { 
              this.pc.removeEventListener('icegatheringstatechange', check); 
              r(); 
            } 
          };
          this.pc.addEventListener('icegatheringstatechange', check);
          setTimeout(() => {
            console.warn("⚠️ [WebRTC] ICE gathering timeout reached (800ms), proceeding with found candidates.");
            r();
          }, 800);
        }
      });

      const response = await fetch(`${this.apiBase}/PublicAgent/webcall/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sdp: this.pc.localDescription.sdp,
          type: this.pc.localDescription.type,
          agent_id: this.options.agentId,
          context: this.options.context
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.Message || "Backend failed to provide answer");
      }
      
      const answer = await response.json();
      console.log("📥 [Sharyx] Answer received from backend. Call ID:", answer.call_id);

      if (answer.call_id && this.options.onCallId) {
        this.callId = answer.call_id;
        this.options.onCallId(answer.call_id);
      }

      await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("✅ [Sharyx] Remote description set. Waiting for audio tracks...");

    } catch (err) {
      console.error("❌ [Sharyx] Call failed:", err);
      this.setStatus('error', err.message);
    }
  }

  _handleDataMessage(event) {
    try {
      const msg = JSON.parse(event.data);
      
      // Relay to custom callback (used by Flutter Bridge)
      if (this.options.onMessage) {
        this.options.onMessage(msg);
      }

      if (msg.type === "status") {
        if (msg.status === "thinking") this.setStatus('thinking');
        else if (msg.status === "speaking") this.setStatus('speaking');
        else if (msg.status === "listening") this.setStatus('listening');
      }
    } catch (e) {
      console.warn("⚠️ [WebRTC] Data channel message parse error:", e);
    }
  }

  stopCall() {
    console.log("🛑 [Sharyx] Ending call...");
    if (this.dc) this.dc.close();
    if (this.pc) this.pc.close();
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.audio) {
      this.audio.srcObject = null;
      if (this.audio.parentNode) {
        this.audio.parentNode.removeChild(this.audio);
      }
    }
    
    this.pc = null;
    this.dc = null;
    this.stream = null;
    this.audio = null;
    
    this.setStatus('idle');
  }

  handleCleanup() {
    this.stopCall();
    if (this.dom && this.dom.parentNode) {
      this.dom.parentNode.removeChild(this.dom);
    }
  }
}

// Support both names for compatibility with the user's reference
window.HoomanVoiceBot = HoomanVoiceBot;
window.SharyxVoiceBot = HoomanVoiceBot;
