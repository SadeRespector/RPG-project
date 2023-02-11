import { functionButton } from "/functions.js";
import { TextMessage } from "/TextMessage.js";
import { Battle } from "/Battle/Battle.js";
import { utils } from "/utils.js";
import { TurnCycle } from "/Battle/TurnCycle.js";
import { PauseMenu } from "./PauseMenu.js";
import { CraftingMenu } from "./CraftingMenu.js";
import { MintMenu } from "./mintMenu.js";
import { Progress } from "./Progess.Js";
import { KeyboardMenu } from "/KeyboardMenu.js";
import { BreedingMenu } from "./Breedingmenu.js";


export class OverworldEvent {
  constructor({ map, event, progress}) {
    this.map = map;
    this.event = event;
    this.progress = progress
  }

  stand(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "stand",
      direction: this.event.direction,
      time: this.event.time
    })
    
    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonStandComplete", completeHandler)
  }

  walk(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: this.event.direction,
      retry: true
    })

    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonWalkingComplete", completeHandler)

  }

  textMessage(resolve) {

    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve()
    })
    message.init( document.querySelector(".game-container") )
  }

  changeMap(resolve) {

    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap( window.OverworldMaps[this.event.map], {
        x: this.event.x,
        y: this.event.y,
        direction: this.event.direction,
      });
      resolve();

      sceneTransition.fadeOut();

    })
  }
  changeMapLost() {

    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.progress = new Progress();
      const file = this.progress.getSaveFile();
      this.progress.load()
      console.log(file)
      this.map.overworld.startMap( window.OverworldMaps[file.mapId], {
        x: this.progress.startingHeroX,
        y: this.progress.startingHeroY,
        direction: this.progress.startingHeroDirection
      });
      location.reload()
      sceneTransition.fadeOut();

    })
  }
  

  battle(resolve) {
    
    const battle = new Battle({
      
      enemy: Enemies[this.event.enemyId],
      onComplete: (didWin) => {
        
        resolve(didWin ? "WON_BATTLE" : "LOST_BATTLE");
        
      }
    })
   
    battle.init(document.querySelector(".game-container"));
    

  }
  randomBattle(resolve) {
    if(utils.randomFromArray([true, false, false,false,false,false])){
      console.log("testing")
      const battle = new Battle({
        enemy: Enemies[this.event.enemyId],
        onComplete: (didWin) => {
          resolve(didWin ? "WON_BATTLE" : "LOST_BATTLE");
        }
      })
      battle.init(document.querySelector(".game-container"));
    }
    else{
      resolve()
    }
    

  }

  pause(resolve) {
    this.map.isPaused = true;
    const menu = new PauseMenu({
      progress: this.map.overworld.progress,
      onComplete: () => {
        resolve();
        this.map.isPaused = false;
        this.map.overworld.startGameLoop();
      }
    });
    menu.init(document.querySelector(".game-container"));
  }

  addStoryFlag(resolve) {
    window.playerState.storyFlags[this.event.flag] = true;
    resolve();
  }


  craftingMenu(resolve) {
    const menu = new CraftingMenu({
      pizzas: this.event.pizzas,
      onComplete: () => {
        resolve();
      }
    })
    menu.init(document.querySelector(".game-container"))
    
  }
  mintMenu(resolve) {
    const menu = new MintMenu({
      pizzas: this.event.pizzas,
      onComplete: () => {
        resolve();
      }
    })
    menu.init(document.querySelector(".game-container"))
    
  }
  breedMenu(resolve) {
    const menu = new BreedingMenu({
      pizzas: this.event.pizzas,
      onComplete: () => {
        resolve();
      }
    })
    menu.init(document.querySelector(".game-container"))
    
  }
  

  init() {
    return new Promise(resolve => {
      this[this.event.type](resolve)      
    })
  }

}
export async function checkParty(){
  console.log(playerState.pizzas[playerState.lineup[0]].hp)
  if(playerState.pizzas[playerState.lineup[0]].hp <= 0){
    const lastmember = playerState.lineup.length - 1
    
    
      playerState.moveToFront(playerState.lineup[lastmember])
  }
}