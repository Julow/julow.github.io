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


function Page(ids, color)
{
	this.elements = [];
	this.color = color;

	for (var i = 0; i < ids.length; ++i)
		this.elements[i] = doc.getElementById(ids[i]);
}
Page.prototype.hide = function()
{
	for (var i = 0; i < this.elements.length; ++i)
		this.elements[i].style.display = 'none';
};
Page.prototype.show = function()
{
	for (var i = 0; i < this.elements.length; ++i)
		this.elements[i].style.display = 'block';
};


var pageMap = {
	"#main":				new Page(["page-main"], "#00adb3"),
	"#uumatter":			new Page(["page-uumatter", "foot-android"], "#6a206a"),
	"#tapwell":				new Page(["page-tapwell", "foot-android"], "#ab7a07"),
	"#leaf":				new Page(["page-leaf", "foot-android"], "#258023"),
	"#language-injector":	new Page(["page-language-injector", "foot-sublime"], "#7e1b1b"),
	"#layout-spliter":		new Page(["page-layout-spliter", "foot-sublime"], "#3b3b3b"),
	"#color-highlight":		new Page(["page-color-highlight", "foot-sublime"], "#2b81ab"),
	"#stop-flash":			new Page(["page-stop-flash", "foot-chrome"], "#8c322b"),
	"#kikoo":				new Page(["page-kikoo", "foot-chrome"], "#7c5231")
};
var style = doc.createElement("style");
doc.getElementsByTagName("head")[0].appendChild(style);
var currPage = null;
var innerStyle = "body{background-color:{{color}};}" +
	"#right-part a,.title-right{color:{{color}};}" +
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
		animation(320, function(p)
		{
			var color = rgbToHex(animationValue(p, currColor.r, toColor.r), animationValue(p, currColor.g, toColor.g), animationValue(p, currColor.b, toColor.b));
			style.innerHTML = repl(innerStyle, {"color": color});
			canvas.setColor(color);
		});
		currPage.hide();
	}
	else
	{
		style.innerHTML = repl(innerStyle, {"color": page.color});
		canvas.setColor(page.color);
	}
	currPage = page;
	page.show();
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
