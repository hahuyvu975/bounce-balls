import { GameModel } from './@GameModel';
import { _decorator, Component, Node, Vec3, game, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Reward')
export class Reward extends Component {
    @property({
        type: GameModel
    })
    private gameModel: GameModel;

    private tempReward: Vec3 = new Vec3();

    
}

