import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  FileText, Upload, Clock, ChevronRight, CheckCircle,
  AlertCircle, Download, Eye, Trash2, IndianRupee,
  HelpCircle, User, Building, Calendar, MessageSquare,
  Home, FolderOpen, HeartHandshake, Sparkles, Scale,
  ClipboardList, Search, Microscope, Handshake, Landmark
} from 'lucide-react';
import { useStore } from '../lib/store';
import { useAISuggestion } from '../hooks/useAI';
import { MedicalCase, Document } from '../lib/store';
import { COMMISSION_RULES, BPL_PROVISIONS } from '../data/commissionRules';
import AccountMenu from './AccountMenu';

const ISSUE_TYPES = [
  'Surgical Negligence', 'Misdiagnosis', 'Wrong Medication', 'Anaesthesia Error',
  'Birth Injury', 'ICU Negligence', 'Delayed Treatment', 'Incorrect Lab Report',
  'Unnecessary Surgery', 'Hospital Infection (HAI)', 'Consent Violation', 'Other'
];

const TIMELINE_STEPS = [
  { key: 'submitted', label: 'Grievance Filed', icon: ClipboardList },
  { key: 'under_review', label: 'Under Review', icon: Search },
  { key: 'expert_assigned', label: 'Expert Assigned', icon: Microscope },
  { key: 'negotiation', label: 'Settlement Negotiation', icon: Handshake },
  { key: 'commission_filed', label: 'Commission Filed', icon: FileText },
  { key: 'hearing', label: 'Hearing Scheduled', icon: Landmark },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle },
];

const STATUS_ORDER = ['submitted', 'under_review', 'expert_assigned', 'negotiation', 'commission_filed', 'hearing', 'resolved'];

