function Ship(ctx){
	gameMonitor.im.loadImage(['images/player.png']);
	this.width = 80;
	this.height = 92;
	this.left = gameMonitor.w/2 - this.width/2;
	this.top = gameMonitor.h - 2*this.height;
	this.player = gameMonitor.im.createImage('images/player.png');

	this.paint = function(){
		ctx.drawImage(this.player, this.left, this.top, this.width, this.height);
	}

	this.setPosition = function(event){
		if(gameMonitor.isMobile()){
			var tarL = event.changedTouches[0].clientX;
			var tarT = event.changedTouches[0].clientY;
		}
		else{
			var tarL = event.offsetX;
			var tarT = event.offsetY;
		}
		this.left = tarL - this.width/2 - 16;
		// this.bottom = 0;
		this.top = tarT - this.height/2;
		if(this.left<0){
			this.left = 0;
		}
		if(this.left>$(window).width()-this.width){
			this.left = $(window).width()-this.width;
		}
		if(this.top<0){
			this.top = 0;
		}
		if(this.top>gameMonitor.h - this.height){
			this.top = gameMonitor.h - this.height;
		}
		this.paint();
	}

	this.controll = function(){
		var _this = this;
		var stage = $('#gamepanel');
		var currentX = this.left,
			currentY = this.top,
			move = false;
		stage.on(gameMonitor.eventType.start, function(event){
			_this.setPosition(event);
			move = true;
		}).on(gameMonitor.eventType.end, function(){
			move = false;
		}).on(gameMonitor.eventType.move, function(event){
			event.preventDefault();
			if(move){
				_this.setPosition(event);	
			}
			
		});
	}

	this.eat = function(foodlist){
		for(var i=foodlist.length-1; i>=0; i--){
			var f = foodlist[i];
			if(f){
				var l1 = this.top+this.height/2 - (f.top+f.height/2);
				var l2 = this.left+this.width/2 - (f.left+f.width/2);
				var l3 = Math.sqrt(l1*l1 + l2*l2);
				if(l3<=this.height/2 + f.height/2){
					foodlist[f.id] = null;
					if(f.type==0){
						gameMonitor.stop();
						document.getElementById('bomb').play();
						document.getElementById('game_music').pause();
						$('#gameoverPanel').show();
						$(".result_failed").show();
						$(".result_success").hide();
						// setTimeout(function(){
						// 	$('#gameoverPanel').hide();
						// 	$('#resultPanel').show();
						// 	gameMonitor.getScore();
						// }, 2000);
					}
					else{
						$('#score').text(++gameMonitor.score);
					}
				}
			}
			
		}
	}
}

//随机产生物品
function goods() {
	var i = randomNum(1, 6);
	var imgPath = 'images/goods' + i + '.png';
	return imgPath;
}

//随机产生1-5之内的整数
function randomNum(){
    return parseInt((Math.random() * 6));
}

function Food(type, left, id){
	this.speedUpTime = 300;
	this.id = id;
	this.type = type;
	this.width = 45;
	this.height = 52;
	this.left = left;
	this.top = -52;
	this.speed = 0.06 * Math.pow(1.2, Math.floor(gameMonitor.time/this.speedUpTime));
	this.loop = 0;
	var p = this.type == 0 ? 'images/bomb.png' : goods();
	this.pic = gameMonitor.im.createImage(p);
}
Food.prototype.paint = function(ctx){
	ctx.drawImage(this.pic, this.left, this.top, this.width, this.height);
}
Food.prototype.move = function(ctx){
	if(gameMonitor.time % this.speedUpTime == 0){
		this.speed *= 1.4;
	}
	this.top += ++this.loop * this.speed;
	if(this.top>gameMonitor.h){
	 	gameMonitor.foodList[this.id] = null;
	}
	else{
		this.paint(ctx);
	}
}


function ImageMonitor(){
	var imgArray = [];
	return {
		createImage : function(src){
			return typeof imgArray[src] != 'undefined' ? imgArray[src] : (imgArray[src] = new Image(), imgArray[src].src = src, imgArray[src])
		},
		loadImage : function(arr, callback){
			for(var i=0,l=arr.length; i<l; i++){
				var img = arr[i];
				imgArray[img] = new Image();
				imgArray[img].onload = function(){
					if(i==l-1 && typeof callback=='function'){
						callback();
					}
				}
				imgArray[img].src = img
			}
		}
	}
}

