import { UIActionGame } from './UIActionGame';
import { _decorator, Component, Node } from 'cc';
import { ScoreColumn } from './ScoreColumn';
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
    private uIActionGame: Node;

    @property({
        type: UIActionGame
    })
    private actionGame: UIActionGame;
    public get ActionGame(): UIActionGame {
        return this.actionGame;
    }
    public set ActionGame(value: UIActionGame) {
        this.actionGame = value;
    }

    
    private isActioning: boolean = true;
    public get IsActioning(): boolean {
        return this.isActioning;
    }
    public set IsActioning(value: boolean) {
        this.isActioning = value;
    }

    @property({
        type: ScoreColumn
    })
    private scoreColumn: ScoreColumn;

    public redirectActionGame(): void {
        this.uIActionGame.active = true;
        this.uIStart.active = false;
        this.scoreColumn.showBestScore();
        this.actionGame.TitleBestScore.active = !this.isActioning;
        this.actionGame.TitleGameOver.active = !this.isActioning;
        this.actionGame.BestScore.node.active = !this.isActioning;
        this.actionGame.BtnRestart.active = !this.isActioning;
    }
}

