const web3 = new Web3(window.ethereum);
await window.ethereum.enable();
import {abi, expABI, expContractAddress, contractAddress} from "../constants.js"
import { OverworldEvent } from "../OverworldEvent.js";
import { utils } from "../utils.js";
import { Progress } from "../Progess.Js";
import { OverworldMap } from "../OverworldMap.js";
import { Overworld } from "../Overworld.js";
import { checkParty } from "../OverworldEvent.js";


const RPGimporttes = new web3.eth.Contract(abi, contractAddress)
//const array = await RPGimporttes.methods.getTokenIds().call({from: ethereum.selectedAddress})


const Exp = new web3.eth.Contract(expABI, expContractAddress);
let balance = await Exp.methods.balanceOf(ethereum.selectedAddress).call({from: ethereum.selectedAddress}) *.00000000000000001
const turnQue = []
export class TurnCycle {
  constructor({ battle, onNewEvent, onWinner, progress, map   }) {
    this.battle = battle;
    this.onNewEvent = onNewEvent;
    this.onWinner = onWinner;
    this.currentTeam = "player" 
    this.progress = progress
    this.mapId = "DemoRoom";
    this.startingHeroX = 5;
    this.startingHeroY = 7;
    this.startingHeroDirection = "down";
    this.map = map;
  }
  
  

  async turn() {
    
    //Get the caster
    const casterId = this.battle.activeCombatants[this.currentTeam];
    const caster = this.battle.combatants[casterId];
    const enemyId = this.battle.activeCombatants[caster.team === "player" ? "enemy" : "player"]
    const enemy = this.battle.combatants[enemyId];
    const playerSpeed = caster.Speed
    const submission = await this.onNewEvent({
      type: "submissionMenu",
      caster,
      enemy
      
    },
    
    
    )
    
  this.enemyTurn(submission, caster, playerSpeed )
  }
    
    
    
