import type { Problem } from '../types';

export const notificationService: Problem = {
  slug: 'notification-service',
  title: 'Notification service',
  tagline:
    'Deliver billions of notifications across push, email, SMS, and in-app with preferences, deduplication, and observability.',
  difficulty: 'Medium',
  tags: ['Fan-out', 'Preferences', 'Deduplication', 'Multi-channel'],
  group: 'collaboration-commerce',
  functional: [
    'Accept events from internal services (like, comment, mention, system alert).',
    'Deliver via push (FCM/APNs), email (SendGrid/SES), SMS (Twilio), in-app feed.',
    'User preferences: per-channel opt-out, quiet hours, frequency caps.',
    'Deduplication: collapse rapid-fire events (for example, 50 likes → "50 people liked").',
    'Template system with localization and variable substitution.',
  ],
  nonFunctional: [
    'p99 event-to-delivery latency under 5 seconds (push), 60 seconds (email/SMS).',
    'Handle 1M events/sec peak, 10B deliveries/month.',
    'At-least-once delivery; idempotent providers prevent duplicates.',
    'Preference changes effective within 30 seconds.',
  ],
  estimation: [
    '10B events/month = 3.8K events/sec average, 1M/sec peak.',
    'Fan-out: 1 event → 100 notifications avg (social), 1M → 100M deliveries.',
    'Preference store: 100M users × 50 bytes = 5 GB (Redis).',
    'Dedupe cache: 10M keys × 100 bytes = 1 GB (Redis, TTL 1 hour).',
  ],
  diagram: `flowchart LR
  SERVICES[Services] --> INGEST[Event ingestion] --> FANOUT[Fanout workers]
  FANOUT --> PREF[Preference service]
  PREF -->|push| PUSH[Push provider]
  PREF -->|email| EMAIL[Email service]
  PREF -->|sms| SMS[SMS gateway]
  PREF -->|in-app| INAPP[In-app feed]
  FANOUT --> DUPE[Dedupe cache]`,
  design: [
    {
      title: 'Event ingestion',
      body: 'Services publish notification events to Kafka (topic per event type). The event contains: `event_type`, `actor_id`, `recipient_ids[]`, `payload` (template variables), `priority`. The ingestion service validates, enriches (fetch actor name, avatar), and forwards to fan-out workers.',
    },
    {
      title: 'Fan-out with preferences',
      body: 'Fan-out workers consume from Kafka. For each recipient, they read preferences (cached in Redis, TTL 30 sec). Channels where the user opted out or is in quiet hours are skipped. Frequency caps (for example, max 3 push/hour) are enforced via a sliding-window counter in Redis. The worker emits one job per (recipient, channel).',
    },
    {
      title: 'Deduplication',
      body: 'For high-volume events (likes, reactions), collapse within a time window. Key: `dedupe:{event_type}:{target_id}:{window}`. The worker increments a counter and schedules a single notification at window end with the aggregate count. The template renders "50 people liked your post". This reduces delivery volume by 10-100x for viral content.',
    },
    {
      title: 'Multi-channel delivery',
      body: "Push: batch to FCM/APNs (1K tokens/request). Email: render template → SendGrid/SES API. SMS: Twilio/Vonage. In-app: write to user's notification feed (wide-column, partition by user_id, cluster by timestamp). All providers are wrapped with retries, circuit breakers, and idempotency keys.",
    },
  ],
  qa: [
    {
      q: 'How do you handle a provider outage (for example, FCM down)?',
      a: 'Circuit breaker trips after 5% error rate. Failed deliveries go to a dead-letter queue (Kafka topic). A replay job retries after the provider recovers. Push notifications have a TTL (for example 24h); expired ones are dropped.',
    },
    {
      q: 'What if a user changes preferences mid-fan-out?',
      a: 'Preferences are read at fan-out time with a short TTL. A change invalidates the cache immediately. In-flight jobs for that user may still deliver, but the next event respects the new preference.',
    },
    {
      q: 'How do you measure delivery success?',
      a: 'Track per-channel: sent, delivered (provider ack), opened (push/email), clicked. Correlate with user retention. Alert on delivery rate drop > 5% or latency p99 increase > 2x.',
    },
  ],
};
