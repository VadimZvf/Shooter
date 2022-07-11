import { Manager, Socket } from "socket.io-client";
import config from "../config";

interface IPlayer {
    id: number;
}

interface IRoomStateMessage {
    type: 'room-state';
    data: { players: IPlayer[] };
}

interface IRequestJoinRoomMessage {
    type: 'request-join-room';
    data: { roomName: string };
}

interface P2PConnectionAnswerMessage {
    type: "p2p-connection-answer",
    data: {
        roomName: string,
        playerId: number,
        answer: RTCSessionDescriptionInit,
    }
}

interface P2PConnectionOfferMessage {
    type: "p2p-connection-offer",
    data: {
        roomName: string,
        playerId: number,
        offer: RTCSessionDescriptionInit,
    }
}

interface P2PConnectionICECandidateMessage {
    type: "p2p-connection-ice-candidate",
    data: {
        roomName: string,
        playerId: number,
        candidate: RTCIceCandidateInit,
    }
}

type IServerToClientMessage = IRoomStateMessage | P2PConnectionAnswerMessage | P2PConnectionOfferMessage | P2PConnectionICECandidateMessage;
type IClientToServerMessage = IRequestJoinRoomMessage | P2PConnectionAnswerMessage | P2PConnectionOfferMessage | P2PConnectionICECandidateMessage;

export default class RoomBrokerConnection {
    static connectionManager: Manager;

    manager: Manager;
    connection: Socket;

    constructor() {
        if (!RoomBrokerConnection.connectionManager) {
            RoomBrokerConnection.connectionManager = new Manager(config.roomsBrokerUrl, {
                reconnectionDelayMax: 10000,
            });
        }
        this.manager = RoomBrokerConnection.connectionManager;
    }

    private async waitForConnect(): Promise<void> {
        if (this.connection.connected) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            this.connection.once("connect", () => {
                resolve();
            });
        });
    }

    public async waitForMessage<Type extends IServerToClientMessage['type']>(event: Type): Promise<any> {
        return new Promise((resolve) => {
            // @ts-ignore
            this.connection.once(event, (data) => {
                resolve(data);
            });
        });
    }

    public async init(): Promise<void> {
        this.connection = this.manager.socket("/", {});

        await this.waitForConnect();
    }

    public async getRoomData(roomName: string) {
        this.sendMessage({ type: "request-join-room", data: {roomName} });

        return this.waitForMessage("room-state");
    }

    public subscribeMessages<Type extends IServerToClientMessage['type']>(type: Type, listener: (data: IServerToClientMessage['data']) => void) {
        // @ts-ignore
        this.connection.on(type, listener);
    }

    public sendMessage(messate: IClientToServerMessage) {
        this.connection.emit(messate.type, messate.data);
    }
}
