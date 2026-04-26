(function() {
  const SCRIPT_ID = 'sharyx-voice-widget-script';
  
  const getApiBase = () => {
    const scriptTag = document.currentScript || document.getElementById(SCRIPT_ID);
    if (scriptTag && scriptTag.src) {
      const url = new URL(scriptTag.src);
      return url.origin + '/api';
    }
    return window.location.origin + '/api';
  };

  const API_BASE = getApiBase();
  const scriptTag = document.currentScript || document.getElementById(SCRIPT_ID);
  const widgetKey = scriptTag ? scriptTag.dataset.widgetKey : null;
  const isIframe = scriptTag?.dataset?.mode === 'iframe' || new URLSearchParams(window.location.search).get('mode') === 'iframe';

  if (!widgetKey) {
    console.error('[Sharyx] Widget Key missing!');
    return;
  }

  let config = null;
  let pc = null;
  let dc = null;
  let audio = null;
  let isCalling = false;
  let isChatting = false;
  let callStartTime = null;
  let chatHistory = [];
  let isTyping = false;

  const injectStyles = (cfg) => {
    const primary = cfg.config?.ui?.primaryColor || '#6366f1';
    const theme = cfg.config?.ui?.theme || 'light';
    const isDark = theme === 'dark';
    const isGlass = theme === 'glass';

    const bg = isDark ? 'rgba(15, 23, 42, 0.95)' : isGlass ? 'rgba(255, 255, 255, 0.7)' : '#ffffff';
    const text = isDark ? '#f8fafc' : '#0f172a';
    const subText = isDark ? '#94a3b8' : '#64748b';
    const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

      #sharyx-widget-container {
        position: ${isIframe ? 'relative' : 'fixed'};
        bottom: ${isIframe ? '0' : '24px'};
        right: ${isIframe ? '0' : '24px'};
        z-index: 999999;
        font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
        display: flex;
        flex-direction: column;
        --sharyx-primary: ${primary};
        --sharyx-accent: #f43f5e;
      }
      #sharyx-widget-button {
        display: ${isIframe ? 'none' : 'flex'};
        width: 64px; height: 64px;
        border-radius: 22px;
        background: var(--sharyx-primary);
        background: linear-gradient(135deg, var(--sharyx-primary) 0%, #818cf8 100%);
        box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4), inset 0 0 0 1px rgba(255,255,255,0.2);
        cursor: pointer;
        align-items: center;
        justify-content: center;
        transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        transform-origin: center;
      }
      #sharyx-widget-button:hover { 
        transform: scale(1.08) translateY(-4px); 
        box-shadow: 0 20px 35px -10px rgba(99, 102, 241, 0.5);
      }
      #sharyx-widget-button svg { width: 30px; height: 30px; fill: white; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }

      #sharyx-widget-modal {
        display: ${isIframe ? 'flex' : 'none'};
        position: ${isIframe ? 'relative' : 'absolute'};
        bottom: ${isIframe ? '0' : '84px'};
        right: 0;
        width: ${isIframe ? '100%' : '400px'};
        height: ${isIframe ? '100%' : '660px'};
        background: ${bg};
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-radius: ${isIframe ? '0' : '32px'};
        border: 1px solid ${border};
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        overflow: hidden;
        flex-direction: column;
        animation: sharyx-slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        color: ${text};
      }
      @keyframes sharyx-slide-up { 
        from { transform: translateY(40px) scale(0.95); opacity: 0; } 
        to { transform: translateY(0) scale(1); opacity: 1; } 
      }

      .sharyx-header {
        padding: 24px;
        background: rgba(255,255,255,0.03);
        border-bottom: 1px solid ${border};
        display: flex; align-items: center; gap: 16px;
        position: relative;
      }
      .sharyx-header::after {
        content: '';
        position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
        background: linear-gradient(90deg, transparent, ${primary}44, transparent);
      }
      .sharyx-header-logo { 
        width: 48px; height: 48px; border-radius: 14px; object-fit: contain; 
        background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
        padding: 4px; border: 1px solid ${border};
      }
      .sharyx-status-dot { 
        width: 10px; height: 10px; background: #22c55e; border-radius: 50%; 
        display: inline-block; margin-right: 8px; 
        box-shadow: 0 0 12px #22c55e; animation: sharyx-pulse 2s infinite; 
      }
      @keyframes sharyx-pulse { 0% { transform: scale(1); opacity: 1; opacity: 1; } 50% { transform: scale(1.4); opacity: 0.4; } 100% { transform: scale(1); opacity: 1; } }

      .sharyx-tabs { 
        display: flex; background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}; 
        padding: 4px; margin: 12px 24px; border-radius: 16px; 
        border: 1px solid ${border};
      }
      .sharyx-tab { 
        flex: 1; padding: 10px; text-align: center; font-size: 13px; font-weight: 700; 
        cursor: pointer; border-radius: 12px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
        color: ${subText}; text-transform: uppercase; letter-spacing: 0.5px;
      }
      .sharyx-tab.active { 
        background: ${isDark ? '#262626' : '#fff'}; color: var(--sharyx-primary); 
        shadow: 0 4px 12px rgba(0,0,0,0.1); 
      }

      .sharyx-body { flex: 1; overflow-y: auto; display: flex; flex-direction: column; padding: 24px; scroll-behavior: smooth; }
      .sharyx-chat-msg { 
        margin-bottom: 20px; max-width: 85%; padding: 14px 18px; border-radius: 22px; 
        font-size: 14px; line-height: 1.5; font-weight: 500;
        box-shadow: 0 2px 5px rgba(0,0,0,0.02);
      }
      .sharyx-msg-ai { 
        background: ${isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}; 
        align-self: flex-start; border-bottom-left-radius: 4px; color: ${text}; 
      }
      .sharyx-msg-user { 
        background: var(--sharyx-primary); 
        background: linear-gradient(135deg, var(--sharyx-primary) 0%, #818cf8 100%);
        color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; 
        box-shadow: 0 8px 16px -4px rgba(99, 102, 241, 0.3);
      }

      .sharyx-call-view { 
        display: none; align-items: center; justify-content: center; 
        height: 100%; flex-direction: column; text-align: center; padding: 24px; gap: 32px;
      }
      .sharyx-call-btn-container {
        position: relative; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center;
      }
      .sharyx-call-ripple {
        position: absolute; width: 100%; height: 100%; border-radius: 50%;
        background: var(--sharyx-primary); opacity: 0.2; transform: scale(1);
        animation: sharyx-ripple 2s infinite;
      }
      @keyframes sharyx-ripple { from { transform: scale(1); opacity: 0.4; } to { transform: scale(1.8); opacity: 0; } }

      .sharyx-call-btn { 
        width: 100px; height: 100px; border-radius: 50%; border: none; 
        background: #10b981; color: #fff; cursor: pointer; display: flex; 
        align-items: center; justify-content: center; z-index: 2;
        box-shadow: 0 15px 30px -5px rgba(16, 185, 129, 0.4); 
        transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1); 
      }
      .sharyx-call-btn:hover { transform: scale(1.05); }
      .sharyx-call-btn.active { 
        background: #f43f5e; box-shadow: 0 15px 30px -5px rgba(244, 63, 94, 0.4); 
      }
      .sharyx-call-btn svg { width: 44px; height: 44px; transition: transform 0.4s; }
      .sharyx-call-btn.active svg { transform: rotate(135deg); }

      .sharyx-input-area { 
        padding: 20px 24px; border-top: 1px solid ${border}; display: flex; gap: 12px; 
        background: rgba(255,255,255,0.01);
      }
      .sharyx-input { 
        flex: 1; border: 1px solid ${border}; 
        background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}; 
        padding: 14px 20px; border-radius: 18px; font-size: 14px; outline: none; 
        transition: all 0.3s; color: ${text}; font-weight: 500;
      }
      .sharyx-input:focus { border-color: var(--sharyx-primary); background: ${isDark ? 'rgba(255,255,255,0.08)' : '#fff'}; box-shadow: 0 0 0 4px ${primary}11; }
      .sharyx-send { 
        width: 48px; height: 48px; border-radius: 16px; border: none; 
        background: var(--sharyx-primary); color: #fff; cursor: pointer; 
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s;
      }
      .sharyx-send:hover { transform: scale(1.05); }

      .sharyx-typing { font-size: 12px; color: ${subText}; margin-bottom: 20px; display: none; font-weight: 600; opacity: 0.8; }
      
      .sharyx-lead-form { 
        background: ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'}; 
        border: 1px solid ${border}; border-radius: 24px; padding: 20px; margin-top: 10px; 
        display: none; flex-direction: column; gap: 12px;
      }
      .sharyx-lead-input { 
        width: 100%; border: 1px solid ${border}; 
        background: ${isDark ? 'rgba(255,255,255,0.05)' : '#fff'}; 
        padding: 12px 16px; border-radius: 14px; font-size: 14px; outline: none; 
        box-sizing: border-box; transition: 0.2s;
      }
      .sharyx-lead-btn { 
        background: var(--sharyx-primary); color: #fff; border: none; padding: 14px; 
        border-radius: 14px; font-size: 14px; font-weight: 700; cursor: pointer; 
        transition: all 0.3s; 
      }
      .sharyx-lead-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
      
      .sharyx-telephony-info { 
        text-align: center; padding: 24px; background: ${primary}11; 
        border-radius: 28px; border: 1px dashed ${primary}44; margin: 24px; 
      }
      .sharyx-phone-link { 
        display: block; font-size: 22px; font-weight: 800; color: var(--sharyx-primary); 
        text-decoration: none; margin: 12px 0; letter-spacing: 1.5px; 
      }

      .custom-scrollbar::-webkit-scrollbar { width: 5px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; border-radius: 10px; }
    `;
    document.head.appendChild(styleEl);
  };

  async function init() {
    try {
      const res = await fetch(`${API_BASE}/public-widget/config?key=${widgetKey}`);
      if (!res.ok) throw new Error('Failed to load config');
      config = await res.json();
      injectStyles(config);
      render();
    } catch (err) { console.error('[Sharyx]', err); }
  }

  function render() {
    const primary = config.config?.ui?.primaryColor || '#6366f1';
    const container = document.createElement('div');
    container.id = 'sharyx-widget-container';
    
    const hasVoice = config.config?.voice?.enabled ?? true;
    const hasChat = config.config?.chat?.enabled ?? true;
    const welcome = config.agent?.welcome_message || config.agent?.first_message || config.config?.ui?.welcomeMessage || 'How can I help you?';
    
    if (chatHistory.length === 0) {
      chatHistory.push({ role: 'assistant', content: welcome });
    }
    const logo = config.config?.ui?.headerLogo || 'https://sharyx.ai/logo.png';
    const launcher = config.config?.ui?.launcherIcon;

    container.innerHTML = `
      <div id="sharyx-widget-modal">
        <div class="sharyx-header">
          <img class="sharyx-header-logo" src="${logo}" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=${config.agent?.name}'" />
          <div style="flex: 1;">
            <div style="font-weight: 800; font-size: 17px; letter-spacing: -0.025em;">${config.agent?.name || 'AI Assistant'}</div>
            <div style="font-size: 12px; font-weight: 600; opacity: 0.7; display: flex; align-items: center;">
              <span class="sharyx-status-dot"></span>Online & Ready
            </div>
          </div>
        </div>

        ${(hasChat && hasVoice) ? `
          <div class="sharyx-tabs">
            <div class="sharyx-tab active" data-tab="chat">Message</div>
            <div class="sharyx-tab" data-tab="call">Voice AI</div>
          </div>
        ` : ''}

        <div id="sharyx-chat-view" class="sharyx-body custom-scrollbar">
           <div class="sharyx-chat-msg sharyx-msg-ai">${welcome}</div>
           <div id="sharyx-chat-history"></div>
           <div id="sharyx-typing-indicator" class="sharyx-typing">AI is generating response...</div>
           <div id="sharyx-lead-form" class="sharyx-lead-form">
              <div style="font-size: 14px; font-weight: 800; margin-bottom: 4px;">Exclusive Access</div>
              <div style="font-size: 12px; opacity: 0.7; margin-bottom: 12px;">Drop your details to stay connected.</div>
              <input type="text" id="sharyx-lead-name" class="sharyx-lead-input" placeholder="Your Name" />
              <input type="email" id="sharyx-lead-email" class="sharyx-lead-input" placeholder="Your Email" />
              <button id="sharyx-lead-submit" class="sharyx-lead-btn">Connect with Expert</button>
           </div>
        </div>

        <div id="sharyx-call-view" class="sharyx-call-view">
           <div style="font-size: 18px; font-weight: 800; letter-spacing: -0.02em;">Instant Voice Support</div>
           <div style="font-size: 13px; font-weight: 500; opacity: 0.6; max-width: 220px;">Experience real-time conversation with ${config.agent?.name || 'our virtual agent'}.</div>
           
           ${config.type === 'telephony' || config.type === 'hybrid' ? `
             <div class="sharyx-telephony-info">
               <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.5; margin-bottom: 12px;">Request Callback</div>
               <input type="text" id="sharyx-telephony-phone" class="sharyx-lead-input" style="margin-bottom: 12px; text-align: center; font-size: 16px; font-weight: 600;" placeholder="+1..." />
               <button id="sharyx-telephony-btn" class="sharyx-lead-btn" style="width: 100%; box-shadow: 0 4px 12px ${primary}44;">Call Me Now</button>
               <div id="sharyx-telephony-status" style="font-size: 12px; font-weight: 700; margin-top: 12px; color: #10b981; display: none;">Establishing connection...</div>
               <div style="font-size: 11px; opacity: 0.4; margin-top: 20px; font-weight: 500;">Direct line: <a href="tel:${config.agent?.phone || ''}" style="color: inherit; text-decoration: underline; font-weight: 700;">${config.agent?.phone || 'Private'}</a></div>
             </div>
           ` : ''}

           ${config.type === 'web' || config.type === 'hybrid' ? `
             <div style="margin: 10px 0; display: flex; flex-direction: column; align-items: center; gap: 20px;">
               <div class="sharyx-call-btn-container">
                  <div id="sharyx-call-ripple" class="sharyx-call-ripple" style="display: none;"></div>
                  <button id="sharyx-call-trigger" class="sharyx-call-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                  </button>
               </div>
               <div id="sharyx-call-status" style="font-size: 14px; font-weight: 700; opacity: 0.8; letter-spacing: -0.01em;">Tap to start voice AI</div>
               <div id="sharyx-call-timer" style="font-size: 12px; font-weight: 800; color: #f43f5e; display: none; font-family: monospace; background: #f43f5e11; padding: 4px 12px; border-radius: 8px;">00:00</div>
             </div>
           ` : ''}
        </div>

        ${hasChat ? `
          <div id="sharyx-footer-chat" class="sharyx-input-area">
            <input type="text" id="sharyx-msg-input" class="sharyx-input" placeholder="Type a message..." />
            <button id="sharyx-send-btn" class="sharyx-send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        ` : ''}

        <div style="padding: 10px; font-size: 10px; text-align: center; opacity: 0.5;">Powered by Sharyx AI</div>
      </div>

      <div id="sharyx-widget-button">
        ${launcher ? `<img src="${launcher}" />` : `
          <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        `}
      </div>
    `;

    document.body.appendChild(container);

    // Event Handlers
    const btn = document.getElementById('sharyx-widget-button');
    const modal = document.getElementById('sharyx-widget-modal');
    const sendBtn = document.getElementById('sharyx-send-btn');
    const input = document.getElementById('sharyx-msg-input');
    const callBtn = document.getElementById('sharyx-call-trigger');
    const tabs = document.querySelectorAll('.sharyx-tab');

    btn.onclick = () => {
      const isVisible = modal.style.display === 'flex';
      modal.style.display = isVisible ? 'none' : 'flex';
    };

    tabs.forEach(tab => {
      tab.onclick = () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.tab;
        document.getElementById('sharyx-chat-view').style.display = mode === 'chat' ? 'flex' : 'none';
        document.getElementById('sharyx-call-view').style.display = mode === 'call' ? 'flex' : 'none';
        document.getElementById('sharyx-footer-chat').style.display = mode === 'chat' && hasChat ? 'flex' : 'none';
      };
    });

    if (sendBtn) sendBtn.onclick = sendMessage;
    if (input) input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
    if (callBtn) callBtn.onclick = toggleCall;
    
    const telephonyBtn = document.getElementById('sharyx-telephony-btn');
    if (telephonyBtn) telephonyBtn.onclick = requestCall;
    
    const leadSubmit = document.getElementById('sharyx-lead-submit');
    if (leadSubmit) leadSubmit.onclick = submitLead;

    // Initial View setup
    if (!hasChat && hasVoice) {
       document.getElementById('sharyx-chat-view').style.display = 'none';
       document.getElementById('sharyx-call-view').style.display = 'flex';
    }
  }

  async function requestCall() {
    const phoneInput = document.getElementById('sharyx-telephony-phone');
    const status = document.getElementById('sharyx-telephony-status');
    const phone = phoneInput?.value?.trim();
    if (!phone) return alert('Please enter your phone number with country code');
    
    try {
      status.style.display = 'block';
      status.style.color = '#22c55e';
      status.innerText = 'Initiating call...';
      const res = await fetch(`${API_BASE}/public-widget/call/telephony`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_key: widgetKey, phone: phone, name: 'Widget Visitor' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        status.innerText = 'Call connected! Please answer your phone.';
        phoneInput.value = '';
      } else {
        status.style.color = '#ef4444';
        status.innerText = data.message || 'Failed to initiate call';
      }
    } catch (err) {
      status.style.color = '#ef4444';
      status.innerText = 'Network error. Please try again.';
    }
  }

  async function sendMessage() {
    const input = document.getElementById('sharyx-msg-input');
    const history = document.getElementById('sharyx-chat-history');
    const indicator = document.getElementById('sharyx-typing-indicator');
    const text = input.value.trim();
    if (!text || isTyping) return;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'sharyx-chat-msg sharyx-msg-user';
    userMsg.innerText = text;
    history.appendChild(userMsg);
    input.value = '';
    scrollToBottom();

    isTyping = true;
    indicator.style.display = 'block';

    try {
      const res = await fetch(`${API_BASE}/public-widget/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_key: widgetKey, message: text, history: chatHistory })
      });
      const data = await res.json();
      
      const aiMsg = document.createElement('div');
      aiMsg.className = 'sharyx-chat-msg sharyx-msg-ai';
      
      let answerText = data.answer || "I'm sorry, I couldn't process that.";
      aiMsg.innerText = answerText;
      
      if (data.sources && data.sources.length > 0) {
        const sourcesDiv = document.createElement('div');
        sourcesDiv.style.fontSize = '10px';
        sourcesDiv.style.marginTop = '6px';
        sourcesDiv.style.opacity = '0.7';
        sourcesDiv.style.borderTop = '1px solid rgba(0,0,0,0.1)';
        sourcesDiv.style.paddingTop = '6px';
        sourcesDiv.innerText = 'Sources: ' + data.sources.join(', ');
        aiMsg.appendChild(sourcesDiv);
      }
      
      history.appendChild(aiMsg);
      
      chatHistory.push({ role: 'user', content: text });
      chatHistory.push({ role: 'assistant', content: answerText });

      // After 2 messages, show lead form if not hidden
      if (chatHistory.length >= 4 && !localStorage.getItem('sharyx-lead-sent')) {
         document.getElementById('sharyx-lead-form').style.display = 'flex';
      }
    } catch (err) {
      console.error('[Sharyx] Chat error:', err);
    } finally {
      isTyping = false;
      indicator.style.display = 'none';
      scrollToBottom();
    }
  }

  function scrollToBottom() {
    const chatView = document.getElementById('sharyx-chat-view');
    chatView.scrollTop = chatView.scrollHeight;
  }

  async function submitLead() {
    const name = document.getElementById('sharyx-lead-name').value;
    const email = document.getElementById('sharyx-lead-email').value;
    const form = document.getElementById('sharyx-lead-form');
    
    if (!name || !email) return alert('Please provide name and email');

    try {
      await fetch(`${API_BASE}/public-widget/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_key: widgetKey, name, email })
      });
      form.innerHTML = '<div style="color: #22c55e; font-size: 12px; font-weight: 600;">Thanks! We will contact you soon.</div>';
      localStorage.setItem('sharyx-lead-sent', 'true');
      setTimeout(() => form.style.display = 'none', 3000);
    } catch (err) { console.error(err); }
  }

  async function toggleCall() {
    if (isCalling) await stopCall();
    else await startCall();
  }

  let callTimerInterval = null;

  async function startCall() {
    const status = document.getElementById('sharyx-call-status');
    const btn = document.getElementById('sharyx-call-trigger');
    const ripple = document.getElementById('sharyx-call-ripple');
    const timer = document.getElementById('sharyx-call-timer');
    
    try {
      isCalling = true;
      callStartTime = Date.now();
      btn.classList.add('active');
      if (ripple) ripple.style.display = 'block';
      if (timer) {
        timer.style.display = 'block';
        timer.innerText = '00:00';
        callTimerInterval = setInterval(() => {
          const elapsed = Math.round((Date.now() - callStartTime) / 1000);
          const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
          const secs = (elapsed % 60).toString().padStart(2, '0');
          timer.innerText = `${mins}:${secs}`;
        }, 1000);
      }
      
      status.innerText = 'Initializing Secure Stream...';

      pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      dc = pc.createDataChannel("pipecat", { ordered: true });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      pc.ontrack = (e) => {
        if (e.track.kind === 'audio') {
          if (!audio) audio = new Audio();
          audio.srcObject = e.streams[0];
          audio.play();
          status.innerText = 'Live Conversation';
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await new Promise(r => {
        if (pc.iceGatheringState === 'complete') r();
        else { pc.onicegatheringstatechange = () => { if (pc.iceGatheringState === 'complete') r(); }; setTimeout(r, 2000); }
      });

      const res = await fetch(`${API_BASE}/public-widget/call/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdp: pc.localDescription.sdp, type: pc.localDescription.type, public_key: widgetKey })
      });
      const answer = await res.json();
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error('[Sharyx] Call failed:', err);
      status.innerText = 'Connection Failed';
      stopCall();
    }
  }

  async function stopCall() {
    isCalling = false;
    if (callTimerInterval) {
      clearInterval(callTimerInterval);
      callTimerInterval = null;
    }
    
    const btn = document.getElementById('sharyx-call-trigger');
    const status = document.getElementById('sharyx-call-status');
    const ripple = document.getElementById('sharyx-call-ripple');
    const timer = document.getElementById('sharyx-call-timer');
    
    if (btn) btn.classList.remove('active');
    if (status) status.innerText = 'Call successfully ended';
    if (ripple) ripple.style.display = 'none';
    if (timer) {
      setTimeout(() => { if (!isCalling && timer) timer.style.display = 'none'; }, 3000);
    }

    if (dc) dc.close();
    if (pc) pc.close();
    if (audio) audio.srcObject = null;
    
    if (callStartTime) {
      const dur = Math.round((Date.now() - callStartTime) / 1000);
      callStartTime = null;
      fetch(`${API_BASE}/public-widget/call/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_key: widgetKey, duration: dur })
      }).catch(e => console.error(e));
    }
  }

  init();
})();