    async enemyTurn(playerSubmission, playerCaster, playerSpeed){
      const casterId = this.battle.activeCombatants.enemy;
    const caster = this.battle.combatants[casterId];
    const enemyId = this.battle.activeCombatants[caster.team === "player" ? "enemy" : "player"]
    const enemy = this.battle.combatants[enemyId];
    const enemySpeed = caster.Speed
    const submission = await this.onNewEvent({
      type: "submissionMenu",
      caster,
      enemy
      
    })
    
    this.resolveSwitch(playerSubmission, playerCaster, playerSpeed, submission, caster, enemySpeed)
    }
    async resolveSwitch(playerSubmission, playerCaster, playerSpeed, enemySubmission, enemyCaster, enemySpeed){
    //Stop here if we are replacing this Pizza
      if (playerSubmission.replacement || enemySubmission.replacement) {
      await this.onNewEvent({
        type: "replace",
        replacement: playerSubmission.replacement || enemySubmission.replacement
      })
      await this.onNewEvent({
        type: "textMessage",
        text: `Go get 'em, ${playerSubmission.replacement.name || enemySubmission.replacement.name}!`
      })
      
     
    } 
    if(playerSubmission.replacement || enemySubmission.replacement){
      const newTargetPlayer = playerSubmission.replacement
      this.resolveActions2(enemySubmission, enemyCaster, enemySpeed, newTargetPlayer)
      
      
    }
    
    else if(playerSpeed > enemySpeed){
      
      this.resolveActionsStep1(playerSubmission, playerCaster, playerSpeed, enemySubmission, enemyCaster, enemySpeed)
    }
    else if(enemySpeed> playerSpeed){
      
      this.resolveActionsStep1(enemySubmission, enemyCaster, enemySpeed, playerSubmission, playerCaster, playerSpeed)
    }
  }
    
    
    
    
    
    
async resolveActionsStep1(firstSubmission, firstCaster, firstSpeed, secondSubmission, secondCaster, secondSpeed){ 
      
      if (firstSubmission.instanceId) {

        //Add to list to persist to player state later
        this.battle.usedInstanceIds[firstSubmission.instanceId] = true;
  
        //Removing item from battle state
        this.battle.items = this.battle.items.filter(i => i.instanceId !== submission.instanceId)
      }
   
      if(firstSubmission){
        let caster = firstCaster
        
      const resultingEvents = caster.getReplacedEvents(firstSubmission.action.success);
        
      for (let i=0; i<resultingEvents.length; i++) {
        const event = {
          ...resultingEvents[i],
          firstSubmission,
          action: firstSubmission.action,
          caster,
          target: firstSubmission.target,

        }
        await this.onNewEvent(event);
        
        
        const targetDead = firstSubmission.target.hp <= 0
        
        if(targetDead){
            
          await this.onNewEvent({ 
            type: "textMessage", text: `${firstSubmission.target.name} is ruined!`
          })
          const winner = this.getWinningTeam();
          if (winner) {
            console.log(winner)
            if(winner == "enemy"){
            await this.onNewEvent({
              type: "textMessage",
              text: "You lost...gotta get out of here!"
            })
            console.log(this.map)
            this.changeMapLost()
            loaction.reload()
          }
            else{
              if(winner == "player"){
                await this.onNewEvent({
                  type: "textMessage",
                  text: "You won!"
                })

            }}
            
            
            this.onWinner(winner);
            return;
          }
          const replacement = await this.onNewEvent({
            type: "replacementMenu",
            team: firstSubmission.target.team
          })
          await this.onNewEvent({
            type: "replace",
            replacement: replacement
          })
          await this.onNewEvent({
            type: "textMessage",
            text: `${replacement.name} appears!`
          })
          
          this.turn()
        }
        
        
        
            
      }
      const survived = firstSubmission.target.hp >= 0
      if(survived){
        console.log(firstSubmission.target.type,firstSubmission.action.type.superEffective, "turncycle")
        if(firstSubmission.action.type.superEffective == firstSubmission.target.type)
        await this.onNewEvent({ 
          type: "textMessage", text: `It's Super effective!`
        })
        else if(firstSubmission.action.type.doesnteffect == firstSubmission.target.type.name){
          console.log(firstSubmission.target.type.name, firstSubmission.action.type.doesnteffect)
          await this.onNewEvent({ 
            type: "textMessage", text: `It's not very effective... `
          })
        }
       
       this.resolveActionsStep2(secondSubmission, secondCaster, secondSpeed)
      }
      
      }
      
    }
    

async getpostEvents(){


  this.turn();
}



  getWinningTeam() {
    
    

    let aliveTeams = {};
    
    
      
      
    Object.values(this.battle.combatants).forEach(c => {
      if (c.hp > 0) {
        aliveTeams[c.team] = true;
      }
    })
    if(playerState.lineup[0])
    if (!aliveTeams["player"]) { return "enemy"}
    if (!aliveTeams["enemy"]) { return "player"}
    
    return null;
  }

