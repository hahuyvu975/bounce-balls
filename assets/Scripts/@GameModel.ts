import { _decorator, Component, Node, CCFloat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameModel')
export class GameModel extends Component {
   @property({
        type: CCFloat
    })
    private speed: number = 500;
    public get Speed(): number {
        return this.speed;
    }
    public set Speed(value: number) {
        this.speed = value;
    }
}

