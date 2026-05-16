// ─── CONSUMER PROTECTION ACT 2019 (COPRA) ─────────────────────────────────
// Latest amendments including 2023 and 2024 notifications

export const COMMISSION_RULES = {
  district: {
    name: 'District Consumer Disputes Redressal Commission',
    shortName: 'DCDRC',
    jurisdiction: 'Claims up to ₹50 Lakhs',
    claimLimit: 5000000,
    filingFee: {
      upTo1L: 100,
      upTo5L: 200,
      upTo10L: 400,
      upTo20L: 500,
      upTo50L: 2000,
    },
    timeLimit: '45 days to file reply; 3 months for disposal (without lab tests)',
    appeal: 'State Commission within 45 days of order',
    amenityRules: 'BPL card holders: ZERO filing fee per COPRA Section 17A',
    stages: [
      { label: 'Filing', desc: 'Complaint filed with required documents and fees' },
      { label: 'Admission', desc: 'Commission verifies admissibility within 21 days' },
      { label: 'Notice to OP', desc: 'Opposite Party (hospital) notified; 30 days to respond' },
      { label: 'Evidence', desc: 'Both parties submit evidence; expert witnesses' },
      { label: 'Arguments', desc: 'Oral/written arguments; ideally within 3 months' },
      { label: 'Order', desc: 'Final order passed; compensation awarded' },
    ],
  },
  state: {
    name: 'State Consumer Disputes Redressal Commission',
    shortName: 'SCDRC',
    jurisdiction: 'Claims ₹50L to ₹2 Crores',
    claimLimit: 20000000,
    filingFee: {
      upTo50L: 2500,
      upTo1Cr: 4000,
      upTo2Cr: 5000,
    },
    timeLimit: '90 days for disposal (extendable); 45 days for reply by OP',
    appeal: 'National Commission within 30 days',
    amenityRules: 'Reduced fee for senior citizens (60+) and BPL holders',
    stages: [
      { label: 'Filing at SCDRC', desc: 'Complaint with affidavit, documents, and court fee' },
      { label: 'Admission Hearing', desc: 'Prima facie case assessed' },
      { label: 'OP Reply', desc: 'Hospital submits counter-affidavit within 45 days' },
      { label: 'Evidence Phase', desc: 'Medical records, expert testimony submitted' },
      { label: 'Arguments', desc: 'Final arguments from both sides' },
      { label: 'SCDRC Order', desc: 'Award passed; appealable to NCDRC' },
    ],
  },
  national: {
    name: 'National Consumer Disputes Redressal Commission',
    shortName: 'NCDRC',
    jurisdiction: 'Claims above ₹2 Crores',
    claimLimit: null,
    filingFee: {
      upTo5Cr: 7500,
      upTo10Cr: 10000,
      above10Cr: 15000,
    },
    timeLimit: '150 days for disposal; appeals from State Commissions heard de novo',
    appeal: 'Supreme Court of India within 30 days',
    amenityRules: 'Free legal aid available; fee exemption orders possible',
    stages: [
      { label: 'NCDRC Filing', desc: 'Complaint or appeal registered at New Delhi' },
      { label: 'Bench Assignment', desc: 'Case assigned to a bench of judges' },
      { label: 'Notice & Reply', desc: 'OP given 30-45 days to file counter' },
      { label: 'Arguments', desc: 'Both sides argue; can take multiple sittings' },
      { label: 'NCDRC Order', desc: 'Binding order; only SC can overturn' },
    ],
  },
};

export const COMPENSATION_TYPES = [
  {
    category: 'Actual Damages',
    items: [
      { name: 'Medical Expenses', desc: 'All bills, medicines, re-surgery costs, rehabilitation', multiplier: '1x actual' },
      { name: 'Loss of Income', desc: 'Salary/income lost during hospitalization and recovery', multiplier: 'Monthly income × months' },
      { name: 'Future Medical Costs', desc: 'Estimated ongoing treatment, prosthetics, care', multiplier: 'Actuarial calculation' },
    ],
  },
  {
    category: 'Non-Economic Damages',
    items: [
      { name: 'Pain & Suffering', desc: 'Physical and emotional distress caused by negligence', multiplier: '2x–5x medical expenses' },
      { name: 'Mental Agony', desc: 'Psychological trauma, depression, PTSD from incident', multiplier: '₹1L–₹10L depending on severity' },
      { name: 'Loss of Consortium', desc: 'Impact on family relationships and marital life', multiplier: '₹50K–₹5L' },
    ],
  },
  {
    category: 'Punitive / Exemplary',
    items: [
      { name: 'Exemplary Damages', desc: 'Awarded when negligence is gross and intentional', multiplier: 'Up to 3x total damages' },
      { name: 'Litigation Costs', desc: 'Legal fees, court expenses, travel to hearings', multiplier: 'Actual + ₹25K–₹2L' },
    ],
  },
];

