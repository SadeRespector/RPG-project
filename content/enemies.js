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


	
	water: "water",
	spicy: "spicy",
	veggie: "veggie",
	fungi: "fungi",
	chill: "chill",
	grass: "grass",
  normal: "normal"
  }

  window.RandomEnemies = [ "donk", "Svintch","Knord"]
//"donk", "Svintch",





window.Enemies = {
  "erio": {
    name: "Erio",
    src: "/images/characters/people/erio.png",
    pizzas: {
      "a": {
        pizzaId: "s001",
        maxHp: 50,
        level: 1,
        
      },
      "b": {
        pizzaId: "s002",
        maxHp: 50,
        level: 1,
      },
    }
  },
  "greg": {
    name: "Greg",
    src: "/images/characters/people/erio.png",
    pizzas: {
      "B": {
        name: "Prancer",
        
        //pizzaId: "p1",
        
        level:8,
        src: "/images/megaxenemy.png",
        icon: "/images/icons/veggie.png",
        hp: 6,
        Def: 35,
        Atk: 24,
        spAtk: 20, 
        spDef: 44,
        maxHp:  10,
        Speed:  0,
        type: window.PizzaTypes.grass,
        
        level: 2,
        status:null,
        actions: [0,1,2,5],
        
      },
    }
},
  "beth": {
    name: "Beth",
    src: "/images/characters/people/npc1.png",
    pizzas: {
      "B": {
        name: "dookie",
        
        //pizzaId: "p1",
        
        level: 1,
        backsrc: "/images/megaxenemy.png",
        icon: "/images/icons/veggie.png",
       
        Def: Math.floor(Math.random() * 32),
        Atk: Math.floor(Math.random() * 32),
        spAtk: Math.floor(Math.random() * 32), 
        spDef: Math.floor(Math.random() * 32),
        maxHp:  Math.floor(Math.random() * 32),
        Speed:  Math.floor(Math.random() * 32),
        type: PizzaTypes.fire,
        
        level: 2,
        status:null,
        actions: [1,2,0],
        
      },
      
    
    }
  },
  "donk": {
    name: "donk",
    src: "/images/characters/people/npc1.png",
    pizzas: {
      "A": {
        name: "donk",
        
       
        
        level: 1,
        backsrc: "/images/1.png",
        icon: "/images/icons/veggie.png",
        
        Def: Math.floor(Math.random() * 10),
        Atk: Math.floor(Math.random() * 10),
        spAtk: Math.floor(Math.random() * 10), 
        spDef: Math.floor(Math.random() * 10),
        maxHp:  Math.floor(Math.random() * 10 +1),
        Speed:  Math.floor(Math.random() * 25),
        type: PizzaTypes.grass,
        
        level: 2,
        status:null,
        actions: [1,2,0],
        
      },
      
    
    }
  },
  "Svintch": {
    name: "Svintch",
    src: "/images/characters/people/npc1.png",
    pizzas: {
      "B": {
        name: "Svintch",
        
        //pizzaId: "p1",
        
        level: 1,
        backsrc: "/images/2.png",
        icon: "/images/icons/veggie.png",
        Def: Math.floor(Math.random() * 10),
        Atk: Math.floor(Math.random() * 10),
        spAtk: Math.floor(Math.random() * 10), 
        spDef: Math.floor(Math.random() * 10),
        maxHp:  Math.floor(Math.random() * 10 +1),
        Speed:  Math.floor(Math.random() * 25),
        
        level: 2,
        status:null,
        actions: [1,2,0],
        
      },
      
    
    }
  },
  "Knord": {
    
    name: "Knord",
    src: "/images/characters/people/npc1.png",
    pizzas: {
      "C": {
        name: "Knord",
        
        //pizzaId: "p1",
        
        level: 1,
        backsrc: "/images/3.png",
        icon: "/images/icons/veggie.png",
       
        Def: Math.floor(Math.random() * 10),
        Atk: Math.floor(Math.random() * 10),
        spAtk: Math.floor(Math.random() * 10), 
        spDef: Math.floor(Math.random() * 10),
        maxHp:  Math.floor(Math.random() * 10 +1),
        Speed:  Math.floor(Math.random() * 25),
        type: PizzaTypes.water,
        
        level: 2,
        status:null,
        actions: [1,2,0],
        
      },
      
    
    }
  }
}


 function getHP(){ 
  const Maxhp = Math.floor(Math.random() * 32)
  return Maxhp
 }