//游戏设定初始时间
var _gameTimeNum = 2000; 
var GameTimeLayer = $(".time_limit");
var status = 2; //进入游戏的状态，后台设置初次进入为1，其他为2
//游戏时间
function gameTime(){
	if(status == 1) {
		_gameTimeNum --;
		if( _gameTimeNum <= 0){
			GameTimeLayer.html('时间到');
			gameMonitor.stop();	
			document.getElementById('game_music').pause();
			$('#gameoverPanel').show();
			var myScore =  gameMonitor.getScore();
			if(myScore == 0) {
				$(".result_failed").show();
			}else if(myScore < 10) {
				$(".result_failed").show();
			}else {
				$(".result_success").show();
				$(".result_failed").hide();
			}	
		}else{
			GameTimeLayer.html(creatTimeText(_gameTimeNum));
		}	
	}else if(status == 2) {
		_gameTimeNum --;
		if( _gameTimeNum <= 0){
			GameTimeLayer.html('时间到');
			gameMonitor.stop();	
			document.getElementById('game_music').pause();
			$('#gameoverPanel').show();
			var myScore =  gameMonitor.getScore();
			var best = cookie("score");
			if(myScore == 0) {
				$(".result_failed").show();
				$(".result_success").hide();
			}else if(myScore < 10) {
				$(".result_failed").show();
				$(".result_success").hide();
			}else if(!best || myScore > best){
				best = myScore;
		 		cookie("score", best, 100);
				$(".result_success").show();
				$(".result_failed").hide();
			}else{
				$(".result_failed").show();
				$(".result_success").hide();
			}	
		}else{
			GameTimeLayer.html(creatTimeText(_gameTimeNum));
		}
	}	
}
//游戏倒计时
function creatTimeText(n){
	var text = (100000+n+'').substr(-4,4);
	text = '&nbsp;&nbsp;'+text.substr(0,2)+"'"+text.substr(2)+"''"
	return text;
}