  async init() {
    
    
    await this.onNewEvent({
      type: "textMessage",
      text: `${this.battle.enemy.name} wants to throw down!`
    })
    
    
    //Start the first turn!
    this.turn();

  }
  async resolveActions2(enemySubmission, enemyCaster, enemySpeed, newTargetPlayer){
    
      if (enemySubmission.instanceId) {
        
        //Add to list to persist to player state later
        this.battle.usedInstanceIds[submission.instanceId] = true;
  
        //Removing item from battle state
        this.battle.items = this.battle.items.filter(i => i.instanceId !== submission.instanceId)
      }
      
      
      if(enemySubmission){
       
        const resultingEvents = enemyCaster.getReplacedEvents(enemySubmission.action.success);
        let caster = enemyCaster
        for (let i=0; i<resultingEvents.length; i++) {
          const event = {
            ...resultingEvents[i],
            enemySubmission,
            action: enemySubmission.action,
            caster,
            target: newTargetPlayer,
            
          }
          await this.onNewEvent(event);
          }
          
          }
          if(newTargetPlayer.hp <= 0){
            this.checkforDeathSwapinonly(newTargetPlayer)}
              else{
                this.turn()
              }
      
          //this.turn();
    }
        async checkforDeathSwapinonly(newTargetPlayer){
           
          const targetDead = newTargetPlayer.hp <= 0
          
          if(targetDead){
            await this.onNewEvent({ 
              type: "textMessage", text: `${newTargetPlayer.name} is ruined!`
            })
            const winner = this.getWinningTeam();
            if (winner) {
              console.log(winner)
              if(winner == "enemy"){
              await this.onNewEvent({
                type: "textMessage",
                text: "You lost...gotta get out of here!"
                
              }
              )
              console.log(this.map)
              this.changeMapLost()
             
            }
              else{
                if(winner == "player"){
                  await this.onNewEvent({
                    type: "textMessage",
                    text: "You won!"
                  })
  
              }}
            }
            const replacement = await this.onNewEvent({
              type: "replacementMenu",
              team: newTargetPlayer.team
            })
            await this.onNewEvent({
              type: "replace",
              replacement: replacement
            })
            await this.onNewEvent({
              type: "textMessage",
              text: `${replacement.name} appears!`
            })
            
            this.turn()
          }
          
          
  }
  
  async resolveActionsStep2(secondSubmission, secondCaster, secondSpeed){ 
      
    if (secondSubmission.instanceId) {

      //Add to list to persist to player state later
      this.battle.usedInstanceIds[secondSubmission.instanceId] = true;

      //Removing item from battle state
      this.battle.items = this.battle.items.filter(i => i.instanceId !== submission.instanceId)
    }
 
    if(secondSubmission){
      let caster = secondCaster
      
    const resultingEvents = caster.getReplacedEvents(secondSubmission.action.success);
      
    for (let i=0; i<resultingEvents.length; i++) {
      const event = {
        ...resultingEvents[i],
        secondSubmission,
        action: secondSubmission.action,
        caster,
        target: secondSubmission.target,

      }
      await this.onNewEvent(event);
      
      const targetDead = secondSubmission.target.hp <= 0
      if(targetDead){
          
        await this.onNewEvent({ 
          type: "textMessage", text: `${secondSubmission.target.name} is ruined!`
        })
        const winner = this.getWinningTeam();
        console.log(winner)
        if (winner) {
          if(winner == "player"){
          await this.onNewEvent({
            type: "textMessage",
            text: "You Won!"
          })}
          else if (winner == "enemy"){
            
            await this.onNewEvent({
              type: "textMessage",
              text: "You lost...gotta get out of here!"
            })
            console.log(this.map)
            this.changeMapLost()
            }
          this.onWinner(winner);
          return;
        }
        const replacement = await this.onNewEvent({
          type: "replacementMenu",
          team: secondSubmission.target.team
        })
        await this.onNewEvent({
          type: "replace",
          replacement: replacement
        })
        await this.onNewEvent({
          type: "textMessage",
          text: `${replacement.name} appears!`
        })
       
        this.turn()
      }
      
      
          
    }
    const survived = secondSubmission.target.hp >= 0
    if(survived){
      
      console.log(secondSubmission.target.type.name, secondSubmission.action.type.superEffective, "super effectiove")
      if(secondSubmission.action.type.superEffective == secondSubmission.target.type.name)
      await this.onNewEvent({ 
        type: "textMessage", text: `It's Super effective!`
      })
      else if(secondSubmission.action.type.doesnteffect == secondSubmission.target.type.name){
        console.log(secondSubmission.target.type.name, secondSubmission.action.type.doesnteffect, "not very effective")
        await this.onNewEvent({ 
          type: "textMessage", text: `It's not very effective... `
        })
      }
     
     this.turn()
    }
    
    }
  }
  changeMapLost() {

    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
     
     
      location.reload()
      sceneTransition.fadeOut();

    })
  }
   

}

  


  