import { Manager, Socket } from "socket.io-client";

const stunServer = "stun:stun.l.google.com:19302";
const roomsBrokerServer = "ws://51.250.5.218/";

interface IPlayer {
    id: number;
}

export default class Connection {
    roomBrokerManager: Manager;
    roomBrokerConnection: Socket;
    peerConnection: RTCPeerConnection;
    dataChannel: RTCDataChannel;
    static iceServers = [
        {
            url: 'stun:stun.l.google.com:19302',
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302'
            ]
        },
        {
            url: 'stun:stun.12connect.com:3478',
            urls: 'stun:stun.12connect.com:3478',
        },
        {
            url: 'stun:stun.antisip.com:3478',
            urls: 'stun:stun.antisip.com:3478',
        }
    ];
    messageListeners: Array<(userId: number, data: object) => void> = [];
    icecandidates: RTCIceCandidateInit[] = [];

    constructor() {
        this.roomBrokerManager = new Manager(roomsBrokerServer, {
            reconnectionDelayMax: 10000,
        });
    }

    private createP2PConnection() {
        this.peerConnection = new RTCPeerConnection({
            iceServers: Connection.iceServers,
        });


        this.peerConnection.addEventListener("icecandidate", (event) => {
            console.log("event.icecandidate", event.candidate);
            if (event.candidate) {
                this.icecandidates.push(event.candidate);
            }
        });

        this.peerConnection.addEventListener('connectionstatechange', event => {
            console.log('!!', this.peerConnection);
            if (this.peerConnection.connectionState === 'connected') {
                console.log('??');
            }
        });

        this.peerConnection.addEventListener('error', event => {
            console.log('error', event);
        });
    }

    private openChannel(isInitiator: boolean) {
        if (isInitiator) {
            this.dataChannel = this.peerConnection.createDataChannel("data", {
                ordered: false,
            });
        } else {
            this.peerConnection.addEventListener("datachannel", (event) => {
                this.dataChannel = event.channel;

                this.dataChannel.addEventListener("open", () => {
                    console.log("OPEN! event!");
                });
        
                this.dataChannel.addEventListener("close", () => {
                    console.log("CLOSE event!");
                });
        
                this.dataChannel.addEventListener("message", (data) => {
                    console.log("MESSAGE!");
                    this.messageListeners.forEach((listener) => {
                        listener(1, data);
                    });
                });

                console.log("DATA Channel!!", event);
            });
        }
    }

    private async getIcecandidate(): Promise<RTCIceCandidateInit[]> {
        if (this.icecandidates.length) {
            return Promise.resolve(this.icecandidates);
        }

        return new Promise((resolve) => {
            this.peerConnection.addEventListener(
                "icecandidate",
                (event) => {
                    if (event.candidate) {
                        resolve([event.candidate]);
                    }
                },
                { once: true }
            );
        });
    }

    private async waitForRoomBrokerConnect(): Promise<void> {
        return new Promise((resolve) => {
            this.roomBrokerConnection.once("connect", () => {
                console.log("Room broker connected!");
                resolve();
            });
        });
    }

    private async waitForRoomBrokerEvent<Data>(
        event: string
    ): Promise<Data> {
        return new Promise((resolve) => {
            this.roomBrokerConnection.once(event, (data) => {
                resolve(data);
            });
        });
    }

    private async sendP2PConnectionOffer(roomName: string, player: IPlayer) {
        this.createP2PConnection();
        this.openChannel(true);
        const localDescr = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(localDescr);

        this.roomBrokerConnection.emit("p2p-connection-offer", {
            roomName,
            playerId: player.id,
            offer: localDescr,
        });

        const { answer } = await this.waitForRoomBrokerEvent<{
            answer: RTCSessionDescriptionInit;
        }>("p2p-connection-answer");

        await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
        );

        const icecandidates = await this.getIcecandidate();

        icecandidates.forEach((icecandidate) => {
            this.roomBrokerConnection.emit("p2p-connection-ice-candidate", {
                roomName,
                playerId: player.id,
                candidate: icecandidate,
            });
        });

        console.log("Connected to room!");
    }

    private async sendP2PConnectionAnswer(
        roomName: string,
        playerId: number,
        offer: RTCSessionDescriptionInit
    ) {
        this.createP2PConnection();
        this.openChannel(false);
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        const localDescr = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(localDescr);

        this.roomBrokerConnection.emit("p2p-connection-answer", {
            roomName,
            playerId,
            answer: localDescr,
        });

        const icecandidates = await this.getIcecandidate();

        icecandidates.forEach((icecandidate) => {
            this.roomBrokerConnection.emit("p2p-connection-ice-candidate", {
                roomName,
                playerId,
                candidate: icecandidate,
            });
        });

        console.log("New player connected!");
    }

    public async init(): Promise<{ success: boolean }> {
        this.roomBrokerConnection = this.roomBrokerManager.socket("/", {});

        await this.waitForRoomBrokerConnect();

        this.roomBrokerConnection.on(
            "p2p-connection-offer",
            (data: {
                roomName: string;
                playerId: number;
                offer: RTCSessionDescriptionInit;
            }) => {
                this.sendP2PConnectionAnswer(
                    data.roomName,
                    data.playerId,
                    data.offer
                );
            }
        );

        this.roomBrokerConnection.on(
            "p2p-connection-ice-candidate",
            (data: {
                roomName: string;
                playerId: number;
                candidate: RTCIceCandidateInit;
            }) => {
                this.peerConnection.addIceCandidate(
                    new RTCIceCandidate(data.candidate)
                );
                console.log("Received IceCandidate!");
            }
        );

        return { success: true };
    }

    public async joinRoom(roomName: string): Promise<{ success: boolean }> {
        this.roomBrokerConnection.emit("request-join-room", { roomName });

        const { players } = await this.waitForRoomBrokerEvent<{
            players: IPlayer[];
        }>("room-state");

        for (const player of players) {
            await this.sendP2PConnectionOffer(roomName, player);
        }

        console.log("Joined to room!");

        return { success: true };
    }

    public subscribeMessage(listener: (userId: number, data: object) => void) {
        this.messageListeners.push(listener);
    }

    public sendMessage(data: object) {
            console.log(this.dataChannel.readyState);
        this.dataChannel.send(new ArrayBuffer(10));
    }
}
