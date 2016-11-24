var game, trex;
var rl_bot, check_game, cur_state, prev_state, prev_action, reward, isPunished;
var alpha = 0.7;
var state = {
	speed: "",
	dist: "",
	width: "",
}
var prev_state;
var qarr = [];

var bins = {
	speed: [9,13,14], // min:6, max: 13
	dist: [75, 100, 150, 200, 250, 300, 650],  // min = -75, max: 600
	width: [20,30,40,50,60,80,90,100], //possible values: [17,25,34,46,50,51,75], here 46 is bird
	action: ["jump", "not jump"]
}


function init_qarr(){
	/*
	* Initiliazes the qarr structure and values for each state each action to 0
	*/
	var speed, dist, width, ac;
	for(speed=0; speed<bins.speed.length; speed++){
		qarr[speed] = [];
		for(dist=0; dist<bins.dist.length; dist++){
			qarr[speed][dist] = [];
			for(width=0; width<bins.width.length; width++){
				qarr[speed][dist][width] = [];
				for(ac=0; ac<bins.action.length; ac++){
					qarr[speed][dist][width][ac] = 0;
				}
			}
		}
	}
}

window.onload = function(){
	init_qarr();
	var i, j, k;
	game = Runner.instance_;
	trex = Runner.instance_.tRex;
	isPunished = false;
	prev_state = get_curr_state_tuples(game);
	prev_action = 1;
	rl_bot = setInterval(function(){
		/*
		*	Driver bot of the game.
		*/

		if(game.crashed && !isPunished){
			isPunished = true;
			console.log("punished", prev_state, prev_action);
			qarr[prev_state[0]][prev_state[1]][prev_state[2]][prev_action] *= (1-alpha);
			qarr[prev_state[0]][prev_state[1]][prev_state[2]][prev_action] += alpha*(-1000);
		}
		if(game.activated){
			if(isPunished){
				isPunished = false;
			}
			if(!trex.jumping){
				cur_state = get_curr_state_tuples(game);
				if(!cur_state.equals(prev_state)){
					reward = 1;
					reward += 0.99 * max(qarr[cur_state[0]][cur_state[1]][cur_state[2]][0], 
						qarr[cur_state[0]][cur_state[1]][cur_state[2]][1]);
					
					qarr[prev_state[0]][prev_state[1]][prev_state[2]][prev_action] *= (1-alpha);
					qarr[prev_state[0]][prev_state[1]][prev_state[2]][prev_action] += alpha*reward;

					
					if(qarr[cur_state[0]][cur_state[1]][cur_state[2]][0] > qarr[cur_state[0]][cur_state[1]][cur_state[2]][1]){
						trex.startJump(game.currentSpeed);
						prev_action = 0;
					}
					else{
						prev_action = 1;
					}
					

					for(i=0;i<prev_state.length; i++){
						prev_state[i] = cur_state[i];
					}
				}
			}
		}
	},10);

	check_game = setInterval(function(){
		/*
		* Restarts the game if the trex crashed
		*/

		if(!game.activated){
			game.restart();
		}
	},5000);
};

function max(a,b){
	if(b>a){
		return b;
	}
	return a;
}
function get_curr_state_tuples(game){
	/*
	* Returns the current state of game according to "bins" values and some heuristics
	*/

	var i, resp = [];
	var speed, dist, width;
	speed = game.currentSpeed;

	if(game.horizon.obstacles[0]){
		dist = game.horizon.obstacles[0].xPos;
		width = game.horizon.obstacles[0].width;
		if(width == 46){
			// putting types of birds (above trex level and at trex level) in different bins
			if(game.horizon.obstacles[0].yPos > 70){
				width = 85;
			}
			else{
				width = 95;
			}
		}
		if(dist < 50){
			if(game.horizon.obstacles[1]){
				dist = game.horizon.obstacles[1].xPos;
				width = game.horizon.obstacles[1].width;
				if(width == 46){
					// putting types of birds (above trex level and at trex level) in different bins
					if(game.horizon.obstacles[1].yPos > 75){
						width = 85;
					}
					else{
						width = 95;
					}
				}
			}
		}
	}
	else{
		dist = 600;
		width = 17;
	}

	for(i=0; i<bins.speed.length; i++){
		if(speed < bins.speed[i]){
			resp[0] = i;
			break;
		}
	}
	for(i=0; i<bins.dist.length; i++){
		if(dist < bins.dist[i]){
			resp[1] = i;
			break;
		}
	}
	for(i=0; i<bins.width.length; i++){
		if(width < bins.width[i]){
			resp[2] = i;
			break;
		}
	}
	
	return resp;
}

/*
var trex = Runner.instance_.tRex;
var game = Runner.instance_;

toJump :- trex.startJump(game.currentSpeed);
obstacles array :- game.horizon.obstacles
to check crashed :- game.crashed
to restart :- game.restart()

trex:
	jumping
	ducking
	status

obstacles:
	xPos
	yPos
	width


*/



if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
	/*
	* Utility function to check if 2 arrays are equal
	*/

    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}