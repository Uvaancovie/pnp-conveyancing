export type UserRole = 'customer' | 'agent' | 'admin';

export type UserType = 'estate-agent' | 'developer' | 'homeowner';

export type AccountStatus = 'active' | 'deactivated';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  username?: string;
  firstName?: string;
  surname?: string;
  role: UserRole;
  userType?: UserType;
  phoneNumber?: string;
  status?: AccountStatus;
  createdAt: Date;
  lastLogin: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role: UserRole, phoneNumber?: string, userType?: UserType) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (displayName: string, phoneNumber?: string) => Promise<void>;
  updateAccountDetails: (details: {
    username?: string;
    firstName?: string;
    surname?: string;
    displayName?: string;
    phoneNumber?: string;
  }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deactivateAccount: () => Promise<void>;
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
