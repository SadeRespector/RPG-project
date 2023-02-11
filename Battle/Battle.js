import { BattleEvent } from "/Battle/BattleEvent.js";
import { Combatant } from "/Battle/Combatant.js";
import { TurnCycle } from "/Battle/TurnCycle.js";
import { PlayerState } from "../State/PlayerState.js";
import { ReplacementMenu } from "./ReplacementMenu.js";
import { TextMessage } from "../TextMessage.js";
import { utils } from "../utils.js";
import { SubmissionMenu } from "./SubmissionMenu.js";
import { Team } from "/Battle/Team.js";
import { DirectionInput } from "../DirectionInput.js";
import { functionButton } from "../functions.js";
import { GameObject } from "../GameObject.js";
import { Hud } from "../Hud.js";
import { KeyboardMenu } from "../KeyboardMenu.js";
import { KeyPressListener } from "../KeyPressListener.js";
import { Overworld } from "../Overworld.js";
import { checkParty, OverworldEvent } from "../OverworldEvent.js";
import { OverworldMap } from "../OverworldMap.js";
import { PauseMenu } from "../PauseMenu.js";
import { Person } from "../Person.js";
import { RevealingText } from "../RevealingText.js";
import { Sprite } from "../Sprite.js";


export class Battle {
  constructor({ enemy, onComplete }) {

    this.enemy = enemy;
    this.onComplete = onComplete;

    this.combatants = {

    }

    this.activeCombatants = {
      player: null, //"player1",
      enemy: null, //"enemy1",
    }

    //Dynamically add the Player team
    window.playerState.lineup.forEach(id => {
      
      this.addCombatant(id, "player", window.playerState.pizzas[id])
    });
    //Now the enemy team
    Object.keys(this.enemy.pizzas).forEach(key => {
      this.addCombatant("e_"+key, "enemy", this.enemy.pizzas[key])
    })


    //Start empty
   

    this.usedInstanceIds = {};

  }

  addCombatant(id, team, config) {
    
      this.combatants[id] = new Combatant({
        ...Pizzas[config.pizzaId],
        ...config,
        team,
        isPlayerControlled: team === "player"
      }, this)

      //Populate first active pizza

      console.log(this)
      this.activeCombatants[team] = this.activeCombatants[team] || id
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("Battle");
    this.element.innerHTML = (`
   
     
    </div>
    
      
    </div>
    `)
  }

  async init(container) {
    
    this.createElement();
    container.appendChild(this.element);

    this.playerTeam = new Team("player", "Hero");
    this.enemyTeam = new Team("enemy", "Bully");

    Object.keys(this.combatants).forEach(key => {
      let combatant = this.combatants[key];
      combatant.id = key;
      combatant.init(this.element)
      
      //Add to correct team
      if (combatant.team === "player") {
        this.playerTeam.combatants.push(combatant);
      } else if (combatant.team === "enemy") {
        this.enemyTeam.combatants.push(combatant);
      }
    })

    this.playerTeam.init(this.element);
    this.enemyTeam.init(this.element);

    this.turnCycle = new TurnCycle({
      battle: this,
      onNewEvent: event => {
        return new Promise(resolve => {
          const battleEvent = new BattleEvent(event, this)
          battleEvent.init(resolve);
        })
      },
      onWinner: winner => {

        if (winner === "player") {
          const playerState = window.playerState;
          Object.keys(playerState.pizzas).forEach(id => {
            const playerStatePizza = playerState.pizzas[id];
            const combatant = this.combatants[id];
            if (combatant) {
              playerStatePizza.hp = combatant.hp;
              playerStatePizza.xp = combatant.xp;
              playerStatePizza.maxXp = combatant.maxXp;
              playerStatePizza.level = combatant.level;
            }
          })

          


        }

        this.element.remove();
        this.onComplete();
      }
    })
    this.turnCycle.init();


  }

}