export type UserRole = 'customer' | 'agent' | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role: UserRole, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (displayName: string, phoneNumber?: string) => Promise<void>;
  updateRole: (newRole: UserRole) => Promise<void>;
}

export interface CustomerProfile extends User {
  role: 'customer';
  savedCalculations: string[]; // IDs of saved calculations
  leads: string[]; // IDs of submitted leads
}

export interface AgentProfile extends User {
  role: 'agent';
  agentCode: string;
  assignedLeads: string[]; // IDs of leads assigned to this agent
  totalLeadsHandled: number;
}
