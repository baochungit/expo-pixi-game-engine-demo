import { GameButton } from 'utils/Game';
import { Ease } from 'pixi-ease';


export default class ChatButton extends GameButton {
  constructor(props = {}) {
    props.visible = props.visible || false;
    super(props);
  }

  shake() {
    const { sprite } = this.getChildren();
    const ease = new Ease({
      ticker: this.gameScene.app.ticker
    });

    ease.add(sprite, {
      shake: 5
    }, {
      reverse: false,
      duration: 500
    });
  }
}
