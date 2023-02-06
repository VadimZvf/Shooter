import EventEmitter from 'events';
import { IHitable } from '../IHitable';
import { ICharacter } from '../ICharacter';
import Enemy from '../Enemy';
import { ServerEnemy } from './ServerEnemy';

const MODE: 'TOWER' | 'SURVIVE' = 'TOWER';

export class ServerEnemyController {
    private tower: IHitable;
    private enemiesServerControllers: Map<number, ServerEnemy> = new Map();
    public events = new EventEmitter();

    constructor(tower: IHitable) {
        this.tower = tower;
    }

    public add(id: number, enemy: Enemy) {
        const enemyServerController = new ServerEnemy(enemy);
        this.enemiesServerControllers.set(id, enemyServerController);

        enemyServerController.events.addListener('die', () => {
            this.events.emit('die', id);
            this.enemiesServerControllers.delete(id);
        });
        enemyServerController.events.addListener('hit', () => {
            this.events.emit('hit', id);
        });
        enemyServerController.events.addListener('move', (position) => this.events.emit('move', id, position));

        if (MODE === 'TOWER') {
            enemyServerController.recalculateTarget([this.tower]);
        }
    }

    public update(delta: number, time: number, players: ICharacter[]) {
        if (MODE === 'TOWER') {
            this.enemiesServerControllers.forEach((controller) => {
                controller.update(delta, time);
            });
        } else {
            this.enemiesServerControllers.forEach((controller) => {
                controller.recalculateTarget(players);
                controller.update(delta, time);
            });
        }
    }

    public getEnemies(): Map<number, ServerEnemy> {
        return this.enemiesServerControllers;
    }
}
