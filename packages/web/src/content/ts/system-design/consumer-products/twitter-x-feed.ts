import type { Problem } from '../types';

export const twitterXFeed: Problem = {
  slug: 'twitter-x-feed',
  title: 'Twitter/X feed',
  tagline: 'Fan out tweets to millions of followers in real time with push and pull hybrid.',
  difficulty: 'Hard',
  tags: ['Fan-out', 'Graph DB', 'Feed cache', 'Push vs pull'],
  group: 'consumer-products',
  functional: [
    'Post a tweet (text, media, reply, quote) and make it visible to followers.',
    'Home timeline shows tweets from followed accounts in reverse chronological order.',
    'Support 500M daily active users, 300M tweets/day, average 700 followers/user.',
    'Celebrity accounts with 50M+ followers must not block the pipeline.',
  ],
  nonFunctional: [
    'p99 home timeline latency under 200 ms.',
    'Tweet visibility for followers within 1 second (push) or 5 minutes (pull).',
    '99.99% availability for read and write paths.',
    'Graceful degradation: if fan-out lags, fall back to pull for affected users.',
  ],
  estimation: [
    '300M tweets/day ≈ 3,500 tweets/sec average, 30K/sec peak.',
    'Average fan-out 700 → 2.4B deliveries/day (push). Too high for pure push.',
    'Hybrid: push to active users (last login < 7 days), pull for inactive/celebrities.',
    'Feed cache: 500M users × 800 tweets × 500 bytes ≈ 200 TB (compressed).',
  ],
  diagram: `flowchart LR
  POST[Client POST] --> GW[API gateway] --> TWEET[Tweet service] --> TDB[(Tweets DB)]
  TWEET --> FW[Fanout worker] --> GDB[(Graph DB: followers)]
  FW --> FC[Feed cache] --> TL[Timeline API]
  TWEET -.-> NOTIF[Notification service]`,
  design: [
    {
      title: 'Push vs pull hybrid',
      body: 'Pure push fan-out to 50M followers takes too long and wastes resources on inactive users. Pure pull (merge on read) is slow for users with many followers. The hybrid: classify users by activity and follower count. Active users (logged in recently) get push fan-out. Inactive users and celebrities (> 100K followers) are pull-only; their tweets are fetched at read time and merged into the timeline.',
    },
    {
      title: 'Fan-out worker',
      body: 'The tweet service writes the tweet, then publishes a "tweet created" event to Kafka. Fan-out workers consume the event, look up followers from the graph DB (sharded by user ID), and write the tweet ID into each follower\'s feed cache (Redis sorted set by timestamp). For pull users, the tweet ID is written to a "celebrity index" instead.',
    },
    {
      title: 'Timeline read',
      body: "The timeline API merges: (1) the user's feed cache (pushed tweets), (2) tweets from pull-users the client follows (fetched from celebrity index), (3) ads and recommendations. Results are paginated with a cursor. The merge is done in the API layer, not the database.",
    },
    {
      title: 'Media handling',
      body: 'Media (images, video) is uploaded separately to object storage. The tweet references media IDs. A media processor generates thumbnails and transcodes video asynchronously. The feed cache stores only tweet IDs; the timeline API hydrates media URLs at read time.',
    },
  ],
  qa: [
    {
      q: 'How do you handle a celebrity with 50M followers posting?',
      a: "Celebrities are pull-only. Their tweets go to the celebrity index, not fan-out. Followers' timelines pull from the index at read time. This avoids the 50M write amplification.",
    },
    {
      q: 'What if the feed cache falls behind?',
      a: 'Monitor the fan-out lag (Kafka consumer lag). If lag exceeds a threshold, temporarily mark affected users as pull-only and backfill their feed cache asynchronously.',
    },
    {
      q: 'How do you delete a tweet?',
      a: 'Publish a "tweet deleted" event. Fan-out workers remove the tweet ID from feed caches. For pull users, the celebrity index marks it deleted. The timeline API filters deleted tweets at read time as a safety net.',
    },
  ],
};
