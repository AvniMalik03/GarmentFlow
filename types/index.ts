export type UserRole = 'owner' | 'main_supervisor' | 'dept_supervisor';

export type Stage =
  | 'cloth_received'
  | 'cutting'
  | 'stitching'
  | 'finishing'
  | 'ironing'
  | 'packing'
  | 'dispatch';

export type OrderStatus = 'active' | 'delayed' | 'completed' | 'on_hold';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Order {
  id: string;
  client_name: string;
  product_name: string;
  quantity: number;
  deadline: string; // ISO Date string
  priority: Priority;
  status: OrderStatus;
  notes?: string;
  created_at: string;
}

export interface Lot {
  id: string;
  order_id: string;
  lot_number: string;
  cloth_roll_ref?: string;
  quantity: number;
  received_date: string; // ISO Date string
  created_at: string;
}

export interface Bundle {
  id: string;
  lot_id: string;
  bundle_code: string;
  piece_count: number;
  current_stage: Stage;
  status: 'in_progress' | 'completed' | 'on_hold';
  created_at: string;
}

export interface Worker {
  id: string;
  name: string;
  phone?: string;
  assigned_stage: 'cutting' | 'stitching' | 'finishing' | 'ironing' | 'packing' | 'qc';
  pay_type: 'piece_rate' | 'daily_wage';
  rate_amount: number;
  is_active: boolean;
  created_at: string;
}

export interface StageLog {
  id: string;
  bundle_id: string;
  worker_id?: string;
  stage: Stage;
  pieces_in: number;
  pieces_out: number;
  pieces_rework: number;
  rework_reason?: string;
  logged_by?: string;
  notes?: string;
  created_at: string;
}

export interface QCLog {
  id: string;
  bundle_id: string;
  inspected_by?: string;
  result: 'pass' | 'fail';
  defect_type?: string;
  defect_count: number;
  action_taken?: string;
  rework_stage?: Stage;
  created_at: string;
}

export interface Dispatch {
  id: string;
  order_id: string;
  dispatch_date: string; // ISO Date string
  pieces_dispatched: number;
  vehicle_ref?: string;
  receiver_name?: string;
  created_at: string;
}
