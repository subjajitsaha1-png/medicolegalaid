import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Scale, Shield, Heart, FileText, Users, Zap, ChevronRight,
  Star, Phone, Mail, MapPin, CheckCircle, AlertTriangle,
  TrendingUp, Award, Clock, IndianRupee
} from 'lucide-react';
import { useStore } from '../lib/store';
import { UserRole } from '../lib/store';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
};

interface LandingPageProps {
  onLogin: (role: UserRole) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [loginRole, setLoginRole] = useState<UserRole>('patient');
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    useStore.getState().login(loginRole);
    onLogin(loginRole);
  };

  const stats = [
    { icon: <Scale className="w-5 h-5" />, value: '2,400+', label: 'Cases Filed' },
    { icon: <Award className="w-5 h-5" />, value: '₹48Cr+', label: 'Compensation Won' },
    { icon: <TrendingUp className="w-5 h-5" />, value: '76%', label: 'Out-of-Court Settled' },
    { icon: <Clock className="w-5 h-5" />, value: '4.2 mo', label: 'Avg. Resolution Time' },
  ];

  const features = [
    { icon: <FileText className="w-7 h-7" />, title: 'Smart Grievance Filing', desc: 'Step-by-step guided form with AI validation. Auto-detects applicable commission and fee waivers for BPL patients.' },
    { icon: <Scale className="w-7 h-7" />, title: 'AI Legal Strategy', desc: 'Claude-powered case analysis recommends exact compensation range, filing strategy, and legal precedents.' },
    { icon: <Heart className="w-7 h-7" />, title: 'Expert Network', desc: 'Verified panel of 150+ medical experts and consumer lawyers across India.' },
    { icon: <Shield className="w-7 h-7" />, title: 'Settlement Engine', desc: 'Structured out-of-court negotiation with automated timeline, offer tracking, and strategic counter-offer suggestions.' },
    { icon: <Users className="w-7 h-7" />, title: 'BPL Patient Support', desc: 'Zero-cost filing, free legal aid via DLSA, and priority hearing for BPL, SC/ST, and disabled patients.' },
    { icon: <Zap className="w-7 h-7" />, title: 'Real-Time Tracker', desc: 'Live case status, commission hearing dates, document management, and staff communication portal.' },
  ];

  const roles = [
    { k: 'patient' as UserRole, icon: '🏥', label: 'Patient / Family', color: 'from-teal-500 to-teal-600', desc: 'File & track your case' },
    { k: 'staff' as UserRole, icon: '📋', label: 'Staff / Admin', color: 'from-navy-600 to-navy-700', desc: 'Manage all cases' },
    { k: 'expert' as UserRole, icon: '🔬', label: 'Expert Reviewer', color: 'from-indigo-500 to-indigo-600', desc: 'Medical & legal experts' },
    { k: 'legal' as UserRole, icon: '⚖️', label: 'Legal Tracker', color: 'from-amber-500 to-amber-600', desc: 'Commission filings' },
  ];

  const testimonials = [
    { name: 'Priya M.', city: 'Chennai', quote: 'After my mother\'s surgery went wrong, we had no idea what to do. MediLegal Assist got us ₹12 lakhs in compensation in 5 months without going to court.', rating: 5 },
    { name: 'Arjun K.', city: 'Pune', quote: 'BPL card waived all my fees. Free lawyer was excellent. The AI suggestion told me exactly which documents to collect. Life-changing service.', rating: 5 },
    { name: 'Rekha T.', city: 'Delhi', quote: 'NCDRC case was complex but the staff dashboard kept me informed at every step. Settled for ₹45 lakhs after hospital saw the expert report.', rating: 5 },
  ];

  return (
    <div className="min-h-screen font-body">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-950/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-xl">⚕️</div>
              <div>
                <div className="text-white font-display font-semibold text-lg leading-tight">MediLegal Assist</div>
                <div className="text-teal-400 text-[10px] tracking-widest uppercase">Justice Through Expertise</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#process" className="hover:text-white transition-colors">How It Works</a>
              <a href="#commission" className="hover:text-white transition-colors">Commission Rules</a>
              <a href="#bpl" className="hover:text-white transition-colors">Free Help</a>
            </div>
            <button onClick={() => setShowLogin(true)} className="btn-teal text-sm px-4 py-2">
              Login / Register
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen bg-hero flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-hero-mesh pointer-events-none" />
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 rounded-full px-4 py-1.5 text-teal-300 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse-slow" />
              COPRA 2019 · Latest 2024 Amendments Integrated
            </motion.div>

            <motion.h1 variants={fadeUp} className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-bold leading-tight mb-6">
              Medical Negligence?<br />
              <span className="text-gradient">We Fight For You.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              India's first AI-powered medicolegal platform. File grievances, negotiate settlements, track commission cases — with expert legal guidance at every step. <strong className="text-white">Zero cost for BPL patients.</strong>
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button onClick={() => setShowLogin(true)} className="btn-teal text-base px-8 py-4 flex items-center justify-center gap-2">
                Start Your Case Free <ChevronRight className="w-5 h-5" />
              </button>
              <button className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Helpline: 1800-11-4000
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {stats.map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                  <div className="flex justify-center text-teal-400 mb-2">{s.icon}</div>
                  <div className="text-white font-display text-2xl font-bold">{s.value}</div>
                  <div className="text-white/60 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-xs animate-bounce">
          <span>Scroll to explore</span>
          <div className="w-0.5 h-8 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-label mb-3">Platform Features</div>
            <h2 className="font-display text-4xl text-navy-800 font-bold">Everything You Need For Justice</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">From filing to final award — our platform guides you through every step with AI assistance and expert support.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-card card-hover border border-gray-100 group">
                <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy-600 flex items-center justify-center mb-4 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-navy-800 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="process" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-label mb-3">Process</div>
            <h2 className="font-display text-4xl text-navy-800 font-bold">Your Path to Compensation</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-400 via-navy-400 to-transparent hidden md:block" />
            {['Collect Evidence & File Grievance', 'AI Analysis & Expert Assignment', 'Hospital Negotiation & Settlement', 'Commission Filing (if needed)', 'Hearing & Compensation Award'].map((step, i) => (
              <motion.div key={step} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="flex gap-6 mb-8 relative">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-navy-600 flex items-center justify-center text-white font-display font-bold text-xl shadow-glow">
                  {i + 1}
                </div>
                <div className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-semibold text-navy-800 text-lg">{step}</h3>
                  <p className="text-gray-500 text-sm mt-1">{[
                    'Upload documents, fill guided form. AI validates and auto-suggests the correct commission level.',
                    'Claude AI analyzes your case and assigns the best-matched medical expert or consumer lawyer.',
                    'Structured negotiation with hospital. Our platform tracks every offer and generates counter-offer strategies.',
                    'File via E-Daakhil portal. Zero fee for BPL patients. Priority listing for vulnerable groups.',
                    'Attend hearings (online/in-person). Compensation awarded within COPRA-mandated timelines.',
                  ][i]}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BPL SECTION */}
      <section id="bpl" className="py-24 bg-gradient-to-br from-teal-600 to-navy-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Heart className="w-4 h-4 text-red-300" /> Free Help for Those Who Need It Most
            </div>
            <h2 className="font-display text-4xl font-bold">BPL & Vulnerable Patient Provisions</h2>
            <p className="text-white/70 mt-4 max-w-xl mx-auto">Under COPRA 2019 and 2024 amendments, economically disadvantaged patients receive full support at no cost.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <IndianRupee className="w-6 h-6" />, title: '₹0 Filing Fee', desc: '100% waived for BPL cardholders at all commission levels' },
              { icon: <Users className="w-6 h-6" />, title: 'Free Legal Aid', desc: 'DLSA-assigned advocate, no out-of-pocket legal costs' },
              { icon: <Zap className="w-6 h-6" />, title: 'Priority Hearing', desc: 'Listed first; faster resolution for BPL/disabled/senior cases' },
              { icon: <Shield className="w-6 h-6" />, title: 'Travel Support', desc: '₹2,000 per hearing for travel to commission office' },
            ].map((item) => (
              <div key={item.title} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                <div className="text-teal-300 mb-3">{item.icon}</div>
                <div className="font-semibold text-lg mb-1">{item.title}</div>
                <div className="text-white/70 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="font-semibold mb-3">Who Qualifies for Full Free Services?</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {['BPL Ration Card holders', 'Antyodaya Anna Yojana (AAY) beneficiaries', 'PMJAY (Ayushman Bharat) card holders', 'EWS certificate holders (income < ₹1L/year)', 'Senior Citizens above 70 years (50% discount)', 'Persons with Disability (40%+) — 100% free'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/80">
                  <CheckCircle className="w-4 h-4 text-teal-300 flex-shrink-0" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-label mb-3">Testimonials</div>
            <h2 className="font-display text-4xl text-navy-800 font-bold">Families We've Helped</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">"{t.quote}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-bold text-xs">{t.name[0]}</div>
                  <div>
                    <div className="font-semibold text-navy-800 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.city}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-navy-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-lg">⚕️</div>
                <div className="font-display font-semibold">MediLegal Assist</div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">India's trusted medicolegal platform for justice, dignity, and fair compensation.</p>
            </div>
            {[
              { title: 'Platform', links: ['File Grievance', 'Track Case', 'Expert Review', 'Settlement Help'] },
              { title: 'Legal', links: ['COPRA 2019', 'NCDRC Rules', 'State Commissions', 'RTI Filing'] },
              { title: 'Support', links: ['Helpline: 1800-11-4000', 'Email: help@medilegal.in', 'E-Daakhil Portal', 'DLSA Directory'] },
            ].map((col) => (
              <div key={col.title}>
                <div className="font-semibold text-sm mb-3 text-white/80">{col.title}</div>
                <ul className="space-y-2">
                  {col.links.map((l) => <li key={l} className="text-white/50 text-sm hover:text-teal-400 transition-colors cursor-pointer">{l}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-white/40 text-xs">
            © 2025 MediLegal Assist · Consumer Protection Act 2019 · Not a substitute for professional legal advice
          </div>
        </div>
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-hero p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-xl">⚕️</div>
                  <div className="font-display font-semibold text-lg">MediLegal Assist</div>
                </div>
                <button onClick={() => setShowLogin(false)} className="text-white/60 hover:text-white w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg transition-colors">✕</button>
              </div>
              <p className="text-white/70 text-sm">Sign in to access your dashboard</p>
            </div>
            <div className="p-6">
              <div className="mb-5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Select Your Role</div>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => (
                    <button key={r.k} onClick={() => setLoginRole(r.k)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${loginRole === r.k ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <div className="text-xl mb-1">{r.icon}</div>
                      <div className="text-xs font-bold text-navy-800">{r.label}</div>
                      <div className="text-xs text-gray-400">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3 mb-5">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="input-field" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-field" />
              </div>
              <button onClick={handleLogin} className="btn-primary w-full text-base">
                Sign In as {roles.find((r) => r.k === loginRole)?.label}
              </button>
              <div className="text-center mt-4 text-xs text-gray-400">
                Demo mode — enter any credentials to explore the platform
              </div>
              <div className="mt-3 p-3 bg-teal-50 rounded-xl text-xs text-teal-700 border border-teal-100">
                <strong>BPL Patients:</strong> Select Patient role → your filing fee will be auto-waived and free legal aid assigned based on your BPL card status.
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
