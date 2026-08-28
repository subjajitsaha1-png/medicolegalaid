import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Send, Clock, FileText, Scale, MessageSquare, X
} from 'lucide-react';
import { useStore, MedicalCase, NegotiationStage } from '../../lib/store';
import { NEGOTIATION_STRATEGY } from '../../data/commissionRules';
import { formatLakhs } from '../../lib/utils';

interface NegotiationPanelProps {
  caseData: MedicalCase;
  onClose?: () => void;
  embedded?: boolean;
}

const STAGE_LABELS: Record<NegotiationStage, string> = {
  not_started: 'Not Started',
  notice_sent: 'Notice Sent',
  hospital_responded: 'Hospital Responded',
  offer_received: 'Offer Received',
  counter_sent: 'Counter Sent',
  mediation: 'In Mediation',
  settlement_agreed: 'Settlement Agreed',
  failed: 'Negotiation Failed',
};

const STAGES_ORDER: NegotiationStage[] = [
  'not_started', 'notice_sent', 'hospital_responded',
  'offer_received', 'counter_sent', 'mediation', 'settlement_agreed',
];

const STRATEGY_TIPS: Partial<Record<NegotiationStage, { title: string; tips: string[]; warning?: string }>> = {
  not_started: {
    title: 'Start with Formal Notice',
    tips: [
      'Send registered legal notice to Hospital CEO + Medical Superintendent + their insurance company simultaneously',
      'CC the State Medical Council — this triggers faster hospital response (hospitals fear license action)',
      'Demand exact compensation + 12% interest from date of incident + litigation costs',
      'Set 30-day hard deadline for response',
    ],
  },
  notice_sent: {
    title: 'Notice Sent — Now Wait Strategically',
    tips: [
      'Do not contact the hospital informally during this period',
      'Use this time to finalize expert opinion and gather all bills/loss estimates',
      'If no response in 30 days, send a reminder + file complaint copy with CCPA',
      'Document the delivery receipt of the notice (tracking ID)',
    ],
    warning: 'Never accept verbal commitments. Everything must be in writing.',
  },
  offer_received: {
    title: 'Hospital Made an Offer — Do NOT Accept First',
    tips: [
      'First offers are typically 15–25% of fair settlement value. Reject politely in writing.',
      'Counter with 75–80% of your maximum demand (backed by expert report)',
      'Attach the expert opinion report to your counter-offer letter',
      'Set 15-day deadline for their next response',
      'Mention that failure to settle = immediate SCDRC/NCDRC filing',
    ],
    warning: 'Accepting first offer without negotiation forfeits 60–80% of rightful compensation.',
  },
  counter_sent: {
    title: 'Counter Offer Sent — Manage the Gap',
    tips: [
      'If gap is >40%, propose formal mediation under COPRA Section 37',
      'Suggest a neutral mediator from the State Commission panel',
      'Do not reduce your counter by more than 10–15% in next round',
      'Calculate mid-point: your bottom line should be 60% of maximum demand',
    ],
  },
  mediation: {
    title: 'In Mediation — Critical Phase',
    tips: [
      'Prepare a "Minimum Acceptable Amount" before mediation — do not share this number',
      'Bring the expert opinion report, all bills, income loss calculation to mediation',
      'Include these clauses in any agreement: NDA, no-admission of guilt, 30-day payment timeline, interest for late payment',
      'If hospital mediator stalls more than 2 sessions, exit mediation and file at commission',
    ],
    warning: 'Mediation is time-bound. Do not let it drag beyond 6 weeks.',
  },
  failed: {
    title: 'Negotiation Failed — File at Commission Now',
    tips: [
      'File online at edaakhil.nic.in within the 2-year limitation period',
      'Attach the failed negotiation correspondence as evidence of good faith effort',
      'Commission filing notice to hospital often triggers a better settlement offer within 30–45 days',
      'Request interim relief / stay order if hospital is disposing assets',
    ],
  },
};

