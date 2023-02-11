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
import { OverworldEvent } from "../OverworldEvent.js";
import { OverworldMap } from "../OverworldMap.js";
import { PauseMenu } from "../PauseMenu.js";
import { Person } from "../Person.js";
import { RevealingText } from "../RevealingText.js";
import { Sprite } from "../Sprite.js";

window.BattleAnimations = {
  async spin(event, onComplete) {
    const element = event.caster.pizzaElement;
    const animationClassName = event.caster.team === "player" ? "battle-spin-right" : "battle-spin-left";
    element.classList.add(animationClassName);

    //Remove class when animation is fully complete
    element.addEventListener("animationend", () => {
      element.classList.remove(animationClassName);
    }, { once:true });

    //Continue battle cycle right around when the pizzas collide
    await utils.wait(100);
    onComplete();
  },

  async glob(event, onComplete) {
    const {caster} = event;
    let div = document.createElement("div");
    div.classList.add("glob-orb");
    div.classList.add(caster.team === "player" ? "battle-glob-right" : "battle-glob-left");
    
    div.innerHTML = (`
    <img class="Combatant_character" src="/images/fireball.png" />
    `);

    //Remove class when animation is fully complete
    div.addEventListener("animationend", () => {
      div.remove();
    });

    //Add to scene
    document.querySelector(".Battle").appendChild(div);

    await utils.wait(820);
    onComplete();
  }
}