export const LATEST_AMENDMENTS = [
  {
    year: '2023',
    title: 'E-Filing Mandate (2023 Amendment)',
    desc: 'All commissions must accept online complaints. The Consumer Helpline (1800-11-4000) is 24/7. E-Daakhil portal is mandatory for filing.',
    impact: 'Faster processing; no travel required to file',
  },
  {
    year: '2023',
    title: 'Mediation Framework (Section 37)',
    desc: 'Mandatory mediation attempt before proceeding to full hearing. COPRA 2019 Section 37 – Mediation Centres established at all Commissions.',
    impact: 'Out-of-court settlement is now preferred and incentivized',
  },
  {
    year: '2024',
    title: 'Enhanced Pecuniary Limits (2024 Notification)',
    desc: 'District Commission: ₹50L (up from ₹20L). State Commission: ₹2Cr (up from ₹1Cr). National Commission: above ₹2Cr.',
    impact: 'More cases can be filed at State level; less congestion at NCDRC',
  },
  {
    year: '2024',
    title: 'Central Consumer Protection Authority (CCPA)',
    desc: 'CCPA can suo motu take up medical negligence cases causing widespread harm. Can impose penalty up to ₹10L on hospitals.',
    impact: 'Systemic negligence cases can be fast-tracked',
  },
  {
    year: '2024',
    title: 'BPL & Vulnerable Persons Exemption',
    desc: 'Zero filing fee for BPL cardholders, senior citizens (70+), and persons with disabilities (40%+ disability). Free legal aid through DLSA.',
    impact: 'Access to justice for the economically disadvantaged guaranteed',
  },
  {
    year: '2024',
    title: 'Digital Medical Records as Evidence',
    desc: 'Electronic health records, WhatsApp messages with doctors, and digital prescriptions are now admissible as primary evidence.',
    impact: 'Easier to build a case using digital communications',
  },
];

export const NEGLIGENCE_TYPES = [
  {
    type: 'Surgical Negligence',
    examples: ['Wrong-site surgery', 'Retained surgical instruments', 'Incorrect organ removal', 'Post-operative negligence'],
    avgCompensation: '₹10L – ₹50L',
    successRate: '78%',
  },
  {
    type: 'Misdiagnosis',
    examples: ['Cancer missed or delayed', 'Wrong treatment prescribed', 'Lab report errors', 'Radiology misread'],
    avgCompensation: '₹5L – ₹25L',
    successRate: '71%',
  },
  {
    type: 'Medication Errors',
    examples: ['Wrong drug administered', 'Overdose', 'Drug interaction ignored', 'Allergy ignored'],
    avgCompensation: '₹2L – ₹15L',
    successRate: '82%',
  },
  {
    type: 'Birth Injuries',
    examples: ['Cerebral palsy from delayed C-section', 'Erb\'s palsy', 'Stillbirth from negligence'],
    avgCompensation: '₹25L – ₹2Cr',
    successRate: '65%',
  },
  {
    type: 'Anaesthesia Errors',
    examples: ['Wrong dosage', 'Awareness under anaesthesia', 'Post-op complications'],
    avgCompensation: '₹5L – ₹30L',
    successRate: '74%',
  },
  {
    type: 'ICU / Emergency Negligence',
    examples: ['Delayed treatment in emergency', 'ICU infection from negligence', 'Equipment failure'],
    avgCompensation: '₹3L – ₹20L',
    successRate: '69%',
  },
];

export const BPL_PROVISIONS = {
  filingFeeWaiver: '100% filing fee waived at all Commission levels',
  legalAid: 'Free legal representation through District Legal Services Authority (DLSA)',
  travelAllowance: 'Reimbursement for travel to commission hearings (up to ₹2,000 per trip)',
  priorityHearing: 'Priority listing for BPL/senior citizen/disability cases',
  incomeCriteria: 'Annual family income below ₹1,00,000 (varies by state; some states: ₹1,50,000)',
  eligibility: ['BPL Ration Card', 'Antyodaya Anna Yojana (AAY) Card', 'PMJAY (Ayushman Bharat) beneficiary', 'EWS (Economically Weaker Section) certificate'],
  additionalDiscounts: [
    { group: 'Senior Citizens (70+)', discount: '50% fee waiver + priority hearing' },
    { group: 'Persons with Disability (40%+)', discount: '100% fee waiver + free legal aid' },
    { group: 'Women Complainants (solo)', discount: '25% fee reduction' },
    { group: 'Tribal / SC/ST applicants', discount: '50% fee reduction + free legal aid' },
  ],
};