export default function PatientDashboard({ onSignedOut }: { onSignedOut?: () => void }) {
  const { user, cases, addCase, updateCase } = useStore();
  const { generateSuggestion, aiLoading } = useAISuggestion();
  const [activeTab, setActiveTab] = useState<'home' | 'file' | 'docs' | 'bpl' | 'ai'>('home');
  const [formStep, setFormStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const myCases = cases.filter((c) => c.patientId === user?.id || c.patientName === user?.name);
  const activeCase = myCases[0];

  // Form state
  const [form, setForm] = useState({
    name: user?.name || '', age: '', phone: '', email: user?.email || '',
    hospital: '', hospitalCity: '', hospitalState: '',
    issueType: '', issueDescription: '', incidentDate: '',
    estimatedDamage: '', bplCard: false, annualIncome: '',
    hasExpertOpinion: false, urgency: 'medium',
  });

  const onDrop = useCallback((accepted: File[]) => {
    setUploadedFiles((prev) => [...prev, ...accepted.map((f) => f.name)]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] }, multiple: true,
  });

  const handleSubmitCase = () => {
    const newCase: MedicalCase = {
      id: `ML-2025-${String(cases.length + 1).padStart(3, '0')}`,
      patientId: user?.id || 'u_new',
      patientName: form.name,
      patientAge: parseInt(form.age),
      patientPhone: form.phone,
      patientEmail: form.email,
      bplCard: form.bplCard,
      annualIncome: parseInt(form.annualIncome) || 0,
      hospital: form.hospital,
      hospitalCity: form.hospitalCity,
      hospitalState: form.hospitalState,
      issueType: form.issueType,
      issueDescription: form.issueDescription,
      incidentDate: form.incidentDate,
      filedDate: new Date().toISOString().split('T')[0],
      estimatedDamage: parseInt(form.estimatedDamage) * 100,
      status: 'submitted',
      commission: parseInt(form.estimatedDamage) * 100 > 20000000 ? 'national' : parseInt(form.estimatedDamage) * 100 > 5000000 ? 'state' : 'district',
      priority: form.urgency as 'low' | 'medium' | 'high' | 'urgent',
      experts: [], documents: [], notes: [],
      negotiation: { stage: 'not_started', hospitalOffer: null, ourDemand: parseInt(form.estimatedDamage) * 100, counterOffer: null, lastActivity: null, agreedAmount: null, mediatorName: null, deadline: null, events: [] },
      filingFeeWaiver: form.bplCard || (parseInt(form.annualIncome) < 100000),
      hearingDates: [], lastUpdated: new Date().toISOString().split('T')[0],
    };
    addCase(newCase);
    setSubmitted(true);
  };

  const handleAI = async () => {
    if (!activeCase) return;
    setActiveTab('ai');
    await generateSuggestion({
      id: activeCase.id,
      issueType: activeCase.issueType,
      issueDescription: activeCase.issueDescription,
      estimatedDamage: activeCase.estimatedDamage,
      bplCard: activeCase.bplCard,
      annualIncome: activeCase.annualIncome,
      negotiationStage: activeCase.negotiation.stage,
      expertVerdict: activeCase.experts[0]?.verdict,
      commission: activeCase.commission,
      hospital: activeCase.hospital,
      patientAge: activeCase.patientAge,
      notes: activeCase.notes,
    });
  };

  const currentStepIdx = activeCase ? STATUS_ORDER.indexOf(activeCase.status) : -1;

  const tabs = [
    { k: 'home', label: 'My Case', icon: Home },
    { k: 'file', label: 'File Grievance', icon: ClipboardList },
    { k: 'docs', label: 'Documents', icon: FolderOpen },
    { k: 'bpl', label: 'Free Help', icon: HeartHandshake },
    { k: 'ai', label: 'AI Advice', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(15,45,96,0.05),transparent_60%)] bg-gray-50 font-body">
      {/* Header */}
      <div className="relative bg-hero text-white sticky top-0 z-40 overflow-hidden">
        <div className="absolute inset-0 bg-hero-mesh pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full seal-badge flex items-center justify-center flex-shrink-0">
              <Scale className="w-4.5 h-4.5 text-gold-300" />
            </div>
            <div>
              <div className="text-[11px] text-gold-400 font-semibold tracking-widest uppercase">Patient Portal</div>
              <div className="font-display font-semibold text-base leading-tight">Welcome, {user?.name?.split(' ')[0]}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCase?.bplCard && (
              <span className="bg-gold-500/15 border border-gold-400/30 text-gold-300 text-[10px] px-2 py-0.5 rounded-full font-semibold">BPL ✓</span>
            )}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-burgundy-500 to-burgundy-700 flex items-center justify-center font-bold text-sm border border-white/10 overflow-hidden">
              <AccountMenu onSignedOut={onSignedOut || (() => {})} avatarClassName="w-full h-full flex items-center justify-center" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative max-w-3xl mx-auto px-2 flex border-t border-white/10 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.k} onClick={() => setActiveTab(t.k as typeof activeTab)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === t.k ? 'border-gold-400 text-white' : 'border-transparent text-white/50 hover:text-white/80'}`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5">
        <AnimatePresence mode="wait">
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              {activeCase ? (
                <>
                  {/* Case Card */}
                  <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-xs text-gray-400 font-medium">{activeCase.id}</div>
                        <div className="font-display font-bold text-navy-800 text-lg mt-0.5">{activeCase.issueType}</div>
                        <div className="text-gray-500 text-sm">{activeCase.hospital}, {activeCase.hospitalCity}</div>
                      </div>
                      <span className={`status-badge ${activeCase.status === 'negotiation' ? 'bg-amber-100 text-amber-700' : activeCase.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {activeCase.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        ['Commission', activeCase.commission.toUpperCase()],
                        ['Filed', activeCase.filedDate],
                        ['Est. Damage', `₹${(activeCase.estimatedDamage / 100000).toFixed(1)}L`],
                        ['Priority', activeCase.priority],
                      ].map(([l, v]) => (
                        <div key={l} className="bg-gray-50 rounded-xl p-3">
                          <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">{l}</div>
                          <div className="text-navy-700 font-semibold text-sm capitalize mt-0.5">{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* BPL Notice */}
                    {activeCase.filingFeeWaiver && (
                      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-teal-700">
                          <strong>Fee Waiver Active</strong> — Filing fee fully waived. Free legal aid has been assigned via DLSA.
                        </div>
                      </div>
                    )}

                    {/* Negotiation Banner */}
                    {activeCase.status === 'negotiation' && (
                      <div className="bg-gradient-to-r from-burgundy-600 to-burgundy-800 rounded-xl p-4 text-white mb-4 border border-gold-400/20">
                        <div className="text-xs text-gold-300 mb-1">Active Settlement Track</div>
                        <div className="font-semibold flex items-center gap-1.5"><Handshake className="w-4 h-4" /> Negotiation In Progress</div>
                        <div className="text-xs opacity-90 mt-1">
                          Hospital: ₹{activeCase.negotiation.hospitalOffer ? (activeCase.negotiation.hospitalOffer / 100000).toFixed(1) : '—'}L
                          {' · '}Our Counter: ₹{activeCase.negotiation.counterOffer ? (activeCase.negotiation.counterOffer / 100000).toFixed(1) : activeCase.negotiation.ourDemand ? (activeCase.negotiation.ourDemand / 100000).toFixed(1) : '—'}L
                        </div>
                      </div>
                    )}

                    {/* AI Button */}
                    <button onClick={handleAI} className="w-full flex items-center justify-between bg-navy-50 hover:bg-navy-100 transition-colors rounded-xl p-3.5 text-navy-700 group">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-gold-600" />
                        <span className="text-sm font-semibold">Get AI Strategy Advice</span>
                      </div>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                    <div className="font-display font-semibold text-navy-800 mb-4">Case Timeline</div>
                    <div className="space-y-0">
                      {TIMELINE_STEPS.map((step, i) => {
                        const done = i < currentStepIdx;
                        const active = i === currentStepIdx;
                        const StepIcon = step.icon;
                        return (
                          <div key={step.key} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${done ? 'bg-teal-500 border-teal-500 text-white' : active ? 'bg-gradient-to-br from-burgundy-600 to-burgundy-800 border-gold-400 text-gold-300' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                                {done ? <CheckCircle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                              </div>
                              {i < TIMELINE_STEPS.length - 1 && (
                                <div className={`w-0.5 flex-1 min-h-5 my-1 ${done ? 'bg-teal-400' : 'bg-gray-100'}`} />
                              )}
                            </div>
                            <div className="pb-5 pt-1.5">
                              <div className={`text-sm font-semibold ${done ? 'text-teal-600' : active ? 'text-burgundy-700' : 'text-gray-400'}`}>{step.label}</div>
                              {active && <div className="text-xs text-gold-700 font-medium mt-0.5">In progress · last updated {activeCase.lastUpdated}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expert Notes */}
                  {activeCase.experts[0]?.commentary && (
                    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mt-4">
                      <div className="font-display font-semibold text-navy-800 mb-3">Expert Evaluation</div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm flex-shrink-0">
                          {activeCase.experts[0].name.split(' ').slice(-1)[0][0]}
                        </div>
                        <div>
                          <div className="font-semibold text-navy-700 text-sm">{activeCase.experts[0].name}</div>
                          <div className="text-gray-400 text-xs">{activeCase.experts[0].designation}</div>
                          <div className="mt-2 text-gray-600 text-sm leading-relaxed">{activeCase.experts[0].commentary}</div>
                          {activeCase.experts[0].verdict && (
                            <span className={`mt-2 inline-block status-badge ${activeCase.experts[0].verdict === 'negligence_found' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                              {activeCase.experts[0].verdict.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="font-display font-semibold text-navy-800 text-xl mb-2">No Cases Filed Yet</h3>
                  <p className="text-gray-500 text-sm mb-6">Start by filing your medical grievance to get expert legal support.</p>
                  <button onClick={() => setActiveTab('file')} className="btn-teal">File Your First Grievance</button>
                </div>
              )}
            </motion.div>
          )}

          {/* FILE GRIEVANCE TAB */}
          {activeTab === 'file' && (
            <motion.div key="file" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                {submitted ? (
                  <div className="text-center py-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-6xl mb-4">✅</motion.div>
                    <h3 className="font-display font-bold text-navy-800 text-xl mb-2">Case Filed Successfully!</h3>
                    <p className="text-gray-500 text-sm mb-1">Case ID: <strong>{cases[cases.length - 1]?.id}</strong></p>
                    <p className="text-gray-500 text-sm mb-6">Our team will contact you within 48 hours. Check My Case tab for updates.</p>
                    {form.bplCard && (
                      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-5 text-left">
                        <div className="font-semibold text-teal-700 text-sm mb-1">✅ BPL Benefits Activated</div>
                        <ul className="text-xs text-teal-600 space-y-1">
                          <li>• Filing fee: ₹0 (fully waived)</li>
                          <li>• Free legal aid: DLSA advocate assigned</li>
                          <li>• Priority hearing listed</li>
                        </ul>
                      </div>
                    )}
                    <button onClick={() => { setSubmitted(false); setFormStep(1); setActiveTab('home'); }} className="btn-primary">View My Case →</button>
                  </div>
                ) : (
                  <>
                    <div className="mb-5">
                      <div className="font-display font-bold text-navy-800 text-lg">Medical Grievance Form</div>
                      <div className="text-gray-400 text-xs mt-1">Step {formStep} of 4 · {['Personal Details', 'Incident Details', 'Documents & Proof', 'Review & Submit'][formStep - 1]}</div>
                    </div>

                    {/* Progress */}
                    <div className="flex gap-1.5 mb-6">
                      {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= formStep ? 'bg-teal-500' : 'bg-gray-100'}`} />
                      ))}
                    </div>

                    {/* Step 1: Personal */}
                    {formStep === 1 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Full Name *</label>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="As per medical records" />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Age *</label>
                            <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="input-field" placeholder="Years" />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Phone *</label>
                            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+91 XXXXX" />
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Email</label>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="email@example.com" />
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Annual Family Income (₹)</label>
                            <input type="number" value={form.annualIncome} onChange={(e) => setForm({ ...form, annualIncome: e.target.value })} className="input-field" placeholder="Enter yearly income in rupees" />
                          </div>
                        </div>

                        {/* BPL Toggle */}
                        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-semibold text-navy-700 text-sm">Do you have a BPL / AAY / PMJAY Card?</div>
                              <div className="text-xs text-gray-500 mt-0.5">Activates zero filing fee + free legal aid</div>
                            </div>
                            <button onClick={() => setForm({ ...form, bplCard: !form.bplCard })}
                              className={`w-12 h-6 rounded-full transition-colors relative ${form.bplCard ? 'bg-teal-500' : 'bg-gray-200'}`}>
                              <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${form.bplCard ? 'left-6' : 'left-0.5'}`} />
                            </button>
                          </div>
                          {form.bplCard && (
                            <div className="bg-teal-100 rounded-lg p-2 text-xs text-teal-700">
                              ✅ BPL benefits activated: ₹0 filing fee, free DLSA advocate, priority hearing
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Incident */}
                    {formStep === 2 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Hospital Name *</label>
                          <input value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} className="input-field" placeholder="Full hospital name" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1.5">City *</label>
                            <input value={form.hospitalCity} onChange={(e) => setForm({ ...form, hospitalCity: e.target.value })} className="input-field" placeholder="City" />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1.5">State *</label>
                            <input value={form.hospitalState} onChange={(e) => setForm({ ...form, hospitalState: e.target.value })} className="input-field" placeholder="State" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Type of Issue *</label>
                          <select value={form.issueType} onChange={(e) => setForm({ ...form, issueType: e.target.value })} className="input-field">
                            <option value="">Select issue type</option>
                            {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Date of Incident *</label>
                          <input type="date" value={form.incidentDate} onChange={(e) => setForm({ ...form, incidentDate: e.target.value })} className="input-field" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Estimated Compensation Demand (₹ in thousands)</label>
                          <input type="number" value={form.estimatedDamage} onChange={(e) => setForm({ ...form, estimatedDamage: e.target.value })} className="input-field" placeholder="e.g. 1500 for ₹15 Lakhs" />
                          {form.estimatedDamage && (
                            <div className="mt-1.5 text-xs text-teal-600 font-medium">
                              → Files at: {parseInt(form.estimatedDamage) * 100 > 20000000 ? 'National Commission (NCDRC)' : parseInt(form.estimatedDamage) * 100 > 5000000 ? 'State Commission (SCDRC)' : 'District Commission (DCDRC)'}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Describe What Happened *</label>
                          <textarea value={form.issueDescription} onChange={(e) => setForm({ ...form, issueDescription: e.target.value })} className="input-field resize-none" rows={5} placeholder="Include: what procedure was done, what went wrong, what injuries resulted, how life has been affected..." />
                        </div>
                      </div>
                    )}

                    {/* Step 3: Documents */}
                    {formStep === 3 && (
                      <div className="space-y-4">
                        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragActive ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}>
                          <input {...getInputProps()} />
                          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <div className="text-sm font-medium text-gray-600">Drop files here or tap to upload</div>
                          <div className="text-xs text-gray-400 mt-1">PDF, JPG, PNG · Max 10MB each</div>
                        </div>
                        {uploadedFiles.length > 0 && (
                          <div className="space-y-2">
                            {uploadedFiles.map((f, i) => (
                              <div key={i} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-green-600" />
                                  <span className="text-sm text-green-700 font-medium">{f}</span>
                                </div>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
                          <strong>Recommended documents:</strong>
                          <ul className="mt-1 space-y-0.5">
                            {['Discharge summary / Death certificate', 'Operation / Lab reports', 'All medical bills', 'Doctor\'s prescriptions', 'Any written complaints to hospital'].map((d) => (
                              <li key={d}>• {d}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Review */}
                    {formStep === 4 && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                          {Object.entries({ Name: form.name, Age: form.age, Hospital: form.hospital, City: form.hospitalCity, 'Issue Type': form.issueType, 'Incident Date': form.incidentDate, 'Estimated Claim': form.estimatedDamage ? `₹${parseInt(form.estimatedDamage) / 10}L` : '—', 'BPL Card': form.bplCard ? 'Yes — Fee waived' : 'No' }).map(([k, v]) => v && (
                            <div key={k} className="flex justify-between py-2.5 px-4 text-sm">
                              <span className="text-gray-400">{k}</span>
                              <span className="text-navy-700 font-medium text-right max-w-[55%]">{v}</span>
                            </div>
                          ))}
                        </div>
                        <div className="bg-navy-50 border border-navy-100 rounded-xl p-4 text-xs text-navy-600 leading-relaxed">
                          By submitting, you authorize our legal team to review your case, contact the hospital, and represent you before the Consumer Commission. All information is strictly confidential.
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      {formStep > 1 && (
                        <button onClick={() => setFormStep((s) => s - 1)} className="flex-1 btn-outline text-sm py-2.5">← Back</button>
                      )}
                      <button onClick={() => formStep < 4 ? setFormStep((s) => s + 1) : handleSubmitCase()} className="flex-[2] btn-primary text-sm py-2.5">
                        {formStep === 4 ? 'Submit Grievance ✓' : 'Continue →'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'docs' && (
            <motion.div key="docs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer mb-4 transition-all ${isDragActive ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-white hover:border-teal-300'}`}>
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-600">Upload New Document</div>
                <div className="text-xs text-gray-400 mt-1">PDF, JPG, PNG</div>
              </div>

              <div className="bg-white rounded-2xl shadow-card border border-gray-100 divide-y divide-gray-50">
                {(activeCase?.documents || []).map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-xl flex-shrink-0">📄</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-navy-700 font-medium text-sm truncate">{doc.name}</div>
                      <div className="text-gray-400 text-xs">{doc.uploadedAt} · {doc.size}</div>
                    </div>
                    <div className="flex gap-1">
                      <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-navy-700 transition-colors"><Eye className="w-4 h-4" /></button>
                      <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-navy-700 transition-colors"><Download className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* BPL TAB */}
          {activeTab === 'bpl' && (
            <motion.div key="bpl" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-gradient-to-br from-burgundy-600 to-navy-800 rounded-2xl p-5 text-white border border-gold-400/20">
                <div className="flex items-center gap-2 text-lg font-display font-bold mb-1"><HeartHandshake className="w-5 h-5 text-gold-300" /> Free Legal Help</div>
                <div className="text-white/70 text-sm">For BPL, SC/ST, disabled & senior citizens</div>
              </div>

              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                <div className="font-semibold text-navy-800 mb-3">Who Qualifies?</div>
                <div className="space-y-2">
                  {BPL_PROVISIONS.eligibility.map((e) => (
                    <div key={e} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" /> {e}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                <div className="font-semibold text-navy-800 mb-3">Special Discounts & Provisions</div>
                <div className="space-y-3">
                  {BPL_PROVISIONS.additionalDiscounts.map((d) => (
                    <div key={d.group} className="flex justify-between items-start gap-2">
                      <div className="text-sm text-gray-600">{d.group}</div>
                      <div className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg text-right">{d.discount}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-navy-50 rounded-2xl p-4 text-sm text-navy-700 leading-relaxed">
                <strong>How to claim:</strong> During case filing, toggle the BPL card option. Our team will verify your eligibility and automatically apply all applicable benefits.
              </div>
            </motion.div>
          )}

          {/* AI ADVICE TAB */}
          {activeTab === 'ai' && (
            <motion.div key="ai" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-700 to-burgundy-700 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4.5 h-4.5 text-gold-300" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-navy-800">AI Case Advisor</div>
                    <div className="text-gray-400 text-xs">Powered by Claude · COPRA 2019 Database</div>
                  </div>
                </div>

                {aiLoading ? (
                  <div className="py-8 text-center">
                    <div className="w-10 h-10 border-3 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <div className="text-gray-500 text-sm">Analyzing your case with Indian medicolegal database...</div>
                  </div>
                ) : activeCase?.aiSuggestion ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{activeCase.aiSuggestion}</div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <div className="text-gray-500 text-sm mb-4">Click below to get personalized AI advice for your case</div>
                    <button onClick={handleAI} className="btn-primary">Generate AI Strategy</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
