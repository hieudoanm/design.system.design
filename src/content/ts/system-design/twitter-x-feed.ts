import type { Problem } from './types';

export const twitterFeed: Problem = {
  slug: 'twitter-x-feed',
  title: 'Twitter feed',
  tagline:
    'Fan billions of posts into per-user timelines, with a push-pull hybrid for the celebrities.',
  difficulty: 'Easy',
  tags: ['event-driven', 'notification', 'search', 'social'],
  group: 'consumer-products',
  functional: [
    'Post a tweet with text, media and links; follow and unfollow accounts.',
    'Read a home timeline of tweets from followed accounts, newest first and ranked.',
    'Search tweets and browse trending topics.',
    'Notify followers and mentioned users.',
  ],
  nonFunctional: [
    'Timeline reads stay under 200 ms p99 and are served from memory.',
    'Roughly 100 reads for every write at 500M daily users.',
    'A feed may lag a few seconds, but a user’s own tweet appears immediately.',
    'Publishing never blocks on fanout, so it survives a slow follower graph.',
  ],
  estimation: [
    '500M daily users posting twice a day is 1B tweets per day, about 12k writes per second and 50k at peak.',
    'Each user refreshes 10 times a day, so 50B timeline reads per day, about 580k reads per second.',
    'Fanout: 1B tweets × 200 followers = 200B cache entries per day, about 1.6 TB of ids before replication.',
    'Caching 800 tweet ids for 100M active timelines is 640 GB of Redis.',
    'Media on 10% of tweets at 200 KB each is 20 TB per day, which belongs on a CDN and never in the tweet store.',
  ],
  diagram: ` POST   Client ─► API gateway ─► Tweet service ─► Tweets DB
                                      │
                                      ├─► Fanout worker ─► Graph DB (followers)
                                      │        │
                                      │        └─► Feed cache (push to followers)
                                      └─► Notification service

 READ   Client ─► API gateway ─► Timeline service ─► Feed cache
                                      │                   │
                                      ├─► Search service  └─ merge celebrity
                                      │                     tweets at read time
                                      └─► CDN (media)`,
  design: [
    {
      title: 'Overview',
      body: "The home timeline shows recent tweets from accounts a user follows.\n\n- The Tweet service persists new tweets and emits them to a Fanout Worker.\n- A graph/followers service supplies follower lists.\n- Fanout copies each tweet into followers' timeline caches (Redis) — a push model.\n- The Timeline service reads cached feeds, merges and ranks them, and returns results through the API gateway with cursor-based pagination.\n- Cap the cached feed (e.g., 800 tweets) to bound memory.\n- Media URLs point at a CDN to offload bytes.\n- Writes are heavy but reads dominate by orders of magnitude, so reads must always hit the in-memory cache, never the primary tweets DB.\n- Use replicas and read-through caching, plus a fanout queue (Kafka) with retry/dead-letter handling to absorb load during spikes.",
    },
  ],
  qa: [
    {
      q: 'Pull-based vs push-based fanout: when do you use which?',
      a: "Push and pull are the two fanout models.\n\n- Push (fanout-on-write) pre-computes timelines: on publish, write the tweet into every follower's cache, giving fast reads at the cost of O(followers) writes and duplicate storage.\n- Pull (fanout-on-read) merges on demand: at read time, query the followed users' recent tweets, which is cheap to write but expensive and slower to read.\n\nReal systems use a hybrid.\n\n- Push for normal accounts (fanout-limited, e.g., under ~100k followers) and pull for celebrities to avoid fanout explosion, or lazily push only to recently-active followers.\n- Additional levers: only push to users who logged in recently, and let celebrity tweets be merged at read time so their write path stays O(1).\n- The trade-off is write amplification and read latency; choose the mode per account tier.",
    },
    {
      q: 'How do you rank or order a news feed?',
      a: "Ranking scores candidate tweets rather than sorting purely by recency.\n\n- Features include exponential time decay, engagement signals (likes, retweets, replies, video views), author quality, the user's interaction history with that author, and content type.\n- Candidate generation fetches recent tweets from followed users (via the fanout cache), then an online ranking service applies per-user weights from a feature store and returns the top K.\n- Real-time signals stream through Kafka into feature stores so weights refresh frequently.\n- A common blend is recency for hard-followed accounts and engagement/relevance for discovery content, so both trending and high-quality items surface.\n- Use predicted click/engagement models offline and validate thresholds with A/B testing.\n- Ranker latency is critical, so score in parallel and cap candidate set size.",
    },
    {
      q: 'Design Twitter search / trending topics',
      a: 'Search is a separate pipeline from the timeline.\n\n- Tweets flow through Kafka into an ingest job that cleans text and indexes into a distributed full-text engine (Elasticsearch/Solr) with an inverted index supporting filters on user, time range, language, and location.\n- Index in near real time with shards replicated for availability.\n- The query path: API to Search service to the index, ranked by relevance (BM25) blended with recency and engagement.\n\nTrending topics is a streaming aggregation over hashtags and normalized keywords.\n\n- Count occurrences in rolling windows (e.g., 10 minutes vs 24 hours) with a stream processor (Flink/Spark).\n- Compare current velocity against baseline to detect spikes.\n- Dedupe and normalize aliases, and serve the top K from a cache (Redis) with regional and language filters.',
    },
    {
      q: 'How do you support a celebrity (supernode) with millions of followers?',
      a: "The problem is fanout explosion: pushing one tweet into millions of follower caches is too expensive and slow.\n\n- The solution is hybrid fanout.\n- For celebrity accounts, do not push — mark them as pull, and at read time the Timeline service fetches the celebrity's recent tweets from a dedicated hot-timeline store and merges them into the follower's feed.\n- Combine with lazy fanout: skip followers inactive for a long period, pushing only to recently-logged-in users.\n\nOther techniques:\n\n- Cache follower lists and partition the graph by follower-count tier.\n- Keep the celebrity's timeline sharded and hot in cache.\n- Cap fanout with an LRU of active followers.\n- Prioritize ranking the celebrity's tweets correctly at merge time.\n\nThe hybrid keeps the write path O(1) while reads stay fast.",
    },
  ],
};