export const NEGOTIATION_STRATEGY = {
  phases: [
    {
      phase: 1,
      name: 'Pre-Notice Investigation',
      duration: '2–4 weeks',
      actions: [
        'Collect all medical records (file RTI if refused)',
        'Get independent medical opinion',
        'Document all financial losses',
        'Calculate total compensation demand',
      ],
      tips: 'Never accept verbal apologies or informal offers. Everything must be in writing.',
    },
    {
      phase: 2,
      name: 'Formal Legal Notice',
      duration: '1 week',
      actions: [
        'Send registered legal notice to hospital CEO, Medical Superintendent, and Insurance company',
        'Demand specific compensation amount + interest',
        'Set 30-day deadline for response',
        'Copy notice to State Medical Council',
      ],
      tips: 'Mentioning State Medical Council in the notice often triggers faster hospital response.',
    },
    {
      phase: 3,
      name: 'Negotiation Window',
      duration: '4–8 weeks',
      actions: [
        'Respond within 7 days to any hospital communication',
        'Never accept first offer (typically 20–30% of fair value)',
        'Use expert report as primary leverage',
        'Document all offers and counter-offers in writing',
      ],
      tips: 'Fair settlement is typically 60–80% of maximum likely commission award.',
    },
    {
      phase: 4,
      name: 'Mediation (COPRA Section 37)',
      duration: '3–6 weeks',
      actions: [
        'Agree to mediation only if hospital is genuine',
        'Use commission-appointed mediator',
        'Set minimum acceptable amount before entering mediation',
        'Include confidentiality + NDA clause in any settlement',
      ],
      tips: 'Mediation saves 18–36 months versus full commission process. Worth the compromise.',
    },
    {
      phase: 5,
      name: 'Commission Filing (if negotiation fails)',
      duration: 'File within 2 years of incident',
      actions: [
        'File via E-Daakhil portal (edaakhil.nic.in)',
        'Attach all evidence with affidavit',
        'Pay court fee (or get waiver)',
        'Serve notice to hospital through commission',
      ],
      tips: 'Filing itself often triggers a better settlement offer from the hospital within 30–60 days.',
    },
  ],
};

// AI Suggestion generator based on case data
export function generateAISuggestion(caseData: {
  issueType: string;
  estimatedDamage: number;
  bplCard: boolean;
  annualIncome: number;
  negotiationStage: string;
  expertVerdict?: string;
  commission: string;
}): string {
  const { issueType, estimatedDamage, bplCard, negotiationStage, expertVerdict, commission } = caseData;

  let suggestion = '';

  // Commission recommendation
  if (estimatedDamage <= 5000000) {
    suggestion += `📋 **Recommended Forum**: District Consumer Commission (DCDRC) — your claim of ₹${(estimatedDamage / 100000).toFixed(1)}L falls within ₹50L jurisdiction.\n\n`;
  } else if (estimatedDamage <= 20000000) {
    suggestion += `📋 **Recommended Forum**: State Consumer Commission (SCDRC) — your claim falls in the ₹50L–₹2Cr jurisdiction.\n\n`;
  } else {
    suggestion += `📋 **Recommended Forum**: National Commission (NCDRC) — claim exceeds ₹2Cr, directly file with NCDRC in New Delhi.\n\n`;
  }

  // BPL benefits
  if (bplCard) {
    suggestion += `♿ **BPL Benefits Active**: Your filing fee is ₹0 (fully waived). Free legal aid through DLSA has been auto-assigned. You qualify for priority hearing listing.\n\n`;
  }

  // Negotiation advice
  if (negotiationStage === 'offer_received') {
    suggestion += `🤝 **Negotiation Strategy**: Hospital's current offer appears to be their opening bid — typically 20–30% of fair value. Based on the expert's verdict and your documented damages, we recommend countering at 70–75% of your stated demand. Do not go below 60%.\n\n`;
  } else if (negotiationStage === 'not_started') {
    suggestion += `📬 **Immediate Action Required**: Send a formal legal notice immediately. Include the expert report if available. Mention State Medical Council in CC. Set 30-day deadline. This triggers the formal negotiation clock.\n\n`;
  } else if (negotiationStage === 'failed') {
    suggestion += `⚖️ **File at Commission Now**: Negotiation has failed. File your complaint within the 2-year limitation period. Use E-Daakhil portal (edaakhil.nic.in). Commission filing itself often triggers a better offer within 30–60 days of notice being served on the hospital.\n\n`;
  }

  // Expert verdict leverage
  if (expertVerdict === 'negligence_found') {
    suggestion += `✅ **Strong Position**: Expert confirmed negligence. This significantly strengthens your case. Commission awards are 85%+ favorable when expert opinion confirms negligence. Minimum realistic award: ₹${(estimatedDamage * 0.5 / 100000).toFixed(1)}L; realistic maximum: ₹${(estimatedDamage * 0.9 / 100000).toFixed(1)}L.\n\n`;
  }

  // Issue-specific tip
  const issueMap: Record<string, string> = {
    'Surgical Negligence': '🔪 Surgical cases: Obtain the Operation Theatre (OT) register and anaesthesia record via RTI. These are crucial evidence.',
    'Misdiagnosis': '🔬 Misdiagnosis: Get second opinion from a government hospital specialist. Supreme Court precedent (Jacob Mathew v. State of Punjab) applies here.',
    'Medication Errors': '💊 Medication error: Preserve the original medication vials/strips as physical evidence. Get pharmacy records.',
  };

  const tipKey = Object.keys(issueMap).find((k) => issueType.includes(k.split(' ')[0]));
  if (tipKey) suggestion += issueMap[tipKey] + '\n\n';

  suggestion += `⏰ **Limitation Reminder**: File within 2 years of the incident date. If deadline has passed, file with reasons for delay — commissions can condone delays for genuine reasons.`;

  return suggestion;
}
