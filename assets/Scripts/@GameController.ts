import { _decorator, Component, Node, AudioClip, input, Input, instantiate, Prefab, Vec3, Collider2D, Contact2DType, RigidBody2D, Vec2, director, Quat, v2, math, Tween, IPhysics2DContact, randomRangeInt, find } from 'cc';

import { AudioController } from './@AudioController';
import { StoreAPI } from './StoreAPI';
import { ScoreReward } from './ScoreReward';
import { GameModel } from './@GameModel';
import { ScoreColumn } from './ScoreColumn';
import { GameView } from './@GameView';

let matchId: string;

const { ccclass, property } = _decorator;
@ccclass('GameController')
export class GameController extends Component {
    @property({
        type: Node
    })
    private btnTurnOn: Node;

    @property({
        type: Node
    })
    private btnTurnOff: Node;

    @property({
        type: AudioController
    })
    private audioCtrl: AudioController;

    @property({
        type: GameView
    })
    private gameView: GameView;

    @property({
        type: Prefab
    })
    private columnPrefab: Prefab;

    @property({
        type: Prefab
    })
    private linePrefab: Prefab;

    @property({
        type: Node
    })
    private columnsNode: Node;

    @property({
        type: Node
    })
    private linesNode: Node;

    @property({
        type: Node
    })
    private ball: Node;

    @property({
        type: Node
    })
    private rewardsNode: Node;

    @property({
        type: ScoreColumn
    })
    private scoreColumn: ScoreColumn;

    @property({
        type: ScoreReward
    })
    private scoreReward: ScoreReward;

    @property({
        type: GameModel
    })
    private gameModel: GameModel;

    @property({
        type: Prefab
    })
    private rewardPrefab: Prefab;

    private reward1: Node;

    //ControlGame
    private onClicked: boolean = false;
    private onClickStart: boolean = false;

    private rigidbody: RigidBody2D;

    // Ball
    private tempReward: Vec3 = new Vec3();
    private arrReward: Node[] = [];
    private status: boolean = true;
    private directionBall: boolean = false;

    //Column
    private positonX: Vec3 = new Vec3(-120, -250);
    private arrColumn: Node[] = [];
    private tempColumn: Vec3 = new Vec3();
    private isMovingObject: boolean = false;
    private countColumn: number = 0;

    //Reward
    private random: number = 1;
    private contactReward: boolean = false;

    //Lines
    private arrLine: Node[] = [];
    private positonLine: Vec3 = new Vec3(-154, -220);
    private tempLine: Vec3 = new Vec3();

    private isGameRunning: boolean = true;
    private endGame: boolean = false;


    //API
    private gameClient;
    // private matchId: string;


    protected async onLoad(): Promise<void> {
        director.resume();
        this.initPrefabColumn();
        this.initPrefabLine();
        this.initActionBall();
        this.initListeners();

        let _this = this;
        let parameters = find("GameClient");
        let gameClientParams = parameters.getComponent(StoreAPI);
        this.gameClient = gameClie.ntParams.gameClient;

        // Khi bat dau game
        await gameClientParams.gameClient.match.startMatch()
            .then((data) => {
                this.matchId = data.matchId;
                console.log(this.matchId)
            })
            .catch((error) => console.log(error));

        gameClientParams.matchId = this.matchId;

        if (!localStorage.getItem('volume')) {
            localStorage.setItem('volume', '1');
        }

        if (localStorage.getItem('volume') === '1') {
            this.btnTurnOn.active = true;
            this.btnTurnOff.active = false;
            this.onSoundTrack(1);
        } else {
            this.btnTurnOn.active = false;
            this.btnTurnOff.active = true;
            this.onSoundTrack(0);
        }
    }

