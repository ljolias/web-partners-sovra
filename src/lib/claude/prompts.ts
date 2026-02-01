import type { Deal, MEDDICScores } from '@/types';

export const MEDDIC_DEFINITIONS = {
  metrics: {
    name: 'Metrics',
    description: 'Quantifiable measures of success that the customer uses to evaluate solutions.',
    questions: [
      'What are the key metrics the customer uses to measure success?',
      'What ROI or cost savings are they expecting?',
      'What is the current baseline and target improvement?',
    ],
    scoring: {
      1: 'No metrics identified',
      2: 'Vague metrics mentioned',
      3: 'Some metrics identified but not quantified',
      4: 'Clear metrics with targets defined',
      5: 'Comprehensive metrics with executive buy-in',
    },
  },
  economicBuyer: {
    name: 'Economic Buyer',
    description: 'The person who has the authority to approve the budget and make the final purchasing decision.',
    questions: [
      'Who has the final authority to approve this purchase?',
      'Have you had direct contact with the economic buyer?',
      'What is their key concern or priority?',
    ],
    scoring: {
      1: 'Economic buyer not identified',
      2: 'Economic buyer identified but no contact',
      3: 'Initial contact made with economic buyer',
      4: 'Good relationship with economic buyer',
      5: 'Strong executive sponsorship confirmed',
    },
  },
  decisionCriteria: {
    name: 'Decision Criteria',
    description: 'The formal criteria the customer will use to evaluate and select a solution.',
    questions: [
      'What criteria will they use to make their decision?',
      'How do they prioritize these criteria?',
      'How does our solution align with their criteria?',
    ],
    scoring: {
      1: 'Decision criteria unknown',
      2: 'Informal criteria mentioned',
      3: 'Formal criteria partially understood',
      4: 'Full criteria documented and aligned',
      5: 'Criteria shaped to favor our solution',
    },
  },
  decisionProcess: {
    name: 'Decision Process',
    description: 'The steps and timeline the customer follows to make a purchasing decision.',
    questions: [
      'What is their decision-making process?',
      'What are the key milestones and timeline?',
      'Who else needs to be involved in the decision?',
    ],
    scoring: {
      1: 'Decision process unknown',
      2: 'General understanding of process',
      3: 'Key steps identified',
      4: 'Full process mapped with timeline',
      5: 'Process confirmed with stakeholders',
    },
  },
  identifyPain: {
    name: 'Identify Pain',
    description: 'The specific business pain or challenge that the customer is trying to solve.',
    questions: [
      'What is the primary pain point driving this initiative?',
      'What happens if they don\'t solve this problem?',
      'Is the pain urgent enough to drive action?',
    ],
    scoring: {
      1: 'Pain not identified',
      2: 'Surface-level pain mentioned',
      3: 'Pain identified but impact unclear',
      4: 'Pain quantified with business impact',
      5: 'Pain acknowledged at executive level',
    },
  },
  champion: {
    name: 'Champion',
    description: 'An internal advocate who supports your solution and has influence within the organization.',
    questions: [
      'Do you have an internal champion?',
      'What is their level of influence?',
      'Are they actively selling internally?',
    ],
    scoring: {
      1: 'No champion identified',
      2: 'Potential champion identified',
      3: 'Champion engaged but limited influence',
      4: 'Active champion with good influence',
      5: 'Powerful champion actively selling internally',
    },
  },
};

export function buildSystemPrompt(deal: Deal, currentScores: MEDDICScores, locale: string): string {
  const localeMessages = {
    es: {
      role: 'Eres un Sales Coach experto en la metodología MEDDIC.',
      context: 'Estás ayudando a un partner de Sovra a analizar y mejorar la calificación de su oportunidad de venta.',
      instructions: 'Analiza la conversación y proporciona coaching sobre MEDDIC. Cuando sugieras actualizar un score, usa el formato: [SUGGEST_SCORE: category=X] donde category es una de las 6 categorías MEDDIC y X es un número del 1 al 5.',
    },
    en: {
      role: 'You are an expert Sales Coach specialized in the MEDDIC methodology.',
      context: 'You are helping a Sovra partner analyze and improve their deal qualification.',
      instructions: 'Analyze the conversation and provide MEDDIC coaching. When suggesting a score update, use the format: [SUGGEST_SCORE: category=X] where category is one of the 6 MEDDIC categories and X is a number from 1 to 5.',
    },
    pt: {
      role: 'Você é um Sales Coach especialista na metodologia MEDDIC.',
      context: 'Você está ajudando um parceiro da Sovra a analisar e melhorar a qualificação de sua oportunidade de venda.',
      instructions: 'Analise a conversa e forneça coaching sobre MEDDIC. Quando sugerir atualizar um score, use o formato: [SUGGEST_SCORE: category=X] onde category é uma das 6 categorias MEDDIC e X é um número de 1 a 5.',
    },
  };

  const messages = localeMessages[locale as keyof typeof localeMessages] || localeMessages.en;

  return `${messages.role}

${messages.context}

## Deal Information
- Company: ${deal.companyName}
- Domain: ${deal.companyDomain}
- Contact: ${deal.contactName} (${deal.contactEmail})
- Deal Value: ${deal.currency} ${deal.dealValue.toLocaleString()}
- Stage: ${deal.stage}
- Notes: ${deal.notes || 'None'}

## Current MEDDIC Scores
${Object.entries(currentScores)
  .map(([key, value]) => {
    const def = MEDDIC_DEFINITIONS[key as keyof typeof MEDDIC_DEFINITIONS];
    return `- ${def.name}: ${value}/5`;
  })
  .join('\n')}

## MEDDIC Definitions
${Object.entries(MEDDIC_DEFINITIONS)
  .map(([key, def]) => `
### ${def.name} (${key})
${def.description}

Key Questions:
${def.questions.map((q) => `- ${q}`).join('\n')}

Scoring Guide:
${Object.entries(def.scoring)
  .map(([score, desc]) => `- ${score}: ${desc}`)
  .join('\n')}
`)
  .join('\n')}

## ${messages.instructions}

Categories for score suggestions:
- metrics
- economicBuyer
- decisionCriteria
- decisionProcess
- identifyPain
- champion

Example: "Based on what you've shared about having direct contact with the CFO, I'd suggest updating your Economic Buyer score. [SUGGEST_SCORE: economicBuyer=4]"
`;
}

export function parseScoreSuggestions(content: string): Partial<MEDDICScores> {
  const suggestions: Partial<MEDDICScores> = {};
  const regex = /\[SUGGEST_SCORE:\s*(\w+)=(\d)\]/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const [, category, score] = match;
    const normalizedCategory = category.toLowerCase();

    const categoryMap: Record<string, keyof MEDDICScores> = {
      metrics: 'metrics',
      economicbuyer: 'economicBuyer',
      decisioncriteria: 'decisionCriteria',
      decisionprocess: 'decisionProcess',
      identifypain: 'identifyPain',
      champion: 'champion',
    };

    const mappedCategory = categoryMap[normalizedCategory];
    if (mappedCategory) {
      const scoreNum = parseInt(score, 10);
      if (scoreNum >= 1 && scoreNum <= 5) {
        suggestions[mappedCategory] = scoreNum;
      }
    }
  }

  return suggestions;
}

export function cleanResponseContent(content: string): string {
  return content.replace(/\[SUGGEST_SCORE:\s*\w+=\d\]/g, '').trim();
}
