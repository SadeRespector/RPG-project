import { KeyboardMenu } from "/KeyboardMenu.js";
import { utils } from "./utils.js";
import { KeyPressListener } from "./KeyPressListener.js";
import { getLineUp, getTMs,  } from "./State/PlayerState.js";
import { OverworldEvent } from "./OverworldEvent.js";
export class Summary {
    constructor(onComplete) {
      this.onComplete = onComplete;
    }
    
    createElement(pageKey) {
        console.log(playerState.pizzas)
        this.element = document.createElement("div");
        this.element.classList.add("Summary");
        console.log(pageKey, "@createElement")
        const moveset = pageKey.actions.map(Key =>{
          const action = Actions[pageKey.actions[1]]
          
          
          }
      )
          console.log(pageKey.type)
      const action0 = Actions[pageKey.actions[0]].name
      const action1 = Actions[pageKey.actions[1]].name
      const action2 = Actions[pageKey.actions[2]].name
      const action3 = Actions[pageKey.actions[3]].name
      


        this.element.innerHTML = (`
        <div class="Summary_tokenID">
        <img src=${pageKey.src}  />
        </div>
        <div class="Summary_tokenIDstats">
        HP:${pageKey.hp}
        </div>
        <div class="Summary_tokenIDstats">
        Atk:${pageKey.Atk}
        </div>
        <div class="Summary_tokenIDstats">
        Def:${pageKey.Def}
        </div>
        <div class="Summary_tokenIDstats">
        spAtk:${pageKey.spAtk}
        </div>
        <div class="Summary_tokenIDstats">
        spDef:${pageKey.spDef}
        </div>
        <div class="Summary_tokenIDstats">
        Speed:${pageKey.Speed}
        </div>
        <div class="Summary_tokenIDstats">
        Type:${pageKey.type}
        </div>
        <div class="Summary_tokenIDMoves">
        Move Set:
        <div class="Summary_tokenIDMoves">${action0}</div>
        <div class="Summary_tokenIDMoves">${action1}</div>
        <div class="Summary_tokenIDMoves">${action2}</div>
        <div class="Summary_tokenIDMoves">${action3}</div>
        </div>
        
        `)
      }
      init(container, pageKey) {
        console.log("init summary", pageKey)
        this.createElement(pageKey);
        container.appendChild(this.element);
        utils.wait(200);
        this.esc = new KeyPressListener("Escape", () => {
        this.close();
    })
      }
  
      close() {
        this.esc?.unbind();
        
        this.element.remove();
       
      }
    
}