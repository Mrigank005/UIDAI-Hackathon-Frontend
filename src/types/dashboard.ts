export interface Summary {
  total_pincodes: number;
  critical_alerts: number;
  mbu_backlog_total: number;
  high_priority_tickets: number;
  total_tickets: number;
}

export interface AnomalySummary {
  total_analyzed: number;
  high_risk_count: number;
  average_confidence: number;
}

export interface ComplianceMapData {
  pincode: string;
  district: string;
  state: string;
  deficit: number;
}

export interface ActionTicket {
  pincode: string;
  priority: "Critical" | "Medium" | "Low";
  task: string;
  venue: string;
  details: string;
  whatsapp_msg: string;
  // Extracted from whatsapp_msg for display
  district?: string;
  state?: string;
}

export interface AppData {
  summary: Summary;
  compliance_map_data: ComplianceMapData[];
  action_tickets: ActionTicket[];
  anomaly_summary: AnomalySummary;
}

export interface FilterState {
  state: string;
  district: string;
  priority: string;
  search: string;
}

export type TabType = "satark" | "saksham" | "kartavya" | "pravas";
