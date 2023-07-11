import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScoreReward')
export class ScoreReward extends Component {
    @property({
        type: Label
    })
    private labelScoreReward: Label;

    private scoreReward: number = 0;
    public get ScoreReward(): number {
        return this.scoreReward;
    }
    public set ScoreReward(value: number) {
        this.scoreReward = value;
    }
    

    public addScoreReward(): void {
        this.scoreReward++;
        this.labelScoreReward.string = this.scoreReward.toString();  
    }
}

