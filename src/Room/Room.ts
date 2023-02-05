import EventEmitter from 'events';
import RoomBrokerConnection from './RoomBrokerConnection';
import P2PConnection from './P2PConnection';
import P2PMessage, { MessageType } from '../Message';
import Message from '../Message';

export default class Connection extends EventEmitter {
    private isHost: boolean;
    private hostId: number;
    private name: string;
    private roomBroker: RoomBrokerConnection;
    private peerConnections: {
        [id: number]: P2PConnection;
    } = {};
    public playerId: number;

    constructor(name: string) {
        super();

        if (!name) {
            throw new Error('Room name required!');
        }

        this.isHost = false;
        this.name = name;
        this.roomBroker = new RoomBrokerConnection();
    }

    public async connect(): Promise<void> {
        await this.roomBroker.init();

        this.roomBroker.subscribeMessages('p2p-connection-offer', (data: { roomName: string; playerId: number; offer: RTCSessionDescriptionInit }) => {
            if (data.roomName !== this.name) {
                console.warn(`Receive wrong room connection offer: ${data.roomName}, current room: ${this.name}`);
                return;
            }

            this.onP2PConnectionRequest(data.roomName, data.playerId, data.offer);
            console.log('New player connected');
        });

        this.roomBroker.subscribeMessages('p2p-connection-ice-candidate', (data: { roomName: string; playerId: number; candidate: RTCIceCandidateInit }) => {
            if (data.roomName !== this.name) {
                console.warn(`Receive ICE candidate with wrong room: ${data.roomName}, current room: ${this.name}`);
                return;
            }

            this.onReceiveICECandidate(data.playerId, data.candidate);
        });

        const data = await this.roomBroker.getRoomData(this.name);

        this.playerId = data.playerId;

        for (const player of data.players) {
            await this.requestP2PConnection(this.name, player.id);
        }

        console.log('Joined to room');

        this.isHost = data.players.length === 0;
    }

    public sendMessage(data: P2PMessage) {
        Object.entries(this.peerConnections).forEach(([id, connection]) => {
            if (connection.isReady) {
                connection.sendMessage(data);
            }
        });
    }

    public getIsHost(): boolean {
        return this.isHost;
    }

    private async requestP2PConnection(roomName: string, playerId: number) {
        if (this.peerConnections[playerId]) {
            throw new Error('Connection already exist for player: ' + playerId + ' !');
        }

        const p2pConnection = new P2PConnection();
        this.peerConnections[playerId] = p2pConnection;

        p2pConnection.onReceiveLocalICECandidate((candidate) => {
            this.roomBroker.sendMessage({
                type: 'p2p-connection-ice-candidate',
                data: { roomName, playerId, candidate },
            });
        });

        await p2pConnection.init(true);

        const offer = await p2pConnection.createOffer();

        this.roomBroker.sendMessage({ type: 'p2p-connection-offer', data: { roomName, playerId, offer } });

        const { answer } = await this.roomBroker.waitForMessage('p2p-connection-answer');

        await p2pConnection.setAnswer(answer);

        await p2pConnection.connect();

        p2pConnection.subscribeMessages((message) => {
            if (message.type === MessageType.HOST_ID) {
                this.hostId = playerId;
                return;
            }

            this.emit('message', playerId, message);
        });

        p2pConnection.subscribeDisconnect(() => {
            delete this.peerConnections[playerId];
            console.log('Player disconnected');

            if (playerId === this.hostId) {
                const minPlayerId = Math.min(...Object.keys(this.peerConnections).map(Number));

                if (this.playerId < minPlayerId) {
                    this.isHost = true;
                    const helloMessage = new Message(MessageType.HOST_ID);
                    this.sendMessage(helloMessage);
                    this.emit('receive_host_role');
                }
            }
        });
    }

    private async onP2PConnectionRequest(roomName: string, playerId: number, offer: RTCSessionDescriptionInit) {
        if (this.peerConnections[playerId]) {
            throw new Error('Connection already exist for player: ' + playerId + ' !');
        }

        const p2pConnection = new P2PConnection();
        this.peerConnections[playerId] = p2pConnection;

        p2pConnection.onReceiveLocalICECandidate((candidate) => {
            this.roomBroker.sendMessage({
                type: 'p2p-connection-ice-candidate',
                data: { roomName, playerId, candidate },
            });
        });

        await p2pConnection.init(false);

        const answer = await p2pConnection.createAnswer(offer);

        this.roomBroker.sendMessage({
            type: 'p2p-connection-answer',
            data: { roomName, playerId, answer },
        });

        await p2pConnection.connect();

        p2pConnection.subscribeMessages((message) => {
            this.emit('message', playerId, message);
        });

        p2pConnection.subscribeDisconnect(() => {
            delete this.peerConnections[playerId];
            console.log('Player disconnected');
        });

        if (this.isHost) {
            const helloMessage = new Message(MessageType.HOST_ID);
            p2pConnection.sendMessage(helloMessage);
        }
    }

    private onReceiveICECandidate(playerId: number, candidate: RTCIceCandidateInit) {
        if (!this.peerConnections[playerId]) {
            throw new Error('Cannot apply ICE candidate, connection for player - ' + playerId + ' dosent exist!');
        }

        this.peerConnections[playerId].addICECandidate(candidate);
    }
}
