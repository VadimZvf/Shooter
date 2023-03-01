import P2PMessage, { MessageType } from '../Message';

export default class P2PConnection {
    private connection: RTCPeerConnection;
    private dataChannel: RTCDataChannel;
    private isInitiator: Boolean;
    static iceServers = [
        { url: 'stun:stun01.sipphone.com', urls: ['stun:stun01.sipphone.com'] },
        { url: 'stun:stun.ekiga.net', urls: ['stun:stun.ekiga.net'] },
        { url: 'stun:stun.fwdnet.net', urls: ['stun:stun.fwdnet.net'] },
        { url: 'stun:stun.ideasip.com', urls: ['stun:stun.ideasip.com'] },
        { url: 'stun:stun.iptel.org', urls: ['stun:stun.iptel.org'] },
        { url: 'stun:stun.rixtelecom.se', urls: ['stun:stun.rixtelecom.se'] },
        { url: 'stun:stun.schlund.de', urls: ['stun:stun.schlund.de'] },
        { url: 'stun:stun.l.google.com:19302', urls: ['stun:stun.l.google.com:19302'] },
        { url: 'stun:stun1.l.google.com:19302', urls: ['stun:stun1.l.google.com:19302'] },
        { url: 'stun:stun2.l.google.com:19302', urls: ['stun:stun2.l.google.com:19302'] },
        { url: 'stun:stun3.l.google.com:19302', urls: ['stun:stun3.l.google.com:19302'] },
        { url: 'stun:stun4.l.google.com:19302', urls: ['stun:stun4.l.google.com:19302'] },
        { url: 'stun:stunserver.org', urls: ['stun:stunserver.org'] },
        { url: 'stun:stun.softjoys.com', urls: ['stun:stun.softjoys.com'] },
        { url: 'stun:stun.voiparound.com', urls: ['stun:stun.voiparound.com'] },
        { url: 'stun:stun.voipbuster.com', urls: ['stun:stun.voipbuster.com'] },
        { url: 'stun:stun.voipstunt.com', urls: ['stun:stun.voipstunt.com'] },
        { url: 'stun:stun.voxgratia.org', urls: ['stun:stun.voxgratia.org'] },
        { url: 'stun:stun.xten.com', urls: ['stun:stun.xten.com'] },
        {
            url: 'turn:numb.viagenie.ca',
            urls: ['turn:numb.viagenie.ca'],
            credential: 'muazkh',
            username: 'webrtc@live.com',
        },
        {
            url: 'turn:192.158.29.39:3478?transport=udp',
            urls: ['turn:192.158.29.39:3478?transport=udp'],
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808',
        },
        {
            url: 'turn:192.158.29.39:3478?transport=tcp',
            urls: ['turn:192.158.29.39:3478?transport=tcp'],
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808',
        },
    ];
    private messageListeners: Array<(data: P2PMessage) => void> = [];
    private disconnectListeners: Array<() => void> = [];
    private ICECandidatesListener: ((candidate: RTCIceCandidateInit) => void) | null = null;
    private pendingICEcandidates: RTCIceCandidateInit[] = [];
    public isReady: Boolean = false;

    constructor() {
        this.connection = new RTCPeerConnection({
            iceServers: P2PConnection.iceServers,
        });

        this.connection.addEventListener('icecandidate', (event) => {
            if (event.candidate) {
                if (this.ICECandidatesListener) {
                    this.ICECandidatesListener(event.candidate);
                } else {
                    this.pendingICEcandidates.push(event.candidate);
                }
            }
        });

        this.connection.addEventListener('error', (event) => {
            console.log('error', event);
        });
    }

    private async getDataChannel(): Promise<RTCDataChannel> {
        if (this.dataChannel) {
            return this.dataChannel;
        }

        return new Promise((resolve) => {
            this.connection.addEventListener(
                'datachannel',
                (event) => {
                    resolve(event.channel);
                },
                { once: true }
            );
        });
    }

    private async waitForConnectionOpen(): Promise<void> {
        const dataChannel = await this.getDataChannel();

        return new Promise((resolve) => {
            dataChannel.addEventListener('open', () => resolve(), { once: true });
        });
    }

    private attachListenersToDataChannel() {
        this.dataChannel.addEventListener('open', () => {
            this.isReady = true;
            console.log('OPEN! event!');
        });

        this.dataChannel.addEventListener('close', () => {
            this.isReady = false;
            this.disconnectListeners.forEach((listener) => {
                listener();
            });
        });

        this.dataChannel.addEventListener('message', ({ data }) => {
            this.messageListeners.forEach((listener) => {
                listener(P2PMessage.deserialize(data));
            });
        });
    }

    public async createOffer() {
        if (!this.isInitiator) {
            throw new Error('Current player should be initiator for P2p connection!');
        }
        const localDescr = await this.connection.createOffer();
        await this.connection.setLocalDescription(localDescr);

        return localDescr;
    }

    public async setAnswer(answer: RTCSessionDescriptionInit) {
        if (!this.isInitiator) {
            throw new Error('Current player should be initiator for P2p connection!');
        }
        await this.connection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    public async createAnswer(offer: RTCSessionDescriptionInit) {
        if (this.isInitiator) {
            throw new Error("Current player shouldn't be initiator for P2p connection!");
        }

        await this.connection.setRemoteDescription(new RTCSessionDescription(offer));

        const localDescr = await this.connection.createAnswer();
        await this.connection.setLocalDescription(localDescr);

        return localDescr;
    }

    public addICECandidate(candidate: RTCIceCandidateInit) {
        this.connection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    public onReceiveLocalICECandidate(listener: (candidate: RTCIceCandidateInit) => void) {
        if (this.ICECandidatesListener) {
            throw new Error('ICE candidare listener already defined!');
        }

        this.ICECandidatesListener = listener;

        while (this.pendingICEcandidates.length) {
            this.ICECandidatesListener(this.pendingICEcandidates.pop());
        }
    }

    public async init(isInitiator: boolean) {
        this.isInitiator = isInitiator;
        if (this.isInitiator) {
            this.dataChannel = this.connection.createDataChannel('data', {
                ordered: true,
            });
            this.attachListenersToDataChannel();
        } else {
            this.connection.addEventListener('datachannel', (event) => {
                this.dataChannel = event.channel;
                this.attachListenersToDataChannel();
            });
        }
    }

    public async connect() {
        return this.waitForConnectionOpen();
    }

    public subscribeMessages(listener: (data: P2PMessage) => void) {
        this.messageListeners.push(listener);
    }

    public subscribeDisconnect(listener: () => void) {
        this.disconnectListeners.push(listener);
    }

    public sendMessage(message: P2PMessage) {
        this.dataChannel.send(message.serialize());
    }
}
