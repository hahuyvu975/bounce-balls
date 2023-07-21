import GameClient from '@onechaintech/gamesdk-beta';
import { _decorator, Component, Node, find, director } from 'cc';
import { StoreAPI } from './StoreAPI';
const { ccclass, property } = _decorator;

@ccclass('LoadingController')
export class LoadingController extends Component {
    public gameClient;

    public async start() : Promise<void> {
            let parameters = find("GameClient");
            
            if (parameters === null) {
                let parameters = new Node("GameClient");
                if (this.gameClient === undefined) {
                    this.gameClient = new GameClient("648050d63399e7ec8a1fa93c", "b6422f4a-1c30-44be-823d-32b43e924da1", window.parent, {dev: false });
                    await this.gameClient.initAsync()
                    .then(() => {console.log('123')})
                    .catch((err) => console.log(err));
                }
                console.log(this.gameClient);
                let gameClientParams = parameters.addComponent(StoreAPI);
                gameClientParams.gameClient = this.gameClient;
                director.addPersistRootNode(parameters);
            }
        director.loadScene("Game");
    }
}
