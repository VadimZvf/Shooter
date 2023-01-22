import { Vector3, Spherical, MathUtils } from 'three';
import EnemyController from './EnemyController';

let ENEMY_ID = 1;
const WAVE_INTERVAL = 1000;
const spawnMaxDistance = 100;
const spawnMinDistance = 50;

export default class WaveController {
    private enemyController: EnemyController;
    private spawnCenter: Vector3;
    private waveNumber = 0;
    private enemiesLeft = 0;

    constructor(enemyController: EnemyController, spawnCenter: Vector3) {
        this.enemyController = enemyController;
        this.spawnCenter = spawnCenter;
    }

    public start() {
        this.waitForNewWave();
    }

    private waitForNewWave() {
        setTimeout(() => {
            this.startWave();
        }, WAVE_INTERVAL);
    }

    private startWave() {
        this.waveNumber++;
        const enemiesCount = this.waveNumber * 10;
        console.log(`Start wave ${this.waveNumber}`);

        this.enemiesLeft = enemiesCount;
        for (let index = 0; index < enemiesCount; index++) {
            const sphericalPoint = new Spherical(
                spawnMinDistance + (spawnMaxDistance - spawnMinDistance) * Math.random(),
                Math.PI / 2,
                Math.PI  * 2 * Math.random(),
            );
            const enemy = this.enemyController.spawn(
                ENEMY_ID,
                new Vector3().setFromSpherical(sphericalPoint).add(this.spawnCenter)
            );
            ENEMY_ID++;
            enemy.events.addListener('die', () => {
                this.onEnemyDie();
            });
        }
    }

    private onEnemyDie() {
        this.enemiesLeft--;

        if (this.enemiesLeft === 0) {
            this.waitForNewWave();
        }
    }
}
