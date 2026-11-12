'use client';

import { type FC, useState, useCallback, useEffect, useRef } from 'react';
import {
  FaTimes,
  FaCopy,
  FaQrcode,
  FaPaste,
  FaCheck,
  FaLink,
} from 'react-icons/fa';
import { PeerConnection } from '@/exhibit/lib/chat/webrtc';
import type { PeerConnectionState } from '@/exhibit/types/chat';

interface PairingModalProps {
  onClose: () => void;
  onPaired: (deviceId: string, peerPublicKey: string) => void;
}

export const PairingModal: FC<PairingModalProps> = ({ onClose, onPaired }) => {
  const [step, setStep] = useState<
    'choose' | 'offer' | 'answer' | 'connecting' | 'done'
  >('choose');
  const [connState, setConnState] = useState<PeerConnectionState>('new');
  const [offerSdp, setOfferSdp] = useState('');
  const [answerSdp, setAnswerSdp] = useState('');
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState('');
  const peerRef = useRef<PeerConnection | null>(null);

  useEffect(() => {
    return () => {
      peerRef.current?.close();
    };
  }, []);

  const generateOffer = useCallback(async () => {
    setStep('offer');
    const peer = new PeerConnection();
    peerRef.current = peer;
    peer.onState((s) => setConnState(s));
    const offer = await peer.createOffer();
    setOfferSdp(JSON.stringify(offer));
    peer.onRemoteDataChannel();
    peer.onData((msg) => {
      if (
        msg.channel === 'presence' &&
        (msg.payload as { type?: string })?.type === 'paired'
      ) {
        setStep('done');
        onPaired('peer-device', 'peer-public-key');
      }
    });
  }, [onPaired]);

  const acceptAnswer = useCallback(async () => {
    if (!peerRef.current || !pasted) return;
    try {
      const ans = JSON.parse(pasted) as RTCSessionDescriptionInit;
      await peerRef.current.acceptAnswer(ans);
      setStep('connecting');
    } catch {
      // invalid SDP
    }
  }, [pasted]);

  const generateAnswer = useCallback(
    async (offerJson: string) => {
      setStep('answer');
      const peer = new PeerConnection();
      peerRef.current = peer;
      peer.onState((s) => setConnState(s));
      peer.onRemoteDataChannel();
      peer.onData((msg) => {
        if (
          msg.channel === 'presence' &&
          (msg.payload as { type?: string })?.type === 'paired'
        ) {
          setStep('done');
          onPaired('peer-device', 'peer-public-key');
        }
      });
      try {
        const offer = JSON.parse(offerJson) as RTCSessionDescriptionInit;
        const answer = await peer.acceptOffer(offer);
        setAnswerSdp(JSON.stringify(answer));
      } catch {
        // invalid SDP
      }
    },
    [onPaired]
  );

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    setPasted(text);
  }, []);

  const qrUrl = offerSdp ? `data:text/plain;base64,${btoa(offerSdp)}` : '';

  return (
    <div className="bg-base-100/95 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
      <div className="bg-base-100 border-base-300 flex w-full max-w-lg flex-col rounded-2xl border p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <FaLink className="h-4 w-4" /> Pair Device
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-xs btn-ghost">
            <FaTimes />
          </button>
        </div>

        {step === 'choose' && (
          <div className="flex flex-col gap-3 py-4">
            <p className="text-base-content/60 text-sm">
              Connect to another device using WebRTC DataChannels. No server
              needed.
            </p>
            <button
              type="button"
              onClick={generateOffer}
              className="btn btn-primary w-full">
              <FaQrcode className="mr-2 h-4 w-4" /> Generate QR / Offer
            </button>
            <div className="divider text-xs">or paste an offer</div>
            <textarea
              className="textarea textarea-bordered h-20 text-xs"
              placeholder="Paste SDP offer here…"
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                if (pasted.trim()) void generateAnswer(pasted);
              }}
              disabled={!pasted.trim()}
              className="btn btn-outline w-full">
              Accept Offer & Generate Answer
            </button>
          </div>
        )}

        {step === 'offer' && (
          <div className="flex flex-col gap-3 py-4">
            <p className="text-base-content/60 text-sm">
              Share this QR code or SDP offer with the other device:
            </p>
            {qrUrl && (
              <div className="flex justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(offerSdp)}`}
                  alt="QR Code"
                  className="h-48 w-48 rounded-lg"
                />
              </div>
            )}
            <div className="relative">
              <textarea
                readOnly
                className="textarea textarea-bordered h-24 w-full font-mono text-[10px]"
                value={offerSdp}
              />
              <button
                type="button"
                onClick={() => handleCopy(offerSdp)}
                className="btn btn-xs btn-ghost absolute top-2 right-2">
                {copied ? <FaCheck /> : <FaCopy />}
              </button>
            </div>
            <div className="divider text-xs">
              paste the answer from the other device
            </div>
            <div className="flex gap-2">
              <textarea
                className="textarea textarea-bordered h-16 flex-1 text-xs"
                placeholder="Paste SDP answer…"
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
              />
              <button
                type="button"
                onClick={handlePaste}
                className="btn btn-ghost mt-1 self-start">
                <FaPaste />
              </button>
            </div>
            <button
              type="button"
              onClick={acceptAnswer}
              disabled={!pasted.trim()}
              className="btn btn-primary w-full">
              Complete Pairing
            </button>
          </div>
        )}

        {step === 'answer' && (
          <div className="flex flex-col gap-3 py-4">
            <p className="text-base-content/60 text-sm">
              Share this SDP answer with the first device:
            </p>
            <div className="relative">
              <textarea
                readOnly
                className="textarea textarea-bordered h-24 w-full font-mono text-[10px]"
                value={answerSdp}
              />
              <button
                type="button"
                onClick={() => handleCopy(answerSdp)}
                className="btn btn-xs btn-ghost absolute top-2 right-2">
                {copied ? <FaCheck /> : <FaCopy />}
              </button>
            </div>
          </div>
        )}

        {step === 'connecting' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <span className="loading loading-spinner loading-lg" />
            <p className="text-sm">Connecting… ({connState})</p>
            <p className="text-base-content/40 text-xs">
              Waiting for peer to confirm the connection.
            </p>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <FaCheck className="text-success h-10 w-10" />
            <p className="text-lg font-bold">Paired!</p>
            <p className="text-base-content/60 text-sm">
              Devices are now connected via encrypted DataChannels.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary mt-2">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
