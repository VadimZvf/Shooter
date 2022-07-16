export enum MessageType {
    'HOST_ID',
    'SPAWN',
    'MOVE',
    'SHOT',
    'DIE',
    'SPAWN_NPC',
    'DIE_NPC',
    'MOVE_NPC',
}

const PROPS = [
    'id',
    'x',
    'z',
    'direction_x',
    'direction_z',
] as const;

type Prop = typeof PROPS[number]

export default class Message {
    type: MessageType;
    data: Record<Prop, number> = {
        id: 0,
        x: 0,
        z: 0,
        direction_x: 0,
        direction_z: 0,
    };

    constructor(type: MessageType) {
        this.type = type;
    }

    static deserialize(buffer: ArrayBuffer): Message {
        const data = new Int32Array(buffer);
        const message = new Message((data[0]) as MessageType);

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
