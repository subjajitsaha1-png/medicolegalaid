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

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────
const SAMPLE_CASES: MedicalCase[] = [
  {
    id: 'ML-2025-001',
    patientId: 'u1',
    patientName: 'Priya Sharma',
    patientAge: 42,
    patientPhone: '+91 98765 43210',
    patientEmail: 'priya@example.com',
    bplCard: false,
    annualIncome: 480000,
    hospital: 'Apollo Hospitals',
    hospitalCity: 'Hyderabad',
    hospitalState: 'Telangana',
    issueType: 'Surgical Negligence',
    issueDescription: 'Left kidney removed instead of right during nephrectomy. Patient suffered permanent damage.',
    incidentDate: '2024-10-15',
    filedDate: '2024-11-10',
    estimatedDamage: 2500000,
    status: 'negotiation',
    commission: 'state',
    priority: 'high',
    experts: [{ id: 'e1', name: 'Dr. Rajiv Menon', designation: 'Senior Urologist', specialization: 'Urology', verdict: 'negligence_found', commentary: 'Clear case of wrong-site surgery. Standard of care severely violated. Estimated compensation: ₹20-25L.', submittedAt: '2025-01-15' }],
    documents: [
      { id: 'd1', name: 'Discharge Summary.pdf', type: 'medical_record', uploadedAt: '2024-11-08', size: '2.4 MB' },
      { id: 'd2', name: 'Surgery Report.pdf', type: 'medical_record', uploadedAt: '2024-11-08', size: '1.8 MB' },
      { id: 'd3', name: 'Expert Opinion – Dr Menon.pdf', type: 'expert_report', uploadedAt: '2025-01-16', size: '890 KB' },
    ],
    notes: [
      { id: 'n1', author: 'Adv. Meera Krishnan', role: 'staff', content: 'Hospital requested 30-day extension. Granted with condition of interim payment.', createdAt: '2025-01-12', isInternal: true },
      { id: 'n2', author: 'Dr. Rajiv Menon', role: 'expert', content: 'Expert report submitted. Strong case for negligence.', createdAt: '2025-01-15', isInternal: false },
    ],
    negotiation: {
      stage: 'counter_sent',
      hospitalOffer: 500000,
      ourDemand: 2500000,
      counterOffer: 1800000,
      lastActivity: '2025-01-18',
      agreedAmount: null,
      mediatorName: null,
      deadline: '2025-02-15',
      events: [
        { id: 'ne1', date: '2024-12-01', actor: 'staff', type: 'notice', message: 'Legal notice sent to Apollo Hospitals via registered post.' },
        { id: 'ne2', date: '2024-12-20', actor: 'hospital', type: 'message', message: 'Hospital acknowledged notice. Requested meeting.' },
        { id: 'ne3', date: '2025-01-05', actor: 'hospital', type: 'offer', amount: 500000, message: 'Hospital offered ₹5,00,000 as full and final settlement.' },
        { id: 'ne4', date: '2025-01-18', actor: 'patient', type: 'counter', amount: 1800000, message: 'Counter offer of ₹18,00,000 sent based on expert report and permanent disability.' },
      ],
    },
    aiSuggestion: '',
    filingFeeWaiver: false,
    hearingDates: [],
    lastUpdated: '2025-01-18',
  },
  {
    id: 'ML-2025-002',
    patientId: 'u2',
    patientName: 'Rajan Iyer',
    patientAge: 67,
    patientPhone: '+91 87654 32109',
    patientEmail: 'rajan@example.com',
    bplCard: true,
    annualIncome: 85000,
    hospital: 'KIMS Hospital',
    hospitalCity: 'Secunderabad',
    hospitalState: 'Telangana',
    issueType: 'Misdiagnosis – Cancer',
    issueDescription: 'Stage 1 lung cancer misdiagnosed as tuberculosis for 8 months. Cancer progressed to Stage 3 during delay.',
    incidentDate: '2024-03-10',
    filedDate: '2024-12-01',
    estimatedDamage: 1500000,
    status: 'commission_filed',
    commission: 'national',
    priority: 'urgent',
    experts: [{ id: 'e2', name: 'Adv. Suresh Pillai', designation: 'Medical Law Expert', specialization: 'Oncology Malpractice', verdict: 'negligence_found', commentary: 'Eight-month delay is gross negligence. Patient lost curative window. Life expectancy significantly reduced.', submittedAt: '2025-01-10' }],
    documents: [{ id: 'd4', name: 'Oncology Report.pdf', type: 'medical_record', uploadedAt: '2024-11-20', size: '3.1 MB' }],
    notes: [{ id: 'n3', author: 'Staff Admin', role: 'staff', content: 'BPL card verified. Filing fee waived under COPRA Section 17A. Free legal aid assigned.', createdAt: '2024-12-01', isInternal: true }],
    negotiation: {
      stage: 'failed',
      hospitalOffer: 200000,
      ourDemand: 1500000,
      counterOffer: 1200000,
      lastActivity: '2024-11-20',
      agreedAmount: null,
      mediatorName: null,
      deadline: null,
      events: [
        { id: 'ne5', date: '2024-11-01', actor: 'staff', type: 'notice', message: 'Legal notice sent to KIMS Hospital.' },
        { id: 'ne6', date: '2024-11-15', actor: 'hospital', type: 'offer', amount: 200000, message: 'Hospital offered ₹2L. Unacceptable given the gravity.' },
        { id: 'ne7', date: '2024-11-20', actor: 'patient', type: 'rejection', message: 'Offer rejected. Case escalated to National Commission (NCDRC).' },
      ],
    },
    filingFeeWaiver: true,
    hearingDates: ['2025-03-15', '2025-05-20'],
    lastUpdated: '2025-01-20',
  },
];

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
