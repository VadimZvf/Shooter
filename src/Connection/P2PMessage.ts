export enum MessageType {
    'SPAWN',
    'MOVE',
    'SHOT',
    'DIE'
}

export default class P2PMessage {
    type: MessageType;
    x: number;
    y: number;

    constructor(type: MessageType) {
        this.type = type;
    }

    setX(x: number) {
        this.x = x;
        return this;
    }

    setY(y: number) {
        this.y = y;
        return this;
    }
}
