import { KeyboardMenu } from "./KeyboardMenu.js";
import { getLineUp, PlayerState } from "./State/PlayerState.js";
import { utils } from "./utils.js";

import { expABI, expContractAddress, contractAddress, abi } from "./constants.js";
const web3 = new Web3(window.ethereum);
await window.ethereum.enable();


const Exp = new web3.eth.Contract(expABI, expContractAddress);
const RPGimporttes = new web3.eth.Contract(abi, contractAddress);
let balance = await Exp.methods.balanceOf(ethereum.selectedAddress).call({from: ethereum.selectedAddress}) *.00000000000000001




export class CraftingMenu {
    constructor({ pizza, onComplete}) {
      this.pizza = pizza;
      this.onComplete = onComplete;
    }
	
    
  
    getOptions(pageKey) {if (pageKey === "root") {
		
		const levelUp = Object.keys(playerState.pizzas).filter(id => {
			return playerState.lineup.indexOf(id) + 1 ;
		  }).map(id => {
			const {pizzaId} = playerState.pizzas[id];
			const base = Pizzas[pizzaId];
			
			
			return {
			  label: `Level Up ${base.name}`,
			  description: "Spend your Exp to get stronger",
			  handler: async () => {
				await RPGimporttes.methods.levelUp(base.tokenId).send({from: ethereum.selectedAddress})
			    balance = await Exp.methods.balanceOf(ethereum.selectedAddress).call({from: ethereum.selectedAddress}) *.00000000000000001
				getLineUp()}}})
		        
		      
		  		
		return [
		  
		  ...levelUp,
		  {
			label: "Experience Points",
			description: `Exp Balance:${balance}`
		   
		  },
		  
		
		  {
			label: "Close",
			description: "Return to Game",
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
		
		
	
	  })
	  
  
	  return [
		
		
		
		
		
	   
	   
  
		
		{
		  label: "Back",
		  description: "Back to root menu",
		  handler: () => {
			this.keyboardMenu.setOptions( this.getOptions("root") );
		  }
		},
		
		
		
	  ];
	}
		
    
  
    createElement() {
      this.element = document.createElement("div");
      this.element.classList.add("CraftingMenu");
      this.element.classList.add("overlayMenu");
      this.element.innerHTML = (`
        <h2>Level Up Your Guy</h2>
      `)
    }
  
    close() {
      this.keyboardMenu.end();
      this.element.remove();
      this.onComplete();
    }
  
  
    init(container) {
      this.createElement();
      this.keyboardMenu = new KeyboardMenu({
        descriptionContainer: container
      })
      this.keyboardMenu.init(this.element)
      this.keyboardMenu.setOptions(this.getOptions("root"))
  
      container.appendChild(this.element);
    }
  }
  