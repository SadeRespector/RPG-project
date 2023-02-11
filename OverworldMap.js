import { OverworldEvent } from "/OverworldEvent.js"
import {Person} from "/Person.js"
import {utils} from "/utils.js"
import { PizzaStone } from "./PizzaStone.js";
import { MintStone } from "./MintStone.js";
import { collisions } from "./collisions.js";
import { Progress } from "./Progess.Js";
import { checkParty } from "./OverworldEvent.js";
import { MoveTutor } from "./MoveTutor.js";
import { Breeder } from "./Breeder.js";


export class OverworldMap {
  constructor(config, progress ) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};
    this.randomBattle = config.randomBattle || {}

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.isPaused = false;
    this.progress = progress
    
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
      )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  } 
  

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }
  isSpaceRandomBattle(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    return this.randomBattle[`${x},${y}`] || false;
    
  }
  startRandomBattle(){
    if (state.map.isSpaceRandomBattle(this.x, this.y, this.direction)){
      console.log("true")
    }
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {

      let object = this.gameObjects[key];
      object.id = key;

      //TODO: determine if this object should actually mount
      object.mount(this);

    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      const result = await eventHandler.init();
      if (result === "LOST_BATTLE") {
       console.log("lost bitch")
       checkParty()
      }
      
    }

    this.isCutscenePlaying = false;

    //Reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {

      const relevantScenario = match.talking.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }


  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
    if (!this.isCutscenePlaying && match ) {
      const relevantScenario = match.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })
      relevantScenario && this.startCutscene( relevantScenario.events )
      console.log(relevantScenario.events)
    }
  }

  addWall(x,y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x,y) {
    delete this.walls[`${x},${y}`]
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const {x,y} = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x,y);
  }
  addRandomBattle(x,y) {
    this.randomBattle[`${x},${y}`] = true;
  }

}




