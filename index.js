/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jaguillo <jaguillo@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2015/01/28 21:33:06 by jaguillo          #+#    #+#             */
/*   Updated: 2015/01/28 22:26:14 by jaguillo         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

(function(doc, win, animFrame){

var DEFAULT_COLOR = (function()
{
	var DARKNESS = 110;
	var h = Math.random() * 6;
	var rand = (Math.random() * DARKNESS) | 0;
	if (h < 1)
		return (rgbToHex(DARKNESS, rand, 0));
	else if (h < 2)
		return (rgbToHex(DARKNESS - rand, DARKNESS, 0));
	else if (h < 3)
		return (rgbToHex(0, DARKNESS, rand));
	else if (h < 4)
		return (rgbToHex(0, DARKNESS - rand, DARKNESS));
	else if (h < 5)
		return (rgbToHex(rand, 0, DARKNESS));
	return (rgbToHex(DARKNESS, 0, DARKNESS - rand));
})();

var COLOR_ANIM = 320;

var JulooCanvas = fus(function(canvas)
{
	this.canvas = canvas;
	this.context = canvas.getContext("2d");

	this.cacheCanvas = doc.createElement("canvas");
	this.cacheContext = this.cacheCanvas.getContext("2d");

	this.color = "rgba(0,0,0,0)";

	this.x = this.canvas.width - 150;

	this.initialTitleX = this.canvas.width - 130;
	this.initialTitleY = 90;
	this.titleX = this.initialTitleX;
	this.titleY = this.initialTitleY;

	this.checkSize();
}, {
	checkSize: function()
	{
		this.canvas.height = doc.getElementById("right-part").offsetHeight;
		this.render();
	},
	setColor: function(c)
	{
		this.color = c;
		this.cacheContext.globalCompositeOperation = "source-atop";
		this.cacheContext.fillStyle = c;
		this.cacheContext.fillRect(0, 0, this.cacheCanvas.width, this.cacheCanvas.height);
		this.render();
	},
	regen: function()
	{
		this.cacheCanvas.width = 0;
		this.cacheCanvas.width = 10;
		this.cacheCanvas.height = this.canvas.height;
		this.cacheContext.globalCompositeOperation = "destination-over";
		this.cacheContext.fillStyle = this.color;
		this.cacheContext.beginPath();
		this.cacheContext.moveTo(5, 0);
		for (var y = 0; y < this.canvas.height + 9; y += 9)
			this.cacheContext.lineTo(((Math.random() * 8) | 0) + 1, y);
		this.cacheContext.lineTo(0, this.canvas.height);
		this.cacheContext.lineTo(0, 0);
		this.cacheContext.lineTo(5, 0);
		this.cacheContext.fill();
	},
	render: function()
	{
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.drawImage(this.cacheCanvas, this.x - 5, 0);
		this.context.fillStyle = this.color;
		this.context.fillRect(0, 35, this.x - 5, 150);
		this.context.font = "bold 70px Arial,sans-serif";
		this.context.textAlign = "center";
		this.context.fillStyle = "#e9e9e9";
		this.context.globalCompositeOperation = "source-atop";
		this.context.fillText("JULOO", this.titleX, this.titleY);
		this.context.fillStyle = this.color;
		this.context.globalCompositeOperation = "destination-over";
		this.context.fillText("JULOO", this.titleX, this.titleY);
	}
});

var canvas = new JulooCanvas(doc.getElementById("canvas"));
animFrame(function updateLoop()
{
	setTimeout(updateLoop, 200);
	canvas.regen();
	canvas.checkSize();
});

function repl(str, map)
{
	return str.replace(/\{\{([^\}]+)\}\}/g, function(match, p1)
	{
		return map[p1] || match;
	});
}

var Animation = fus(function(duration, frame)
{
	this.progress = 0;
	this.startTime = Date.now();
	this.duration = duration;
	this.ended = false;

	var self = this;
	animFrame(function animUpdate()
	{
		if (self.ended)
			return;
		self.update();
		animFrame(animUpdate);
		frame();
	});
}, {
	update: function()
	{
		var p = Date.now() - this.startTime;
		if (p < this.duration)
		{
			p /= this.duration;
			this.progress = (2 - p) * p;
		}
		else
		{
			this.progress = 1;
			this.ended = true;
		}
	},
	value: function(start, end)
	{
		return (start > end)? start - ((start - end) * this.progress) : (end - start) * this.progress + start;
	},
	stop: function()
	{
		this.ended = true;
	}
});

function hexToRgb(hex)
{
	var len = (hex.length == 4)? 1 : 2;
	function getNum(index)
	{
		var h = hex.substr(1 + index, len);
		return parseInt((len == 1)? h + h : h, 16);
	}
	return {r: getNum(0), g: getNum(len), b: getNum(len + len)};
}
function rgbToHex(r, g, b)
{
	return "#" + (0x01000000 + (r << 16) + (g << 8) + b).toString(16).substr(1, 6);
}

var style = doc.createElement("style");
doc.getElementsByTagName("head")[0].appendChild(style);
var currColor = null;
var animColor = null;
var lastAnim = null;
var innerStyle = "::selection{background:{{c}};text-shadow:none;}" +
	"::-moz-selection{background:{{c}};text-shadow:none;}" +
	"#right-part a{color:{{c}};}";

function setColor(color)
{
	if (currColor && (color === currColor || color === animColor))
		return;
	if (currColor)
	{
		var fromColor = hexToRgb(currColor);
		var toColor = hexToRgb(color);
		if (lastAnim)
			lastAnim.stop();
		lastAnim = new Animation(COLOR_ANIM, function()
		{
			currColor = rgbToHex(lastAnim.value(fromColor.r, toColor.r), lastAnim.value(fromColor.g, toColor.g), lastAnim.value(fromColor.b, toColor.b));
			doc.body.style.backgroundColor = currColor;
			canvas.setColor(currColor);
		});
		animColor = color;
	}
	else
	{
		currColor = color;
		doc.body.style.backgroundColor = color;
		canvas.setColor(color);
	}
	style.innerHTML = repl(innerStyle, {"c": color});
}

function getMargin(pos)
{
	var n = pos / 224;
	//return Math.round(n * (20 - n) * 10) / 10;
	return Math.round(n * (20 - n));
}
var layout = doc.getElementById("layout");
var nextMouseMove = 0;
doc.addEventListener("mousemove", function(e)
{
	var n = Date.now();
	if (nextMouseMove > n)
		return;
	nextMouseMove = (n | 0) + 25;
	var marginX = getMargin(e.clientX);
	var marginY = -getMargin(e.clientY);
	layout.style.marginLeft = marginX + "px";
	layout.style.marginTop = marginY + "px";
	layout.style.paddingBottom = -marginY + "px";
	canvas.titleX = canvas.initialTitleX - Math.round(marginX * 0.8);
	canvas.titleY = canvas.initialTitleY - marginY;
	canvas.render();
}, false);

function getAttribute(element, attribute)
{
	while (element && element.nodeName != doc.nodeName)
	{
		var data = element.getAttribute(attribute);
		if (data)
			return data;
		element = element.parentNode;
	}
	return null;
}

doc.addEventListener("mouseout", function(e)
{
	var c = getAttribute(e.relatedTarget, "data-bgcolor") || DEFAULT_COLOR;
	if (c != "none")
		setColor(c);

}, false);

win.addEventListener("hashchange", function()
{
}, false);

win.addEventListener("resize", function()
{
	canvas.checkSize();
}, false);

setColor(DEFAULT_COLOR);

})(document, window, requestAnimationFrame || function(c){setTimeout(c, 20);});
