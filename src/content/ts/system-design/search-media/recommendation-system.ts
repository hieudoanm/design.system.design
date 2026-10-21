import type { Problem } from '../types';

export const recommendationSystem: Problem = {
  slug: 'recommendation-system',
  title: 'Recommendation system',
  tagline:
    'Generate personalized recommendations at scale with candidate generation, ranking, and real-time features.',
  difficulty: 'Hard',
  tags: ['Candidate generation', 'ANN', 'Ranking', 'Feature store', 'Real-time'],
  group: 'search-media',
  functional: [
    'Home feed: personalized ranking of items (videos, products, articles).',
    'Related items: "users who viewed this also viewed".',
    'Cold start: recommendations for new users/items with no history.',
    'Explainability: show why an item was recommended.',
  ],
  nonFunctional: [
    'p99 end-to-end latency under 100 ms.',
    'Freshness: user actions (click, like) affect recommendations within 1 minute.',
    'Throughput: 100K recommendations/sec.',
    'Model updates: daily retraining, canary deploy.',
  ],
  estimation: [
    '100M users, 10M items. User-item matrix is 99.9% sparse.',
    'Candidate generation: 10M → 1K candidates (ANN over embeddings).',
    'Ranking: 1K → 50 (heavy model). Serving: 50 → 10 (light model).',
    'Feature store: 100M users × 500 features = 50B values (online + offline).',
  ],
  diagram: `flowflow LR
  USER[User] --> WEB[Web app] --> GW[API gateway] --> REC[Recommendation service]
  REC --> CAND[Candidate generation] --> ANN[ANN index]
  ANN --> RANK[Ranking model] --> FEAT[Feature store]
  FEAT --> SERVE[Serving policy] --> RESP[Response]`,
  design: [
    {
      title: 'Two-stage funnel',
      body: 'Stage 1 (candidate generation): retrieve ~1K candidates from 10M items. Methods: collaborative filtering (matrix factorization), content-based (item embeddings), ANN (HNSW/IVF-PQ over item embeddings), and rule-based (trending, recent). Stage 2 (ranking): a gradient-boosted tree or neural network scores each candidate using user features, item features, and cross features. Top 50 go to a lighter serving model for final ordering and diversity.',
    },
    {
      title: 'Embeddings and ANN',
      body: 'Item embeddings (128-256 dim) from a two-tower model (user tower, item tower) trained on implicit feedback (watch time, clicks). The ANN index (HNSW or IVF-PQ) enables sub-millisecond nearest-neighbor search. The index is rebuilt daily; updates are streamed to a delta index for intra-day freshness.',
    },
    {
      title: 'Feature store',
      body: 'Offline store (data lake, Parquet) for training. Online store (Redis, DynamoDB, or Feast) for serving. Features: user demographics, historical aggregates (7/30-day), session context, item metadata. The ranking model reads ~500 features per request. Feature freshness: streaming writes (Flink) update the online store within seconds of user actions.',
    },
    {
      title: 'Serving policy',
      body: 'Post-ranking rules: diversity (category, creator), freshness boost, business rules (no competitor ads, safety filters), and deduplication. The policy is configurable per surface (home, search, related) without model retraining.',
    },
  ],
  qa: [
    {
      q: 'How do you handle cold-start users?',
      a: 'Use demographic/location priors, popular/trending items, and onboarding signals (explicit interests). A lightweight "cold-start model" runs until enough interactions accumulate for the main model.',
    },
    {
      q: 'How do you A/B test models?',
      a: 'Canary deploy the new model to 1% of traffic. Compare online metrics (CTR, watch time, conversion) against control. Use sequential testing for early stopping. Gradually ramp to 100%.',
    },
    {
      q: 'What if the ANN index returns irrelevant items?',
      a: 'The ranking model corrects most errors. For systematic issues, add negative sampling to training. Monitor "candidate quality" metrics (recall@K of ground truth). Rebuild index with better embeddings if recall drops.',
    },
  ],
};
