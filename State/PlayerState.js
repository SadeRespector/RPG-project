import { utils } from "../utils.js";
import { OverworldEvent } from "../OverworldEvent.js";
import { OverworldMap } from "../OverworldMap.js";
import { Overworld } from "../Overworld.js";
import { CraftingMenu } from "../CraftingMenu.js";
import { Hud } from "../Hud.js";
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
		superEffective: "",
        doesnteffect: ""
	},
}
const web3 = new Web3(window.ethereum);
import {abi, expABI , contractAddress, expContractAddress, TMABI, TMAddress} from "../constants.js"

await window.ethereum.enable();

const TMs = new web3.eth.Contract(TMABI, TMAddress)
const RPGimporttes = new web3.eth.Contract(abi, contractAddress);
//let array = await RPGimporttes.methods.getTokenIds().call({from: ethereum.selectedAddress})
//console.log(array)
//const tokenURI = await RPGimporttes.methods.gettokenURI().call({from: ethereum.selectedAddress})
let pizzas = {}
let currentLineUp = []
let items = {}
let currentItems = []



export class PlayerState {
  constructor() {
	this.pizzas = pizzas
	this.lineup = currentLineUp
	this.items = items
	this.currentItems = currentItems

    
	this.storyFlags = {
    };
  }
  swapLineup(oldId, incomingId) {
    const oldIndex = this.lineup.indexOf(oldId);
    this.lineup[oldIndex] = incomingId;
    utils.emitEvent("LineupChanged");
  }

  moveToFront(futureFrontId) {
    this.lineup = this.lineup.filter(id => id !== futureFrontId);
    this.lineup.unshift(futureFrontId);
    utils.emitEvent("LineupChanged");
  }
  
}


 export async function getLineUp(){
	
	let array = await RPGimporttes.methods.getTokenIds().call({from: ethereum.selectedAddress})
	array.forEach(async(tokenId) => {
	const type = await getType(tokenId)
	let moveset = await RPGimporttes.methods.getMoves(tokenId).call({from: ethereum.selectedAddress})
	let stats = await RPGimporttes.methods.characters(tokenId - 1).call({from: ethereum.selectedAddress})
	let newtokenId = `p${tokenId}`; 
	let _tokenId = tokenId
	let _hp = stats[1]

	pizzas[newtokenId] = {
	name:  stats[9],
	tokenId: _tokenId,
	pizzaId: `p${tokenId}`,
	type: stats[8],
	src: `${await RPGimporttes.methods.tokenURI(tokenId).call({from: ethereum.selectedAddress})}`,
	backsrc: `${await RPGimporttes.methods.tokenURIBack(tokenId).call({from: ethereum.selectedAddress})}`,
	icon: "/images/icons/spicy.png",
	hp: stats[2],
	Def:stats[5],
	Atk:  stats[3],
	spAtk: stats[4],
	spDef: stats[6],
	maxHp: stats[2],
	Speed:  stats[7],
	description: "Test",
	level: stats[0],
	status:null,
	actions: moveset}
	
	if(currentLineUp.length < 6 && !currentLineUp.includes(newtokenId) ){
	currentLineUp.push(newtokenId)}
	//console.log(newtokenId)
	// console.log(currentLineUp)
	console.log(moveset)
	window.Pizzas = pizzas
	utils.emitEvent("LineupChanged")
	
	//console.log(pizzas)
})}
export async function getTMs(){
	
	let tmArray = await TMs.methods.getTokenIds().call({from: ethereum.selectedAddress})
	tmArray.forEach(async(tokenId) => {
		let newitemId = `i${tokenId}`;
		
		items[newitemId] = {
			itemId: `p${tokenId}`,
			moveNumber: `${await TMs.methods.getTmNum(tokenId).call({from: ethereum.selectedAddress})}`,
			tokenId: tokenId
		}
		window.Items = items
		if(!currentItems.includes(newitemId) ){
			currentItems.push(newitemId)}
		utils.emitEvent("PlayerStateUpdated")
		console.log(items[newitemId].moveNumber)
		console.log(currentItems)
		
	})
	
	
	
	
}
async function getType(tokenId){
	
		const typenum = await RPGimporttes.methods.getStats(tokenId).call({from: ethereum.selectedAddress})
		if(typenum[7] == 1 ){
		return PizzaTypes.fire}
		else if (typenum[7] == 2){
			return PizzaTypes.water
		}
		else if (typenum[7]== 3){
			return PizzaTypes.grass
		}
	  }

//getTMs()


getLineUp()







window.playerState = new PlayerState();