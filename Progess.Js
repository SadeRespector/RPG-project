
import { TitleScreen } from "./TitleScreen.js";
export class Progress {
  constructor() {
    this.mapId = "DemoRoom";
    this.startingHeroX = 0;
    this.startingHeroY = 0;
    this.startingHeroDirection = "down";
    //this.saveFileKey = "PizzaLegends_SaveFile1";
  }

  save() {
    window.localStorage.setItem(this.saveFileKey, JSON.stringify({
      mapId: this.mapId,
      startingHeroX: this.startingHeroX,
      startingHeroY: this.startingHeroY,
      startingHeroDirection: this.startingHeroDirection,
      playerState: {
        
        storyFlags: playerState.storyFlags
      }
    }))
  }

  getSaveFile() {

    if (!window.localStorage) {
      return null;
    }

    const file = window.localStorage.getItem(this.saveFileKey);
    return file ? JSON.parse(file) : null
    
  }
  
  load() {
    console.log("Loading from Title screen")
    const file = this.getSaveFile();
    console.log(file)
    if (file) {
      this.mapId = file.mapId;
      this.startingHeroX = file.startingHeroX;
      this.startingHeroY = file.startingHeroY;
      this.startingHeroDirection = file.startingHeroDirection;
      Object.keys(file.playerState).forEach(key => {
        playerState[key] = file.playerState[key];
      })
    }
  }

 async init() {
 
    const container = document.querySelector(".game-container");
  
    //Create a new Progress tracker
    this.progress = new Progress();
  
    //Show the title screen
    this.titleScreen = new TitleScreen({
      progress: this.progress
    })
    const useSaveFile = await this.titleScreen.init(container);
  
    //Potentially load saved data
    let initialHeroState = null;
    if (useSaveFile) {
      this.progress.load();
      initialHeroState = {
        x: this.progress.startingHeroX,
        y: this.progress.startingHeroY,
        direction: this.progress.startingHeroDirection,
      }
    }
 
  

  }
  
}
