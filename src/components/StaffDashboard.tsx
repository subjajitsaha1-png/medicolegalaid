import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, ChevronRight, Plus, MessageSquare,
  Clock, AlertTriangle, CheckCircle, Scale, Users, FileText,
  Sparkles, Handshake
} from 'lucide-react';
import { useStore, MedicalCase } from '../lib/store';
import NegotiationPanel from '../components/negotiation/NegotiationPanel';
import { useAISuggestion } from '../hooks/useAI';
import AccountMenu, { ROLE_META } from './AccountMenu';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  submitted: { label: 'Submitted', bg: 'bg-blue-100', text: 'text-blue-700' },
  under_review: { label: 'Under Review', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  expert_assigned: { label: 'Expert Assigned', bg: 'bg-purple-100', text: 'text-purple-700' },
  negotiation: { label: 'Negotiation', bg: 'bg-amber-100', text: 'text-amber-700' },
  commission_filed: { label: 'Filed', bg: 'bg-blue-100', text: 'text-blue-800' },
  hearing: { label: 'Hearing', bg: 'bg-orange-100', text: 'text-orange-700' },
  resolved: { label: 'Resolved', bg: 'bg-green-100', text: 'text-green-700' },
  dismissed: { label: 'Dismissed', bg: 'bg-gray-100', text: 'text-gray-500' },
};