window.OverworldMaps = {
  
  DemoRoom: {
    id: "DemoRoom",
    lowerSrc: "/images/maps/DemoLower.png",
    upperSrc: "/images/maps/DemoUpper.png",
    gameObjects: {
      hero: new Person({
        
        isPlayerControlled: true,
        x: utils.withGrid(6),
        y: utils.withGrid(7),
      }),
      Beth: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand",  direction: "left", time: 800 },
          { type: "stand",  direction: "up", time: 800 },
          { type: "stand",  direction: "right", time: 1200 },
          { type: "stand",  direction: "up", time: 300 },
        ],
        talking: [
          
          {
            events: [
              { type: "addStoryFlag", flag: "TALKED_TO_ERIO"},
              { type: "textMessage", text: "I'm going to crush you!", faceHero: "Beth" },
              { type: "battle", enemyId: "beth" },
              
              { type: "textMessage", text: "You crushed me like weak pepper.", faceHero: "Beth" },
              // { type: "textMessage", text: "Go away!"},
              //{ who: "hero", type: "walk",  direction: "up" },
            ]
          }
        ]
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/images/characters/people/erio.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Bahaha!", faceHero: "npcB" },
              { type: "addStoryFlag", flag: "TALKED_TO_ERIO"},
              //{ type: "battle", enemyId: "erio" }
            ]
          }
        ]
       
      }),
    
    },
     walls: {
       [utils.asGridCoord(7,6)] : true,
       [utils.asGridCoord(8,6)] : true,
       [utils.asGridCoord(7,7)] : true,
       [utils.asGridCoord(8,7)] : true,
     },
    randomBattle: {
      [utils.asGridCoord(7,6)] : true,
      [utils.asGridCoord(8,6)] : true,
      [utils.asGridCoord(7,7)] : true,
      [utils.asGridCoord(8,7)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,9)]:[{
        required: ["HAVESEEN"],
        events: [
          
          
        ]},
        {events: [
          { who: "Beth", type: "walk",  direction: "left" },
          { who: "hero", type: "stand",  direction: "right" },
          { type: "textMessage", text:"Hey Welcome to the Demo!"},
          { type: "textMessage", text:"You're probably wondering what to do right now."},
          { type: "textMessage", text:"Just head outside and talk to the guy outside the house"},
          { type: "textMessage", text:"Good luck"},
          { who: "Beth", type: "walk",  direction: "right" },
          { type: "addStoryFlag", flag: "HAVESEEN"}
          
        ]
      }],
      
      [utils.asGridCoord(7,4)]: [
        {
          
          events: [
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "stand",  direction: "up", time: 500 },
            { type: "textMessage", text:"You can't be in there!"},
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
            { type: "addStoryFlag", flag: "HAVESEEN"}
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          required: ["HAVESEEN"],
          events: [
            
            { 
              type: "changeMap", 
              map: "pallettown",
              x: utils.withGrid(6), 
              y: utils.withGrid(11), 
              direction: "down"
            }
          ]
        }
      ],
      
      [utils.asGridCoord(7,6)]: [
        {
          events: [
            
            { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
          ]
        }
      ]
    }
    
  },
  
  
 
  pallettown: {
    id: "pallettown",
    lowerSrc: "/images/maps/pallettownLower.png",
    upperSrc: "/images/maps/pallettowntop.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(0),
        y: utils.withGrid(0),
      }),
      npcB:new Person( {
        
        x: utils.withGrid(9),
        y: utils.withGrid(11),
        direction: "down",
        src: "/images/characters/people/npc7.png",
        talking: [
          {
            required: ["USED_PIZZA_STONE"],
            events: [
              { type: "textMessage", text: "Well look at that.",faceHero: "npcB"},
              { type: "textMessage", text: "You got yourself your own Guy",faceHero: "npcB"},
              { type: "textMessage", text: "I hope the professor didn't try anything funny",faceHero: "npcB"},
              { type: "textMessage", text: "He's not exactly Sober these days...",faceHero: "npcB"},
            ]
          },
          
          {
             
            events: [
              { type: "textMessage", text: "Hey Kid, nice to meet ya. I'm CockRoach",faceHero: "npcB"},
              { type: "textMessage", text: "But you can call me Roach.",faceHero: "npcB"},
              { type: "textMessage", text: "You don't look like you're from around here...",faceHero: "npcB"},
              { type: "textMessage", text: "And it looks like you ain't got a Guy.",faceHero: "npcB"},
              { type: "textMessage", text: "That's a big problem Kid.",faceHero: "npcB"},
              { type: "textMessage", text: " This world Ain't safe without a Guy.",faceHero: "npcB"},
              { type: "textMessage", text: " But I'm a nice Bug, so I'll help you out",faceHero: "npcB"},
              { type: "textMessage", text: "Head down to the Lab, the yellow building",faceHero: "npcB"},
              { type: "textMessage", text: " There's a professor there, real nutjob.",faceHero: "npcB"},
              { type: "textMessage", text: " But he's good people, He can get you a Guy",faceHero: "npcB"},
              
            ]
          },
          
          
        ]
      }),
      npcC:new Person( {
        
        x: utils.withGrid(12),
        y: utils.withGrid(4),
        direction: "down",
        src: "/images/spriteSheetBlack.png",
        talking: [
          {
            required: ["USED_PIZZA_STONE"],
            events: [
              { type: "textMessage", text: "I will shoot your dog if you don't keep moving",faceHero: "npcC"},
             
              
            ]
          },
          {
             
            events: [
              { type: "textMessage", text: "HEY!!, You need a guy to get past here!",faceHero: "npcC"},
              { type: "textMessage", text: "You see, I'm a COP, a HERO, a PROTECTOR.",faceHero: "npcC"},
              { type: "textMessage", text: "Beyond this door is a route infested with",faceHero: "npcC"},
              { type: "textMessage", text: "wild, guys and hooligans just itching to pounce.",faceHero: "npcC"},
              { type: "textMessage", text: "So unless you got a Guy, BEAT IT! ",faceHero: "npcC"},
              { type: "textMessage", text: "You're lucky I don't take you to jail right now for",faceHero: "npcC"},
              { type: "textMessage", text: "even THINKING about challenging me",faceHero: "npcC"},
              { type: "textMessage", text: "*The cop draws his weapon and starts breathing heavily",faceHero: "npcC"},
              { type: "textMessage", text: "YOU'VE got 10 SECOND TO MOVE!!",faceHero: "npcC"},
              { type: "textMessage", text: "5, 4, 3,....",faceHero: "npcC"},
              { type: "textMessage", text: "DISPATCH I NEED BACK UP!!!",faceHero: "npcC"},
              { type: "textMessage", text: "THIS ISN'T A PROMISE IT'S A THREAT!!",faceHero: "npcC"},
              { type: "textMessage", text: "PUT YOUR HANDS BEHIND YOUR BACK AND CRAWL TOWARDS ME!",faceHero: "npcC"},
              { type: "textMessage", text: "*You notice his weapon is a toy and this man*",faceHero: "npcC"},
              { type: "textMessage", text: "*may not really be who he says he is*",faceHero: "npcC"},
            ]
          },
          
          
        ]
      }),
      
      
    },
    
    cutsceneSpaces: {
      
     
      [utils.asGridCoord(6,11)]: [
        {
          
          events: [
            { 
              type: "changeMap",
              map: "DemoRoom",
              x: utils.withGrid(5),
              y: utils.withGrid(10), 
              direction: "up"
            },
           
          ]
        }
      ],
      [utils.asGridCoord(16,17)]: [
        {
          events: [
            { 
              type: "changeMap",
              map: "lab",
              x: utils.withGrid(6),
              y: utils.withGrid(12), 
              direction: "up"
            },
           
          ]
        }
      ],
      [utils.asGridCoord(22,29)]: [
        {
          events: [
            { 
              type: "changeMap",
              map: "pallettowncave",
              x: utils.withGrid(8),
              y: utils.withGrid(17), 
              direction: "up"
            },
           
          ]
        }
      ],
      [utils.asGridCoord(12,4)]:[ {
        events: [
          { 
            type: "changeMap",
            map: "forrest",
            x: utils.withGrid(14),
            y: utils.withGrid(18), 
            direction: "up"
          },
         
        ]
      }],
      [utils.asGridCoord(12,5)]:[
        
        {required: ["USED_PIZZA_STONE"],
        events: [

          { who: "npcC", type: "walk",  direction: "right" },
          { type: "addStoryFlag", flag: "TalkedToCop"}
        
      ]},
        {
          required: ["talkedtoProf2"],
          events: [
            { type: "textMessage", text: "Looks like you've obtained a Guy. Good work citizen",faceHero: "npcC"},
            { who: "npcC", type: "walk",  direction: "right" },
            { type: "addStoryFlag", flag: "TalkedToCop"}
            
          ]
        },
      ]
    },
    walls:{
      //pallet town perimeter walls
      [utils.asGridCoord(1,4)]: true,
      [utils.asGridCoord(1,5)]: true,
      [utils.asGridCoord(1,6)]: true,
      [utils.asGridCoord(1,7)]: true,
      [utils.asGridCoord(1,8)]: true,
      [utils.asGridCoord(1,9)]: true,
      [utils.asGridCoord(1,10)]: true,
      [utils.asGridCoord(1,11)]: true,
      [utils.asGridCoord(1,12)]: true,
      [utils.asGridCoord(1,13)]: true,
      [utils.asGridCoord(1,14)]: true,
      [utils.asGridCoord(1,15)]: true,
      [utils.asGridCoord(1,16)]: true,
      [utils.asGridCoord(1,17)]: true,
      [utils.asGridCoord(1,18)]: true,
      [utils.asGridCoord(1,19)]: true,
      [utils.asGridCoord(1,20)]: true,
      [utils.asGridCoord(1,21)]: true,
      [utils.asGridCoord(1,22)]: true,
      [utils.asGridCoord(2,4)]: true,
      [utils.asGridCoord(3,4)]: true,
      [utils.asGridCoord(4,4)]: true,
      [utils.asGridCoord(5,4)]: true,
      [utils.asGridCoord(6,4)]: true,
      [utils.asGridCoord(7,4)]: true,
      [utils.asGridCoord(8,4)]: true,
      [utils.asGridCoord(9,4)]: true,
      [utils.asGridCoord(10,4)]: true,
      [utils.asGridCoord(11,4)]: true,
      [utils.asGridCoord(11,3)]: true,
      [utils.asGridCoord(11,2)]: true,
      [utils.asGridCoord(11,1)]: true,
      [utils.asGridCoord(2,1)]: true,
      [utils.asGridCoord(3,1)]: true,
      [utils.asGridCoord(4,1)]: true,
      [utils.asGridCoord(5,1)]: true,
      [utils.asGridCoord(6,1)]: true,
      [utils.asGridCoord(7,1)]: true,
      [utils.asGridCoord(8,1)]: true,
      [utils.asGridCoord(9,1)]: true,
      [utils.asGridCoord(10,1)]: true,
      [utils.asGridCoord(11,1)]: true,
      [utils.asGridCoord(1,0)]: true,
      [utils.asGridCoord(14,4)]: true,
      [utils.asGridCoord(14,3)]: true,
      [utils.asGridCoord(14,2)]: true,
      [utils.asGridCoord(14,1)]: true,
      [utils.asGridCoord(15,1)]: true,
      [utils.asGridCoord(16,1)]: true,
      [utils.asGridCoord(17,1)]: true,
      [utils.asGridCoord(18,1)]: true,
      [utils.asGridCoord(19,1)]: true,
      [utils.asGridCoord(20,1)]: true,
      [utils.asGridCoord(21,1)]: true,
      [utils.asGridCoord(21,4)]: true,
      [utils.asGridCoord(20,4)]: true,
      [utils.asGridCoord(19,4)]: true,
      [utils.asGridCoord(18,4)]: true,
      [utils.asGridCoord(17,4)]: true,
      [utils.asGridCoord(16,4)]: true,
      [utils.asGridCoord(15,4)]: true,
      [utils.asGridCoord(22,4)]: true,
      [utils.asGridCoord(22,5)]: true,
      [utils.asGridCoord(22,6)]: true,
      [utils.asGridCoord(22,7)]: true,
      [utils.asGridCoord(22,8)]: true,
      [utils.asGridCoord(22,9)]: true,
      [utils.asGridCoord(22,10)]: true,
      [utils.asGridCoord(22,11)]: true,
      [utils.asGridCoord(22,12)]: true,
      [utils.asGridCoord(22,13)]: true,
      [utils.asGridCoord(22,14)]: true,
      [utils.asGridCoord(22,15)]: true,
      [utils.asGridCoord(22,16)]: true,
      [utils.asGridCoord(22,17)]: true,
      [utils.asGridCoord(22,18)]: true,
      [utils.asGridCoord(22,19)]: true,
      [utils.asGridCoord(22,20)]: true,
      [utils.asGridCoord(22,21)]: true,
      [utils.asGridCoord(22,22)]: true,
      [utils.asGridCoord(0,22)]: true,
      [utils.asGridCoord(1,22)]: true,
      [utils.asGridCoord(2,22)]: true,
      [utils.asGridCoord(3,22)]: true,
      [utils.asGridCoord(4,22)]: true,
      [utils.asGridCoord(5,22)]: true,
      [utils.asGridCoord(6,22)]: true,
      [utils.asGridCoord(7,22)]: true,
      [utils.asGridCoord(7,23)]: true,
      [utils.asGridCoord(7,24)]: true,
      [utils.asGridCoord(7,25)]: true,
      [utils.asGridCoord(7,26)]: true,
      [utils.asGridCoord(7,27)]: true,
      [utils.asGridCoord(7,28)]: true,
      [utils.asGridCoord(7,29)]: true,
      [utils.asGridCoord(7,30)]: true,
      [utils.asGridCoord(7,31)]: true,
      [utils.asGridCoord(7,32)]: true,
      //fence bottom map
      [utils.asGridCoord(8,33)]: true,
      [utils.asGridCoord(9,33)]: true,
      [utils.asGridCoord(10,33)]: true,
      [utils.asGridCoord(11,33)]: true,
      [utils.asGridCoord(12,33)]: true,
      [utils.asGridCoord(13,33)]: true,
      //wall trees right of fence
      [utils.asGridCoord(14,33)]: true,
      [utils.asGridCoord(14,32)]: true,
      [utils.asGridCoord(14,31)]: true,
      [utils.asGridCoord(14,30)]: true,
      [utils.asGridCoord(15,30)]: true,
      [utils.asGridCoord(16,30)]: true,
      [utils.asGridCoord(17,30)]: true,
      [utils.asGridCoord(18,30)]: true,
      [utils.asGridCoord(19,30)]: true,
      [utils.asGridCoord(19,31)]: true,
      [utils.asGridCoord(19,32)]: true,
      [utils.asGridCoord(19,33)]: true,
      [utils.asGridCoord(20,34)]: true,
      [utils.asGridCoord(21,34)]: true,
      [utils.asGridCoord(22,34)]: true,
      [utils.asGridCoord(23,34)]: true,
      [utils.asGridCoord(24,34)]: true,
      [utils.asGridCoord(25,34)]: true,
      [utils.asGridCoord(25,35)]: true,
      [utils.asGridCoord(25,36)]: true,
      [utils.asGridCoord(25,37)]: true,
      [utils.asGridCoord(25,38)]: true,
      [utils.asGridCoord(25,39)]: true,
      [utils.asGridCoord(25,39)]: true,
      [utils.asGridCoord(26,39)]: true,
      [utils.asGridCoord(27,39)]: true,
      [utils.asGridCoord(28,39)]: true,
      [utils.asGridCoord(29,29)]: true,
      [utils.asGridCoord(29,30)]: true,
      [utils.asGridCoord(29,31)]: true,
      [utils.asGridCoord(29,32)]: true,
      [utils.asGridCoord(29,33)]: true,
      [utils.asGridCoord(29,34)]: true,
      [utils.asGridCoord(29,35)]: true,
      [utils.asGridCoord(29,36)]: true,
      [utils.asGridCoord(29,37)]: true,
      [utils.asGridCoord(29,38)]: true,
      [utils.asGridCoord(29,39)]: true,
      [utils.asGridCoord(26,29)]: true,
      [utils.asGridCoord(27,39)]: true,
      [utils.asGridCoord(28,39)]: true,
      [utils.asGridCoord(29,39)]: true,
      [utils.asGridCoord(14,28)]: true,
      [utils.asGridCoord(15,28)]: true,
      [utils.asGridCoord(16,28)]: true,
      [utils.asGridCoord(17,28)]: true,
      [utils.asGridCoord(18,28)]: true,
      [utils.asGridCoord(19,28)]: true,
      [utils.asGridCoord(20,28)]: true,
      [utils.asGridCoord(21,28)]: true,
      [utils.asGridCoord(22,28)]: true,
      [utils.asGridCoord(23,28)]: true,
      [utils.asGridCoord(24,28)]: true,
      [utils.asGridCoord(25,28)]: true,
      [utils.asGridCoord(14,22)]: true,
      [utils.asGridCoord(14,23)]: true,
      [utils.asGridCoord(14,24)]: true,
      [utils.asGridCoord(14,25)]: true,
      [utils.asGridCoord(14,26)]: true,
      [utils.asGridCoord(14,27)]: true,
      [utils.asGridCoord(15,22)]: true,
      [utils.asGridCoord(16,22)]: true,
      [utils.asGridCoord(17,22)]: true,
      [utils.asGridCoord(18,22)]: true,
      [utils.asGridCoord(19,22)]: true,
      [utils.asGridCoord(20,22)]: true,
      [utils.asGridCoord(21,22)]: true,







      [utils.asGridCoord(21,0)]: true,
      //house top left
      [utils.asGridCoord(4,10)]: true,
      [utils.asGridCoord(5,10)]: true,
      [utils.asGridCoord(5,9)]: true,
      [utils.asGridCoord(5,8)]: true,
      [utils.asGridCoord(5,7)]: true,
      [utils.asGridCoord(6,10)]: true,
      [utils.asGridCoord(7,10)]: true,
      [utils.asGridCoord(8,10)]: true,
      [utils.asGridCoord(9,10)]: true,
      [utils.asGridCoord(9,9)]: true,
      [utils.asGridCoord(9,8)]: true,
      [utils.asGridCoord(9,7)]: true,
      [utils.asGridCoord(6,7)]: true,
      [utils.asGridCoord(7,7)]: true,
      [utils.asGridCoord(8,7)]: true,
      //fence
      [utils.asGridCoord(5,14)]: true,
      [utils.asGridCoord(6,14)]: true,
      [utils.asGridCoord(7,14)]: true,
      [utils.asGridCoord(8,14)]: true,
      [utils.asGridCoord(9,14)]: true,
      //house top right
      [utils.asGridCoord(13,10)]: true,
      [utils.asGridCoord(14,10)]: true,
      [utils.asGridCoord(14,9)]: true,
      [utils.asGridCoord(14,8)]: true,
      [utils.asGridCoord(14,7)]: true,
      [utils.asGridCoord(15,10)]: true,
      [utils.asGridCoord(16,10)]: true,
      [utils.asGridCoord(17,10)]: true,
      [utils.asGridCoord(18,10)]: true,
      [utils.asGridCoord(18,9)]: true,
      [utils.asGridCoord(18,8)]: true,
      [utils.asGridCoord(18,7)]: true,
      [utils.asGridCoord(15,7)]: true,
      [utils.asGridCoord(16,7)]: true,
      [utils.asGridCoord(17,7)]: true,
      //small brown sign
      [utils.asGridCoord(5,17)]: true,
      //fence/lab
      [utils.asGridCoord(13,19)]: true,
      [utils.asGridCoord(14,19)]: true,
      [utils.asGridCoord(15,19)]: true,
      [utils.asGridCoord(16,19)]: true,
      [utils.asGridCoord(17,19)]: true,
      [utils.asGridCoord(18,19)]: true,
      //lab
      [utils.asGridCoord(13,13)]: true,
      [utils.asGridCoord(14,13)]: true,
      [utils.asGridCoord(15,13)]: true,
      [utils.asGridCoord(16,13)]: true,
      [utils.asGridCoord(17,13)]: true,
      [utils.asGridCoord(18,13)]: true,
      [utils.asGridCoord(19,13)]: true,
      [utils.asGridCoord(13,14)]: true,
      [utils.asGridCoord(13,15)]: true,
      [utils.asGridCoord(13,16)]: true,
      [utils.asGridCoord(14,16)]: true,
      [utils.asGridCoord(15,16)]: true,
      // [utils.asGridCoord(16,16)]: true, // door
      [utils.asGridCoord(17,16)]: true,
      [utils.asGridCoord(18,16)]: true,
      [utils.asGridCoord(19,16)]: true,
      [utils.asGridCoord(19,15)]: true,
      [utils.asGridCoord(19,13)]: true,
      [utils.asGridCoord(19,14)]: true,
      
    }

  },
  lab: {
    id: "lab",
    lowerSrc: "/images/pallettowninterior.png",
    upperSrc: "/images/maps/labtop.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(0),
        y: utils.withGrid(0),
      }),
      Professor:new Person( {
        
        x: utils.withGrid(6),
        y: utils.withGrid(4),
        direction: "down",
        src: "/images/characters/people/npc7.png",
        talking: [
         { required: ["talkedtoProf2"],
            events:[
              {type: "textMessage", text: "*the professor doesn't look right*",faceHero: "Professor"},
              {type: "textMessage", text: "*He's smells strongly of liquor and",faceHero: "Professor"},
              {type: "textMessage", text: "*the notes he's taking are mostly scribles of*",faceHero: "Professor"},
              {type: "textMessage", text: "*women in lewd positions*",faceHero: "Professor"},



            ]},
          {
            required: ["USED_PIZZA_STONE"],
            events:[{type: "textMessage", text: "Woah look at you're new guy!",faceHero: "Professor"},
            {type: "textMessage", text: "The stone kinda looked like a big piece of shit huh?",faceHero: "Professor"},
            {type: "textMessage", text: "Oh my assistant already said that?...",faceHero: "Professor"},
            {type: "textMessage", text: "Anyway, if you havent figured it out already you can",faceHero: "Professor"},
            {type: "textMessage", text: "press the ESC button and see your Guy",faceHero: "Professor"},
            {type: "textMessage", text: "On the Summary page you should see their Stats",faceHero: "Professor"},
            {type: "textMessage", text: "including thier type and move set aswell.",faceHero: "Professor"},
            {type: "textMessage", text: "I'm no expert in the art of Battles however,",faceHero: "Professor"},
            {type: "textMessage", text: "I just study the Summoning aspect of Guys",faceHero: "Professor"},
            {type: "textMessage", text: "If you want to learn more about Battling head north.",faceHero: "Professor"},
            {type: "textMessage", text: "There is a town there, with a well known Arena",faceHero: "Professor"},
            {type: "textMessage", text: "Maybe the Arena Master in that town can teach you",faceHero: "Professor"},
            {type: "textMessage", text: "Be careful though, the path there is infested with wild",faceHero: "Professor"},
            {type: "textMessage", text: "Guys. Guys with no owners who attack strangers.",faceHero: "Professor"},
            {type: "textMessage", text: "If your guy gets worn down in battle you'll be placed",faceHero: "Professor"},
            {type: "textMessage", text: "where you last saved your progress.",faceHero: "Professor"},
            {type: "textMessage", text: "All right! take care, come back to me some other time",faceHero: "Professor"},
            {type: "textMessage", text: "I might have a task you can do for me.",faceHero: "Professor"},
            { type: "addStoryFlag", flag: "talkedtoProf2"}

        ]},
          {
            required: ["talkedtoProf"], 
            events: [
              { type: "textMessage", text: "** The Professor is busy fiddling with a contraption **",faceHero: "Professor"},
            ]
          },
          {
             
            events: [
              { type: "textMessage", text: "I was expecting you!",faceHero: "Professor"},
              { type: "textMessage", text: "Roach gave me a call",faceHero: "Professor"},
              { type: "textMessage", text: "He said you might need a guy",faceHero: "Professor"},
              { type: "textMessage", text: "in this world, humans summon and keep Guys",faceHero: "Professor"},
              { type: "textMessage", text: "Some use these Guys to fight others for sport",faceHero: "Professor"},
              { type: "textMessage", text: "Others simply collect them for fun",faceHero: "Professor"},
              { type: "textMessage", text: "Some even breed them to create stronger Guys",faceHero: "Professor"},
              { type: "textMessage", text: "Guys are mysterious creatures that come from...",faceHero: "Professor"},
              { type: "textMessage", text: "portals scattered around the world",faceHero: "Professor"},
              
              { type: "textMessage", text: "I actually study these creatures for a living.",faceHero: "Professor"},
              { type: "textMessage", text: "In fact you're here just in time!",faceHero: "Professor"},
              { type: "textMessage", text: "We're going to perform a summon right now",faceHero: "Professor"},
              { type: "textMessage", text: "Head to the south of town",faceHero: "Professor"},
              { type: "textMessage", text: "there's a cave there where a portal just opened up",faceHero: "Professor"},
              { type: "textMessage", text: "Use the portal to summon a guy and come back to me",faceHero: "Professor"},
              { type: "addStoryFlag", flag: "talkedtoProf"}
            ]
          },
          
          
        ]
      }),
      
    },
    walls: {
      
      [utils.asGridCoord(-1,1)] : true,
      [utils.asGridCoord(-1,2)] : true,
      [utils.asGridCoord(-1,3)] : true,
      [utils.asGridCoord(-1,4)] : true,
      [utils.asGridCoord(-1,5)] : true,
      [utils.asGridCoord(-1,6)] : true,
      [utils.asGridCoord(-1,7)] : true,
      [utils.asGridCoord(-1,8)] : true,
      [utils.asGridCoord(-1,9)] : true,
      [utils.asGridCoord(-1,10)] : true,
      [utils.asGridCoord(-0,11)] : true,
      [utils.asGridCoord(0,12)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(1,8)] : true,
      [utils.asGridCoord(2,8)] : true,
      [utils.asGridCoord(3,8)] : true,
      [utils.asGridCoord(4,8)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(1,2)] : true,
      [utils.asGridCoord(2,2)] : true,
      [utils.asGridCoord(3,2)] : true,
      [utils.asGridCoord(4,2)] : true,
      [utils.asGridCoord(5,2)] : true,
      [utils.asGridCoord(6,1)] : true,
      [utils.asGridCoord(7,1)] : true,
      [utils.asGridCoord(8,1)] : true,
      [utils.asGridCoord(9,1)] : true,
      [utils.asGridCoord(10,1)] : true,
      [utils.asGridCoord(11,1)] : true,
      [utils.asGridCoord(12,1)] : true,
      [utils.asGridCoord(13,1)] : true,
      [utils.asGridCoord(13,2)] : true,
      [utils.asGridCoord(13,3)] : true,
      [utils.asGridCoord(13,4)] : true,
      [utils.asGridCoord(13,5)] : true,
      [utils.asGridCoord(13,6)] : true,
      [utils.asGridCoord(13,7)] : true,
      [utils.asGridCoord(13,8)] : true,
      [utils.asGridCoord(13,9)] : true,
      [utils.asGridCoord(13,10)] : true,
      [utils.asGridCoord(13,11)] : true,
      [utils.asGridCoord(13,12)] : true,
      [utils.asGridCoord(8,8)] : true,
      [utils.asGridCoord(9,8)] : true,
      [utils.asGridCoord(10,8)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(12,8)] : true,
      [utils.asGridCoord(8,4)] : true,
      [utils.asGridCoord(9,4)] : true,
      [utils.asGridCoord(10,4)] : true,
      [utils.asGridCoord(1,4)] : true,
      [utils.asGridCoord(1,5)] : true,
      [utils.asGridCoord(2,4)] : true,
      [utils.asGridCoord(2,5)] : true,
      [utils.asGridCoord(2,5)] : true,
      [utils.asGridCoord(12,12)] : true,
      [utils.asGridCoord(12,11)] : true,
      [utils.asGridCoord(0,13)] : true,
      [utils.asGridCoord(1,13)] : true,
      [utils.asGridCoord(2,13)] : true,
      [utils.asGridCoord(3,13)] : true,
      [utils.asGridCoord(4,13)] : true,
      [utils.asGridCoord(5,13)] : true,
      [utils.asGridCoord(6,13)] : true,
      [utils.asGridCoord(7,13)] : true,
      [utils.asGridCoord(8,13)] : true,
      [utils.asGridCoord(9,13)] : true,
      [utils.asGridCoord(10,13)] : true,
      [utils.asGridCoord(11,13)] : true,
      
      
      
    
    },
    
    cutsceneSpaces: {
      [utils.asGridCoord(6,12)]: [
        {
          events: [
            { 
              type: "changeMap",
              map: "pallettown",
              x: utils.withGrid(16),
              y: utils.withGrid(17), 
              direction: "down"
            }
          ]
        }
      ]
    }
  },
  pallettowncave:{
    id: "pallettowncave",
    lowerSrc: "/images/pallettowncavelower.png",
    upperSrc: "",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(0),
        y: utils.withGrid(0),
      }),
      npcB:new Person( {
        
        x: utils.withGrid(7),
        y: utils.withGrid(16),
        direction: "down",
        src: "/images/characters/people/npc7.png",
        talking: [
          {
            required: ["USED_PIZZA_STONE"],
            events:[{type: "textMessage", text: "You did it!",faceHero: "npcB"},
            {type: "textMessage", text: "The stone kinda looks like a big piece of shit huh?",faceHero: "npcB"}
            
            
            
            ]
          },
          {
            
            events: [
              { type: "textMessage", text: "*He's busy taking measurments of some kind*",faceHero: "npcB"},
            ]
          },
         
          
          
        ]
      }),
      mintStone: new MintStone({
        x: utils.withGrid(8),
        y: utils.withGrid(8),
       storyFlag: "USED_PIZZA_STONE"
      }),
     
      
      
      
     
      
  },
  
  cutsceneSpaces: {
    
    [utils.asGridCoord(8,16)]:[
      {
        required: ["TalkedToAssitant"],
        events:[
        
        
        
        ]
      },
      {events: [
        { who: "npcB", type: "stand",  direction: "right" },
        { who: "hero", type: "stand",  direction: "left" },
        { type: "textMessage", text: "Woah, glad you're here!",faceHero: "npcB"},
        { type: "textMessage", text: "This stone seems a bit unstable",faceHero: "npcB"},
        { type: "textMessage", text: "You can use it to summon a Guy, but hurry",faceHero: "npcB"},
        { type: "textMessage", text: "You're not going to be able to choose who",faceHero: "npcB"},
        { type: "textMessage", text: "You're able to summon.",faceHero: "npcB"},
        { type: "textMessage", text: "And how strong they are is random too",faceHero: "npcB"},
        { type: "textMessage", text: "You might get lucky and get someone strong",faceHero: "npcB"},
        { type: "textMessage", text: "But it's possible you get a really weak one too",faceHero: "npcB"},
        { type: "textMessage", text: "once you're done, come talk to me",faceHero: "npcB"},
        { type: "addStoryFlag", flag: "TalkedToAssitant"},
      ],
      
    }],
    [utils.asGridCoord(8,17)]:[ {
      events: [
        { 
          type: "changeMap",
          map: "pallettown",
          x: utils.withGrid(22),
          y: utils.withGrid(29), 
          direction: "down"
        },
       
      ]
    }],
    
  
  
}
},
forrest:{
  id: "forrest",
  lowerSrc: "/images/forrest.png",
  upperSrc: "/images/forresttop.png",
  gameObjects: {
    hero: new Person({
      isPlayerControlled: true,
      x: utils.withGrid(0),
      y: utils.withGrid(0),
    }),
   
    npcB:new Person( {
        
      x: utils.withGrid(14),
      y: utils.withGrid(15),
      direction: "down",
      src: "/images/characters/people/npc7.png",
      talking: [
        {
         
          events:[{type: "textMessage", text: "There's too many Guys here",faceHero: "npcB"},
          {type: "textMessage", text: "I can't make it through the forrest.",faceHero: "npcB"},
          {type: "textMessage", text: "My Guy is too weak... ",faceHero: "npcB"},
          {type: "textMessage", text: "If only I had a TM or more guys...",faceHero: "npcB"},
          
          
          
          ]
        },
        ]
    }),
    npcA:new Person( {
        
      x: utils.withGrid(9),
      y: utils.withGrid(11),
      direction: "right",
      src: "/images/characters/people/npc7.png",
      talking: [
        {
          required: ["beatnpcA"],
          events: [
            {type: "textMessage", text: "I guess you can...",faceHero: "npcA"},
            
          ]},
          
        {
          
          events: [
            
            {type: "textMessage", text: "You think you can just get past here?",faceHero: "npcA"},
            { type: "battle", enemyId: "beth" },
            { type: "addStoryFlag", flag: "beatnpcA"}
            
          ]
          
        },
        ]
    }),
    npcC:new Person( {
        
      x: utils.withGrid(35),
      y: utils.withGrid(5),
      direction: "down",
      src: "/images/characters/people/npc7.png",
      talking: [
        {
          required: ["beatnpcC"],
          events: [
            {type: "textMessage", text: "I have to keep training.",faceHero: "npcC"},
            
          ]},
          
        {
          
          events: [
            
            {type: "textMessage", text: "I trained real hard for this!",faceHero: "npcC"},
            { type: "battle", enemyId: "beth" },
            { type: "addStoryFlag", flag: "beatnpcC"}
            
          ]
          
        },
        ]
    }),
    npcD:new Person( {
        
      x: utils.withGrid(31),
      y: utils.withGrid(14),
      direction: "down",
      src: "/images/characters/people/npc7.png",
      talking: [
        
          
        {
          
          events: [
            
            {type: "textMessage", text: "People with weak guys come here.",faceHero: "npcD"},
            {type: "textMessage", text: "They're picking on other weaklings.",faceHero: "npcD"},
            {type: "textMessage", text: "But you can only get stronger by",faceHero: "npcD"},
            {type: "textMessage", text: "Facing stronger opponets.",faceHero: "npcD"},
          ]
          
        },
        ]
    }),
    npcE:new Person( {
        
      x: utils.withGrid(69),
      y: utils.withGrid(13),
      direction: "down",
      src: "/images/characters/people/npc7.png",
      talking: [ {
        required: ["beatnpcE"],
        events: [
          {type: "textMessage", text: "Nevermind... it's yours...",faceHero: "npcE"},
          
        ]},
        
          
        {
          
          events: [
            
        {type: "textMessage", text: "That Stone Belongs to ME!",faceHero: "npcE"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcE"}
           
            
          ]
          
        },
        ]
    }),
    npcF:new Person( {
        
      x: utils.withGrid(78),
      y: utils.withGrid(23),
      direction: "up",
      src: "/images/characters/people/npc7.png",
      talking: [
        
          
        {
          
          events: [
            
            {type: "textMessage", text: "I've been training all day",faceHero: "npcF"},
            {type: "textMessage", text: "but the only way to get EXP is at a dojo.",faceHero: "npcF"},
            {type: "textMessage", text: "Sometimes you can get TMs from people",faceHero: "npcF"},
            {type: "textMessage", text: "and you can use those to change your moves.",faceHero: "npcF"},
           
            
          ]
          
        },
        ]
    }),
    npcG:new Person( {
        
      x: utils.withGrid(109),
      y: utils.withGrid(8),
      direction: "right",
      src: "/images/characters/people/npc7.png",
      talking: [
        {
          required: ["beatnpcG"],
          events: [
            {type: "textMessage", text: "I have to keep training.",faceHero: "npcC"},
            
          ]},
          
        {
          
          events: [
            
            {type: "textMessage", text: "I trained real hard for this!",faceHero: "npcG"},
            { type: "battle", enemyId: "beth" },
            { type: "addStoryFlag", flag: "beatnpcG"}
            
          ]
          
        },
        ]
    }),
    npcH:new Person( {
        
      x: utils.withGrid(114),
      y: utils.withGrid(16),
      direction: "left",
      src: "/images/characters/people/npc7.png",
      talking: [{
        required: ["beatnpcH"],
        events: [
          {type: "textMessage", text: "My real name is Darryel.",faceHero: "npcC"},
          
        ]},
        
          
        {
          
          events: [
            
            {type: "textMessage", text: "My name is Mud",faceHero: "npcH"},
          { type: "battle", enemyId: "beth" },
          { type: "addStoryFlag", flag: "beatnpcH"}
           
            
          ]
          
        },
        ]
    }),



    mintStone: new MintStone({
      x: utils.withGrid(4),
      y: utils.withGrid(1),
     storyFlag: "2"
    }),
   
    mintStone3: new MintStone({
      x: utils.withGrid(57), 
      y: utils.withGrid(16),
      storyFlag: "3"
    }),
    mintStone4: new MintStone({
      x: utils.withGrid(38), 
      y: utils.withGrid(23),
      storyFlag: "4"
    }),
    mintStone5: new MintStone({
      x: utils.withGrid(41), 
      y: utils.withGrid(23),
      storyFlag: "5"
    }),
    mintStone6: new MintStone({
      x: utils.withGrid(64), 
      y: utils.withGrid(15),
      storyFlag: "6"
    }),
    mintStone7: new MintStone({
      x: utils.withGrid(70), 
      y: utils.withGrid(23),
      storyFlag: "7"
    }),
    mintStone8: new MintStone({
      x: utils.withGrid(104), 
      y: utils.withGrid(21),
      storyFlag: "8"
    }),
    
    
    
    

    
  },
  cutsceneSpaces: {
    [utils.asGridCoord(115,23)]:[ {
      events: [
        { 
          type: "changeMap",
          map: "arenatown",
          x: utils.withGrid(4),
          y: utils.withGrid(26), 
          direction: "right"
        },
       
      ]
    }],
    
    [utils.asGridCoord(14, 17)]:[{
      required: ["nothing"],
      events: [
        
        
      ]},
      {events: [
        { who: "npcB", type: "walk",  direction: "left" },
        { type: "addStoryFlag", flag: "nothing"}
        
        
      ]
    }],
    ///npcC battle
    [utils.asGridCoord(35, 7)]:[{
      required: ["beatnpcC"],
      events: [
        
        
      ]},
      {events: [
        { who: "npcC", type: "walk",  direction: "down" },
        { who: "hero", type: "stand",  direction: "up" },
        {type: "textMessage", text: "I trained real hard for this!",faceHero: "npcC"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcC"}
        
        
      ]
    }],
    [utils.asGridCoord(35, 8)]:[{
      required: ["beatnpcC"],
      events: [
        
        
      ]},
      {events: [
        { who: "npcC", type: "walk",  direction: "down" },
        { who: "npcC", type: "walk",  direction: "down" },
        { who: "hero", type: "stand",  direction: "up" },
        {type: "textMessage", text: "I trained real hard for this!",faceHero: "npcC"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcC"}
        
        
      ]
    }],
    [utils.asGridCoord(35, 9)]:[{
      required: ["beatnpcC"],
      events: [
        
        
      ]},
      {events: [
        { who: "npcC", type: "walk",  direction: "down" },
        { who: "npcC", type: "walk",  direction: "down" },
        { who: "npcC", type: "walk",  direction: "down" },
        { who: "hero", type: "stand",  direction: "up" },
        {type: "textMessage", text: "I trained real hard for this!",faceHero: "npcC"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcC"}
        
        
      ]
    }],
    
    
    [utils.asGridCoord(10, 11)]:[{
      required: ["beatnpcA"],
      events: [
        
        
      ]},
      {events: [
        { who: "hero", type: "stand",  direction: "left" },
        {type: "textMessage", text: "I HATE THE ANTI CHRIST!",faceHero: "npcA"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcA"}
        
      ],
      
    }],
    ///npcE battle
    [utils.asGridCoord(69, 14)]:[{
      required: ["beatnpcE"],
      events: [
        
        
      ]},
      {events: [
        
        { who: "hero", type: "stand",  direction: "up" },
        {type: "textMessage", text: "I HATE THE ANTI CHRIST!",faceHero: "npcE"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcE"}
        
      ],
      
    }],
    [utils.asGridCoord(69, 15)]:[{
      required: ["beatnpcE"],
      events: [
        
        
      ]},
      {events: [
        { who: "npcE", type: "walk",  direction: "down" },
        { who: "hero", type: "stand",  direction: "up" },
        {type: "textMessage", text: "I HATE THE ANTI CHRIST!",faceHero: "npcE"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcE"}
        
      ],
      
    }],
    [utils.asGridCoord(69, 16)]:[{
      required: ["beatnpcE"],
      events: [
        
        
      ]},
      {events: [
        { who: "npcE", type: "walk",  direction: "down" },
        { who: "npcE", type: "walk",  direction: "down" },
        { who: "hero", type: "stand",  direction: "up" },
        {type: "textMessage", text: "I HATE THE ANTI CHRIST!",faceHero: "npcE"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcE"}
        
      ],
      
    }],
    [utils.asGridCoord(69, 17)]:[{
      required: ["beatnpcE"],
      events: [
        
        
      ]},
      {events: [
        { who: "npcE", type: "walk",  direction: "down" },
        { who: "npcE", type: "walk",  direction: "down" },
        { who: "npcE", type: "walk",  direction: "down" },
        { who: "hero", type: "stand",  direction: "up" },
        {type: "textMessage", text: "I HATE THE ANTI CHRIST!",faceHero: "npcE"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcE"}
        
      ],
      
    }],
    ///npcG battle
    [utils.asGridCoord(110, 8)]:[{
      required: ["beatnpcG"],
      events: [
        
        
      ]},
      {events: [
        
        { who: "hero", type: "stand",  direction: "left" },
        {type: "textMessage", text: "My name is Kurt",faceHero: "npcG"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcG"}
        
      ],
      
    }],
    [utils.asGridCoord(111, 8)]:[{
      required: ["beatnpcG"],
      events: [
        
        
      ]},
      {events: [
        { who: "npcG", type: "walk",  direction: "right" },
        { who: "hero", type: "stand",  direction: "left" },
        {type: "textMessage", text: "My name is Kurt",faceHero: "npcG"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcG"}
        
      ],
      
    }],
    [utils.asGridCoord(112, 8)]:[{
      required: ["beatnpcG"],
      events: [
        
        
      ]},
      {events: [
        { who: "npcG", type: "walk",  direction: "right" },
        { who: "npcG", type: "walk",  direction: "right" },
        { who: "hero", type: "stand",  direction: "left" },
        {type: "textMessage", text: "My name is Kurt",faceHero: "npcG"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcG"}
        
      ],
      
    }],
    [utils.asGridCoord(113, 8)]:[{
      required: ["beatnpcG"],
      events: [
        
        
      ]},
      {events: [
        { who: "npcG", type: "walk",  direction: "right" },
        { who: "npcG", type: "walk",  direction: "right" },
        { who: "npcG", type: "walk",  direction: "right" },
        { who: "hero", type: "stand",  direction: "left" },
        {type: "textMessage", text: "My name is Kurt",faceHero: "npcG"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcG"}
        
      ],
      
    }],
    [utils.asGridCoord(114, 8)]:[{
      required: ["beatnpcG"],
      events: [
        
        
      ]},
      {events: [
        { who: "npcG", type: "walk",  direction: "right" },
        { who: "npcG", type: "walk",  direction: "right" },
        { who: "npcG", type: "walk",  direction: "right" },
        { who: "npcG", type: "walk",  direction: "right" },
        { who: "hero", type: "stand",  direction: "left" },
        {type: "textMessage", text: "My name is Kurt",faceHero: "npcG"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcG"}
        
      ],
      
    }],
    [utils.asGridCoord(113, 16)]:[{
      required: ["beatnpcH"],
      events: [
        
        
      ]},
      {events: [
        
        { who: "hero", type: "stand",  direction: "right" },
        {type: "textMessage", text: "My name is Mud",faceHero: "npcH"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcH"}
        
      ],
      
    }],
    [utils.asGridCoord(112, 16)]:[{
      required: ["beatnpcH"],
      events: [
        
        
      ]},
      {events: [
        { who: "npcH", type: "walk",  direction: "left" },
        { who: "hero", type: "stand",  direction: "right" },
        {type: "textMessage", text: "My name is Mud",faceHero: "npcH"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcH"}
        
      ],
      
    }],
    [utils.asGridCoord(111, 16)]:[{
      required: ["beatnpcH"],
      events: [
        
        
      ]},
      {events: [
        { who: "npcH", type: "walk",  direction: "left" },
        { who: "npcH", type: "walk",  direction: "left" },
        { who: "hero", type: "stand",  direction: "right" },
        {type: "textMessage", text: "My name is Mud",faceHero: "npcH"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcH"}
        
      ],
      
    }],
    [utils.asGridCoord(110, 16)]:[{
      required: ["beatnpcH"],
      events: [
        
        
      ]},
      {events: [
        { who: "npcH", type: "walk",  direction: "left" },
        { who: "npcH", type: "walk",  direction: "left" },
        { who: "npcH", type: "walk",  direction: "left" },
        { who: "hero", type: "stand",  direction: "right" },
        {type: "textMessage", text: "My name is Mud",faceHero: "npcH"},
        { type: "battle", enemyId: "beth" },
        { type: "addStoryFlag", flag: "beatnpcH"}
        
      ],
      
    }],
    ///Random battle spaces.
    [utils.asGridCoord(3,14)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(3,13)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(3,12)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(3,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(3,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(3,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(3,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(3,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(3,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(3,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(3,4)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(3,3)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(4,14)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(4,13)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(4,12)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(4,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(4,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(4,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(4,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(4,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(4,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(4,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(4,4)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(4,3)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(5,14)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(5,13)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(5,12)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(5,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(5,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(5,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(5,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(5,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(5,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(5,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(5,4)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(5,3)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(44,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(45,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(46,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(47,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(48,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(49,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(50,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(51,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(52,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(53,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(54,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(55,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(44,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(45,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(46,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(47,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(48,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(49,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(50,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(51,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(52,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(53,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(54,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(55,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(44,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(45,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(46,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(47,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(48,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(49,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(50,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(51,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(52,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(53,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(54,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(55,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(15,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(16,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(17,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(18,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(19,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(20,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(21,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(22,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(15,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(16,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(17,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(18,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(19,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(20,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(21,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(22,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(15,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(16,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(17,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(18,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(19,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(20,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(21,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(22,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(21,0)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(21,1)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(21,2)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(21,3)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(21,4)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(22,0)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(22,1)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(22,2)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(22,3)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(22,4)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(23,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(24,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(25,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(26,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(27,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(28,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(29,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(30,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(31,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(32,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(33,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(34,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(35,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(36,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(37,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(38,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(39,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(40,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(41,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(42,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(29,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(30,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(31,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(32,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(33,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(34,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(35,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(36,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(37,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(38,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(39,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(40,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(41,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(42,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(32,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(33,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(34,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(35,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(36,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(37,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(38,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(39,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(40,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(41,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(42,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    
    //
    [utils.asGridCoord(63,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(64,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(65,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(66,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(67,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(68,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(69,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(70,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(71,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(72,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(73,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(74,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(75,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(76,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(77,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(78,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(79,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(80,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(63,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(64,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(65,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(66,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(67,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(68,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(69,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(70,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(71,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(72,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(73,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(74,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(75,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(76,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(77,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(78,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(79,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(80,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(63,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(64,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(65,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(66,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(67,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(68,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(69,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(70,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(71,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(72,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(73,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(74,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(75,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(76,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(77,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(78,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(79,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(80,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(63,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(64,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(65,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(66,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(67,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(68,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(69,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(70,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(71,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(72,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(73,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(74,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(75,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(76,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(77,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(63,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(64,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(65,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(66,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(67,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(68,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(69,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(70,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(71,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(72,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(73,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(74,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(75,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(76,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(77,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(78,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(79,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(80,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(81,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(82,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(83,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(84,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(85,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(86,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(87,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(88,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(89,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(90,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(91,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(92,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(93,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(94,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(95,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(75,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(76,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(77,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(78,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(79,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(80,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(81,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(82,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(83,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(84,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(85,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(86,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(87,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(88,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(89,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(90,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(91,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(92,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(93,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(94,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(95,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(85,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(86,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(87,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(88,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(89,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(90,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(91,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(92,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(93,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],

    [utils.asGridCoord(80,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(81,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(82,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(83,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(84,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(85,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(86,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(87,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(88,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(89,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(90,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(91,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(92,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(93,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(94,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(95,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(96,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(97,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(98,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(99,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(100,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(101,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(102,21)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(80,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(81,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(82,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(83,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(84,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(85,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(86,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(87,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(88,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(89,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(90,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(91,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(92,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(93,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(94,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(95,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(96,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(97,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(98,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(99,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(100,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(101,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(102,22)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(109,4)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(109,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(109,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(109,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(109,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(109,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(109,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(109,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(109,12)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(109,13)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(109,14)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(109,4)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(109,4)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(110,4)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(110,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(110,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(110,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(110,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(110,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(110,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(110,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(110,12)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(110,13)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(110,14)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(110,4)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(111,4)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(111,4)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(111,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(111,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(111,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(111,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(111,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(111,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(111,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(111,12)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(111,13)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(111,14)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(111,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(111,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(111,17)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(112,4)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(112,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(112,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(112,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(112,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(112,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(112,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(112,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(112,12)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(112,13)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(112,14)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(112,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(112,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(112,17)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(113,4)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(113,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(113,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(113,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(113,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(113,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(113,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(113,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(113,12)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(113,13)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(113,14)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(113,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(113,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(113,17)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(114,4)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(114,5)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(114,6)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(114,7)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(114,8)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(114,9)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(114,10)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(114,11)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(114,12)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(114,13)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(114,14)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(114,15)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(114,16)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    [utils.asGridCoord(114,17)]: [
      {
        events: [
          
          { type: "randomBattle", enemyId: utils.randomFromArray(window.RandomEnemies) },
        ]
      }
    ],
    
    
    
    
    
    
    
    
    
    
    
    ///mapchange
    [utils.asGridCoord(14,19)]:[ {
      events: [
        { 
          type: "changeMap",
          map: "pallettown",
          x: utils.withGrid(12),
          y: utils.withGrid(5), 
          direction: "down"
        },
       
      ]
    }],


  },
  walls:{
    [utils.asGridCoord(2,0)]: true,
    [utils.asGridCoord(3,0)]: true,
    [utils.asGridCoord(4,0)]: true,
    [utils.asGridCoord(5,0)]: true,
    [utils.asGridCoord(6,0)]: true,
    [utils.asGridCoord(6,1)]: true,
    [utils.asGridCoord(6,2)]: true,
    [utils.asGridCoord(6,3)]: true,
    [utils.asGridCoord(6,4)]: true,
    [utils.asGridCoord(6,5)]: true,
    [utils.asGridCoord(6,6)]: true,
    [utils.asGridCoord(6,7)]: true,
    [utils.asGridCoord(6,8)]: true,
    [utils.asGridCoord(6,9)]: true,
    [utils.asGridCoord(6,10)]: true,
    [utils.asGridCoord(6,11)]: true,
    [utils.asGridCoord(6,12)]: true,
    [utils.asGridCoord(6,13)]: true,
    [utils.asGridCoord(6,14)]: true,
    [utils.asGridCoord(7,14)]: true,
    [utils.asGridCoord(8,14)]: true,
    [utils.asGridCoord(8,13)]: true,
    [utils.asGridCoord(8,12)]: true,
    [utils.asGridCoord(8,11)]: true,
    [utils.asGridCoord(8,10)]: true,
    [utils.asGridCoord(8,9)]: true,
    [utils.asGridCoord(8,8)]: true,
    [utils.asGridCoord(8,7)]: true,
    [utils.asGridCoord(8,6)]: true,
    [utils.asGridCoord(9,6)]: true,
    [utils.asGridCoord(10,6)]: true,
    [utils.asGridCoord(11,6)]: true,
    [utils.asGridCoord(12,6)]: true,
    [utils.asGridCoord(13,6)]: true,
    [utils.asGridCoord(14,6)]: true,
    [utils.asGridCoord(14,5)]: true,
    [utils.asGridCoord(14,4)]: true,
    [utils.asGridCoord(15,4)]: true,
    [utils.asGridCoord(16,4)]: true,
    [utils.asGridCoord(17,4)]: true,
    [utils.asGridCoord(18,4)]: true,
    [utils.asGridCoord(19,4)]: true,
    [utils.asGridCoord(20,4)]: true,
    [utils.asGridCoord(20,3)]: true,
    [utils.asGridCoord(20,2)]: true,
    [utils.asGridCoord(20,1)]: true,
    [utils.asGridCoord(20,0)]: true,
    [utils.asGridCoord(21,-1)]: true,
    [utils.asGridCoord(22,-1)]: true,
    [utils.asGridCoord(23,0)]: true,
    [utils.asGridCoord(23,1)]: true,
    [utils.asGridCoord(23,2)]: true,
    [utils.asGridCoord(23,3)]: true,
    [utils.asGridCoord(23,4)]: true,
    [utils.asGridCoord(23,5)]: true,
    [utils.asGridCoord(23,6)]: true,
    [utils.asGridCoord(24,6)]: true,
    [utils.asGridCoord(25,6)]: true,
    [utils.asGridCoord(26,6)]: true,
    [utils.asGridCoord(27,6)]: true,
    [utils.asGridCoord(28,6)]: true,
    [utils.asGridCoord(29,6)]: true,
    [utils.asGridCoord(30,6)]: true,
    [utils.asGridCoord(31,6)]: true,
    [utils.asGridCoord(32,6)]: true,
    [utils.asGridCoord(33,6)]: true,
    [utils.asGridCoord(34,6)]: true,
    [utils.asGridCoord(34,5)]: true,
    [utils.asGridCoord(35,4)]: true,
    [utils.asGridCoord(36,4)]: true,
    [utils.asGridCoord(37,4)]: true,
    [utils.asGridCoord(38,4)]: true,
    [utils.asGridCoord(39,4)]: true,
    [utils.asGridCoord(40,4)]: true,
    [utils.asGridCoord(41,4)]: true,
    [utils.asGridCoord(42,4)]: true,
    [utils.asGridCoord(43,4)]: true,
    [utils.asGridCoord(44,4)]: true,
    [utils.asGridCoord(45,4)]: true,
    [utils.asGridCoord(46,4)]: true,
    [utils.asGridCoord(47,4)]: true,
    [utils.asGridCoord(48,4)]: true,
    [utils.asGridCoord(49,4)]: true,
    [utils.asGridCoord(50,4)]: true,
    [utils.asGridCoord(51,4)]: true,
    [utils.asGridCoord(52,4)]: true,
    [utils.asGridCoord(53,4)]: true,
    [utils.asGridCoord(54,4)]: true,
    [utils.asGridCoord(55,4)]: true,
    [utils.asGridCoord(56,4)]: true,
    [utils.asGridCoord(57,4)]: true,
    [utils.asGridCoord(58,4)]: true,
    [utils.asGridCoord(59,4)]: true,
    [utils.asGridCoord(60,4)]: true,
    [utils.asGridCoord(61,4)]: true,
    [utils.asGridCoord(62,4)]: true,
    [utils.asGridCoord(63,4)]: true,
    [utils.asGridCoord(64,4)]: true,
    [utils.asGridCoord(65,4)]: true,
    [utils.asGridCoord(66,4)]: true,
    [utils.asGridCoord(67,4)]: true,
    [utils.asGridCoord(68,4)]: true,
    [utils.asGridCoord(69,4)]: true,
    [utils.asGridCoord(70,4)]: true,
    [utils.asGridCoord(70,3)]: true,
    [utils.asGridCoord(70,2)]: true,
    [utils.asGridCoord(71,2)]: true,
    [utils.asGridCoord(72,2)]: true,
    [utils.asGridCoord(73,2)]: true,
    [utils.asGridCoord(73,2)]: true,
    [utils.asGridCoord(73,1)]: true,
    [utils.asGridCoord(73,0)]: true,
    [utils.asGridCoord(74,-1)]: true,
    [utils.asGridCoord(75,-1)]: true,
    [utils.asGridCoord(76,-1)]: true,
    [utils.asGridCoord(77,-1)]: true,
    [utils.asGridCoord(78,-1)]: true,
    [utils.asGridCoord(79,-1)]: true,
    [utils.asGridCoord(80,-1)]: true,
    [utils.asGridCoord(81,-1)]: true,
    [utils.asGridCoord(82,-1)]: true,
    [utils.asGridCoord(83,-1)]: true,
    [utils.asGridCoord(84,-1)]: true,
    [utils.asGridCoord(85,-1)]: true,
    [utils.asGridCoord(86,-1)]: true,
    [utils.asGridCoord(87,-1)]: true,
    [utils.asGridCoord(88,-1)]: true,
    [utils.asGridCoord(89,-1)]: true,
    [utils.asGridCoord(90,-1)]: true,
    [utils.asGridCoord(91,-1)]: true,
    [utils.asGridCoord(92,-1)]: true,
    [utils.asGridCoord(93,-1)]: true,
    [utils.asGridCoord(94,-1)]: true,
    [utils.asGridCoord(95,-1)]: true,
    [utils.asGridCoord(96,-1)]: true,
    [utils.asGridCoord(97,-1)]: true,
    [utils.asGridCoord(98,-1)]: true,
    [utils.asGridCoord(99,-1)]: true,
    [utils.asGridCoord(100,-1)]: true,
    [utils.asGridCoord(101,-1)]: true,
    [utils.asGridCoord(102,-1)]: true,
    [utils.asGridCoord(103,-1)]: true,
    [utils.asGridCoord(104,-1)]: true,
    [utils.asGridCoord(105,-1)]: true,
    [utils.asGridCoord(106,-1)]: true,
    [utils.asGridCoord(107,-1)]: true,
    [utils.asGridCoord(108,-1)]: true,
    [utils.asGridCoord(109,-1)]: true,
    [utils.asGridCoord(110,-1)]: true,
    [utils.asGridCoord(111,-1)]: true,
    [utils.asGridCoord(112,-1)]: true,
    [utils.asGridCoord(113,-1)]: true,
    [utils.asGridCoord(114,-1)]: true,
    [utils.asGridCoord(115,0)]: true,
    [utils.asGridCoord(115,1)]: true,
    [utils.asGridCoord(115,2)]: true,
    [utils.asGridCoord(115,3)]: true,
    [utils.asGridCoord(115,4)]: true,
    [utils.asGridCoord(115,5)]: true,
    [utils.asGridCoord(115,6)]: true,
    [utils.asGridCoord(115,7)]: true,
    [utils.asGridCoord(115,8)]: true,
    [utils.asGridCoord(115,9)]: true,
    [utils.asGridCoord(115,10)]: true,
    [utils.asGridCoord(115,11)]: true,
    [utils.asGridCoord(115,12)]: true,
    [utils.asGridCoord(115,13)]: true,
    [utils.asGridCoord(115,14)]: true,
    [utils.asGridCoord(115,15)]: true,
    [utils.asGridCoord(115,16)]: true,
    [utils.asGridCoord(115,17)]: true,
    [utils.asGridCoord(115,18)]: true,
    [utils.asGridCoord(115,19)]: true,
    [utils.asGridCoord(115,20)]: true,
    [utils.asGridCoord(116,20)]: true,
    [utils.asGridCoord(116,21)]: true,
    [utils.asGridCoord(116,22)]: true,
    [utils.asGridCoord(116,23)]: true,
    [utils.asGridCoord(116,24)]: true,
    [utils.asGridCoord(114,25)]: true,
    [utils.asGridCoord(113,25)]: true,
    [utils.asGridCoord(112,25)]: true,
    [utils.asGridCoord(111,25)]: true,
    [utils.asGridCoord(110,25)]: true,
    [utils.asGridCoord(109,25)]: true,
    [utils.asGridCoord(108,24)]: true,
    [utils.asGridCoord(108,23)]: true,
    [utils.asGridCoord(108,22)]: true,
    [utils.asGridCoord(108,21)]: true,
    [utils.asGridCoord(108,20)]: true,
    [utils.asGridCoord(108,19)]: true,
    [utils.asGridCoord(108,18)]: true,
    [utils.asGridCoord(108,17)]: true,
    [utils.asGridCoord(108,16)]: true,
    [utils.asGridCoord(108,15)]: true,
    [utils.asGridCoord(108,14)]: true,
    [utils.asGridCoord(108,13)]: true,
    [utils.asGridCoord(108,12)]: true,
    [utils.asGridCoord(108,11)]: true,
    [utils.asGridCoord(108,10)]: true,
    [utils.asGridCoord(108,9)]: true,
    [utils.asGridCoord(108,8)]: true,
    [utils.asGridCoord(108,7)]: true,
    [utils.asGridCoord(108,6)]: true,
    [utils.asGridCoord(108,5)]: true,
    [utils.asGridCoord(107,5)]: true,
    [utils.asGridCoord(106,5)]: true,
    [utils.asGridCoord(106,6)]: true,
    [utils.asGridCoord(106,7)]: true,
    [utils.asGridCoord(106,8)]: true,
    [utils.asGridCoord(106,9)]: true,
    [utils.asGridCoord(106,10)]: true,
    [utils.asGridCoord(106,11)]: true,
    [utils.asGridCoord(106,12)]: true,
    [utils.asGridCoord(106,13)]: true,
    [utils.asGridCoord(106,14)]: true,
    [utils.asGridCoord(106,15)]: true,
    [utils.asGridCoord(106,16)]: true,
    [utils.asGridCoord(106,17)]: true,
    [utils.asGridCoord(106,18)]: true,
    [utils.asGridCoord(106,19)]: true,
    [utils.asGridCoord(106,20)]: true,
    [utils.asGridCoord(106,21)]: true,
    [utils.asGridCoord(106,22)]: true,
    [utils.asGridCoord(106,23)]: true,
    [utils.asGridCoord(105,23)]: true,
    [utils.asGridCoord(104,23)]: true,
    [utils.asGridCoord(103,23)]: true,
    [utils.asGridCoord(102,23)]: true,
    [utils.asGridCoord(101,23)]: true,
    [utils.asGridCoord(100,23)]: true,
    [utils.asGridCoord(99,23)]: true,
    [utils.asGridCoord(98,23)]: true,
    [utils.asGridCoord(97,23)]: true,
    [utils.asGridCoord(96,23)]: true,
    [utils.asGridCoord(95,23)]: true,
    [utils.asGridCoord(94,23)]: true,
    [utils.asGridCoord(93,23)]: true,
    [utils.asGridCoord(92,23)]: true,
    [utils.asGridCoord(91,23)]: true,
    [utils.asGridCoord(90,23)]: true,
    [utils.asGridCoord(89,23)]: true,
    [utils.asGridCoord(88,23)]: true,
    [utils.asGridCoord(87,23)]: true,
    [utils.asGridCoord(86,23)]: true,
    [utils.asGridCoord(85,23)]: true,
    [utils.asGridCoord(84,23)]: true,
    [utils.asGridCoord(83,23)]: true,
    [utils.asGridCoord(82,23)]: true,
    [utils.asGridCoord(81,23)]: true,
    [utils.asGridCoord(80,23)]: true,
    [utils.asGridCoord(79,23)]: true,
    [utils.asGridCoord(80,20)]: true,
    [utils.asGridCoord(81,20)]: true,
    [utils.asGridCoord(82,20)]: true,
    [utils.asGridCoord(83,20)]: true,
    [utils.asGridCoord(84,20)]: true,
    [utils.asGridCoord(85,20)]: true,
    [utils.asGridCoord(86,20)]: true,
    [utils.asGridCoord(87,20)]: true,
    [utils.asGridCoord(88,20)]: true,
    [utils.asGridCoord(89,20)]: true,
    [utils.asGridCoord(90,20)]: true,
    [utils.asGridCoord(91,20)]: true,
    [utils.asGridCoord(92,20)]: true,
    [utils.asGridCoord(93,20)]: true,
    [utils.asGridCoord(94,20)]: true,
    [utils.asGridCoord(95,20)]: true,
    [utils.asGridCoord(96,20)]: true,
    [utils.asGridCoord(97,20)]: true,
    [utils.asGridCoord(98,20)]: true,
    [utils.asGridCoord(99,20)]: true,
    [utils.asGridCoord(100,20)]: true,
    [utils.asGridCoord(101,20)]: true,
    [utils.asGridCoord(102,20)]: true,
    [utils.asGridCoord(103,20)]: true,
    [utils.asGridCoord(104,20)]: true,
    [utils.asGridCoord(105,20)]: true,
    [utils.asGridCoord(105,18)]: true,
    [utils.asGridCoord(104,18)]: true,
    [utils.asGridCoord(103,18)]: true,
    [utils.asGridCoord(102,18)]: true,
    [utils.asGridCoord(101,18)]: true,
    [utils.asGridCoord(100,18)]: true,
    [utils.asGridCoord(99,18)]: true,
    [utils.asGridCoord(98,18)]: true,
    [utils.asGridCoord(97,18)]: true,
    [utils.asGridCoord(96,18)]: true,
    [utils.asGridCoord(95,18)]: true,
    [utils.asGridCoord(94,18)]: true,
    [utils.asGridCoord(93,18)]: true,
    [utils.asGridCoord(92,18)]: true,
    [utils.asGridCoord(91,18)]: true,
    [utils.asGridCoord(90,18)]: true,
    [utils.asGridCoord(89,18)]: true,
    [utils.asGridCoord(88,18)]: true,
    [utils.asGridCoord(87,18)]: true,
    [utils.asGridCoord(86,18)]: true,
    [utils.asGridCoord(85,18)]: true,
    [utils.asGridCoord(84,18)]: true,
    [utils.asGridCoord(83,18)]: true,
    [utils.asGridCoord(82,18)]: true,
    [utils.asGridCoord(81,18)]: true,
    [utils.asGridCoord(80,18)]: true,
    [utils.asGridCoord(79,18)]: true,
    [utils.asGridCoord(79,19)]: true,
    [utils.asGridCoord(115,25)]: true,
    


    
   
    [utils.asGridCoord(2,1)]: true,
    [utils.asGridCoord(2,2)]: true,
    [utils.asGridCoord(2,3)]: true,
    [utils.asGridCoord(2,4)]: true,
    [utils.asGridCoord(2,5)]: true,
    [utils.asGridCoord(2,6)]: true,
    [utils.asGridCoord(2,7)]: true,
    [utils.asGridCoord(2,8)]: true,
    [utils.asGridCoord(2,9)]: true,
    [utils.asGridCoord(2,10)]: true,
    [utils.asGridCoord(2,11)]: true,
    [utils.asGridCoord(2,12)]: true,
    [utils.asGridCoord(2,13)]: true,
    [utils.asGridCoord(2,14)]: true,
    [utils.asGridCoord(2,15)]: true,
    [utils.asGridCoord(2,16)]: true,
    [utils.asGridCoord(2,17)]: true,
    [utils.asGridCoord(3,18)]: true,
    [utils.asGridCoord(4,18)]: true,
    [utils.asGridCoord(5,18)]: true,
    [utils.asGridCoord(6,18)]: true,
    [utils.asGridCoord(7,18)]: true,
    [utils.asGridCoord(8,18)]: true,
    [utils.asGridCoord(9,18)]: true,
    [utils.asGridCoord(10,18)]: true,
    [utils.asGridCoord(11,18)]: true,
    [utils.asGridCoord(17,19)]: true,
    [utils.asGridCoord(18,18)]: true,
    [utils.asGridCoord(19,18)]: true,
    [utils.asGridCoord(20,18)]: true,
    [utils.asGridCoord(21,18)]: true,
    [utils.asGridCoord(22,18)]: true,
    [utils.asGridCoord(23,18)]: true,
    [utils.asGridCoord(24,18)]: true,
    [utils.asGridCoord(25,18)]: true,
    [utils.asGridCoord(26,18)]: true,
    [utils.asGridCoord(27,18)]: true,
    [utils.asGridCoord(28,18)]: true,
    [utils.asGridCoord(29,18)]: true,
    [utils.asGridCoord(30,18)]: true,
    [utils.asGridCoord(31,18)]: true,
    [utils.asGridCoord(32,18)]: true,
    [utils.asGridCoord(33,18)]: true,
    [utils.asGridCoord(34,18)]: true,
    [utils.asGridCoord(35,18)]: true,
    [utils.asGridCoord(35,19)]: true,
    [utils.asGridCoord(35,20)]: true,
    [utils.asGridCoord(35,21)]: true,
    [utils.asGridCoord(35,22)]: true,
    [utils.asGridCoord(35,23)]: true,
    [utils.asGridCoord(35,24)]: true,
    [utils.asGridCoord(36,25)]: true,
    [utils.asGridCoord(37,25)]: true,
    [utils.asGridCoord(38,25)]: true,
    [utils.asGridCoord(39,25)]: true,
    [utils.asGridCoord(40,25)]: true,
    [utils.asGridCoord(41,25)]: true,
    [utils.asGridCoord(42,25)]: true,
    [utils.asGridCoord(43,25)]: true,
    [utils.asGridCoord(44,22)]: true,
    [utils.asGridCoord(44,21)]: true,
    [utils.asGridCoord(44,20)]: true,
    [utils.asGridCoord(44,19)]: true,
    [utils.asGridCoord(44,18)]: true,
    [utils.asGridCoord(45,18)]: true,
    [utils.asGridCoord(46,18)]: true,
    [utils.asGridCoord(47,18)]: true,
    [utils.asGridCoord(48,18)]: true,
    [utils.asGridCoord(49,18)]: true,
    [utils.asGridCoord(50,18)]: true,
    [utils.asGridCoord(51,18)]: true,
    [utils.asGridCoord(52,18)]: true,
    [utils.asGridCoord(53,18)]: true,
    [utils.asGridCoord(54,18)]: true,
    [utils.asGridCoord(55,18)]: true,
    [utils.asGridCoord(56,18)]: true,
    [utils.asGridCoord(57,18)]: true,
    [utils.asGridCoord(58,18)]: true,
    [utils.asGridCoord(59,17)]: true,
    [utils.asGridCoord(59,16)]: true,
    [utils.asGridCoord(59,15)]: true,
    [utils.asGridCoord(59,14)]: true,
    [utils.asGridCoord(59,13)]: true,
    [utils.asGridCoord(59,12)]: true,
    [utils.asGridCoord(58,14)]: true,
    [utils.asGridCoord(57,14)]: true,
    [utils.asGridCoord(56,14)]: true,
    [utils.asGridCoord(55,14)]: true,
    [utils.asGridCoord(54,14)]: true,
    [utils.asGridCoord(53,14)]: true,
    [utils.asGridCoord(52,14)]: true,
    [utils.asGridCoord(51,14)]: true,
    [utils.asGridCoord(50,14)]: true,
    [utils.asGridCoord(49,14)]: true,
    [utils.asGridCoord(48,14)]: true,
    [utils.asGridCoord(47,14)]: true,
    [utils.asGridCoord(46,14)]: true,
    [utils.asGridCoord(45,14)]: true,
    [utils.asGridCoord(44,14)]: true,
    [utils.asGridCoord(43,14)]: true,
    [utils.asGridCoord(42,14)]: true,
    [utils.asGridCoord(41,14)]: true,
    [utils.asGridCoord(40,14)]: true,
    [utils.asGridCoord(39,14)]: true,
    [utils.asGridCoord(38,14)]: true,
    [utils.asGridCoord(37,14)]: true,
    [utils.asGridCoord(36,14)]: true,
    [utils.asGridCoord(35,14)]: true,
    [utils.asGridCoord(34,14)]: true,
    [utils.asGridCoord(33,14)]: true,
    [utils.asGridCoord(32,14)]: true,
    [utils.asGridCoord(31,13)]: true,
    [utils.asGridCoord(30,13)]: true,
    [utils.asGridCoord(29,13)]: true,
    [utils.asGridCoord(28,12)]: true,
    [utils.asGridCoord(27,12)]: true,
    [utils.asGridCoord(26,12)]: true,
    [utils.asGridCoord(25,12)]: true,
    [utils.asGridCoord(24,12)]: true,
    [utils.asGridCoord(23,12)]: true,
    [utils.asGridCoord(22,12)]: true,
    [utils.asGridCoord(21,12)]: true,
    [utils.asGridCoord(20,12)]: true,
    [utils.asGridCoord(19,12)]: true,
    [utils.asGridCoord(18,12)]: true,
    [utils.asGridCoord(17,12)]: true,
    [utils.asGridCoord(16,12)]: true,
    [utils.asGridCoord(15,12)]: true,
    [utils.asGridCoord(14,12)]: true,
    [utils.asGridCoord(13,12)]: true,
    [utils.asGridCoord(12,12)]: true,
    [utils.asGridCoord(11,12)]: true,
    [utils.asGridCoord(11,11)]: true,
    [utils.asGridCoord(11,10)]: true,
    [utils.asGridCoord(11,9)]: true,
    [utils.asGridCoord(11,8)]: true,
    [utils.asGridCoord(12,8)]: true,
    [utils.asGridCoord(13,8)]: true,
    [utils.asGridCoord(14,8)]: true,
    [utils.asGridCoord(15,8)]: true,
    [utils.asGridCoord(16,8)]: true,
    [utils.asGridCoord(17,8)]: true,
    [utils.asGridCoord(18,8)]: true,
    [utils.asGridCoord(19,8)]: true,
    [utils.asGridCoord(20,8)]: true,
    [utils.asGridCoord(21,8)]: true,
    [utils.asGridCoord(22,8)]: true,
    [utils.asGridCoord(23,8)]: true,
    [utils.asGridCoord(24,8)]: true,
    [utils.asGridCoord(25,8)]: true,
    [utils.asGridCoord(26,8)]: true,
    [utils.asGridCoord(27,8)]: true,
    [utils.asGridCoord(28,8)]: true,
    [utils.asGridCoord(29,9)]: true,
    [utils.asGridCoord(30,9)]: true,
    [utils.asGridCoord(31,9)]: true,
    [utils.asGridCoord(32,10)]: true,
    [utils.asGridCoord(33,10)]: true,
    [utils.asGridCoord(34,10)]: true,
    [utils.asGridCoord(35,10)]: true,
    [utils.asGridCoord(36,10)]: true,
    [utils.asGridCoord(37,10)]: true,
    [utils.asGridCoord(38,10)]: true,
    [utils.asGridCoord(39,10)]: true,
    [utils.asGridCoord(40,10)]: true,
    [utils.asGridCoord(41,10)]: true,
    [utils.asGridCoord(42,10)]: true,
    [utils.asGridCoord(43,10)]: true,
    [utils.asGridCoord(44,10)]: true,
    [utils.asGridCoord(45,10)]: true,
    [utils.asGridCoord(46,10)]: true,
    [utils.asGridCoord(47,10)]: true,
    [utils.asGridCoord(48,10)]: true,
    [utils.asGridCoord(49,10)]: true,
    [utils.asGridCoord(50,10)]: true,
    [utils.asGridCoord(51,10)]: true,
    [utils.asGridCoord(52,10)]: true,
    [utils.asGridCoord(53,10)]: true,
    [utils.asGridCoord(54,10)]: true,
    [utils.asGridCoord(55,10)]: true,
    [utils.asGridCoord(56,10)]: true,
    [utils.asGridCoord(57,10)]: true,
    [utils.asGridCoord(58,10)]: true,
    [utils.asGridCoord(59,10)]: true,
    [utils.asGridCoord(60,10)]: true,
    [utils.asGridCoord(61,10)]: true,
    [utils.asGridCoord(62,10)]: true,
    [utils.asGridCoord(63,10)]: true,
    [utils.asGridCoord(64,10)]: true,
    [utils.asGridCoord(65,10)]: true,
    [utils.asGridCoord(66,10)]: true,
    [utils.asGridCoord(67,10)]: true,
    [utils.asGridCoord(68,10)]: true,
    [utils.asGridCoord(69,10)]: true,
    [utils.asGridCoord(70,10)]: true,
    [utils.asGridCoord(71,10)]: true,
    [utils.asGridCoord(72,10)]: true,
    [utils.asGridCoord(73,10)]: true,
    [utils.asGridCoord(73,11)]: true,
    [utils.asGridCoord(73,12)]: true,
    [utils.asGridCoord(72,12)]: true,
    [utils.asGridCoord(71,12)]: true,
    [utils.asGridCoord(70,12)]: true,
    [utils.asGridCoord(69,12)]: true,
    [utils.asGridCoord(68,12)]: true,
    [utils.asGridCoord(67,12)]: true,
    [utils.asGridCoord(66,12)]: true,
    [utils.asGridCoord(65,12)]: true,
    [utils.asGridCoord(64,12)]: true,
    [utils.asGridCoord(63,12)]: true,
    [utils.asGridCoord(62,12)]: true,
    [utils.asGridCoord(44,23)]: true,
    [utils.asGridCoord(44,24)]: true,
    [utils.asGridCoord(61,12)]: true,
    [utils.asGridCoord(61,13)]: true,
    [utils.asGridCoord(61,14)]: true,
    [utils.asGridCoord(61,15)]: true,
    [utils.asGridCoord(61,16)]: true,
    [utils.asGridCoord(61,17)]: true,
    [utils.asGridCoord(79,24)]: true,
    [utils.asGridCoord(79,20)]: true,
    [utils.asGridCoord(67,18)]: true,
    [utils.asGridCoord(66,18)]: true,
    [utils.asGridCoord(65,18)]: true,
    [utils.asGridCoord(64,18)]: true,
    [utils.asGridCoord(63,18)]: true,
    [utils.asGridCoord(62,18)]: true,
    [utils.asGridCoord(67,18)]: true,
    [utils.asGridCoord(67,19)]: true,
    [utils.asGridCoord(67,20)]: true,
    [utils.asGridCoord(67,21)]: true,
    [utils.asGridCoord(67,22)]: true,
    [utils.asGridCoord(67,23)]: true,
    [utils.asGridCoord(67,24)]: true,
    [utils.asGridCoord(68,25)]: true,
    [utils.asGridCoord(69,25)]: true,
    [utils.asGridCoord(70,25)]: true,
    [utils.asGridCoord(71,25)]: true,
    [utils.asGridCoord(72,25)]: true,
    [utils.asGridCoord(73,25)]: true,
    [utils.asGridCoord(74,25)]: true,
    [utils.asGridCoord(75,25)]: true,
    [utils.asGridCoord(76,25)]: true,
    [utils.asGridCoord(77,25)]: true,
    [utils.asGridCoord(78,25)]: true,
    [utils.asGridCoord(78,15)]: true,
    [utils.asGridCoord(79,15)]: true,
    [utils.asGridCoord(80,15)]: true,
    [utils.asGridCoord(78,13)]: true,
    [utils.asGridCoord(79,13)]: true,
    [utils.asGridCoord(80,13)]: true,
    [utils.asGridCoord(84,7)]: true,
    [utils.asGridCoord(85,7)]: true,
    [utils.asGridCoord(86,7)]: true,
    [utils.asGridCoord(84,5)]: true,
    [utils.asGridCoord(85,5)]: true,
    [utils.asGridCoord(86,5)]: true,
    [utils.asGridCoord(79,3)]: true,
    [utils.asGridCoord(80,3)]: true,
    [utils.asGridCoord(81,3)]: true,
    [utils.asGridCoord(79,2)]: true,
    [utils.asGridCoord(79,1)]: true,
    [utils.asGridCoord(80,1)]: true,
    [utils.asGridCoord(81,1)]: true,
    [utils.asGridCoord(81,2)]: true,
    [utils.asGridCoord(84,6)]: true,
    [utils.asGridCoord(86,6)]: true,
    [utils.asGridCoord(78,14)]: true,
    [utils.asGridCoord(80,14)]: true,




  }
  




},
arenatown: {
  id: "arenatown",
  lowerSrc: "/images/arenatown.png",
  upperSrc: "/images/arenatowntop.png",
  gameObjects: {
    hero: new Person({
      isPlayerControlled: true,
      x: utils.withGrid(0),
      y: utils.withGrid(0),
    }),
    npcB:new Person( {
        
      x: utils.withGrid(9),
      y: utils.withGrid(16),
      direction: "down",
      src: "/images/characters/people/npc7.png",
      talking: [
        {
         
          events:[{type: "textMessage", text: "There's too many Guys here",faceHero: "npcB"},
          {type: "textMessage", text: "I can't make it through the forrest.",faceHero: "npcB"},
          {type: "textMessage", text: "My Guy is too weak... ",faceHero: "npcB"},
          {type: "textMessage", text: "If only I had a TM or more guys...",faceHero: "npcB"},
          
          
          
          ]
        },
        ]
    }),
  
  
  
  
  
  
  
  
  },

  walls: {
      
    [utils.asGridCoord(1,3)] : true,
    [utils.asGridCoord(1,4)] : true,
    [utils.asGridCoord(1,5)] : true,
    [utils.asGridCoord(1,6)] : true,
    [utils.asGridCoord(1,7)] : true,
    [utils.asGridCoord(1,8)] : true,
    [utils.asGridCoord(1,9)] : true,
    [utils.asGridCoord(1,10)] : true,
    [utils.asGridCoord(1,11)] : true,
    [utils.asGridCoord(1,12)] : true,
    [utils.asGridCoord(1,13)] : true,
    [utils.asGridCoord(1,14)] : true,
    [utils.asGridCoord(1,15)] : true,
    [utils.asGridCoord(1,16)] : true,
    [utils.asGridCoord(1,17)] : true,
    [utils.asGridCoord(1,18)] : true,
    [utils.asGridCoord(1,19)] : true,
    [utils.asGridCoord(1,20)] : true,
    [utils.asGridCoord(1,21)] : true,
    [utils.asGridCoord(1,22)] : true,
    [utils.asGridCoord(2,23)] : true,
    [utils.asGridCoord(3,23)] : true,
    [utils.asGridCoord(4,23)] : true,
    [utils.asGridCoord(5,23)] : true,
    [utils.asGridCoord(3,27)] : true,
    [utils.asGridCoord(4,28)] : true,
    [utils.asGridCoord(5,28)] : true,
    [utils.asGridCoord(6,28)] : true,
    [utils.asGridCoord(7,28)] : true,
    [utils.asGridCoord(8,29)] : true,
    [utils.asGridCoord(8,29)] : true,
    [utils.asGridCoord(9,29)] : true,
    [utils.asGridCoord(10,29)] : true,
    [utils.asGridCoord(11,29)] : true,
    [utils.asGridCoord(12,29)] : true,
    [utils.asGridCoord(13,29)] : true,
    [utils.asGridCoord(14,29)] : true,
    [utils.asGridCoord(15,29)] : true,
    [utils.asGridCoord(16,29)] : true,
    [utils.asGridCoord(17,29)] : true,
    [utils.asGridCoord(18,29)] : true,
    [utils.asGridCoord(19,29)] : true,
    [utils.asGridCoord(20,29)] : true,
    [utils.asGridCoord(21,29)] : true,
    [utils.asGridCoord(22,29)] : true,
    [utils.asGridCoord(23,29)] : true,
    [utils.asGridCoord(24,29)] : true,
    [utils.asGridCoord(25,29)] : true,
    [utils.asGridCoord(26,29)] : true,
    //
    [utils.asGridCoord(27,8)] : true,
    [utils.asGridCoord(27,9)] : true,
    [utils.asGridCoord(27,10)] : true,
    [utils.asGridCoord(27,11)] : true,
    [utils.asGridCoord(27,12)] : true,
    [utils.asGridCoord(27,13)] : true,
    [utils.asGridCoord(27,14)] : true,
    [utils.asGridCoord(27,15)] : true,
    [utils.asGridCoord(27,16)] : true,
    [utils.asGridCoord(27,17)] : true,
    [utils.asGridCoord(27,18)] : true,
    [utils.asGridCoord(27,19)] : true,
    [utils.asGridCoord(27,20)] : true,
    [utils.asGridCoord(27,21)] : true,
    [utils.asGridCoord(27,22)] : true,
    [utils.asGridCoord(27,23)] : true,
    [utils.asGridCoord(27,24)] : true,
    [utils.asGridCoord(27,25)] : true,
    [utils.asGridCoord(27,26)] : true,
    [utils.asGridCoord(27,27)] : true,
    [utils.asGridCoord(27,28)] : true,
    [utils.asGridCoord(27,29)] : true,
    [utils.asGridCoord(26,6)] : true,
    [utils.asGridCoord(25,5)] : true,
    [utils.asGridCoord(24,5)] : true,
    [utils.asGridCoord(23,5)] : true,
    [utils.asGridCoord(22,5)] : true,
    [utils.asGridCoord(21,5)] : true,
    [utils.asGridCoord(20,5)] : true,
    [utils.asGridCoord(19,5)] : true,
    [utils.asGridCoord(18,5)] : true,
    [utils.asGridCoord(18,4)] : true,
    [utils.asGridCoord(18,3)] : true,
    [utils.asGridCoord(2,2)] : true,
    [utils.asGridCoord(3,2)] : true,
    [utils.asGridCoord(4,2)] : true,
    [utils.asGridCoord(5,2)] : true,
    [utils.asGridCoord(6,2)] : true,
    [utils.asGridCoord(7,2)] : true,
    [utils.asGridCoord(8,2)] : true,
    [utils.asGridCoord(9,2)] : true,
    [utils.asGridCoord(10,2)] : true,
    [utils.asGridCoord(11,2)] : true,
    [utils.asGridCoord(12,2)] : true,
    [utils.asGridCoord(13,2)] : true,
    [utils.asGridCoord(14,2)] : true,
    [utils.asGridCoord(15,2)] : true,
    [utils.asGridCoord(16,2)] : true,
    [utils.asGridCoord(17,2)] : true,
    [utils.asGridCoord(4,23)] : true,
    [utils.asGridCoord(5,23)] : true,
    [utils.asGridCoord(2,16)] : true,
    [utils.asGridCoord(3,16)] : true,
    [utils.asGridCoord(4,16)] : true,
    [utils.asGridCoord(5,16)] : true,
    [utils.asGridCoord(2,15)] : true,
    [utils.asGridCoord(3,15)] : true,
    [utils.asGridCoord(4,15)] : true,
    [utils.asGridCoord(2,14)] : true,
    [utils.asGridCoord(3,14)] : true,
    [utils.asGridCoord(4,14)] : true,
    [utils.asGridCoord(2,13)] : true,
    [utils.asGridCoord(3,13)] : true,
    [utils.asGridCoord(4,13)] : true,
    [utils.asGridCoord(2,12)] : true,
    [utils.asGridCoord(3,12)] : true,
    [utils.asGridCoord(4,12)] : true,
    [utils.asGridCoord(2,11)] : true,
    [utils.asGridCoord(3,11)] : true,
    [utils.asGridCoord(4,11)] : true,
    [utils.asGridCoord(5,11)] : true,
    //

    [utils.asGridCoord(11,23)] : true,
    [utils.asGridCoord(11,22)] : true,
    [utils.asGridCoord(11,21)] : true,
    [utils.asGridCoord(11,20)] : true,
    [utils.asGridCoord(12,20)] : true,
    [utils.asGridCoord(13,20)] : true,
    [utils.asGridCoord(14,20)] : true,
    [utils.asGridCoord(15,20)] : true,
    [utils.asGridCoord(15,21)] : true,
    [utils.asGridCoord(15,22)] : true,
    [utils.asGridCoord(15,23)] : true,
    [utils.asGridCoord(14,23)] : true,
    [utils.asGridCoord(13,23)] : true,
    [utils.asGridCoord(12,23)] : true,

    [utils.asGridCoord(26,23)] : true,
    [utils.asGridCoord(25,23)] : true,
    [utils.asGridCoord(24,23)] : true,
    [utils.asGridCoord(23,23)] : true,
    [utils.asGridCoord(22,23)] : true,
    [utils.asGridCoord(22,22)] : true,
    [utils.asGridCoord(22,21)] : true,
    [utils.asGridCoord(22,20)] : true,
    [utils.asGridCoord(23,20)] : true,
    [utils.asGridCoord(24,20)] : true,
    [utils.asGridCoord(25,20)] : true,
    [utils.asGridCoord(26,20)] : true,
    
    [utils.asGridCoord(16,14)] : true,
    [utils.asGridCoord(17,14)] : true,
    [utils.asGridCoord(18,14)] : true,
    [utils.asGridCoord(19,14)] : true,
    [utils.asGridCoord(20,14)] : true,
    [utils.asGridCoord(21,14)] : true,
    [utils.asGridCoord(22,14)] : true,
    [utils.asGridCoord(16,13)] : true,
    [utils.asGridCoord(16,12)] : true,
    [utils.asGridCoord(16,11)] : true,
    [utils.asGridCoord(17,11)] : true,
    [utils.asGridCoord(18,11)] : true,
    [utils.asGridCoord(19,11)] : true,
    [utils.asGridCoord(20,11)] : true,
    [utils.asGridCoord(21,11)] : true,
    [utils.asGridCoord(22,12)] : true,
    [utils.asGridCoord(22,13)] : true,
    [utils.asGridCoord(22,14)] : true,
    [utils.asGridCoord(3,24)] : true,
    [utils.asGridCoord(3,25)] : true,
    [utils.asGridCoord(3,26)] : true,
    [utils.asGridCoord(27,7)] : true,
  
  
  
  },
  cutsceneSpaces: {
    [utils.asGridCoord(12,24)]:[ {
      events: [
        { 
          type: "changeMap",
          map: "areanatownBreeder",
          x: utils.withGrid(5),
          y: utils.withGrid(9), 
          direction: "up"
        },
       
      ]
    }],
    
  }
  
  
  
  
  },
  areanatownBreeder:{
    id: "areanatownBreeder",
  lowerSrc: "images/maps/breederarenatown.png",
  upperSrc: "",
  gameObjects: {
    hero: new Person({
      isPlayerControlled: true,
      x: utils.withGrid(0),
      y: utils.withGrid(0),
    }),
    mintStone: new Breeder({
      x: utils.withGrid(4),
      y: utils.withGrid(7),
     storyFlag: "2"
    }),




  },

   cutsceneSpaces: {
    [utils.asGridCoord(5,9)]:[ {
      events: [
        { 
          type: "changeMap",
          map: "arenatown",
          x: utils.withGrid(12),
          y: utils.withGrid(24), 
          direction: "down"
        },
       
      ]
    }],
    
  }
}

}