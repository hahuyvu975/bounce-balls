import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScoreColumn')
export class ScoreColumn extends Component {
    @property({
        type: Label
    })
    private labelScoreColumn: Label;

    private scoreColumn: number = 0;

    public addScoreColumn(): void {
        this.scoreColumn++;
        this.labelScoreColumn.string = this.scoreColumn.toString();
        if(!localStorage.getItem('bestScore')) {
            localStorage.setItem('bestScore', this.scoreColumn.toString());
        }
        if (this.scoreColumn >= parseInt(localStorage.getItem('bestScore'))) {
            localStorage.setItem('bestScore', (this.scoreColumn.toString()));
        } else {
            return;
        }
    }

}