    protected start(): void {
        this.rigidbody = this.ball.getComponent(RigidBody2D);
        const collider = this.ball.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    // va chạm
    protected onBeginContact(sefl: Collider2D, other: Collider2D, contact: IPhysics2DContact): void {
        if (this.status) {
            this.ball.getComponent(RigidBody2D).linearVelocity = new Vec2(0, 13);
        }

        if (localStorage.getItem('volume') === '1') {
            this.onAudioQueue(1);
        }
        // line
        if (other.tag === 3) {
            this.status = false;
            this.ball.getComponent(RigidBody2D).linearVelocity = new Vec2(-15, -5);
        }
        //reward
        if (other.tag === 0) {
            this.ball.getComponent(RigidBody2D).linearVelocity = new Vec2(0, -10);
            if (localStorage.getItem('volume') === '1') {
                this.onAudioQueue(2);
            }
            this.scoreReward.addScoreReward();
            this.contactReward = true;
        }
        // column
        if (this.onClickStart) {
            this.isMovingObject = true;
            if (other.tag === 1) {
                this.scoreColumn.addScoreColumn();
            }
        }
    }

    protected initListeners(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    // action start game
    protected onTouchStart(): void {

        if (localStorage.getItem('volume') === '1') {
            this.onAudioQueue(0);
        }

        this.onClickStart = true;
        // Thay đổi view
        if (this.gameView.IsActioning) {
            this.gameView.redirectActionGame();
            this.gameView.IsActioning = false;
        }
    }

    protected initActionBall(): void {
        input.on(Input.EventType.TOUCH_START, this.onActionBallDown, this)
    }

    //  action ball for down
    protected onActionBallDown(): void {
        const force: Vec2 = new Vec2(100, -1050);
        const point: Vec2 = new Vec2(0, 0);
        this.rigidbody.applyForce(force, point, true);
        this.ball.getComponent(Collider2D).apply();
    }

    protected initPrefabReward(index: number): void {
        this.countColumn = 0;
        this.reward1 = instantiate(this.rewardPrefab);
        this.reward1.parent = this.rewardsNode;
        this.arrReward.push(this.reward1);
        this.setPosReward(this.rewardsNode, index);
        // this.reward1.getComponent(Collider2D).apply();
    }

    protected setPosReward(node: Node, index: number): void {
        node.setPosition(this.arrColumn[index].position.x + 7, -30);
        // node.getComponent(Collider2D).apply();
    }

    protected initPrefabColumn(): void {
        for (let i = 0; i < 3; i++) {
            let element = instantiate(this.columnPrefab)
            this.columnsNode.addChild(element)
            this.arrColumn.push(element)
            this.setPosColumn(element);
            element.getComponent(Collider2D).apply();
        }
    }

    protected setPosColumn(node?: Node): void {
        for (let i = 0; i < this.arrColumn.length; i++) {
            node = this.arrColumn[i];
            node.setPosition(this.positonX.x + (i * 240), this.positonX.y);
        }
    }

    protected initPrefabLine(): void {
        for (let i = 0; i < 3; i++) {
            let element = instantiate(this.linePrefab)
            this.linesNode.addChild(element)
            this.arrLine.push(element)
            this.setPosLine(element);
            element.getComponent(Collider2D).apply();
        }
    }

    protected setPosLine(node?: Node): void {
        for (let i = 0; i < this.arrLine.length; i++) {
            node = this.arrLine[i];
            node.setPosition(this.positonLine.x + (i * 240), this.positonLine.y);
        }
    }

    protected async overGame(): Promise<void> {
        director.pause();
        console.log('over game');
        if (localStorage.getItem('volume') === '1') {
            this.onAudioQueue(3);
        }
        // Thay đổi view
        if (!this.gameView.IsActioning) {
            this.gameView.redirectActionGame();
        }
        

        console.log(this.matchId)
        try {
            await this.gameClient.match.completeMatch(this.matchId, { score: this.scoreColumn.ScoreColumn });
            console.log(this.scoreColumn.ScoreColumn);
            //Thay đổi view
            if (!this.gameView.IsActioning) {
                this.gameView.redirectActionGame();
            }
        } catch (error) {
            console.log(error);
        }
    }


    protected onClickRestart(): void {
        console.log('click restart');
        if (localStorage.getItem('volume') === '1') {
            this.onAudioQueue(0);
        }
        director.resume();
        director.loadScene('Game');

    }
    protected onClickSound(): void {
        if (!this.onClicked) {
            if (localStorage.getItem('volume') === '1') {
                this.onAudioQueue(0);
            }
            localStorage.setItem('volume', '0');
            this.onSoundTrack(0);
            this.btnTurnOn.active = false;
            this.btnTurnOff.active = true;
            this.onClicked = true;
        } else {
            localStorage.setItem('volume', '1');
            this.onSoundTrack(1);
            this.btnTurnOn.active = true;
            this.btnTurnOff.active = false;
            this.onClicked = false;
        }
    }
    protected onAudioQueue(num: number) {
        let clip: AudioClip = this.audioCtrl.Clips[num];
        this.audioCtrl.AudioSource.playOneShot(clip);
    }
    protected onSoundTrack(index: number): void {
        this.audioCtrl.AudioSource.volume = index;
    }



    protected async update(deltaTime: number): Promise<void> {

        if (this.status) {
            this.ball.setPosition(-120, this.ball.position.y);
        }

        //
        if (this.contactReward) {
            this.reward1.active = false;
            this.reward1.getComponent(Collider2D).apply();
            this.contactReward = false;
        }

        if (this.isGameRunning) {
            if (this.ball.getPosition().y < -385) {
                this.overGame();
            }
            // moving column and redward
            if (this.isMovingObject) {
                // move column
                for (let i = 0; i < this.arrColumn.length; i++) {
                    let element = this.arrColumn[i];
                    this.tempColumn = element.position;
                    this.tempColumn.x -= this.gameModel.Speed * deltaTime;
                    if (this.tempColumn.x < - 360) {
                        this.countColumn++;
                        this.tempColumn.x = 360;
                    }
                    this.arrColumn[i].setPosition(this.tempColumn);


                    if (this.countColumn === this.random) {
                        this.initPrefabReward(i);
                        this.random = math.randomRangeInt(5, 10);
                    }
                    this.arrColumn[i].getComponent(Collider2D).apply();
                }
                //move reward
                for (let i = 0; i < this.arrReward.length; i++) {
                    const element = this.arrReward[i];

                    this.tempReward = element.position;

                    if (this.tempReward === null) continue;

                    this.tempReward.x -= this.gameModel.Speed * deltaTime;
                    element.setPosition(this.tempReward);
                    element.getComponent(Collider2D).apply();

                    if (this.tempReward.x < -700) {
                        element.destroy();
                    }
                }
                // move line
                for (let i = 0; i < this.arrLine.length; i++) {
                    let element = this.arrLine[i];
                    this.tempLine = element.position;
                    this.tempLine.x -= this.gameModel.Speed * deltaTime;
                    if (this.tempLine.x < - 394) {
                        this.tempLine.x = 326;
                    }
                    element.setPosition(this.tempLine);
                    element.getComponent(Collider2D).apply();
                }
            }

        }
    }
}

