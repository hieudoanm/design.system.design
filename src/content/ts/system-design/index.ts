import type { Problem } from './types';
import { apiGateway } from './api-gateway';
import { autocompleteTypeahead } from './autocomplete-typeahead';
import { chatSystem } from './chat-system';
import { contentDeliveryNetwork } from './content-delivery-network';
import { distributedCache } from './distributed-cache';
import { distributedLockService } from './distributed-lock-service';
import { distributedMessageQueue } from './distributed-message-queue';
import { dropboxFileSync } from './dropbox-file-sync';
import { googleDocsCollaboration } from './google-docs-collaboration';
import { instagramPhotoSharing } from './instagram-photo-sharing';
import { keyValueStore } from './key-value-store';
import { loadBalancer } from './load-balancer';
import { notificationService } from './notification-service';
import { rateLimiter } from './rate-limiter';
import { recommendationSystem } from './recommendation-system';
import { serviceDiscovery } from './service-discovery';
import { stripePayments } from './stripe-payments';
import { ticketmasterEventBooking } from './ticketmaster-event-booking';
import { twitterFeed } from './twitter-x-feed';
import { uberRideHailing } from './uber-ride-hailing';
import { uniqueIdGenerator } from './unique-id-generator';
import { urlShortener } from './url-shortener';
import { webCrawlerSearchEngine } from './web-crawler-search-engine';
import { youtubeVideoSharing } from './youtube-video-sharing';

export type { Problem } from './types';

/** The six groups the problems are arranged into, in reading order. Four each. */
export const problemGroups = [
  {
    id: 'foundations',
    title: 'Foundations',
    intro: 'The classic primitives every interview starts from.',
  },
  {
    id: 'consumer-products',
    title: 'Consumer products',
    intro: 'Feeds, media and marketplaces at consumer scale.',
  },
  {
    id: 'collaboration-commerce',
    title: 'Collaboration & commerce',
    intro: 'Multi-user editing, money and recommendations.',
  },
  {
    id: 'search-media',
    title: 'Search & media',
    intro: 'Crawling, ranking and serving content near the user.',
  },
  {
    id: 'building-blocks',
    title: 'Building blocks',
    intro: 'The infrastructure components the other designs lean on.',
  },
  {
    id: 'platform-services',
    title: 'Platform services',
    intro: 'The shared services every large system eventually grows.',
  },
] as const;

export type ProblemGroupId = (typeof problemGroups)[number]['id'];

export const problems: Problem[] = [
  urlShortener,
  rateLimiter,
  uniqueIdGenerator,
  keyValueStore,
  twitterFeed,
  instagramPhotoSharing,
  youtubeVideoSharing,
  uberRideHailing,
  chatSystem,
  notificationService,
  dropboxFileSync,
  recommendationSystem,
  googleDocsCollaboration,
  ticketmasterEventBooking,
  stripePayments,
  autocompleteTypeahead,
  webCrawlerSearchEngine,
  contentDeliveryNetwork,
  distributedCache,
  distributedMessageQueue,
  distributedLockService,
  apiGateway,
  loadBalancer,
  serviceDiscovery,
];

/** The problems of one group, in reading order. */
export const problemsByGroup = (group: ProblemGroupId): Problem[] =>
  problems.filter((problem) => problem.group === group);

export const getProblem = (slug: string) => problems.find((p) => p.slug === slug);

/** The steps to follow in any system design interview. */
export const framework: { step: string; detail: string }[] = [
  {
    step: 'Clarify requirements',
    detail:
      'Separate functional from non-functional requirements. Ask about scale, read/write ratio and what is out of scope.',
  },
  {
    step: 'Estimate',
    detail:
      'Work out requests per second, storage and bandwidth. Rough numbers are enough to decide whether you need sharding or caching.',
  },
  {
    step: 'Sketch the API and data model',
    detail: 'List the main endpoints and entities. Pick storage that matches the access pattern.',
  },
  {
    step: 'Draw the high-level design',
    detail:
      'Clients, load balancer, services, data stores, caches and queues. Walk one request through end to end.',
  },
  {
    step: 'Go deep on the hard parts',
    detail:
      'Pick the one or two components that are hardest (key generation, fan-out, consistency) and discuss trade-offs.',
  },
  {
    step: 'Find bottlenecks and failures',
    detail:
      'What happens when a node, a zone or a dependency fails? Add replication, retries, monitoring and rate limits.',
  },
];
