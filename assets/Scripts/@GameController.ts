import { _decorator, Component, Node, AudioClip, input, Input, instantiate, Prefab, Vec3, Collider2D, Contact2DType, RigidBody2D, Vec2, director, Quat, v2, math, Tween, IPhysics2DContact, randomRangeInt, find, AudioSource } from 'cc';

import { AudioController } from './@AudioController';
import { StoreAPI } from './StoreAPI';
import { ScoreReward } from './ScoreReward';
import { GameModel } from './@GameModel';
import { ScoreColumn } from './ScoreColumn';
import { GameView } from './@GameView';



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

    @property({ type: AudioSource })
    private bgAudio: AudioSource;

    //ControlGame
    private onClicked: boolean = false;
    private onClickStart: boolean = false;
    private endGame: boolean = false;
    private rigidbody: RigidBody2D;

    // Ball
    private tempReward: Vec3 = new Vec3();
    private arrReward: Node[] = [];
    private status: boolean = true; ư
    private posBallCenter: boolean = true;

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

    // Moving objects (Column, Reward, Line)
    private isGameRunning: boolean = true;

    //API
    private gameClient;
    private matchId: string;


    protected async onLoad(): Promise<void> {
        let _this = this;
        this.ball.active = false;
        let parameters = find("GameClient");
        let gameClientParams = parameters.getComponent(StoreAPI);
        this.gameClient = gameClientParams.gameClient;

        // Khi bat dau game
        await gameClientParams.gameClient.match.startMatch()
            .then((data) => {
                _this.matchId = data.matchId;
            })
            .catch((error) => console.log(error));

        this.ball.active = true;

        this.bgAudio.play();
        this.initPrefabColumn();
        this.initPrefabLine();
        this.initActionBall();
        this.initListeners();

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

        //reward
        if (other.tag === 0) {
            if (localStorage.getItem('volume') === '1') {
                this.onAudioQueue(2);
            }
            this.scoreReward.addScoreReward();
            this.contactReward = true;
        }

        // line
        if (other.tag === 3) {
            this.posBallCenter = false;
            this.ball.getComponent(RigidBody2D).linearVelocity = new Vec2(-10, -15);
        }

        // column
        if (this.onClickStart) {
            this.status = false;
            this.isMovingObject = true;
            if (other.tag === 1) {
                this.scoreColumn.addScoreColumn();
                this.ball.getComponent(RigidBody2D).linearVelocity = new Vec2(0, 13);
            }
        }
    }

    protected initListeners(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    // action start game
    protected onTouchStart(): void {
        console.log('click')
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
        this.reward1.getComponent(Collider2D).apply();
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
        console.log('overGame');
        if (localStorage.getItem('volume') === '1') {
            this.onAudioQueue(3);
        }
        let _this = this;
        await this.gameClient.match
            .completeMatch(_this.matchId, { score: this.scoreColumn.ScoreColumn })
            .then((data) => { })
            .catch((error) => console.log(error));


        this.isGameRunning = false;
        
        // Thay đổi view
        if (!this.gameView.IsActioning) {
            this.gameView.redirectActionGame();
        }
    }


    protected onClickRestart(): void {
        if (localStorage.getItem('volume') === '1') {
            this.onAudioQueue(0);
        }
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
        if (this.posBallCenter) {
            this.ball.setPosition(-120, this.ball.position.y);
        }

        if (this.contactReward) {
            this.reward1.active = false;
            this.reward1.getComponent(Collider2D).apply();
            this.contactReward = false;
        }

        if (!this.endGame && this.ball.getPosition().y < -385) {
            this.ball.getComponent(RigidBody2D).enabled = false;
            this.overGame();
            this.endGame = true;
        }

        if (!this.endGame && this.isGameRunning) {

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

