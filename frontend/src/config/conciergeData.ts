export interface ConciergeStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  tab?: string; // Target tab to switch to (e.g. 'voice', 'prompt')
}

export interface ConciergeTour {
  id: string;
  steps: ConciergeStep[];
}

export const allTours: ConciergeTour[] = [
  {
    id: 'agent_builder',
    steps: [
      {
        target: '[data-concierge="agent-name"]',
        title: "Name Your Agent",
        content: "Give your AI a professional name like 'Vikram - Sales Lead' or 'Aditi - Support' to identify them in your dashboard.",
        position: 'bottom',
        tab: 'overview'
      },
      {
        target: '[data-concierge="agent-goal"]',
        title: "Define the Goal",
        content: "What should this agent achieve? (e.g., 'Book a table for Bangalore Bistro' or 'Handle Delhi Store Inquiries').",
        position: 'top',
        tab: 'overview'
      },
      {
        target: '[data-concierge="tab-voice"]',
        title: "Voice Configuration",
        content: "Pick a high-quality voice! We recommend Cartesia or ElevenLabs for the most natural Indian-English accents.",
        position: 'bottom',
        tab: 'overview'
      },
      {
        target: '[data-concierge="voice-config"]',
        title: "Synthesis Settings",
        content: "Fine-tune speech speed and pitch. You can even add background sounds like 'Office Ambience' for a realistic call feel.",
        position: 'top',
        tab: 'voice'
      },
      {
        target: '[data-concierge="stt-provider"]',
        title: "Select STT Provider",
        content: "Choose a Speech-to-Text provider. Deepgram is highly recommended for its speed and accuracy with Indian accents.",
        position: 'top',
        tab: 'speech'
      },
      {
        target: '[data-concierge="stt-model"]',
        title: "Choose Language Model",
        content: "Select the specific language model. Ensure it matches the primary language your customers will speak (e.g., English-India).",
        position: 'top',
        tab: 'speech'
      },
      {
        target: '[data-concierge="stt-performance"]',
        title: "Performance Tuning",
        content: "Advanced users can fine-tune sample rates and encoding here to optimize for specific telephony hardware.",
        position: 'top',
        tab: 'speech'
      },
      {
        target: '[data-concierge="tab-prompt"]',
        title: "AI Intelligence",
        content: "The Model tab is where the 'brain' is configured. You can select the LLM (like GPT-4 or Grok) and define its personality.",
        position: 'bottom',
        tab: 'speech'
      },
      {
        target: '[data-concierge="model-config"]',
        title: "Advanced Reasoning",
        content: "Configure temperature and max tokens to balance between creative conversation and concise answers.",
        position: 'top',
        tab: 'prompt'
      },
      {
        target: '[data-concierge="postcall-config"]',
        title: "Post Call Behavior",
        content: "Define how the agent says goodbye. Set a polite Indian-standard closing like 'Dhanyavad, Have a great day!'.",
        position: 'top',
        tab: 'postcall'
      },
      {
        target: '[data-concierge="precall-config"]',
        title: "Pre-Call Logic",
        content: "Fetch customer details from your CRM or set the context before the call starts. Essential for personalized greetings.",
        position: 'top',
        tab: 'precall'
      },
      {
        target: '[data-concierge="tab-tools"]',
        title: "Extend Capabilities",
        content: "Add tools to let your agent book appointments in a Google Calendar or send order updates via WhatsApp/SMS.",
        position: 'bottom',
        tab: 'precall'
      },
      {
        target: '[data-concierge="tab-knowledge"]',
        title: "Knowledge Bank",
        content: "Upload PDFs of your business menu, product catalogue, or FAQ docs. This becomes the agent's source of truth.",
        position: 'bottom',
        tab: 'tools'
      },
      {
        target: '[data-concierge="tab-analytics"]',
        title: "Analytics & Outcomes",
        content: "Define successful outcomes like 'Interested' or 'Call back later' to track conversion rates in your dashboard.",
        position: 'bottom',
        tab: 'knowledge'
      },
      {
        target: '[data-concierge="tab-test"]',
        title: "Simulation",
        content: "Test before going live! Talk to your agent in real-time to verify the tone, accuracy, and flow.",
        position: 'left',
        tab: 'analytics'
      },
      {
        target: '[data-concierge="deploy-button"]',
        title: "Go Live!",
        content: "Ready? Click Deploy to launch your business dashboard. Billing Ramesh is now ready to handle your inventory and sales!",
        position: 'left',
        tab: 'overview'
      }
    ]
  },
  {
    id: 'tool_creation',
    steps: [
      {
        target: '[data-concierge="tool-name"]',
        title: "Tool Name",
        content: "Give your tool a descriptive name. This is what the AI will see.",
        position: 'bottom'
      },
      {
        target: '[data-concierge="create-tool-button"]',
        title: "Save Tool",
        content: "Once configured, save your tool to make it available for all your agents.",
        position: 'top'
      }
    ]
  }
];

export function getTourIdForRoute(route: string): string | null {
  if (route.startsWith('/agents/')) return 'agent_builder';
  if (route === '/tools') return 'tool_creation';
  if (route === '/numbers') return 'telephone_config';
  if (route === '/knowledge_base') return 'knowledge_base';
  return null;
}
