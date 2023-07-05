import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIActionGame')
export class UIActionGame extends Component {
    @property({
        type: Label
    })
    private scoreColumn: Label;
    public get ScoreColumn(): Label {
        return this.scoreColumn;
    }
    public set ScoreColumn(value: Label) {
        this.scoreColumn = value;
    }

    @property({
        type: Label
    })
    private bestScore: Label;
    public get BestScore(): Label {
        return this.bestScore;
    }
    public set BestScore(value: Label) {
        this.bestScore = value;
    }

    @property({
        type: Label
    })
    private scoreReward: Label;
    public get ScoreReward(): Label {
        return this.scoreReward;
    }
    public set ScoreReward(value: Label) {
        this.scoreReward = value;
    }

    @property({
        type: Node
    })
    private reward: Node;
    public get Reward(): Node {
        return this.reward;
    }
    public set Reward(value: Node) {
        this.reward = value;
    }

    @property({
        type: Node
    })
    private titleGameOver: Node;
    public get TitleGameOver(): Node {
        return this.titleGameOver;
    }
    public set TitleGameOver(value: Node) {
        this.titleGameOver = value;
    }

    @property({
        type: Node
    })
    private titleBestScore: Node;
    public get TitleBestScore(): Node {
        return this.titleBestScore;
    }
    public set TitleBestScore(value: Node) {
        this.titleBestScore = value;
    }
        
    @property({
        type: Node
    })
    private btnRestart: Node;
    public get BtnRestart(): Node {
        return this.btnRestart;
    }
    public set BtnRestart(value: Node) {
        this.btnRestart = value;
    }
}

