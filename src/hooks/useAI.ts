import { useStore } from '../lib/store';
import { generateAISuggestion } from '../data/commissionRules';

// This hook generates AI suggestions using Claude API (via Anthropic SDK)
// In Lovable, set VITE_ANTHROPIC_API_KEY in environment variables
// For demo mode, it uses the local generateAISuggestion function

export async function getAICaseSuggestion(caseData: {
  id: string;
  issueType: string;
  issueDescription: string;
  estimatedDamage: number;
  bplCard: boolean;
  annualIncome: number;
  negotiationStage: string;
  expertVerdict?: string;
  commission: string;
  hospital: string;
  patientAge: number;
  notes: string[];
}): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 800,
          system: `You are an expert medicolegal consultant in India with deep knowledge of:
- Consumer Protection Act 2019 (COPRA) and all 2023-2024 amendments
- NCDRC, SCDRC, DCDRC jurisdiction and procedures
- Medical negligence case strategy
- Out-of-court settlement negotiation tactics
- Indian Supreme Court precedents on medical negligence (Jacob Mathew, Kusum Sharma cases)
- BPL/poor patient provisions and fee waivers
- The distinction between civil compensation (COPRA, this platform's focus) and criminal liability under Section 106 of the Bharatiya Nyaya Sanhita 2023 (BNS, effective 1 July 2024, replacing IPC Section 304A) — under which a registered medical practitioner causing death by a negligent act faces up to 2 years' imprisonment plus fine (vs. up to 5 years for the general public), with imprisonment mandatory on conviction. Only mention this criminal route when the case involves a patient death, and always caveat that it requires a separate FIR/criminal lawyer, not this platform's Commission process.

Provide concise, actionable, numbered strategic advice. Use ₹ for amounts. Be specific about Indian law sections. Max 400 words. Format with markdown bold for key points.`,
          messages: [
            {
              role: 'user',
              content: `Analyze this medical negligence case and give strategic advice:

Case: ${caseData.issueType} at ${caseData.hospital}
Patient Age: ${caseData.patientAge}
BPL Card: ${caseData.bplCard ? 'Yes' : 'No'}, Annual Income: ₹${caseData.annualIncome.toLocaleString('en-IN')}
Estimated Damage: ₹${caseData.estimatedDamage.toLocaleString('en-IN')}
Description: ${caseData.issueDescription}
Current Negotiation Stage: ${caseData.negotiationStage}
Expert Verdict: ${caseData.expertVerdict || 'Pending'}
Commission Level: ${caseData.commission}
Staff Notes: ${caseData.notes.join('; ')}

Provide:
1. Which commission to file at and why
2. Realistic compensation range with legal basis
3. Negotiation strategy for current stage
4. BPL/special provisions applicable
5. Most important immediate action
6. Key Indian legal precedent applicable`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.content[0]?.text || generateFallback(caseData);
      }
    } catch (err) {
      console.error('AI API error:', err);
    }
  }

  // Fallback to local generation
  return generateFallback(caseData);
}

function generateFallback(caseData: Parameters<typeof getAICaseSuggestion>[0]): string {
  return generateAISuggestion({
    issueType: caseData.issueType,
    estimatedDamage: caseData.estimatedDamage,
    bplCard: caseData.bplCard,
    annualIncome: caseData.annualIncome,
    negotiationStage: caseData.negotiationStage,
    expertVerdict: caseData.expertVerdict,
    commission: caseData.commission,
  });
}

export function useAISuggestion() {
  const { setAiSuggestion, setAiLoading, aiLoading } = useStore();

  const generateSuggestion = async (c: {
    id: string;
    issueType: string;
    issueDescription: string;
    estimatedDamage: number;
    bplCard: boolean;
    annualIncome: number;
    negotiationStage: string;
    expertVerdict?: string;
    commission: string;
    hospital: string;
    patientAge: number;
    notes: { content: string }[];
  }) => {
    setAiLoading(true);
    try {
      const suggestion = await getAICaseSuggestion({
        ...c,
        notes: c.notes.map((n) => n.content),
      });
      setAiSuggestion(c.id, suggestion);
    } finally {
      setAiLoading(false);
    }
  };

  return { generateSuggestion, aiLoading };
}
