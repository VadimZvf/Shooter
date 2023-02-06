import EventEmitter from 'events';
import { Vector3, Spherical } from 'three';

const WAVE_INTERVAL = 1000;
const spawnMaxDistance = 100;
const spawnMinDistance = 50;

export default class WaveController {
    private spawnCenter: Vector3;
    private waveNumber = 0;
    private enemiesLeft = 0;
    public events = new EventEmitter();

    constructor(spawnCenter: Vector3) {
        this.spawnCenter = spawnCenter;
    }

    public syncWaveNumber(waveNumber: number) {
        this.waveNumber = waveNumber;
    }

    public syncEnemiesCount(count: number) {
        this.enemiesLeft = count;
    }

    public getWaveNumber(): number {
        return this.waveNumber;
    }

    public start() {
        if (this.enemiesLeft === 0) {
            this.waitForNewWave();
        }
    }

    public onEnemyDie() {
        this.enemiesLeft--;

        if (this.enemiesLeft === 0) {
            this.waitForNewWave();
        }
    }

    private waitForNewWave() {
        setTimeout(() => {
            this.startWave();
        }, WAVE_INTERVAL);
    }

    private startWave() {
        this.waveNumber++;

        this.events.emit('wave_start', this.waveNumber);
        const enemiesCount = this.waveNumber * 10;
        console.log(`Start wave ${this.waveNumber}`);

        this.enemiesLeft = enemiesCount;
        for (let index = 0; index < enemiesCount; index++) {
            const sphericalPoint = new Spherical(spawnMinDistance + (spawnMaxDistance - spawnMinDistance) * Math.random(), Math.PI / 2, Math.PI * 2 * Math.random());
            this.events.emit('spawn', new Vector3().setFromSpherical(sphericalPoint).add(this.spawnCenter));
        }
    }
}
