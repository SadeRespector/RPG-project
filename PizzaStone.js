import { GameObject } from "./GameObject.js";
import { Sprite } from "./Sprite.js";
export class PizzaStone extends GameObject {
    constructor(config) {
      super(config);
      this.sprite = new Sprite({
        gameObject: this,
        src: "./images/summonstone.png",
        animations: {
          "used-down"   : [ [0,0] ],
          "unused-down" : [ [0,0] ],
        },
        currentAnimation: "used-down"
      });
      this.storyFlag = config.storyFlag;
      this.pizzas = config.pizzas;
  
      this.talking = [
      
        {
          events: [
            { type: "textMessage", text: "Hey, I can level your Guys up!",  },
            { type: "craftingMenu"},
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