export default function NegotiationPanel({ caseData, onClose, embedded = false }: NegotiationPanelProps) {
  const { updateNegotiation, addNegotiationEvent, addNote } = useStore();
  const [tab, setTab] = useState<'overview' | 'events' | 'strategy' | 'send'>('overview');
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [newStage, setNewStage] = useState<NegotiationStage>(caseData.negotiation.stage);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const neg = caseData.negotiation;
  const stageIdx = STAGES_ORDER.indexOf(neg.stage);
  const tip = STRATEGY_TIPS[neg.stage];

  const gap = neg.hospitalOffer && neg.ourDemand ? neg.ourDemand - neg.hospitalOffer : null;
  const gapPct = neg.hospitalOffer && neg.ourDemand ? Math.round(((neg.ourDemand - neg.hospitalOffer) / neg.ourDemand) * 100) : null;

  const handleSendOffer = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));

    const amount = offerAmount ? parseInt(offerAmount) * 100 : undefined;
    addNegotiationEvent(caseData.id, {
      date: new Date().toISOString().split('T')[0],
      actor: 'patient',
      type: amount ? 'counter' : 'message',
      amount,
      message: message || `Counter offer of ₹${(parseInt(offerAmount) / 1000).toFixed(1)}L sent.`,
    });

    if (amount) {
      updateNegotiation(caseData.id, {
        counterOffer: amount,
        stage: 'counter_sent',
      });
    }

    if (newStage !== caseData.negotiation.stage) {
      updateNegotiation(caseData.id, { stage: newStage });
    }

    setSending(false);
    setSent(true);
    setOfferAmount('');
    setMessage('');
    setTimeout(() => setSent(false), 3000);
  };

  const content = (
    <div className={embedded ? '' : 'bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-900 text-white p-5 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-teal-300 font-medium mb-1">{caseData.id} · Settlement Track</div>
            <div className="font-display font-bold text-lg">{caseData.hospital}</div>
            <div className="text-white/70 text-sm mt-0.5">{caseData.patientName} · {caseData.issueType}</div>
          </div>
          {onClose && (
            <button onClick={onClose} aria-label="Close negotiation panel" className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stage tracker */}
        <div className="mt-4 flex gap-1">
          {STAGES_ORDER.slice(0, 6).map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full ${i <= stageIdx ? 'bg-teal-400' : 'bg-white/20'}`} />
            </div>
          ))}
        </div>
        <div className="mt-1.5 text-xs text-white/60">{STAGE_LABELS[neg.stage]}</div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 flex-shrink-0">
        {[['overview', 'Overview'], ['events', 'Timeline'], ['strategy', 'Strategy'], ['send', 'Send Offer']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as typeof tab)}
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors ${tab === k ? 'border-navy-700 text-navy-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-4">
            {/* Offer comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                <div className="text-xs font-semibold text-red-500 mb-1 flex items-center justify-center gap-1"><TrendingDown className="w-3 h-3" /> Hospital Offer</div>
                <div className="text-2xl font-display font-bold text-red-700">
                  {neg.hospitalOffer ? `₹${formatLakhs(neg.hospitalOffer)}` : '—'}
                </div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                <div className="text-xs font-semibold text-green-600 mb-1 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" /> Our Demand</div>
                <div className="text-2xl font-display font-bold text-green-700">
                  {neg.ourDemand ? `₹${formatLakhs(neg.ourDemand)}` : '—'}
                </div>
              </div>
            </div>

            {gap !== null && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                <div className="text-xs font-semibold text-amber-700 mb-1">Settlement Gap</div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold text-amber-800">₹{formatLakhs(gap)} apart</div>
                  <div className="text-sm font-medium text-amber-600">{gapPct}% difference</div>
                </div>
                <div className="mt-2 bg-amber-100 rounded-lg h-2 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-lg" style={{ width: `${100 - (gapPct || 0)}%` }} />
                </div>
                <div className="text-xs text-amber-600 mt-1.5">Progress toward agreement: {100 - (gapPct || 0)}%</div>
              </div>
            )}

            {neg.counterOffer && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                <div className="text-xs font-semibold text-blue-500 mb-1">Our Counter Offer</div>
                <div className="text-xl font-display font-bold text-blue-800">₹{formatLakhs(neg.counterOffer)}</div>
              </div>
            )}

            {neg.deadline && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl p-3.5 text-sm text-orange-700">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>Negotiation deadline: <strong>{neg.deadline}</strong></span>
              </div>
            )}

            {/* Strategy tip banner */}
            {tip && (
              <div className="bg-navy-50 border border-navy-100 rounded-xl p-4">
                <div className="font-semibold text-navy-800 text-sm mb-2">💡 {tip.title}</div>
                <ul className="space-y-1">
                  {tip.tips.slice(0, 2).map((t, i) => (
                    <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                      <span className="text-teal-500 mt-0.5">→</span> {t}
                    </li>
                  ))}
                </ul>
                {tip.warning && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" /> {tip.warning}
                  </div>
                )}
                <button onClick={() => setTab('strategy')} className="mt-2 text-xs text-navy-600 font-semibold hover:text-teal-600 transition-colors">
                  View full strategy →
                </button>
              </div>
            )}
          </div>
        )}

        {/* EVENTS TIMELINE */}
        {tab === 'events' && (
          <div>
            <div className="font-semibold text-navy-800 text-sm mb-4">Negotiation History</div>
            <div className="space-y-0">
              {[...neg.events].reverse().map((event, i) => (
                <div key={event.id} className="flex gap-3 mb-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${event.actor === 'hospital' ? 'bg-red-100 text-red-600' : event.actor === 'patient' || event.actor === 'staff' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-500'}`}>
                      {event.type === 'offer' || event.type === 'counter' ? '₹' : event.type === 'notice' ? '📬' : event.type === 'agreement' ? '✅' : event.type === 'rejection' ? '✗' : '💬'}
                    </div>
                    {i < neg.events.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 mt-1 min-h-3" />}
                  </div>
                  <div className="pb-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div className="text-xs font-semibold text-gray-500 capitalize">{event.actor === 'patient' || event.actor === 'staff' ? 'Our Team' : event.actor}</div>
                      <div className="text-xs text-gray-400">{event.date}</div>
                    </div>
                    {event.amount && (
                      <div className={`text-base font-display font-bold mt-0.5 ${event.actor === 'hospital' ? 'text-red-600' : 'text-teal-600'}`}>
                        ₹{formatLakhs(event.amount)}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mt-0.5 leading-relaxed">{event.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STRATEGY */}
        {tab === 'strategy' && (
          <div className="space-y-4">
            {tip && (
              <div className="bg-navy-700 text-white rounded-xl p-4 mb-4">
                <div className="text-xs text-teal-300 font-medium mb-1">Current Stage Advice</div>
                <div className="font-semibold mb-2">{tip.title}</div>
                <ul className="space-y-1.5">
                  {tip.tips.map((t, i) => (
                    <li key={i} className="text-xs text-white/80 flex gap-2">
                      <span className="text-teal-400 flex-shrink-0">→</span> {t}
                    </li>
                  ))}
                </ul>
                {tip.warning && (
                  <div className="mt-3 bg-amber-500/20 border border-amber-400/30 rounded-lg p-2.5 text-xs text-amber-200 flex gap-2">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" /> {tip.warning}
                  </div>
                )}
              </div>
            )}

            <div className="font-semibold text-navy-800 text-sm mb-2">Complete Negotiation Roadmap</div>
            {NEGOTIATION_STRATEGY.phases.map((phase: any) => (
              <div key={phase.phase} className={`border rounded-xl p-4 ${phase.phase === STAGES_ORDER.indexOf(neg.stage) + 1 ? 'border-teal-300 bg-teal-50' : 'border-gray-100 bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${phase.phase <= stageIdx + 1 ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'}`}>{phase.phase}</div>
                  <div>
                    <div className="font-semibold text-navy-800 text-sm">{phase.name}</div>
                    <div className="text-xs text-gray-400">{phase.duration}</div>
                  </div>
                </div>
                <ul className="space-y-1">
                  {phase.actions.map((a: string, i: number) => (
                    <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                      <CheckCircle className="w-3 h-3 text-teal-400 flex-shrink-0 mt-0.5" /> {a}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5 italic">
                  💡 {phase.tips}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SEND OFFER */}
        {tab === 'send' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Update Negotiation Stage</label>
              <select value={newStage} onChange={(e) => setNewStage(e.target.value as NegotiationStage)} className="input-field text-sm">
                {Object.entries(STAGE_LABELS).map(([k, l]) => (
                  <option key={k} value={k}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Counter Offer Amount (₹)</label>
              <input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} className="input-field" placeholder="Enter amount in rupees" />
              {offerAmount && <div className="mt-1 text-xs text-teal-600 font-medium">= ₹{(parseInt(offerAmount) / 100000).toFixed(2)} Lakhs</div>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Message / Communication</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="input-field resize-none text-sm" rows={5}
                placeholder="Type message to hospital / internal note..." />
            </div>

            {/* Suggested counters */}
            {neg.hospitalOffer && neg.ourDemand && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                <div className="text-xs font-semibold text-blue-600 mb-2">Suggested Counter Amounts</div>
                {[0.8, 0.7, 0.6].map((pct) => {
                  const amt = Math.round(neg.ourDemand! * pct);
                  return (
                    <button key={pct} onClick={() => setOfferAmount(String(amt))}
                      className="mr-2 mb-1.5 text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                      ₹{formatLakhs(amt)} ({Math.round(pct * 100)}%)
                    </button>
                  );
                })}
              </div>
            )}

            <button onClick={handleSendOffer} disabled={sending || (!offerAmount && !message && newStage === neg.stage)}
              className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${sent ? 'bg-green-500 text-white' : 'btn-primary'} disabled:opacity-50`}>
              {sending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
              ) : sent ? (
                <><CheckCircle className="w-4 h-4" /> Sent Successfully</>
              ) : (
                <><Send className="w-4 h-4" /> Send to Hospital</>
              )}
            </button>

            <div className="text-xs text-gray-400 text-center">All communications are logged and can be used as evidence in commission proceedings</div>
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className="fixed inset-0 bg-navy-950/75 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="w-full sm:max-w-lg">
        {content}
      </motion.div>
    </div>
  );
}
