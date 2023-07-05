import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends Component {
    @property({
        type: Node
    })
    private uIStart: Node;

    @property({
        type: Node
    })
    private uIGame: Node;

    @property({
        type: Node
    })
    private uIResult: Node;


    public redirectGame(): void {
        this.uIResult.active = false;
        this.uIStart.active = false;
        this.uIGame.active = true;
    }

    public redirectResult(): void {
        this.uIStart.active = false;
        this.uIGame.active = false;
        this.uIResult.active = true;
    }
}

