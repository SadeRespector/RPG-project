import { GameObject } from "./GameObject.js";
import { Sprite } from "./Sprite.js";
export class MintStone extends GameObject {
    constructor(config) {
      super(config);
      this.sprite = new Sprite({
        gameObject: this,
        src: "./images/summonstone.png",
        animations: {
          "used-down"   : [[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],],
          "unused-down" : [ [1,0],[2,0],[2,0],[3,0],[3,0],[4,0],[4,0], ],
        },
        currentAnimation: "used-down"
      });
      this.storyFlag = config.storyFlag;
      this.pizzas = config.pizzas;
  
      this.talking = [
        {required: [this.storyFlag],
           events: [
             { type: "textMessage", text: "The stone crumbled...",  }]},
      
        {
           
          events: [
            { type: "textMessage", text: "You approach the summoning stone",  },
            { type: "mintMenu",  },
            { type: "addStoryFlag", flag: this.storyFlag }
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