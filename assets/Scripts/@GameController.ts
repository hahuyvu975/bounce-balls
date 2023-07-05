import { ScoreColumn } from './ScoreColumn';
import { GameView } from './@GameView';
import { _decorator, Component, Node, AudioClip, input, Input, instantiate, Prefab, Vec3, Collider2D, Contact2DType, IPhysics2DContact, RigidBody2D, Vec2, director } from 'cc';
import { AudioController } from './@AudioController';
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
        type: Node
    })
    private columnsNode: Node;

    @property({
        type: Node
    })
    private ball: Node;

    @property({
        type: ScoreColumn
    })
    private scoreColumn: ScoreColumn;


    private onClicked: boolean = false;
    private onClickStart: boolean = false;

    private isJumped: boolean = false;
    private tempPosBall: Vec3 = new Vec3();
    private isRecured: boolean = false;

    private positonX: Vec3 = new Vec3(-135, -500);
    private arrColumn: Node[] = [];
    private speedColumn: number = 600;
    private tempColumn: Vec3 = new Vec3();
    private contact: boolean = false;

    protected onLoad(): void {
        this.initPrefabColumn();
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
        const collider = this.ball.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact): void {
        if(localStorage.getItem('volume') === '1') {
            this.onAudioQueue(1);
        }
        // this.ball.setPosition(-110, this.ball.position.y);
        this.isJumped = true;
        if(this.onClickStart) {
            this.contact = true;
            this.scoreColumn.addScoreColumn();
            
        }
    }

    protected initListeners(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    protected onTouchStart(): void {
        this.onClickStart = true;
        this.gameView.redirectGame();
    }

    protected initActionBall(): void {
        input.on(Input.EventType.TOUCH_START, this.onActionBall, this)
    }

    protected onActionBall(): void {
        const rigid = this.ball.getComponent(RigidBody2D);
        rigid.applyForceToCenter(new Vec2(0, -10).multiplyScalar(200), true);
        this.isJumped = false;
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

    protected setPosColumn(node: Node): void {
        for (let i = 0; i < this.arrColumn.length; i++) {
            node = this.arrColumn[i];
            node.setPosition(this.positonX.x + (i * 270), this.positonX.y);
        }
    }

    protected overGame(): void {

        director.pause();
        this.gameView.redirectResult();
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

    protected update(deltaTime: number) {
        if(this.ball.getPosition().y < -385) {
            this.overGame();
        }

        if (this.isJumped) {
            this.tempPosBall = this.ball.position;
            this.tempPosBall.y += 400 * deltaTime;
            this.ball.setPosition(this.tempPosBall);
            this.ball.setRotationFromEuler(0,0,0);
            this.ball.getComponent(Collider2D).apply();
        }

        if (this.contact) {
            for (let i = 0; i < this.arrColumn.length; i++) {
                let element = this.arrColumn[i].position;
                this.tempColumn = element;
                this.tempColumn.x -= this.speedColumn * deltaTime;
                if (this.tempColumn.x < - 405) {
                    this.tempColumn.x = 405;
                }
                this.arrColumn[i].setPosition(this.tempColumn);
                this.arrColumn[i].getComponent(Collider2D).apply();
                }
            }
        }

        
    }

