export enum MessageType {
    'HOST_ID',
    'STATE',
    'WAVE_NUMBER',
    'PLAYER_SPAWN',
    'PLAYER_MOVE',
    'PLAYER_STOP',
    'PLAYER_HIT',
    'PLAYER_SHOT',
    'PLAYER_DIE',
    'NPC_SPAWN',
    'NPC_DIE',
    'NPC_MOVE',
    'NPC_HIT',
}

const PROPS = ['id', 'x', 'z', 'direction_x', 'direction_z'] as const;

type Prop = typeof PROPS[number];

export default class Message {
    type: MessageType;
    data: Record<Prop, number> = {
        id: 0,
        x: 0,
        z: 0,
        direction_x: 0,
        direction_z: 0,
    };

    rawData: Object = {};

    constructor(type: MessageType) {
        this.type = type;
    }

    static deserialize(buffer: ArrayBuffer): Message {
        const data = new Int32Array(buffer);
        const message = new Message(data[0] as MessageType);

        if (data[0] === MessageType.STATE) {
            const rawData = Message.deserializeRawData(data);
            message.addRawData(rawData);
            return message;
        }

        for (let index = 0; index < PROPS.length; index++) {
            const key = PROPS[index];
            message.setProp(key, data[index + 1] / 100);
        }

        return message;
    }

    static deserializeRawData(data: Int32Array) {
        let str = '';

        for (let index = 1; index < data.length; index++) {
            const symbol = String.fromCharCode(data[index]);
            str += symbol;
        }

        return JSON.parse(str);
    }

    public serialize(): Int32Array {
        if (this.type === MessageType.STATE) {
            return this.serializeRawData();
        }

        const data = new Int32Array(new ArrayBuffer(PROPS.length * 40));

        data[0] = this.type;

        for (let index = 0; index < PROPS.length; index++) {
            const key = PROPS[index];
            data[index + 1] = Math.ceil(this.data[key] * 100);
        }

        return data;
    }

    public serializeRawData(): Int32Array {
        const strData = JSON.stringify(this.rawData);

        const buf = new ArrayBuffer(strData.length * 4 + 4);
        const data = new Int32Array(buf);

        data[0] = this.type;

        for (let i = 0; i < strData.length; i++) {
            data[i + 1] = strData.charCodeAt(i);
        }

        return data;
    }

    public setProp(name: Prop, value: number) {
        this.data[name] = value;
        return this;
    }

    public getProp(name: Prop): number {
        return this.data[name];
    }

    public addRawData(rawData: Object) {
        if (this.type !== MessageType.STATE) {
            throw new Error('Raw data can be used only for STATE type message');
        }

        this.rawData = rawData;
    }

    public getRawData() {
        if (this.type !== MessageType.STATE) {
            throw new Error('Raw data can be used only for STATE type message');
        }

        return this.rawData;
    }
}
