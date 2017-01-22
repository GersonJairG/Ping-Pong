//para crear el concepto de tablero y los elementos.
(function () {
	self.Board = function(width,height){
		this.width = width;
		this.height = height;
		this.playing = false;
		this.game_over= false;
		this.bars = [];
		this.ball = null;
		this.playing = false;
	}

	self.Board.prototype = {
		get elements(){
			var elements = this.bars.map(function(bar){
				return bar;
			});
			elements.push(this.ball);
			return elements;
		}
	}
})();

(function(){
	self.Ball = function(x,y,radius,board){
		this.x = x;
		this.y = y;
		this.radius= radius;
		this.speed_y = 0;
		this.speed_x = 3;
		this.board = board;
		board.ball = this;
		this.kind= "circle";
		this.direction = -1;
		this.bounce_angle= 0;
		this.max_bounce_angle = Math.PI /12;
		this.speed = 3;
		//GitHubIni
		this.rebote = 1;
		//gitHubFin


	}

	self.Ball.prototype = {
		/*move : function(){
			this.x += (this.speed_x* this.direction);
			this.y += (this.speed_y);
		},*/
		//gitHubIni
		move: function(){
			if (this.y >= 399 || this.y <= 1){
				this.rebote = this.direction;
			}
			
			this.x += (this.speed_x * this.direction);
			this.y += (this.speed_y * this.rebote);
		},
		//gitHubFin
		get width(){
			return this.radius*2;
		},
		get height(){
			return this.radius*2;
		},
		collision : function(bar){
			//Reacciona con una colision con una barra que pasamos como parametro.
			var relative_intersect_y = ( bar.y + (bar.height/2) ) - this.y;

			var normalized_intersect_y = relative_intersect_y / (bar.height/2);

			this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;
			
			this.speed_y = this.speed * -Math.sin(this.bounce_angle);
			this.speed_x = this.speed * Math.cos(this.bounce_angle);

			if(this.x > (this.board.width/2)){
			 this.direction = -1;
			}else {
				this.direction = 1;
			}
			

		}
	}
})();

