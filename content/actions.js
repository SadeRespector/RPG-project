import { Battle } from "../Battle/Battle.js";

const web3 = new Web3(window.ethereum);
await window.ethereum.enable();

 
 


	
	



//let tokenId = 7
//let tokenStats = await RPGimporttes.methods.getCharacterStats(tokenId - 1).call({from: ethereum.selectedAddress})


window.Actions = {
	
	0: {
		
		name: "Ember",
		description: "scatters hot embers all around",
		type: PizzaTypes.fire,
		
		success: [
		  { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
		  { type: "animation", animation: "spin"},
		  { type: "stateChange", spAtkdamage: 40},
		  
		]
	  },
	
	1: {
		
	  name: "Tackle",
	  description: "Smashes into foe",
	  type: PizzaTypes.normal,
	  success: [
		{ type: "textMessage", text: "{CASTER} uses {ACTION}!"},
		{ type: "animation", animation: "spin"},
		{ type: "stateChange", Atkdamage: 40},
		
	  ]
	},
	2: {
		name: "Water Gun",
		description: "Shoot a stream of water",
		type: PizzaTypes.water,
		success: [
		  { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
		  { type: "animation", animation: "spin"},
		  { type: "stateChange", spAtkdamage: 40}
		]
	},
	3: {
	  name: "Olive Oil",
	  description: "Slippery mess of deliciousness",
	  type: PizzaTypes.normal,
	  success: [
		{ type: "textMessage", text: "{CASTER} uses {ACTION}!"},
		{ type: "animation", animation: "glob", color: "#dafd2a" },
		{ type: "stateChange", status: { type: "clumsy", expiresIn: 2 } },
		{ type: "textMessage", text: "{TARGET} is slipping all around!"},
	  ]
	},
	4: {
		name: "Whomp2!",
		description: "Pillowy punch of dough",
		success: [
		  { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
		  { type: "animation", animation: "spin"},
		  { type: "stateChange", damage: 100}
		]
	  },
	  5:{
		name: "Swords Dance",
		description: "Raises Attack stat!",
		type: PizzaTypes.normal,
		targetType: "friendly",
		success: [
			{ type: "textMessage", text: "{CASTER} uses {ACTION}!"},
			{ type: "stateChange", AtkBoosted: 2}
		]
	  }
	//Items
	// item_recoverStatus: {
	//   name: "Heating Lamp",
	//   description: "Feeling fresh and warm",
	//   targetType: "friendly",
	//   success: [
	// 	{ type: "textMessage", text: "{CASTER} uses a {ACTION}!"},
	// 	{ type: "stateChange", status: null },
	// 	{ type: "textMessage", text: "Feeling fresh!", },
	//   ]
	// },
	// item_recoverHp: {
	//   name: "Parmesan",
	//   targetType: "friendly",
	//   success: [
	// 	{ type:"textMessage", text: "{CASTER} sprinkles on some {ACTION}!", },
	// 	{ type:"stateChange", recover: 10, },
	// 	{ type:"textMessage", text: "{CASTER} recovers HP!", },
	//   ]
	// },
  }
  