var gameMonitor = {
	w : $(window).width(),
	h : $(window).height(),
	bgWidth : $(window).width(),
	bgHeight : $(window).height(),
	time : 0,
	timmer : null,
	bgSpeed : 2,
	bgloop : 0,
	score : 0,
	im : new ImageMonitor(),
	foodList : [],
	bgDistance : 0,//背景位置
	eventType : {
		start : 'touchstart',
		move : 'touchmove',
		end : 'touchend'
	},
	init : function(){
		var _this = this;
		var canvas = document.getElementById('stage');
		var ctx = canvas.getContext('2d');
		canvas.width = $(window).width();
		canvas.height = $(window).height();
		//绘制背景
		var bg = new Image();
		_this.bg = bg;
		bg.onload = function(){
          	ctx.drawImage(bg, 0, 0, _this.bgWidth, _this.bgHeight);          	
		}
		bg.src = 'images/bg.jpg';

		_this.initListener(ctx);


	},
	initListener : function(ctx){
		var _this = this;
		var body = $(document.body);
		$(document).on(gameMonitor.eventType.move, function(event){
			event.preventDefault();
		});
		body.on(gameMonitor.eventType.start, '.replay_btn, .playagain', function(){
			$('#gameoverPanel').hide();
			document.getElementById('game_music').load();
			document.getElementById('game_music').play();
			_gameTimeNum = 2000;
			var canvas = document.getElementById('stage');
			var ctx = canvas.getContext('2d');
			_gameTime = setInterval(gameTime, 10)
			_this.ship = new Ship(ctx);
      		_this.ship.controll();
      		_this.reset();
			_this.run(ctx);
		});

		body.on(gameMonitor.eventType.start, '#frontpage', function(){
			$('#frontpage').css('left', '-100%');
			gameTime();
		});

		body.on(gameMonitor.eventType.start, '#gameGuide', function(){
			$(this).parent().hide();
			document.getElementById('cartoon_music').pause();
			document.getElementById('game_music').play();
			_gameTime = setInterval(gameTime, 10)
			_this.ship = new Ship(ctx);
			_this.ship.paint();
      		_this.ship.controll();
			gameMonitor.run(ctx);
		});

		body.on(gameMonitor.eventType.start, '.share', function(){
			$('.weixin-share').show().on(gameMonitor.eventType.start, function(){
				$(this).hide();
			});
		});

		body.on(gameMonitor.eventType.start, '.back_btn', function() {
			_gameTimeNum = 2000;
			var canvas = document.getElementById('stage');
			var ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, $(window).width(), $(window).height);
			_this.ship = new Ship(ctx);
			_this.ship.paint();
      		_this.reset();
      		canvas.width = $(window).width();
			canvas.height = $(window).height();
			//绘制背景
			var bg = new Image();
			_this.bg = bg;
			bg.onload = function(){
	          	ctx.drawImage(bg, 0, 0, _this.bgWidth, _this.bgHeight);          	
			}
			bg.src = 'images/bg.jpg';
			$("#gameoverPanel").hide();
			$("#second_duty").show();
		});

	},
	rollBg : function(ctx){
		ctx.drawImage(this.bg, 0, this.bgDistance, this.bgWidth, this.bgHeight);
	},
	run : function(ctx){
		var _this = gameMonitor;
		ctx.clearRect(0, 0, _this.bgWidth, _this.bgHeight);
		_this.rollBg(ctx);

		//绘制飞船
		_this.ship.paint();
		_this.ship.eat(_this.foodList);


		//产生物品
		_this.genorateFood();

		//绘制物品
		for(i=_this.foodList.length-1; i>=0; i--){
			var f = _this.foodList[i];
			if(f){
				f.paint(ctx);
				f.move(ctx);
			}
			
		}
		_this.timmer = setTimeout(function(){
			gameMonitor.run(ctx);
		}, Math.round(1000/65));

		_this.time++;
	},
	stop : function(){
		var _this = this
		$('#stage').off(gameMonitor.eventType.start + ' ' +gameMonitor.eventType.move);
		clearInterval(_gameTime);
		setTimeout(function(){
			clearTimeout(_this.timmer);
		}, 0);
		
	},
	genorateFood : function(){
		var genRate = 30; //产生物品的频率
		var random = Math.random();
		if(random*genRate>genRate-1){
			var left = Math.random()*(this.w - 45);
			var type = Math.floor(left)%3 == 0 ? 0 : 1;
			var id = this.foodList.length;
			var f = new Food(type, left, id);
			this.foodList.push(f);
		}
	},
	reset : function(){
		this.foodList = [];
		this.bgloop = 0;
		this.score = 0;
		this.timmer = null;
		this.time = 0;
		$('#score').text(this.score);
	},
	getScore : function(){
		var time = Math.floor(this.time/60);
		var score = this.score;
		return score;
	},
	isMobile : function(){
		var sUserAgent= navigator.userAgent.toLowerCase(),
		bIsIpad= sUserAgent.match(/ipad/i) == "ipad",
		bIsIphoneOs= sUserAgent.match(/iphone os/i) == "iphone os",
		bIsMidp= sUserAgent.match(/midp/i) == "midp",
		bIsUc7= sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
		bIsUc= sUserAgent.match(/ucweb/i) == "ucweb",
		bIsAndroid= sUserAgent.match(/android/i) == "android",
		bIsCE= sUserAgent.match(/windows ce/i) == "windows ce",
		bIsWM= sUserAgent.match(/windows mobile/i) == "windows mobile",
		bIsWebview = sUserAgent.match(/webview/i) == "webview";
		return (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM);
     }
}
if(!gameMonitor.isMobile()){
	gameMonitor.eventType.start = 'mousedown';
	gameMonitor.eventType.move = 'mousemove';
	gameMonitor.eventType.end = 'mouseup';
}

gameMonitor.init();

function cookie(name, value, time) {
	if (name) {
		if (value) {
			if (time) {
				var date = new Date();
				date.setTime(date.getTime() + 864e5 * time), time = date.toGMTString();
			}
			return document.cookie = name + "=" + escape(toStr(value)) + (time ? "; expires=" + time + (arguments[3] ? "; domain=" + arguments[3] + (arguments[4] ? "; path=" + arguments[4] + (arguments[5] ? "; secure" : "") : "") : "") : ""), !0;
		}
		return value = document.cookie.match("(?:^|;)\\s*" + name.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1") + "=([^;]*)"), value = value && "string" == typeof value[1] ? unescape(value[1]) : !1, (/^(\{|\[).+\}|\]$/.test(value) || /^[0-9]+$/g.test(value)) && eval("value=" + value), value;
	}
	var data = {};
	value = document.cookie.replace(/\s/g, "").split(";");
	for (var i = 0; value.length > i; i++) name = value[i].split("="), name[1] && (data[name[0]] = unescape(name[1]));
	return data;
}
function toStr(obj) {
    if ( typeof obj == 'object' ) {
        return JSON.stringify(obj);
    } else {
        return obj;
    }
    return '';
}
