//import { ethers } from "/09-pizza-legends-triggers-talking-map-switching/ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"
import { ethers } from "./ethers-5.6.esm.min.js"
import { KeyPressListener } from "/KeyPressListener.js";
import { RevealingText } from "./RevealingText.js";

export class functionButton {
    constructor({ func, onComplete }) {
      this.func = func;
      
      this.onComplete = onComplete;
      this.element = null;
    }
  
    createElement() {
      //Create the element
      this.element = document.createElement("div");
      this.element.classList.add("functionButton");
      
      this.element.innerHTML = (`
        <p class = "functionButton_p" >would you like to mint?</p>
        <button id="minter" class="functionButton_button">Mint</button>
        <button id="Exit" class="functionButton_button">Exit</button>
        
      `)
      this.element.querySelector("button").addEventListener("click", () => {
        document.getElementById("Exit").onclick = this.exitdone})
      
        this.element.querySelector("button").addEventListener("click", () => {
        //Close the text message
       
        document.getElementById("minter").onclick = async function mint(){
    
          console.log(`Funding with ${0.1}...`)
          if (typeof window.ethereum !== "undefined") {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, abi, signer)
            try {
              const transactionResponse = await contract.mint({
                value: ethers.utils.parseUnits("0.1", "ether")
              })
              await listenForTransactionMine(transactionResponse, provider)
              
            } catch (error) {
              console.log(error)
            }
            
          } else {
            
  
          }
          
      }});
      
  
      this.actionListener = new KeyPressListener("Enter", () => {
        
        this.done();
      })
  
    }
  
    done() {
  
    
        this.element.remove();
        this.actionListener.unbind();
        this.onComplete();
      
        
      
    }
    exitdone() {
  
    
        this.element.remove();
        this.actionListener.unbind();
        this.onComplete();
      
        
      
    }
  
    init(container) {
      this.createElement();
      container.appendChild(this.element);
      
    }
  
  
  }
