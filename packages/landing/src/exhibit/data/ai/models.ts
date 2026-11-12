import type { AIModel } from '@/exhibit/types/ai';

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    badge: 'GPT-4o',
    badgeColor: 'badge-primary',
    description: 'Most capable OpenAI model for complex reasoning',
    contextWindow: '128K tokens',
    capabilities: ['Text', 'Code', 'Vision', 'Function Calling'],
    responseStyle: 'Detailed and structured',
  },
  {
    id: 'claude-3.5',
    name: 'Claude 3.5 Sonnet',
    badge: 'Claude',
    badgeColor: 'badge-secondary',
    description: "Anthropic's balanced model for analysis and coding",
    contextWindow: '200K tokens',
    capabilities: ['Text', 'Code', 'Analysis', 'Vision'],
    responseStyle: 'Thoughtful and analytical',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    badge: 'Gemini',
    badgeColor: 'badge-accent',
    description: "Google's multimodal model for versatile tasks",
    contextWindow: '1M tokens',
    capabilities: ['Text', 'Code', 'Vision', 'Multimodal'],
    responseStyle: 'Concise and informative',
  },
  {
    id: 'llama-3',
    name: 'Llama 3',
    badge: 'Llama',
    badgeColor: 'badge-info',
    description: "Meta's open-source model for general tasks",
    contextWindow: '8K tokens',
    capabilities: ['Text', 'Code'],
    responseStyle: 'Straightforward and practical',
  },
];

export const MOCK_RESPONSES: Record<string, string[]> = {
  'gpt-4o': [
    "I'd be happy to help you with that. Let me break this down into clear steps:\n\n1. **First**, we need to understand the core requirements\n2. **Then**, we can design an appropriate solution\n3. **Finally**, we'll implement and test it\n\nWould you like me to elaborate on any of these steps?",
    "That's an interesting question. Based on my analysis, here are the key points:\n\n- The solution involves multiple components working together\n- Performance should be considered at each step\n- Testing is crucial for reliability\n\nLet me know if you need more details on any aspect.",
    "Great question! Here's a comprehensive overview:\n\n```\n// Example code\nconst solution = {\n  approach: 'systematic',\n  priority: 'correctness',\n  testing: 'comprehensive'\n};\n```\n\nThis approach ensures we cover all bases while maintaining code quality.",
  ],
  'claude-3.5': [
    'I appreciate you bringing this up. Let me think through it carefully:\n\nThe key insight here is that we need to balance **simplicity** with **completeness**. Often, the best solution is one that:\n\n- Solves the immediate problem\n- Anticipates future needs\n- Remains maintainable\n\nWhat aspects would you like to explore further?',
    "This is a thoughtful question. Here's my analysis:\n\n> The best code is code that doesn't need to be written, but when you must write it, make it clear and testable.\n\nConsider these approaches:\n1. Start with the simplest solution that works\n2. Refactor as patterns emerge\n3. Document your reasoning\n\nShall I dive deeper into any of these?",
    'Let me provide a nuanced perspective on this:\n\n```\nfunction analyze(problem) {\n  const factors = identifyFactors(problem);\n  const priorities = rankByImpact(factors);\n  return createPlan(priorities);\n}\n```\n\nThe key is breaking down complex problems into manageable pieces.',
  ],
  'gemini-pro': [
    "Here's a concise answer to your question:\n\n**Key Points:**\n- Focus on the core requirement\n- Use proven patterns\n- Test early and often\n\nWould you like me to expand on any of these points?",
    'Good question! Let me provide a clear breakdown:\n\n| Aspect | Recommendation |\n|--------|----------------|\n| Architecture | Keep it simple |\n| Testing | Write tests first |\n| Documentation | Document as you go |\n\nLet me know if you need more details.',
    "Here's what I recommend:\n\n1. Start with a prototype\n2. Gather feedback\n3. Iterate based on learnings\n\nThis approach minimizes risk while maximizing learning.",
  ],
  'llama-3': [
    "Here's a straightforward approach:\n\n1. Define the problem clearly\n2. List available resources\n3. Choose the simplest effective solution\n4. Implement and verify\n\nWant me to go deeper on any step?",
    'Let me give you a practical answer:\n\n- Keep it simple\n- Make it work\n- Make it right\n- Make it fast (if needed)\n\nThis progression helps avoid over-engineering.',
    "Here's what I suggest:\n\n```\nsolution = {\n  step1: 'understand',\n  step2: 'plan',\n  step3: 'execute',\n  step4: 'verify'\n}\n```\n\nSimple and effective.",
  ],
};

export const MOCK_TITLES: string[] = [
  'Getting Started with TypeScript',
  'React Best Practices',
  'Node.js Performance Tips',
  'CSS Grid Layout Guide',
  'Python Data Analysis',
  'Docker Configuration Help',
  'API Design Patterns',
  'Database Optimization',
  'Git Workflow Tips',
  'Testing Strategies',
];

export const SYSTEM_PROMPT_TEMPLATES: { name: string; prompt: string }[] = [
  {
    name: 'Translate',
    prompt:
      'Translate the following text to English. Keep the original formatting and structure.',
  },
  {
    name: 'Explain Code',
    prompt:
      'Explain the following code in detail. Describe what each part does and how it works together.',
  },
  {
    name: 'Write Essay',
    prompt:
      'Write a well-structured essay on the given topic. Include an introduction, body paragraphs, and conclusion.',
  },
  {
    name: 'Summarize',
    prompt:
      'Provide a concise summary of the given text. Focus on the main points and key takeaways.',
  },
];
