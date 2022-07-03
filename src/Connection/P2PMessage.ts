export enum MessageType {
    'SPAWN',
    'MOVE',
    'SHOT',
    'DIE'
}

const PROPS = [
    'x',
    'z',
] as const;

type Prop = typeof PROPS[number]

export default class P2PMessage {
    type: MessageType;
    data: Record<Prop, number> = {
        x: 0,
        z: 0,
    };

    constructor(type: MessageType) {
        this.type = type;
    }

    static deserialize(buffer: ArrayBuffer): P2PMessage {
        const data = new Int32Array(buffer);
        const message = new P2PMessage((data[0]) as MessageType);

        for (let index = 0; index < PROPS.length; index++) {
            const key = PROPS[index];
            message.setProp(key, (data[index + 1] / 100))
        }

        return message;
    }

    setProp(name: Prop, value: number) {
        this.data[name] = value;
        return this;
    }

    getProp(name: Prop): number {
        return this.data[name];
    }

    public serialize(): Int32Array {
        const data = new Int32Array(new ArrayBuffer(PROPS.length * 40));

        data[0] = this.type;

        for (let index = 0; index < PROPS.length; index++) {
            const key = PROPS[index];
            data[index + 1] = Math.ceil(this.data[key] * 100);
        }

        return data;
    }
}
