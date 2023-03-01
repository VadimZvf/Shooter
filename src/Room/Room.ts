import EventEmitter from 'events';
import RoomBrokerConnection from './RoomBrokerConnection';
import P2PConnection from './P2PConnection';
import P2PMessage, { MessageType } from '../Message';
import Message from '../Message';

export default class Connection extends EventEmitter {
    private hostId: number;
    private name: string;
    private roomBroker: RoomBrokerConnection;
    private peerConnections: Map<number, P2PConnection> = new Map();
    public playerId: number;

    constructor(name: string) {
        super();

        if (!name) {
            throw new Error('Room name required!');
        }

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

        if (data.players.length === 0) {
            this.hostId = this.playerId;
        }
    }

    public sendMessage(data: P2PMessage) {
        this.peerConnections.forEach((connection) => {
            if (connection.isReady) {
                connection.sendMessage(data);
            }
        });
    }

    public sendDirectMessage(data: P2PMessage, playerId: number) {
        this.peerConnections.get(playerId).sendMessage(data);
    }

    public getIsHost(): boolean {
        return this.hostId === this.playerId;
    }

    private async requestP2PConnection(roomName: string, playerId: number) {
        if (this.peerConnections.has(playerId)) {
            throw new Error('Connection already exist for player: ' + playerId + ' !');
        }

        const p2pConnection = new P2PConnection();
        this.peerConnections.set(playerId, p2pConnection);

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
                console.log('receive hello!');
                this.hostId = playerId;
                return;
            }

            this.emit('message', playerId, message);
        });

        p2pConnection.subscribeDisconnect(this.performPlayerDisconnection(playerId));
    }

    private async onP2PConnectionRequest(roomName: string, playerId: number, offer: RTCSessionDescriptionInit) {
        if (this.peerConnections.has(playerId)) {
            throw new Error('Connection already exist for player: ' + playerId + ' !');
        }

        const p2pConnection = new P2PConnection();
        this.peerConnections.set(playerId, p2pConnection);

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

        p2pConnection.subscribeDisconnect(this.performPlayerDisconnection(playerId));

        if (this.hostId === this.playerId) {
            const helloMessage = new Message(MessageType.HOST_ID);
            p2pConnection.sendMessage(helloMessage);
        }
    }

    private onReceiveICECandidate(playerId: number, candidate: RTCIceCandidateInit) {
        if (!this.peerConnections.has(playerId)) {
            throw new Error('Cannot apply ICE candidate, connection for player - ' + playerId + ' dosent exist!');
        }

        this.peerConnections.get(playerId).addICECandidate(candidate);
    }

    private performPlayerDisconnection = (playerId: number) => () => {
        this.peerConnections.delete(playerId);
        console.log('Player disconnected');

        if (playerId === this.hostId) {
            const minPlayerId = Math.min(...Object.keys(this.peerConnections).map(Number), this.playerId);

            if (this.playerId === minPlayerId) {
                this.hostId = this.playerId;
                const helloMessage = new Message(MessageType.HOST_ID);
                this.sendMessage(helloMessage);
                this.emit('receive_host_role');
            }
        }
    };
}
