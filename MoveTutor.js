import { GameObject } from "./GameObject.js";
import { Sprite } from "./Sprite.js";
export class MoveTutor extends GameObject {
    constructor(config) {
      super(config);
      this.sprite = new Sprite({
        gameObject: this,
        src: "/images/pokemon red sprite.png",
        animations: {
          "used-down"   : [ [2,2] ],
          "unused-down" : [ [2,2] ],
        },
        currentAnimation: "used-down"
      });
      this.storyFlag = config.storyFlag;
      this.pizzas = config.pizzas;
  
      this.talking = [
      
        {
          events: [
            { type: "textMessage", text: "Enword",  },
            { type: "mintMenu",  },
            { type: "addStoryFlag", flag: this.storyFlag },
          ]
        }
      ]
  
    }
  
    update() {
     this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
      ? "used-down"
      : "unused-down";
    }
  
  }