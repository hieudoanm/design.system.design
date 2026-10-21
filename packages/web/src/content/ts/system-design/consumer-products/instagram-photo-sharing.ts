import type { Problem } from '../types';

export const instagramPhotoSharing: Problem = {
  slug: 'instagram-photo-sharing',
  title: 'Instagram photo sharing',
  tagline: 'Upload, process, and serve billions of photos with thumbnails, CDN, and metadata.',
  difficulty: 'Medium',
  tags: ['Object storage', 'Media processing', 'CDN', 'Metadata'],
  group: 'consumer-products',
  functional: [
    'Upload photos (up to 50 MB) with captions, tags, and location.',
    'Generate multiple resolutions (thumbnail, medium, full) automatically.',
    'Serve photos via CDN with low latency worldwide.',
    'Support likes, comments, and sharing.',
  ],
  nonFunctional: [
    'Upload success rate > 99.9% under variable network conditions.',
    'Photo visible to followers within 5 seconds of upload.',
    'p99 read latency under 100 ms (CDN hit).',
    'Store originals durably for 10+ years.',
  ],
  estimation: [
    '100M uploads/day, average 5 MB = 500 TB/day ingest.',
    '3 resolutions + original = 4× storage. 500 TB × 4 = 2 PB/day new data.',
    'CDN cache hit ratio > 95% for recent photos.',
    'Metadata: 100M records/day × 500 bytes = 50 GB/day.',
  ],
  diagram: `flowchart LR
  subgraph UPLOAD [Upload path]
    UCLIENT[Client] --> UGW[API gateway] --> UMUP[Media upload] --> OBJ[(Object storage)]
    UMUP --> MPROC[Media processor] --> THUMB[Thumbnails] --> OBJ
    MPROC --> META[Metadata DB]
  end
  subgraph READ [Read path]
    RCLIENT[Client] --> CDN[CDN] --> OBJ
    RCLIENT -.-> META
  end`,
  design: [
    {
      title: 'Upload flow',
      body: 'The client requests a pre-signed URL from the media upload service, then PUTs directly to object storage (S3, GCS). This bypasses the API gateway for the large payload. On upload complete, the client notifies the API, which enqueues a media processing job.',
    },
    {
      title: 'Media processing',
      body: 'A worker pool (Kubernetes, Lambda, or dedicated fleet) picks up jobs from a queue. It downloads the original, generates thumbnails (150px, 640px, 1080px), extracts EXIF, runs content moderation, and writes outputs back to object storage. Metadata (dimensions, format, thumbnails URLs) is written to the metadata DB. Processing is async; the photo appears in the feed once the thumbnail is ready.',
    },
    {
      title: 'Read path and CDN',
      body: "The CDN caches thumbnails and full-resolution images. The metadata DB (wide-column or document store) stores photo info: owner, caption, tags, location, thumbnail URLs, like count. The feed API queries the metadata DB for the user's followees, joins with photo metadata, and returns thumbnail URLs. The client fetches images directly from the CDN.",
    },
    {
      title: 'Storage tiering',
      body: 'Originals go to cold storage (S3 Glacier) after 30 days. Thumbnails stay in hot storage. A lifecycle policy moves data automatically. Deletes are soft (marked deleted, purged after 30 days) to support undo.',
    },
  ],
  qa: [
    {
      q: 'How do you handle a 50 MB upload on a flaky mobile connection?',
      a: 'Use resumable uploads (multipart with pre-signed URLs per part). The client retries failed parts. The upload service assembles parts and verifies checksums before enqueueing processing.',
    },
    {
      q: 'What if media processing is slow?',
      a: 'The photo appears in the feed with a low-res placeholder while processing completes. The client polls or uses WebSocket for the thumbnail-ready event.',
    },
    {
      q: 'How do you moderate content?',
      a: 'Run ML moderation (NSFW, violence, spam) in the media processor pipeline. Flagged photos are quarantined: not served, not in feeds. Human review queue for borderline cases. Appeals flow reinstates if overturned.',
    },
  ],
};
