export interface TurnConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface RtcConfig {
  iceServers: TurnConfig[];
}

export const DEFAULT_ICE_SERVERS: TurnConfig[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export type ConnectionState =
  'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';

export type ChannelLabel = 'messaging' | 'presence' | 'typing' | 'receipts';

export interface DataChannelMessage {
  channel: ChannelLabel;
  payload: unknown;
}

export interface ReconnectConfig {
  initialDelayMs: number;
  maxDelayMs: number;
  multiplier: number;
  maxRetries: number;
}

const DEFAULT_RECONNECT: ReconnectConfig = {
  initialDelayMs: 500,
  maxDelayMs: 30000,
  multiplier: 2,
  maxRetries: 10,
};

export class PeerConnection {
  private pc: RTCPeerConnection | null = null;
  private channels: Map<ChannelLabel, RTCDataChannel> = new Map();
  private state: ConnectionState = 'new';
  private retryCount = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectConfig: ReconnectConfig;
  private iceServers: TurnConfig[];
  private onStateChange?: (state: ConnectionState) => void;
  private onMessage?: (msg: DataChannelMessage) => void;

  constructor(
    iceServers: TurnConfig[] = DEFAULT_ICE_SERVERS,
    reconnectConfig: Partial<ReconnectConfig> = {}
  ) {
    this.iceServers = iceServers;
    this.reconnectConfig = { ...DEFAULT_RECONNECT, ...reconnectConfig };
  }

  onState(cb: (state: ConnectionState) => void): void {
    this.onStateChange = cb;
  }

  onData(cb: (msg: DataChannelMessage) => void): void {
    this.onMessage = cb;
  }

  private setState(s: ConnectionState): void {
    this.state = s;
    this.onStateChange?.(s);
  }

  private createPeer(): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: this.iceServers });
    pc.oniceconnectionstatechange = () => {
      const ice = pc.iceConnectionState;
      if (ice === 'connected' || ice === 'completed') {
        this.retryCount = 0;
        this.setState('connected');
      } else if (ice === 'disconnected') {
        this.setState('disconnected');
        this.scheduleReconnect();
      } else if (ice === 'failed') {
        this.setState('failed');
        this.scheduleReconnect();
      }
    };
    return pc;
  }

  private scheduleReconnect(): void {
    if (this.retryCount >= this.reconnectConfig.maxRetries) return;
    const delay = Math.min(
      this.reconnectConfig.initialDelayMs *
        Math.pow(this.reconnectConfig.multiplier, this.retryCount),
      this.reconnectConfig.maxDelayMs
    );
    this.retryCount++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.setState('connecting');
      this.pc?.restartIce();
    }, delay);
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    this.pc = this.createPeer();
    this.openChannels();
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return this.pc.localDescription!;
  }

  async acceptAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) throw new Error('No local peer — create offer first');
    await this.pc.setRemoteDescription(answer);
  }

  async acceptOffer(
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    this.pc = this.createPeer();
    this.openChannels();
    await this.pc.setRemoteDescription(offer);
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return this.pc.localDescription!;
  }

  private openChannels(): void {
    if (!this.pc) return;
    const labels: ChannelLabel[] = [
      'messaging',
      'presence',
      'typing',
      'receipts',
    ];
    for (const label of labels) {
      const ch = this.pc.createDataChannel(label, { ordered: true });
      ch.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data) as DataChannelMessage;
          this.onMessage?.(msg);
        } catch {
          // malformed
        }
      };
      ch.onopen = () => this.setState('connected');
      ch.onclose = () => {};
      this.channels.set(label, ch);
    }
  }

  onRemoteDataChannel(): void {
    if (!this.pc) return;
    this.pc.ondatachannel = (e) => {
      const label = e.channel.label as ChannelLabel;
      const ch = e.channel;
      ch.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data) as DataChannelMessage;
          this.onMessage?.(msg);
        } catch {
          // malformed
        }
      };
      ch.onopen = () => this.setState('connected');
      this.channels.set(label, ch);
    };
  }

  send(label: ChannelLabel, payload: unknown): void {
    const ch = this.channels.get(label);
    if (!ch || ch.readyState !== 'open') return;
    const msg: DataChannelMessage = { channel: label, payload };
    ch.send(JSON.stringify(msg));
  }

  getConnectionState(): ConnectionState {
    return this.state;
  }

  getRetryCount(): number {
    return this.retryCount;
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    await this.pc?.addIceCandidate(candidate);
  }

  close(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    for (const ch of this.channels.values()) ch.close();
    this.channels.clear();
    this.pc?.close();
    this.pc = null;
    this.setState('closed');
  }
}

export const generateDeviceId = (): string => {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export interface SyncPayload {
  deviceId: string;
  timestamp: number;
  type: 'key-backup' | 'message-sync' | 'presence';
  data: unknown;
}

export const createSyncPayload = (
  deviceId: string,
  type: SyncPayload['type'],
  data: unknown
): SyncPayload => ({
  deviceId,
  timestamp: Date.now(),
  type,
  data,
});
