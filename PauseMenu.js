import { KeyboardMenu } from "/KeyboardMenu.js";
import { utils } from "./utils.js";
import { KeyPressListener } from "./KeyPressListener.js";
import { getLineUp, getTMs,  } from "./State/PlayerState.js";
import { checkParty, OverworldEvent } from "./OverworldEvent.js";
import { Summary } from "./Summary.js";
import { Hud } from "./Hud.js";
import { TitleScreen } from "./TitleScreen.js";
import { Overworld } from "./Overworld.js";

const web3 = new Web3(window.ethereum);
import {abi, contractAddress, expContractAddress, expABI, TMABI, TMAddress} from "./constants.js"
await window.ethereum.enable();

const TMs = new web3.eth.Contract(TMABI, TMAddress)
const Exp = new web3.eth.Contract(expABI, expContractAddress);
const RPGimporttes = new web3.eth.Contract(abi, contractAddress);
let balance = await Exp.methods.balanceOf(ethereum.selectedAddress).call({from: ethereum.selectedAddress}) *.00000000000000001
let newname = null
let tokenId = null
//let stats = await RPGimporttes.methods.getStats(tokenId).call({from: ethereum.selectedAddress})

export class  PauseMenu {
  constructor({progress, onComplete, titleScreen, overworld}) {
    this.progress = progress;
    this.onComplete = onComplete;
	this.titleScreen = titleScreen
	this.overworld = overworld
  }
  
