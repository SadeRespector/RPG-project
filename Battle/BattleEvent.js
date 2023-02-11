window.PizzaTypes = {
	

	fire: {
		name: "fire",
		typeNum: 1,
		superEffective: "grass",
        doesnteffect: "water"

	},
water: {
		name: "water",
		typeNum: 2,
		superEffective: "fire",
        doesnteffect: "grass"
	},
  grass: {
		name: "grass",
		typeNum: 3,
		superEffective: "water",
        doesnteffect: "fire"
	},
    normal: {
		name: "normal",
		typeNum: 0,
		superEffective: "none",
        doesnteffect: "none"
	},
}



import { ReplacementMenu } from "./ReplacementMenu.js";
import { TextMessage } from "../TextMessage.js";
import { utils } from "../utils.js";
import { SubmissionMenu } from "./SubmissionMenu.js";
import { TurnCycle } from "./TurnCycle.js";

export class BattleEvent {
  constructor(event, battle) {
    this.event = event;
    this.battle = battle;
  }
  
  textMessage(resolve) {

    const text = this.event.text
    .replace("{CASTER}", this.event.caster?.name)
    .replace("{TARGET}", this.event.target?.name)
    .replace("{ACTION}", this.event.action?.name)

    const message = new TextMessage({
      text,
      onComplete: () => {
        resolve();
      }
    })
    message.init( this.battle.element )
  }
  
  async textMessage2() {

    const text = "It's super Effective!"
   
    const message = new TextMessage({
      text,
      onComplete: () => {
        resolve()
      }
    })
    message.init( this.battle.element )
  }


  async stateChange(resolve) {
    const {caster, target, Atkdamage, spAtkdamage, recover, status, action,AtkBoosted} = this.event;
    let who = this.event.onCaster ? caster : target;
    
    
    if (Atkdamage) {
      
      let damage = this.damageCalc(caster.level, caster.Atk, Atkdamage, target.Def, caster.type, target.type, action.type, action.type.superEffective  )
      
      target.update({
        
        hp: target.hp - damage
      })
      
      //start blinking
      target.pizzaElement.classList.add("battle-damage-blink");
    }
    if (spAtkdamage) {
      let damage = this.damageCalc(caster.level, caster.spAtk, spAtkdamage, target.spDef, caster.type, target.type, action.type, action.type.superEffective )
      
        target.update({
        
          hp: target.hp - damage
        })
      
      
      
       
      
      target.pizzaElement.classList.add("battle-damage-blink");

    }
      
       

      
      
      
    
   
   

    if (recover) {
      let newHp = who.hp + recover;
      if (newHp > who.maxHp) {
        newHp = who.maxHp;
      }
      who.update({
        hp: newHp
      })
    }
    if(AtkBoosted){
      
      let newAtk = who.Atk * AtkBoosted
      who.update({
        Atk: newAtk
      })
      console.log(newAtk, "this is the new attack")
    }

    if (status) {
      who.update({
        status: {...status}
      })
    }
    if (status === null) {
      who.update({
        status: null
      })
    }
    


    //Wait a little bit
    await utils.wait(600)

    //Update Team components
    this.battle.playerTeam.update();
    this.battle.enemyTeam.update();

    //stop blinking
    target.pizzaElement.classList.remove("battle-damage-blink");
    resolve();
  }

  submissionMenu(resolve) {
    const {caster} = this.event;
    const menu = new SubmissionMenu({
      caster: caster,
      enemy: this.event.enemy,
      items: this.battle.items,
      replacements: Object.values(this.battle.combatants).filter(c => {
        return c.id !== caster.id && c.team === caster.team && c.hp > 0
      }),
      onComplete: submission => {
        //submission { what move to use, who to use it on }
        resolve(submission)
      }
    })
    menu.init( this.battle.element )
  }

  replacementMenu(resolve) {
    const menu = new ReplacementMenu({
      replacements: Object.values(this.battle.combatants).filter(c => {
        return c.team === this.event.team && c.hp > 0
      }),
      onComplete: replacement => {
        resolve(replacement)
      }
    })
    menu.init( this.battle.element )
  }

  async replace(resolve) {
    const {replacement} = this.event;

    //Clear out the old combatant
    const prevCombatant = this.battle.combatants[this.battle.activeCombatants[replacement.team]];
    this.battle.activeCombatants[replacement.team] = null;
    prevCombatant.update();
    await utils.wait(400);

    //In with the new!
    this.battle.activeCombatants[replacement.team] = replacement.id;
    replacement.update();
    await utils.wait(400);

    //Update Team components
    this.battle.playerTeam.update();
    this.battle.enemyTeam.update();

    resolve();
  }

  giveXp(resolve) {
    let amount = this.event.xp;
    const {combatant} = this.event;
    const step = () => {
      if (amount > 0) {
        amount -= 1;
        combatant.xp += 1;

        //Check if we've hit level up point
        if (combatant.xp === combatant.maxXp) {
          combatant.xp = 0;
          combatant.maxXp = 100;
          combatant.level += 1;
        }

        combatant.update();
        requestAnimationFrame(step);
        return;
      }
      resolve();
    }
    requestAnimationFrame(step);
  }

  animation(resolve) {
    const fn = BattleAnimations[this.event.animation];
    fn(this.event, resolve);
  }
  damageCalc(level, Atk, moveUsed, Def, typeAttacker, typeDefender, actiontype, superEffective ) {
    let casterlevel = level 
    let attackStat = Atk  
    let attackPower = moveUsed
    let defenseStat = Def
    let weakResist = this.getWeakresist(actiontype, typeDefender)
    let stab = this.getStab(typeAttacker, actiontype) 
    let randomNumber = 50
    console.log(typeDefender, typeAttacker)
let damage = ((((2 * level) + 10)/250) * (attackStat/defenseStat) * (attackPower) + 2) * stab * weakResist * ((randomNumber+85)/100);
return damage


}
getStab(typeAttacker, actiontype){
if(typeAttacker == actiontype){
  return 1.5
}
else{
  return 1
}}
getWeakresist(actiontype, typeDefender){
  if(actiontype.superEffective == typeDefender){
    
   
    return 2
  }
  else {
    return 1
  }
}   

  init(resolve) {
    this[this.event.type](resolve);
  }
}