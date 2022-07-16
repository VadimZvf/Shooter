import { Vector3 } from 'three';
import EnemyController from './EnemyController';

let ENEMY_ID = 1;
const WAVE_INTERVAL = 10000;
const spawnCenter = new Vector3(0, 0, 0);
const spawnSpread = 2;

export default class WaveController {
    private enemyController: EnemyController;
    private waveNumber = 0;
    private enemiesLeft = 0;

    constructor(enemyController: EnemyController) {
        this.enemyController = enemyController;
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
        const enemiesCount = this.waveNumber;
        console.log(`Start wave ${this.waveNumber}`);

        this.enemiesLeft = enemiesCount;
        for (let index = 0; index < enemiesCount; index++) {
            const enemy = this.enemyController.spawn(ENEMY_ID, new Vector3(
                spawnCenter.x + ((Math.random() * 2) - 1) * spawnSpread,
                spawnCenter.y,
                spawnCenter.z + ((Math.random() * 2) - 1) * spawnSpread,
            ));
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