export default function StaffDashboard({ onSignedOut }: { onSignedOut?: () => void }) {
  const { user, cases, updateCase, addNote } = useStore();
  const { generateSuggestion, aiLoading } = useAISuggestion();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCommission, setFilterCommission] = useState('all');
  const [selected, setSelected] = useState<MedicalCase | null>(null);
  const [negCase, setNegCase] = useState<MedicalCase | null>(null);
  const [noteText, setNoteText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'notes' | 'ai'>('info');

  const role = user?.role || 'staff';
  const roleMeta = ROLE_META[role];
  // Role-based hierarchy: staff/admin manage case status; legal can also negotiate;
  // experts are read + commentary only (no status changes, no negotiation).
  const canManageStatus = role === 'admin' || role === 'staff';
  const canNegotiate = canManageStatus || role === 'legal';
  const panelTitle = role === 'legal' ? 'Legal Tracker' : role === 'expert' ? 'Expert Review' : role === 'admin' ? 'Admin Panel' : 'Staff Panel';

  const filtered = cases.filter((c) => {
    const q = search.toLowerCase();
    const matchQ = !q || c.patientName.toLowerCase().includes(q) || c.hospital.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.issueType.toLowerCase().includes(q);
    const matchS = filterStatus === 'all' || c.status === filterStatus;
    const matchC = filterCommission === 'all' || c.commission === filterCommission;
    return matchQ && matchS && matchC;
  });

  const stats = [
    { label: 'Total', value: cases.length, icon: <FileText className="w-4 h-4" />, color: 'text-navy-700' },
    { label: 'Negotiation', value: cases.filter((c) => c.status === 'negotiation').length, icon: <Scale className="w-4 h-4" />, color: 'text-amber-600' },
    { label: 'BPL Cases', value: cases.filter((c) => c.bplCard).length, icon: <Users className="w-4 h-4" />, color: 'text-teal-600' },
    { label: 'Resolved', value: cases.filter((c) => c.status === 'resolved').length, icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-600' },
  ];

  const handleAddNote = () => {
    if (!selected || !noteText.trim()) return;
    addNote(selected.id, { author: user?.name || 'Staff', role: 'staff', content: noteText.trim(), isInternal: true });
    setNoteText('');
  };

  const handleUpdateStatus = () => {
    if (!selected || !newStatus) return;
    updateCase(selected.id, { status: newStatus as MedicalCase['status'] });
    setSelected({ ...selected, status: newStatus as MedicalCase['status'] });
    setNewStatus('');
  };

  const handleAI = async (c: MedicalCase) => {
    setSelected(c);
    setActiveDetailTab('ai');
    await generateSuggestion({
      id: c.id,
      issueType: c.issueType,
      issueDescription: c.issueDescription,
      estimatedDamage: c.estimatedDamage,
      bplCard: c.bplCard,
      annualIncome: c.annualIncome,
      negotiationStage: c.negotiation.stage,
      expertVerdict: c.experts[0]?.verdict,
      commission: c.commission,
      hospital: c.hospital,
      patientAge: c.patientAge,
      notes: c.notes,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-body">
      {negCase && <AnimatePresence><NegotiationPanel key="neg" caseData={negCase} onClose={() => setNegCase(null)} /></AnimatePresence>}

      {/* Header */}
      <div className="relative bg-hero text-white sticky top-0 z-40 overflow-hidden">
        <div className="absolute inset-0 bg-hero-mesh pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full seal-badge flex items-center justify-center flex-shrink-0 hidden sm:flex">
                <Scale className="w-4.5 h-4.5 text-gold-300" />
              </div>
              <div>
                <div className="text-[11px] text-gold-400 font-semibold tracking-widest uppercase">{panelTitle}</div>
                <div className="font-display font-bold text-xl mt-0.5 flex items-center gap-2">
                  Case Management
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleMeta.badgeClass}`}>{roleMeta.label}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs text-white/50">Logged in</div>
                <div className="text-sm font-medium">{user?.name}</div>
              </div>
              <AccountMenu onSignedOut={onSignedOut || (() => {})} />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-center backdrop-blur-sm">
                <div className="flex justify-center mb-1 text-gold-400">{s.icon}</div>
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className={`grid gap-6 ${selected ? 'lg:grid-cols-[1fr,420px]' : 'lg:grid-cols-1'}`}>
          {/* Case List */}
          <div>
            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient, hospital, case ID..." className="input-field pl-10 text-sm" />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field text-sm sm:w-40">
                <option value="all">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={filterCommission} onChange={(e) => setFilterCommission(e.target.value)} className="input-field text-sm sm:w-44">
                <option value="all">All Commissions</option>
                <option value="district">District (DCDRC)</option>
                <option value="state">State (SCDRC)</option>
                <option value="national">National (NCDRC)</option>
              </select>
            </div>

            <div className="space-y-3">
              {filtered.map((c) => {
                const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.submitted;
                const isSelected = selected?.id === c.id;
                return (
                  <motion.div key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    onClick={() => { setSelected(isSelected ? null : c); setNewStatus(''); setActiveDetailTab('info'); }}
                    className={`bg-white rounded-2xl p-4 cursor-pointer border-2 transition-all shadow-card card-hover ${isSelected ? 'border-navy-700 shadow-card-hover' : 'border-transparent'}`}>
                    <div className="flex flex-wrap items-start gap-2 justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2 items-center mb-1.5">
                          <span className="text-xs text-gray-400 font-medium">{c.id}</span>
                          <span className={`status-badge ${sc.bg} ${sc.text}`}>{sc.label}</span>
                          <span className={`status-badge ${c.priority === 'urgent' ? 'bg-red-100 text-red-700' : c.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>{c.priority}</span>
                          {c.bplCard && <span className="status-badge bg-teal-100 text-teal-700">BPL</span>}
                          <span className="status-badge bg-navy-100 text-navy-700">{c.commission.toUpperCase()}</span>
                        </div>
                        <div className="font-display font-bold text-navy-800 text-base">{c.patientName} · {c.issueType}</div>
                        <div className="text-gray-500 text-sm mt-0.5">{c.hospital}, {c.hospitalCity} · Filed: {c.filedDate}</div>
                        {c.experts[0] && <div className="text-teal-600 text-xs mt-1 font-medium">Expert: {c.experts[0].name}</div>}
                      </div>
                      <div className="flex gap-2 items-center flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-bold text-navy-700">₹{(c.estimatedDamage / 100000).toFixed(1)}L</div>
                          <div className="text-xs text-gray-400">est. claim</div>
                        </div>
                        {c.status === 'negotiation' && canNegotiate && (
                          <button onClick={(e) => { e.stopPropagation(); setNegCase(c); }}
                            className="text-xs font-semibold bg-burgundy-100 text-burgundy-700 px-3 py-1.5 rounded-lg hover:bg-burgundy-200 transition-colors flex items-center gap-1">
                            <Handshake className="w-3 h-3" /> Negotiate
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleAI(c); }}
                          className="text-xs font-semibold bg-gold-100 text-gold-800 px-3 py-1.5 rounded-lg hover:bg-gold-200 transition-colors flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  No cases match your filters
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          {selected && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-card border border-gray-100 h-fit sticky top-32">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between mb-1">
                  <div className="font-display font-bold text-navy-800 text-lg">{selected.patientName}</div>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
                </div>
                <div className="text-gray-500 text-sm">{selected.hospital} · {selected.issueType}</div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className={`status-badge ${STATUS_CONFIG[selected.status]?.bg} ${STATUS_CONFIG[selected.status]?.text}`}>{STATUS_CONFIG[selected.status]?.label}</span>
                  {selected.bplCard && <span className="status-badge bg-teal-100 text-teal-700">BPL — Fee Waived</span>}
                  {selected.filingFeeWaiver && <span className="status-badge bg-green-100 text-green-700">Free Legal Aid</span>}
                </div>
              </div>

              {/* Detail tabs */}
              <div className="flex border-b border-gray-100">
                {[['info', 'Details'], ['notes', 'Notes'], ['ai', 'AI Advice']].map(([k, l]) => (
                  <button key={k} onClick={() => setActiveDetailTab(k as typeof activeDetailTab)}
                    className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors ${activeDetailTab === k ? 'border-gold-500 text-burgundy-700' : 'border-transparent text-gray-400'}`}>
                    {l}
                  </button>
                ))}
              </div>

              <div className="p-5 max-h-[60vh] overflow-y-auto">
                {activeDetailTab === 'info' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {[
                        ['Case ID', selected.id],
                        ['Age', selected.patientAge + ' years'],
                        ['Phone', selected.patientPhone],
                        ['Filed', selected.filedDate],
                        ['Commission', selected.commission.toUpperCase()],
                        ['Claim', `₹${(selected.estimatedDamage / 100000).toFixed(1)}L`],
                        ['Income', `₹${(selected.annualIncome / 100000).toFixed(1)}L/yr`],
                        ['BPL', selected.bplCard ? 'Yes' : 'No'],
                      ].map(([k, v]) => (
                        <div key={k} className="bg-gray-50 rounded-xl p-2.5">
                          <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">{k}</div>
                          <div className="text-navy-700 font-medium mt-0.5 text-xs">{v}</div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</div>
                      <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">{selected.issueDescription}</div>
                    </div>

                    {/* Update Status */}
                    {canManageStatus ? (
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Update Status</div>
                        <div className="flex gap-2">
                          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field text-sm flex-1">
                            <option value="">Current: {STATUS_CONFIG[selected.status]?.label}</option>
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                          <button onClick={handleUpdateStatus} disabled={!newStatus} className="btn-primary text-sm px-4 py-2.5 disabled:opacity-40">Save</button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700">
                        <strong>{roleMeta.label} access:</strong> {role === 'expert' ? 'You can review case details and add commentary, but status changes are managed by staff.' : 'Status changes are managed by staff/admin.'}
                      </div>
                    )}

                    {selected.status === 'negotiation' && canNegotiate && (
                      <button onClick={() => setNegCase(selected)} className="w-full py-3 rounded-xl bg-gradient-to-r from-burgundy-600 to-burgundy-800 hover:from-burgundy-700 hover:to-burgundy-900 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors border border-gold-400/20">
                        <Handshake className="w-4 h-4" /> Open Negotiation Panel
                      </button>
                    )}
                  </div>
                )}

                {activeDetailTab === 'notes' && (
                  <div className="space-y-3">
                    {(cases.find((c) => c.id === selected.id)?.notes || []).map((note) => (
                      <div key={note.id} className={`rounded-xl p-3 border-l-3 ${note.isInternal ? 'bg-gold-50 border-l-gold-400' : 'bg-navy-50 border-l-navy-400'}`} style={{ borderLeftWidth: 3 }}>
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-xs font-semibold text-gray-600">{note.author}</div>
                          <div className="text-xs text-gray-400">{note.createdAt}</div>
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed">{note.content}</div>
                        {note.isInternal && <div className="text-[10px] text-gold-700 font-semibold mt-1">INTERNAL NOTE</div>}
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input value={noteText} onChange={(e) => setNoteText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNote()} placeholder="Add internal note..." className="input-field text-sm flex-1" />
                      <button onClick={handleAddNote} disabled={!noteText.trim()} className="btn-primary text-sm px-4 py-2.5 disabled:opacity-40">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'ai' && (
                  <div>
                    {aiLoading ? (
                      <div className="py-8 text-center">
                        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <div className="text-gray-400 text-sm">Generating AI strategy...</div>
                      </div>
                    ) : selected.aiSuggestion ? (
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{selected.aiSuggestion}</div>
                    ) : (
                      <div className="text-center py-6">
                        <Sparkles className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                        <button onClick={() => handleAI(selected)} className="btn-primary text-sm">Generate AI Advice</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
