import { GameObject } from "./GameObject.js";
import { Sprite } from "./Sprite.js";
export class Breeder extends GameObject {
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
            { type: "textMessage", text: "Hey I'm a breeder!",  },
            { type: "breedMenu",  },
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