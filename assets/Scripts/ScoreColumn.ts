import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScoreColumn')
export class ScoreColumn extends Component {
    @property({
        type: Label
    })
    private labelScoreColumn: Label;

    @property({
        type: Label
    })
    private labelBestScore: Label;

    private scoreColumn: number = 0;
    public get ScoreColumn(): number {
        return this.scoreColumn;
    }
    public set ScoreColumn(value: number) {
        this.scoreColumn = value;
    }
    

    protected onLoad(): void {
        if(!localStorage.getItem('bestScore')) {
            localStorage.setItem('bestScore', '0');
        }
    }

    protected start(): void {
    }

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

    public showBestScore(): void {
        const tempBestScore = localStorage.getItem('bestScore');
        if(tempBestScore === null) {
            this.labelBestScore.string = `0`
        } else {
            this.labelBestScore.string = `${tempBestScore}`
        }
        
    }

}

