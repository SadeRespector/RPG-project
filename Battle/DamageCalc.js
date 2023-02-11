function damageCalc() {
        level = 1,
        attackStat = 2 
        attackPower =  2
        defenseStat = 4
        weakResist = 1
        stab = 1
        randomNumber = 8

    return ((((2 * level) + 10)/250) * (attackStat/defenseStat) * (attackPower) + 2) * stab * weakResist * ((randomNumber+85)/100);
}

function getdmg(){
    var answer = Math.floor(damageCalc());
 console.log(answer);
};

   
var criticalHit = Math.floor((Math.random() * 15) + 1)

document.getElementById("Crit").onclick = function(){
var crit = Math.floor(criticalHit)
document.getElementById("logCrit").innerHTML =crit
}