(function(){
	self.Bar = function(x,y,width,height,board){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.board = board;
		this.board.bars.push(this);
		this.kind = "rectangle";
		this.speed = 10;
	}

	self.Bar.prototype= {
		down: function(){
			this.y+=this.speed;
			
		},
		up: function(){
			this.y-=this.speed;
			
		},
		toString : function(){
			return "x: "+this.x + ",y: " + this.y;
		}
}
})();
//para la vista del tablero.
(function(){
	self.BoardView = function(canvas,board){
		this.canvas = canvas;
		this.canvas.width = board.width;
		this.canvas.height = board.height;
		this.board = board;
		this.cxt = canvas.getContext("2d");
		//gitHubIni
		this.marcador_a = 0;
		this.marcador_b = 0;
		//gitHubFin

	}

	self.BoardView.prototype = {
		clean: function(){
			this.cxt.clearRect(0,0,this.board.width,this.board.height);
		},
		draw : function(){
			for (var i = this.board.elements.length - 1; i >= 0; i--) {
				var el = this.board.elements[i];
				draw(this.cxt,el);
			}
		},

		check_collisions: function(){
			for (var i = this.board.bars.length - 1; i >= 0; i--) {
					var bar = this.board.bars[i];
					if (hit(bar,this.board.ball)) {
						this.board.ball.collision(bar);
						
					}


			}
		},
		//gitHubIni
		check_goal: function(){
			var goal = false;
			if (this.board.ball.x >= 800){
				this.marcador_a++;
				console.log("Goal A "+this.marcador_a);
				this.board.playing = false;
				goal = true;
			}else if(this.board.ball.x <= 0){
				this.marcador_b++;
				console.log("Goal B "+this.marcador_b);
				this.board.playing = false;
				goal = true;
			}
			return goal;
		},
		refresh_scoreboard: function(){
			var sbA = document.getElementById('teamA').innerHTML = this.marcador_a.toString();
			var sbB = document.getElementById('teamB').innerHTML = this.marcador_b.toString();
		},
		//gitHubFin
		play : function(){
				
	 	 	if (this.board.playing===true) {
	 	 		this.clean();
	 	 		this.draw();
	 	 		this.check_collisions();
	 	 		//gitHubIni
	 	 		if (this.check_goal()=== true){
					this.refresh_scoreboard();
					this.board.ball.x = 400;
					this.board.ball.y = 200;
					this.clean();
					this.draw();
					this.board.playing = false;
				}
	 	 		//gitHubFin
	 	 		this.board.ball.move();	 	 		
	 	 	}
	 	 	
		}
	}

	function hit(a,b){
		//Revisa si a colisiona con b

		var hit = false;
		//Colisiones Horizontales.
		if (b.x + b.width>= a.x && b.x < a.x+ a.width) {
			//Colisiones verticales
			if(b.y + b.height >= a.y && b.y < a.y + a.height){
				hit = true;
			}
		}
		//Colisión de a con b
		if(b.x <= a.x && b.x + b.width >= a.x + a.width){
			if(b.y <= a.y && b.y + b.height >= a.y + a.height){
				hit = true;
			}
		}
		//Colisión b con a
		if(a.x <= b.x && a.x + a.width >= b.x + b.width){
			if(a.y <= b.y && a.y + a.height >= b.y + b.height){
				hit = true;
			}
		}
		
		return hit;

	}

	//para pintar los cuadrados
	function draw(cxt,element){
			//if (element!==null && element.hasOwnProperty("kind")) {
				switch(element.kind){
				case "rectangle":
					cxt.fillRect(element.x,element.y,element.width,element.height);
					break;

				case "circle":
					cxt.beginPath();
					cxt.arc(element.x,element.y,element.radius,0,7);
					// 0 y 7, no se exactamente por que, pero es para hacer un circulo en canvas.
					cxt.fill();
					cxt.closePath();
					break;
			//}
		
		}
	}
})();
	

	var board = new Board(800,400);
	var bar = new Bar(20,100,40,100,board);
	var bar_2 = new Bar(730,100,40,100,board);
	var ball = new Ball(350,100,10,board);
	//extraemos el canvas del html
	var canvas = document.getElementById("canvas");
	var board_view = new BoardView(canvas,board);
	

	//para mover hacia abajo o hacia arriba las barras.
	document.addEventListener("keydown",function(ev){
		
		
		//ev.keyCode devuelve un numero exclusivo de cada tecla, en este caso nos referimos
		//a la tecla hacia abajo y la tecla hacia arriba.
		console.log(ev.keyCode);
		if (ev.keyCode==38) {
			//para prevenir que se mueva la pagina respecto las teclas que presionemos.
			ev.preventDefault();
			//Arriba
			bar.up();
			console.log(bar.toString());
		}else if (ev.keyCode==40) {
			//para prevenir que se mueva la pagina respecto las teclas que presionemos.
			ev.preventDefault();
			//Abajo
			bar.down();
			console.log(bar.toString());
		}else if (ev.keyCode==87) {
			//para prevenir que se mueva la pagina respecto las teclas que presionemos.
			ev.preventDefault();
			//W
			bar_2.up();
			console.log(bar_2.toString());
		}else if (ev.keyCode == 83) {
			//para prevenir que se mueva la pagina respecto las teclas que presionemos.
			ev.preventDefault();
			//S
			bar_2.down();
			console.log(bar_2.toString());
		}else if (ev.keyCode == 32) {
			ev.preventDefault();
			//Barra espaciadora
			board.playing = !board.playing;
		}

		
	});
	//window.addEventListener("load",main);
	board_view.draw();
	window.requestAnimationFrame(controller);


function controller(){
 	
	board_view.play();
	window.requestAnimationFrame(controller);
}
