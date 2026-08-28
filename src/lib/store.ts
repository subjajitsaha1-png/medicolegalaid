import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type UserRole = 'patient' | 'staff' | 'expert' | 'legal' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bplCard?: boolean; // Below Poverty Line
  annualIncome?: number;
  avatar?: string;
}

export type CaseStatus =
  | 'draft' | 'submitted' | 'under_review' | 'expert_assigned'
  | 'negotiation' | 'commission_filed' | 'hearing' | 'resolved' | 'dismissed';

export type Commission = 'district' | 'state' | 'national' | 'supreme';

export type NegotiationStage =
  | 'not_started' | 'notice_sent' | 'hospital_responded'
  | 'offer_received' | 'counter_sent' | 'mediation'
  | 'settlement_agreed' | 'failed';

export interface NegotiationEvent {
  id: string;
  date: string;
  actor: 'patient' | 'hospital' | 'mediator' | 'staff';
  type: 'message' | 'offer' | 'counter' | 'rejection' | 'agreement' | 'notice';
  amount?: number;
  message: string;
}

export interface Negotiation {
  stage: NegotiationStage;
  hospitalOffer: number | null;
  ourDemand: number | null;
  counterOffer: number | null;
  lastActivity: string | null;
  agreedAmount: number | null;
  mediatorName: string | null;
  deadline: string | null;
  events: NegotiationEvent[];
}

export interface Expert {
  id: string;
  name: string;
  designation: string;
  specialization: string;
  verdict?: 'negligence_found' | 'no_negligence' | 'inconclusive' | 'further_review';
  commentary?: string;
  submittedAt?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'medical_record' | 'prescription' | 'bill' | 'expert_report' | 'legal' | 'other';
  uploadedAt: string;
  size: string;
  url?: string;
}

export interface CaseNote {
  id: string;
  author: string;
  role: UserRole;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

export interface MedicalCase {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  patientEmail: string;
  bplCard: boolean;
  annualIncome: number;
  hospital: string;
  hospitalCity: string;
  hospitalState: string;
  issueType: string;
  issueDescription: string;
  incidentDate: string;
  filedDate: string;
  estimatedDamage: number;
  status: CaseStatus;
  commission: Commission;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  experts: Expert[];
  documents: Document[];
  notes: CaseNote[];
  negotiation: Negotiation;
  aiSuggestion?: string;
  filingFeeWaiver: boolean;
  compensationAwarded?: number;
  hearingDates: string[];
  lastUpdated: string;
}

// ─── STORE ────────────────────────────────────────────────────────────────────
interface AppStore {
  user: User | null;
  cases: MedicalCase[];
  currentCaseId: string | null;
  aiLoading: boolean;

  login: (role: UserRole) => void;
  logout: () => void;
  setCurrentCase: (id: string | null) => void;

  addCase: (c: MedicalCase) => void;
  updateCase: (id: string, updates: Partial<MedicalCase>) => void;
  addNote: (caseId: string, note: Omit<CaseNote, 'id' | 'createdAt'>) => void;
  updateNegotiation: (caseId: string, updates: Partial<Negotiation>) => void;
  addNegotiationEvent: (caseId: string, event: Omit<NegotiationEvent, 'id'>) => void;
  setAiSuggestion: (caseId: string, suggestion: string) => void;
  setAiLoading: (loading: boolean) => void;
}

const DEMO_USERS: Record<UserRole, User> = {
  patient: { id: 'u1', name: 'Priya Sharma', email: 'priya@example.com', role: 'patient', bplCard: false, annualIncome: 480000 },
  staff: { id: 'u3', name: 'Adv. Meera Krishnan', email: 'meera@medicolegal.in', role: 'staff' },
  expert: { id: 'u4', name: 'Dr. Rajiv Menon', email: 'rajiv@medicolegal.in', role: 'expert' },
  legal: { id: 'u5', name: 'Adv. Prashant Kumar', email: 'prashant@medicolegal.in', role: 'legal' },
  admin: { id: 'u0', name: 'Admin', email: 'admin@medicolegal.in', role: 'admin' },
};

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      cases: SAMPLE_CASES,
      currentCaseId: null,
      aiLoading: false,

      login: (role) => set({ user: DEMO_USERS[role] }),
      logout: () => set({ user: null, currentCaseId: null }),
      setCurrentCase: (id) => set({ currentCaseId: id }),

      addCase: (c) => set((s) => ({ cases: [...s.cases, c] })),
      updateCase: (id, updates) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === id ? { ...c, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : c
          ),
        })),
      addNote: (caseId, note) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId
              ? { ...c, notes: [...c.notes, { ...note, id: `n${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] }] }
              : c
          ),
        })),
      updateNegotiation: (caseId, updates) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId ? { ...c, negotiation: { ...c.negotiation, ...updates, lastActivity: new Date().toISOString().split('T')[0] } } : c
          ),
        })),
      addNegotiationEvent: (caseId, event) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId
              ? { ...c, negotiation: { ...c.negotiation, events: [...c.negotiation.events, { ...event, id: `ne${Date.now()}` }], lastActivity: new Date().toISOString().split('T')[0] } }
              : c
          ),
        })),
      setAiSuggestion: (caseId, suggestion) =>
        set((s) => ({ cases: s.cases.map((c) => (c.id === caseId ? { ...c, aiSuggestion: suggestion } : c)) })),
      setAiLoading: (loading) => set({ aiLoading: loading }),
    }),
    { name: 'medicolegal-store', partialize: (s) => ({ cases: s.cases, user: s.user }) }
  )
);

export const selectCurrentCase = (state: AppStore) =>
  state.cases.find((c) => c.id === state.currentCaseId) ?? null;

export const selectPatientCases = (patientId: string) => (state: AppStore) =>
  state.cases.filter((c) => c.patientId === patientId);
