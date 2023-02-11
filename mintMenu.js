import { KeyboardMenu } from "./KeyboardMenu.js";
import { getLineUp} from "./State/PlayerState.js";
import { utils } from "./utils.js";

import { expABI, expContractAddress, contractAddress, abi } from "./constants.js";
const web3 = new Web3(window.ethereum);
await window.ethereum.enable();


const Exp = new web3.eth.Contract(expABI, expContractAddress);
const RPGimporttes = new web3.eth.Contract(abi, contractAddress);
let balance = await Exp.methods.balanceOf(ethereum.selectedAddress).call({from: ethereum.selectedAddress}) *.00000000000000001
//const array = await RPGimporttes.methods.getTokenIds().call({from: ethereum.selectedAddress})



export class MintMenu {
    constructor({ pizza, onComplete}) {
      this.pizza = pizza;
      this.onComplete = onComplete;
    }
	
    
  
    getOptions(pageKey) {if (pageKey === "root") {
		return [
		  
		  
		  {
			label: "Attempt a Summon? ",
			description: `Spend ETH to summon a fighter`,
			handler: async () => {
				await RPGimporttes.methods.requestMint().send({from: ethereum.selectedAddress})
				
				//getLineUp()
				
			  }
			  
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
      this.element.classList.add("MintMenu");
      this.element.classList.add("overlayMenu");
      this.element.innerHTML = (`
        <h2>The Summoning Stone is humming quietly...</h2>
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
  