   getOptions(pageKey) {
	
	this.initHud()
    //Case 1: Show the first page of options
    
	if (pageKey === "root") {
		
		//console.log(stats[1])
		//console.log(playerState.pizzas[playerState.lineup[0]].hp)
		// if(playerState.pizzas[playerState.lineup[0]].hp <= 0){
		// 	playerState.moveToFront(playerState.lineup[1])
		// }
		getTMs()
		checkParty()
		
		
		
		
	    const lineupPizzas = playerState.lineup.map(id => {
			
        const {pizzaId} = playerState.pizzas[id];
        const base = Pizzas[pizzaId];
        let  baseStats = `Hp:${base.hp} Atk:${base.Atk} Def:${base.Def} spDef:${base.spDef} Speed:${base.Speed}`
        
        return {
          label: base.name,
          description: "",//baseStats,
		  
          handler: () => {

            this.keyboardMenu.setOptions( this.getOptions(id) )
          }
        }
      })
	
	
	 
	  
		
      
      return [
        ...lineupPizzas,
		
        {
          label: "Experience Points",
          description: `Exp Balance:${balance}`,
		  handler: () => {
			
			//this.keyboardMenu.setOptions( this.getOptions("root") )
           console.log(pageKey)
          }
         
        },
		{
			label: "Tech Machines",
			description: `View Your TMs`,
			handler: () => {
			  
			  this.keyboardMenu.setOptions( this.getOptions2("items") )
			 	console.log(pageKey)
			}
		   
		  },
        
        
        {
          label: "Save",
          description: "Save your progress",
          handler: () => {
            this.progress.save();
            this.close();
          }
        },
        {
          label: "Close",
          description: "Close the pause menu",
          handler: () => {
            this.close();
          }
        }
      ]
    }

    //Case 2: Show the options for just one pizza (by id)
    const unequipped = Object.keys(playerState.pizzas).filter(id => {
      return playerState.lineup.indexOf(id) === -1;
    }).map(id => {
      const {pizzaId} = playerState.pizzas[id];
      const base = Pizzas[pizzaId];
      
      
      
      return {
        label: `Swap for ${base.name}`,
        description: `Put em' In`,
        handler: () => {
          playerState.swapLineup(pageKey, id);
          this.keyboardMenu.setOptions( this.getOptions("root") );
        }
        
        
      }
    })

		
	    const moveset = playerState.pizzas[pageKey].actions.map(Key =>{
		const action = Actions[Key]
		
		const moveIndex = playerState.pizzas[pageKey].actions
		//console.log(moveIndex, "this is the move index", playerState.pizzas[pageKey].actions)
		moveIndex.indexOf(action)
		const actionsarray = playerState.pizzas[pageKey].actions
		const tokenId = playerState.pizzas[pageKey].tokenId
		let MoveKey = actionsarray.indexOf(Key)
		
		return {
			label: action.name,
			description: action.description,
			handler: () => {

			}
			
		}})
	
      
      
    
   

    return [
      
      ...unequipped,
	  {
		label: "Summary",
		description: ``,
		handler: async () => {
			const summary = new Summary
			const summaryChoice = playerState.pizzas[pageKey]
			this.close()
			summary.init(document.querySelector(".game-container"), summaryChoice)
			
			
		}
	
	
	},
	//   {
    //     label: "Move Set:",
    //     description: ``,
    //     handler: async () => {
	// 		console.log(pageKey)
	// 		}
	// 	},
		
      //...moveset,
	//   {
    //     label: "Options:",
    //     description: ``,
    //     handler: async () => {
			
	// 		}
    //     },
      {
        label: "Move to front",
        description: "Move this pizza to the front of the list",
        handler: () => {
          playerState.moveToFront(pageKey);
          //console.log(pageKey)
          this.keyboardMenu.setOptions( this.getOptions("root") );
        }
      },
	 
	  
	  {
        label: "Rename",
        description: "Rename your Guy",
        handler: async () => {
			var input = prompt("choose your new name")
			const {pizzaId} = playerState.pizzas[pageKey];
      		const base = Pizzas[pizzaId];
			console.log(base.tokenId)
			newname = input
			tokenId = base.tokenId
			await RPGimporttes.methods.setName(newname, tokenId).send({from: ethereum.selectedAddress})
			getLineUp()
        }
      },
       {
        label: "Back",
        description: "Back to root menu",
        handler: () => {
          this.keyboardMenu.setOptions( this.getOptions("root") );
        }
      },
      
      
      
    ];
	
  }
  getOptions2(pageKey) {
	
	
    //Case 1: Show the first page of options
    
	if (pageKey === "items") {
		
		
		const items = playerState.currentItems.map(id =>{
			const action = Actions[id]
			const itemId = playerState.items[id].moveNumber
			const itemTokenId = playerState.items[id].tokenId
			
			return {
				label: `TM${itemId}:${Actions[itemId].name}`,
				description: "Use this TM?",
				handler: async() => {
					console.log(itemTokenId)
					this.keyboardMenu.setOptions(this.getOptionsMoveChange2(id, itemTokenId))
				}
			  }
			  
			})
      	
		
	    

	  
		
      
      return [
		
        ...items,
		
		{
			label: "Close",
			description: "Close the pause menu",
			handler: () => {
			  this.close();
			}
		  }
		
        
        
        
      ]
    }

    
    
   

    return [];
	
  }

getOptionsMoveChange2(pageKey, itemTokenId){
			if(pageKey === pageKey, itemTokenId){
			const lineupPizzas = playerState.lineup.map(id => {
			const {pizzaId} = playerState.pizzas[id];
			const base = Pizzas[pizzaId];
			let  baseStats = `Hp:${base.hp} Atk:${base.Atk} Def:${base.Def} spDef:${base.spDef} Speed:${base.Speed}`
			const action = Actions
			tokenId = base.tokenId
			itemTokenId = itemTokenId
			return {
			  label: base.name,
			  description: action.name,
			  handler: () => {
				console.log(pageKey)
				this.keyboardMenu.setOptions( this.getOptions3(pageKey,  itemTokenId, tokenId, pizzaId ) )
			  }
			}
		  })
		return[
			{
				label:"Use this TM on?"
			},
			...lineupPizzas,
			]
			
		

	}
	
}
getOptions3(pageKey,itemTokenId, tokenId, pizzaId){
	if(pageKey === pageKey, itemTokenId, tokenId, pizzaId){
			const moveset = playerState.pizzas[pizzaId].actions.map(Key =>{
			const action = Actions[Key]
			
			const moveIndex = playerState.pizzas[pizzaId].actions[Key]
			moveIndex.indexOf(action)
			const actionsarray = playerState.pizzas[pizzaId].actions
			const tokenId = playerState.pizzas[pizzaId].tokenId
			let MoveKey = actionsarray.indexOf(Key)
			
			return {
				label: action.name,
				description: MoveKey,
				handler: async () => {
					//let MoveKey = actionsarray.indexOf(Key)
					await RPGimporttes.methods.moveSetChange(tokenId, MoveKey, itemTokenId).send({from: ethereum.selectedAddress})
					console.log(MoveKey)
					
					
				}
				
			
		
			  }})
		
		return[
			{
				label:"Choose which move to replace:"
			},
			...moveset,
			]
	}
}
  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("PauseMenu");
    this.element.classList.add("overlayMenu");
    this.element.innerHTML = (`
      <h2>Pause Menu</h2>
    `)
  }
  summary(){
	const summary = new Summary({
	 
	})
	
	this.close()
   }
initHud(){
	
	
	
}
 

  close() {
    this.esc?.unbind();
    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
  }

  async init(container) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      descriptionContainer: container
    })
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions("root"));
	//this.keyboardMenu.setOptions(this.getOptions2("items"));

    container.appendChild(this.element);
	//const container = document.querySelector(".game-container");
	this.hud = new Hud();
	this.hud.init(container);

    utils.wait(200);
    this.esc = new KeyPressListener("Escape", () => {
      this.close();
    })
  }
  

}