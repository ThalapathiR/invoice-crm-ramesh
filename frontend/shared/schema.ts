export interface Agent {
  id: string;
  name: string;
  description?: string;
  language?: string;
  voice_id?: string;
  phone?: string;
  status: string;
  calls24h: number;
  tenant_id: string;
}

export interface Flow {
  id: string;
  name: string;
  description?: string;
  steps?: any;
  nodeData?: any;
  edgeData?: any;
  status: string;
  lastEdited: string;
  tenant_id: string;
}

export interface Call {
  id: string;
  caller: string;
  direction?: string;
  agent_name: string;
  outcome: string;
  duration: string;
  duration_seconds: number;
  cost: string;
  sentiment: string;
  sentiment_score: number;
  transcript?: string;
  transcript_messages?: any[];
  recording_url?: string;
  caller_location?: string;
  end_reason?: string;
  latency_avg?: number;
  tool_calls_count?: number;
  intent_detected?: string;
  goal_achieved: string;
  tags?: string[];
  timeline_events?: any[];
  tenant_id: string;
  call_status?: string;
  created_on: string;
}

export interface Tool {
  id: string;
  name: string;
  description?: string;
  type?: string;
  method?: string;
  endpoint?: string;
  status: string;
  tenant_id: string;
}

export interface PhoneNumber {
  id: string;
  number: string;
  country?: string;
  type?: string;
  agent?: string;
  monthly_cost?: string;
  tenant_id: string;
  status: any;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: boolean;
}
