
// 请求用户授权使用陀螺仪
function requestDeviceOrientation() {
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    DeviceOrientationEvent.requestPermission()
      .then((permissionState) => {
        if (permissionState === "granted") {
          window.addEventListener("deviceorientation", () => {});
        }
      })
      .catch(console.error);
  } else {
    // handle regular non iOS 13+ devices
    console.log("not iOS");
  }
}
//get reference to canvas
var canvas = document.getElementById('canvas');

//get reference to canvas context
var context = canvas.getContext('2d');

//get reference to loading screen
var loading_screen = document.getElementById('loading');

//初始化加载变量
var load_counter = 0;
var loaded = false;

//初始化图层图像
var background = new Image();
var girl = new Image();
var computer = new Image();
var paperplane = new Image();
var shadow = new Image();

//制定图层列表
var layer_list = [
{
	'image':background,
	'src':'./images/0.png',
	'z_index':-1,
	'position': {x: 0, y: 0},
	'opacity':1
},
{
	'image':shadow,
	'src':'./images/mask.png',
	'z_index':-0.7,
	'position': {x: 0, y: 0},
	'blend':'multiply',
	'opacity':0.1
},
{
	'image':girl,
	'src':'./images/1.png',
	'z_index':0.25,
	'position': {x: 0, y: 0},
	'blend':null,
	'opacity':1
},
{
	'image':computer,
	'src':'./images/3.png',
	'z_index':0.5,
	'position': {x: 0, y: 0},
	'blend':null,
	'opacity':1
},
{
	'image':paperplane,
	'src':'./images/2.png',
	'z_index':1,
	'position': {x:0,y:0},
	'blend':null,
	'opacity':0.9
}
];

// 读取列表，加载图片资源
layer_list.forEach(function(layer, index) {
	layer.image.onload = function() {
		// Add 1 to the load counter
		load_counter += 1;
		// Checks if all the images are loaded
		if (load_counter >= layer_list.length) {
			// Hide the loading screen
			hideLoading();
			// Start the render Loop!
			requestAnimationFrame(drawCanvas);
		}
	}
	layer.image.src = layer.src;
});

function hideLoading(){
	loading_screen.classList.add('hidden');
}


// 在Canvas里绘画
function drawCanvas() {		
	// Erase everything currently on the canvas
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Update the tween
	TWEEN.update();

	//计算画布应该如何旋转
	var rotate_x = (pointer.y * -0.15) + (motion.y * -1.2);
	var rotate_y = (pointer.x * 0.15) + (motion.x * 1.2);

	var transform_string = "rotateX(" + rotate_x + "deg) rotateY(" + rotate_y + "deg)";


	//旋转画布
	canvas.style.transform = transform_string;


	
	// Loop through each layer in the list and draw it to the canvas
	layer_list.forEach(function(layer, index) {

        layer.position = getOffset(layer);

		
		// If the layer has a blend mode set, use that blend mode, otherwise use normal
		if (layer.blend) {
			context.globalCompositeOperation = layer.blend;
		} else {
			context.globalCompositeOperation = 'normal';
		}
		
		// Set the opacity of the layer
		context.globalAlpha = layer.opacity;
		
		// Draw the layer into the canvas context
		context.drawImage(layer.image, layer.position.x, layer.position.y);
	});
	
	// Loop this function! requestAnimationFrame is a special built in function that can draw to the canvas at 60 frames per second
	// NOTE: do not call drawCanvas() without using requestAnimationFrame here—things will crash!
	requestAnimationFrame(drawCanvas);
}

    function getOffset(layer){
    var touch_multiplier = 0.3;
 	  var touch_offset_x = pointer.x * layer.z_index * touch_multiplier;
 	  var touch_offset_y = pointer.y * layer.z_index * touch_multiplier;

 	  var motion_multiplier = 2;
 	  var motion_offset_x = motion.x * layer.z_index * motion_multiplier;
 	  var motion_offset_y = motion.y * layer.z_index * motion_multiplier;



 	  var offset = {

 		x:touch_offset_x + motion_offset_x,
 		y:touch_offset_y + motion_offset_y
 	  };

    return offset

 }

//// 触摸和鼠标控制 ////

var moving = false;

//// 初始化位置 ////

var pointer_initial = {
	x:0,
	y:0
};

var pointer = {
	x:0,
	y:0
};

canvas.addEventListener('touchstart',pointerStart);
canvas.addEventListener('mousedown',pointerStart);

function pointerStart(event){
	moving = true;
	if (event.type === 'mousedown') {
	pointer_initial.x = event.clientX;
	pointer_initial.y = event.clientY;
   } else if(event.type === 'touchstart'){
	pointer_initial.x = event.touches[0].clientX;
	pointer_initial.y = event.touches[0].clientY;
   }

}

window.addEventListener('touchmove',pointerMove);
window.addEventListener('mousemove',pointerMove);

function pointerMove(event){
	event.preventDefault();
	if(moving === true){
		var current_x = 0;
		var current_y = 0;
		if (event.type === 'touchmove'){
			current_x = event.touches[0].clientX;
			current_y = event.touches[0].clientY;
		} else if(event.type === 'mousemove'){
			current_x = event.clientX;
			current_y = event.clientY;

		}
		pointer.x = current_x - pointer_initial.x;
		pointer.y = current_y - pointer_initial.y;
	}
}

canvas.addEventListener('touchmove',function(event){
	event.preventDefault();
	});

canvas.addEventListener('mousemove',function(event){
	event.preventDefault();
});

window.addEventListener('touchend',function(event){
	endGesture();
});

window.addEventListener('mouseup',function(event){
	endGesture();
});

function endGesture(){
	moving = false;

	TWEEN.removeAll();
	var pointer_tween = new TWEEN.Tween(pointer).to({x:0,y:0},300).easing(TWEEN.Easing.Back.Out).start();

	//// pointer.x = 0;
	//// pointer.y = 0;
}


////动态控制////

//初始化动态视差变量//
var motion_initial = {
	x:null,
	y:null
};

var motion = {
	x:0,
	y:0
};

//监听螺旋仪事件//
window.addEventListener('deviceorientation',function(event){

	if(!motion_initial.x && !motion_initial.y){
		motion_initial.x = event.beta;
		motion_initial.y = event.gamma;
	}

	if(window.orientation === 0){
		//设备没有旋转
		motion.y = event.beta - motion_initial.x;
		motion.x = event.gamma - motion_initial.y;

	} else if (window.orientation === 90){
		//设备旋转90度
		motion.x = event.beta - motion_initial.x;
		motion.y = -event.gamma + motion_initial.y;

	} else if (window.orientation === -90){
		//设备旋转-90度
		motion.y = -event.beta + motion_initial.x;
		motion.x = event.gamma - motion_initial.y;

	} else {
		//设备翻转
		motion.y = -event.beta + motion_initial.x;
		motion.x = -event.gamma + motion_initial.y;

	}

});

window.addEventListener('orientationchange',function(event){
	motion_initial.x = 0;
	motion_initial.y = 0;
});