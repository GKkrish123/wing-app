// Production-grade voice chat service with WebRTC and Supabase signaling

import { supabaseBrowser } from '@/util/supabase/browser';

export interface VoiceChatConfig {
  conversationId: string;
  userId: string;
  onPeerConnected?: (peerId: string) => void;
  onPeerDisconnected?: (peerId: string) => void;
  onAudioStream?: (stream: MediaStream, peerId: string) => void;
  onPresenceUpdate?: (users: string[]) => void;
}

export class VoiceChatService {
  private conversationId: string;
  private userId: string;
  private localStream: MediaStream | null = null;
  private peers: Map<string, RTCPeerConnection> = new Map();
  private onPeerConnected?: (peerId: string) => void;
  private onPeerDisconnected?: (peerId: string) => void;
  private onAudioStream?: (stream: MediaStream, peerId: string) => void;
  private onPresenceUpdate?: (users: string[]) => void;
  private isInitialized = false;
  private voiceChannel: any = null;
  private audioElements: Map<string, HTMLAudioElement> = new Map();

  constructor(config: VoiceChatConfig) {
    this.conversationId = config.conversationId;
    this.userId = config.userId;
    this.onPeerConnected = config.onPeerConnected;
    this.onPeerDisconnected = config.onPeerDisconnected;
    this.onAudioStream = config.onAudioStream;
    this.onPresenceUpdate = config.onPresenceUpdate;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const supabase = supabaseBrowser();
      this.voiceChannel = supabase
        .channel(`voice:${this.conversationId}`, {
          config: {
            presence: {
              key: this.userId,
            },
          },
        })
        .on('presence', { event: 'sync' }, () => {
          const state = this.voiceChannel.presenceState();
          this.handlePresenceChange(state);
        })
        .on('presence', { event: 'join' }, ({ key }: { key: string }) => {
          if (key !== this.userId) {
            this.handlePeerJoin(key);
          }
        })
        .on('presence', { event: 'leave' }, ({ key }: { key: string }) => {
          if (key !== this.userId) {
            this.handlePeerLeave(key);
          }
        })
        .on('broadcast', { event: 'offer' }, ({ payload }: { payload: any }) => {
          this.handleOffer(payload);
        })
        .on('broadcast', { event: 'answer' }, ({ payload }: { payload: any }) => {
          this.handleAnswer(payload);
        })
        .on('broadcast', { event: 'ice-candidate' }, ({ payload }: { payload: any }) => {
          this.handleIceCandidate(payload);
        });

      await this.voiceChannel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await this.voiceChannel.track({
            user_id: this.userId,
            online_at: new Date().toISOString(),
          });
        }
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize voice chat:', error);
      throw error;
    }
  }

  private handlePresenceChange(state: any): void {
    const allUsers = Object.keys(state);
    const currentPeers = allUsers.filter((id: string) => id !== this.userId);
    
    // Notify chat component about all users in voice room
    if (this.onPresenceUpdate) {
      this.onPresenceUpdate(allUsers);
    }
    
    for (const peerId of currentPeers) {
      if (!this.peers.has(peerId)) {
        this.createPeerConnection(peerId);
      }
    }

    for (const [peerId] of this.peers) {
      if (!currentPeers.includes(peerId)) {
        this.removePeer(peerId);
      }
    }
  }

  private async handlePeerJoin(peerId: string): Promise<void> {
    if (!this.peers.has(peerId)) {
      await this.createPeerConnection(peerId);
      await this.initiateCall(peerId);
    }
  }

  private async handlePeerLeave(peerId: string): Promise<void> {
    this.removePeer(peerId);
  }

  private async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peer.addTrack(track, this.localStream!);
      });
    }

    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      const audioElement = document.createElement('audio');
      audioElement.srcObject = remoteStream;
      audioElement.autoplay = true;
      document.body.appendChild(audioElement);
      this.audioElements.set(peerId, audioElement);
      if (this.onAudioStream) {
        this.onAudioStream(remoteStream, peerId);
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        this.voiceChannel.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            candidate: event.candidate,
            target: peerId,
            from: this.userId,
          },
        });
      }
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'connected') {
        if (this.onPeerConnected) {
          this.onPeerConnected(peerId);
        }
      } else if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
        if (this.onPeerDisconnected) {
          this.onPeerDisconnected(peerId);
        }
      }
    };

    this.peers.set(peerId, peer);
    return peer;
  }

  private async initiateCall(peerId: string): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer) return;

    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      
      this.voiceChannel.send({
        type: 'broadcast',
        event: 'offer',
        payload: {
          offer,
          target: peerId,
          from: this.userId,
        },
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  private async handleOffer(payload: any): Promise<void> {
    if (payload.target !== this.userId) return;

    let peer = this.peers.get(payload.from);
    if (!peer) {
      peer = await this.createPeerConnection(payload.from);
    }

    try {
      await peer.setRemoteDescription(payload.offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      this.voiceChannel.send({
        type: 'broadcast',
        event: 'answer',
        payload: {
          answer,
          target: payload.from,
          from: this.userId,
        },
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  private async handleAnswer(payload: any): Promise<void> {
    if (payload.target !== this.userId) return;
    const peer = this.peers.get(payload.from);
    if (!peer) return;

    try {
      await peer.setRemoteDescription(payload.answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  private async handleIceCandidate(payload: any): Promise<void> {
    if (payload.target !== this.userId) return;
    const peer = this.peers.get(payload.from);
    if (!peer) return;

    try {
      await peer.addIceCandidate(payload.candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private removePeer(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.close();
      this.peers.delete(peerId);
    }
    const audioElement = this.audioElements.get(peerId);
    if (audioElement) {
      audioElement.remove();
      this.audioElements.delete(peerId);
    }
    if (this.onPeerDisconnected) {
      this.onPeerDisconnected(peerId);
    }
  }

  async disconnect(): Promise<void> {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.voiceChannel) {
      await this.voiceChannel.unsubscribe();
      this.voiceChannel = null;
    }

    this.peers.forEach(peer => peer.close());
    this.peers.clear();

    this.audioElements.forEach(audio => audio.remove());
    this.audioElements.clear();

    this.isInitialized = false;
  }

  mute(): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => { track.enabled = false; });
    }
  }

  unmute(): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => { track.enabled = true; });
    }
  }

  isConnected(): boolean {
    return this.isInitialized;
  }
}
