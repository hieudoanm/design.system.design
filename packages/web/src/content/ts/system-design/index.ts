import type { Problem } from './types';
import { urlShortener, rateLimiter, uniqueIdGenerator, keyValueStore } from './foundations';
import {
  twitterXFeed,
  instagramPhotoSharing,
  youtubeVideoSharing,
  uberRideHailing,
} from './consumer-products';
import {
  chatSystem,
  notificationService,
  dropboxFileSync,
  googleDocsCollaboration,
} from './collaboration-commerce';
import {
  recommendationSystem,
  ticketmasterEventBooking,
  stripePayments,
  autocompleteTypeahead,
} from './search-media';
import {
  webCrawlerSearchEngine,
  distributedCache,
  distributedMessageQueue,
  distributedLockService,
} from './building-blocks';
import {
  apiGateway,
  contentDeliveryNetwork,
  loadBalancer,
  serviceDiscovery,
} from './platform-services';

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
  twitterXFeed,
  instagramPhotoSharing,
  youtubeVideoSharing,
  uberRideHailing,
  chatSystem,
  notificationService,
  dropboxFileSync,
  googleDocsCollaboration,
  recommendationSystem,
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
