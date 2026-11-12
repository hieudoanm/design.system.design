import type { Problem } from '../types';

export const youtubeVideoSharing: Problem = {
  slug: 'youtube-video-sharing',
  title: 'YouTube video sharing',
  tagline: 'Ingest, transcode, store, and stream video at massive scale with adaptive bitrate.',
  difficulty: 'Hard',
  tags: ['Video transcoding', 'Adaptive bitrate', 'CDN', 'Chunked upload'],
  group: 'consumer-products',
  functional: [
    'Upload videos up to 12 hours, 256 GB, multiple codecs.',
    'Transcode to adaptive bitrate ladder (144p to 4K/8K).',
    'Stream via DASH/HLS with adaptive quality switching.',
    'Support live streaming and premieres.',
  ],
  nonFunctional: [
    '99.9% upload success rate; resumable for large files.',
    'Transcoding starts within 1 minute of upload complete.',
    'Stream start latency under 2 seconds (CDN hit).',
    'Support 1B hours watched/day, 500 hours uploaded/minute.',
  ],
  estimation: [
    '500 hrs/min upload = 30K hrs/day. Average 1 GB/hr = 30 PB/day raw.',
    'ABR ladder: 8 renditions × 30 PB = 240 PB/day new transcoded data.',
    'CDN: 1B hrs/day × 2 Mbps avg = 250 Tbps sustained egress.',
    'Metadata: 30K videos/day × 10 KB = 300 MB/day.',
  ],
  diagram: `flowchart LR
  subgraph UPLOAD [Upload path]
    UCLIENT[Client] --> UGW[API gateway] --> UUP[Upload service] --> CHUNK[Chunked object storage]
    UUP --> ENCQ[Encoding queue]
  end
  subgraph PROCESS [Processing]
    ENCQ --> ENC[Encoding pipeline] --> REND[Renditions] --> VIDSTOR[(Video storage)]
    ENC --> META[Metadata DB]
  end
  subgraph WATCH [Watch path]
    WCLIENT[Client] --> CDN[CDN] --> VIDSTOR
    WCLIENT -.-> META
  end`,
  design: [
    {
      title: 'Chunked upload',
      body: 'Large videos are split into chunks (for example 64 MB each). The client uploads chunks in parallel to pre-signed URLs. The upload service verifies checksums and assembles the original in object storage. This enables pause/resume and survives network interruptions.',
    },
    {
      title: 'Encoding pipeline',
      body: 'A distributed transcoder (FFmpeg on Kubernetes or cloud transcoder) pulls jobs from the queue. It generates an ABR ladder: 144p, 240p, 360p, 480p, 720p, 1080p, 1440p, 2160p. Each rendition is segmented (6-second chunks) and packaged as DASH (MPD) and HLS (m3u8). Thumbnails, sprites, and captions are generated in parallel. Outputs go to video storage (object storage with CDN).',
    },
    {
      title: 'Adaptive streaming',
      body: 'The player requests the manifest (MPD/m3u8), then selects the highest quality the bandwidth allows. It switches seamlessly by requesting chunks from different renditions. The CDN caches chunks at the edge. Pre-warming popular videos reduces origin load.',
    },
    {
      title: 'Live streaming',
      body: 'The broadcaster pushes RTMP/SRT to an ingest point. A live transcoder segments in real time (2-6 second chunks) and writes to a low-latency HLS/DASH manifest. The CDN caches live chunks with short TTL. DVR window (rewind) is implemented by keeping the last N hours of segments.',
    },
  ],
  qa: [
    {
      q: 'How do you handle copyright detection?',
      a: 'Run Content ID fingerprinting in the encoding pipeline (async, after upload). Matches are flagged; the uploader can dispute. Monetisation claims redirect ad revenue. This is a separate pipeline from transcoding to avoid blocking publish.',
    },
    {
      q: 'What about 8K and AV1?',
      a: 'Add renditions to the ladder as codecs mature. AV1 encoding is CPU-intensive; use hardware-accelerated encoders (GPU/ASIC) or cloud transcoders. Serve AV1 only to clients that advertise support.',
    },
    {
      q: 'How do you reduce storage cost?',
      a: 'Tier storage: hot (recent, popular) on SSD, warm on HDD, cold (archival) on Glacier. Delete unreferenced renditions. Use per-title encoding to avoid wasting bits on simple content.',
    },
  ],
};
