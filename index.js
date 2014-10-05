(function(doc, win){

function JulooCanvas(canvas)
{
	this.canvas = canvas;
	this.context = canvas.getContext('2d');

	this.color = "#606459";

	this.x = canvas.width / 2;
	this.offsetY = 9;
	this.pointsX = [];

	this.titleX = 170;
	this.titleY = 90;

	this.checkSize();
}
JulooCanvas.prototype.checkSize = function()
{
	var e = doc.documentElement;
	this.canvas.height = 0;
	this.canvas.height = Math.max(e.clientHeight, e.scrollHeight);
	this.render();
};
JulooCanvas.prototype.setColor = function(c)
{
	this.color = c;
	this.render();
}
JulooCanvas.prototype.regen = function()
{
	this.pointsX = [];
	for (var y = 0; y < this.canvas.height; y += this.offsetY)
		this.pointsX.push((Math.random() * 8 - 4 + this.x) | 0);
};
JulooCanvas.prototype.render = function()
{
	var x5 = this.x - 5;
	this.context.fillStyle = this.color;
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.context.beginPath();
	this.context.moveTo(this.x, 0);
	for (var i = 0, y, diff; i < this.pointsX.length; ++i)
		this.context.lineTo(this.pointsX[i], i * this.offsetY);
	this.context.lineTo(x5, this.canvas.height);
	this.context.lineTo(x5, 0);
	this.context.lineTo(this.x, 0);
	this.context.fill();
	this.context.fillRect(0, 35, x5, 75);
	this.context.font = "bold 70px Arial,sans-serif";
	this.context.textAlign = "center";
	this.context.fillStyle = "#e9e9e9";
	this.context.globalCompositeOperation = "source-atop";
	this.context.fillText("JULOO", this.titleX, this.titleY);
	this.context.fillStyle = this.color;
	this.context.globalCompositeOperation = "destination-over";
	this.context.fillText("JULOO", this.titleX, this.titleY);
};

var canvas = new JulooCanvas(doc.getElementById("canvas"));
(function updateLoop()
{
	setTimeout(updateLoop, 200);
	canvas.regen();
	canvas.render();
})();


function repl(str, map)
{
	return str.replace(/\{\{([^\}]+)\}\}/g, function(match, p1)
	{
		return map[p1] || match;
	});
}


function animation(duration, callback)
{
	var startTime = performance.now();
	(function animUpdate()
	{
		var progress = (performance.now() - startTime) / duration;
		if (progress < 1)
			requestAnimationFrame(animUpdate);
		callback((progress > 1)? 1 : (progress - 2) * -progress);
	})();
}
function animationValue(progress, start, end)
{
	if (start > end)
		return start - ((start - end) * progress);
	return (end - start) * progress + start;
}


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


function Page(id, color)
{
	this.element = doc.getElementById(id);
	this.color = color;
}
Page.prototype.setVisible = function(visible)
{
	if (visible)
		this.element.className = this.element.className + " visible";
	else
		this.element.className = this.element.className.replace(/ *visible *|  +/g, " ");
};


var pageMap = {
	"#main":				new Page("page-main", "#188386"),
	"#uumatter":			new Page("page-uumatter", "#6a2f6a"),
	"#tapwell":				new Page("page-tapwell", "#927020"),
	"#leaf":				new Page("page-leaf", "#258023")
};
var style = doc.createElement("style");
doc.getElementsByTagName("head")[0].appendChild(style);
var currPage = null;
var innerStyle = "#right-part a{color:{{color}};}" +
	".banner{box-shadow:0 0px 2px {{color}};border-bottom:1px solid {{color}};}";

function showPage(pageName)
{
	var page = pageMap[pageName];
	if (!page)
		return;
	if (currPage)
	{
		var currColor = hexToRgb(currPage.color);
		var toColor = hexToRgb(page.color);
		animation(270, function(p)
		{
			var color = rgbToHex(animationValue(p, currColor.r, toColor.r), animationValue(p, currColor.g, toColor.g), animationValue(p, currColor.b, toColor.b));
			doc.body.style.backgroundColor = color;
			canvas.setColor(color);
		});
		currPage.setVisible(false);
	}
	else
	{
		doc.body.style.backgroundColor = page.color;
		canvas.setColor(page.color);
	}
	style.innerHTML = repl(innerStyle, {"color": page.color});
	currPage = page;
	page.setVisible(true);
}
if (pageMap[win.location.hash])
	showPage(win.location.hash);
else
	showPage(Object.keys(pageMap)[0]);


function getMargin(pos)
{
	var n = pos / 512;
	return Math.round(n * (10 - n));
}


doc.addEventListener("mousemove", function(e)
{
	var marginX = getMargin(e.clientX);
	var marginY = -getMargin(e.clientY);
	doc.body.style.marginLeft = marginX + "px";
	doc.body.style.marginTop = marginY + "px";
	canvas.titleX = 170 - Math.round(marginX * 0.8);
	canvas.titleY = 90 - marginY;
	canvas.render();
}, false);


win.addEventListener("hashchange", function()
{
	showPage(win.location.hash);
}, false);
win.addEventListener("resize", function()
{
	canvas.checkSize();
}, false);

})(document, window);
