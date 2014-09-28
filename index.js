(function(){

function SeparationCanvas(canvas)
{
	this.canvas = canvas;
	this.context = canvas.getContext('2d');

	this.color = "#606459";

	this.x = canvas.width / 2;
	this.offsetY = 9;
	this.pointsX = [];

	this.lastHeight = 0;

	this.checkSize();
}
SeparationCanvas.prototype.checkSize = function()
{
	var e = document.documentElement;
	var height = Math.max(e.clientHeight, e.scrollHeight);
	if (height == this.lastHeight)
		return;
	this.lastHeight = height;
	this.canvas.height = 0;
	this.canvas.height = height;
	this.render();
};
SeparationCanvas.prototype.regen = function()
{
	this.pointsX = [];
	for (var y = 0; y < this.canvas.height; y += this.offsetY)
		this.pointsX.push((Math.random() * 8 - 4 + this.x) | 0);
};
SeparationCanvas.prototype.render = function()
{
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.context.fillStyle = this.color;
	this.context.beginPath();
	this.context.moveTo(this.x, 0);
	for (var i = 0, y, diff; i < this.pointsX.length; ++i)
		this.context.lineTo(this.pointsX[i], i * this.offsetY);
	this.context.lineTo(0, this.canvas.height);
	this.context.lineTo(0, 0);
	this.context.lineTo(this.x, 0);
	this.context.fill();
};

var separation = new SeparationCanvas(document.getElementById("separation"));
(function updateLoop()
{
	setTimeout(updateLoop, 200);
	separation.regen();
	separation.render();
})();


function repl(str, map)
{
	return str.replace(/\{\{([^\}]+)\}\}/g, function(match, p1)
	{
		return map[p1] || match;
	});
}


function Page(ids, color)
{
	this.elements = [];
	this.color = color;

	for (var i = 0; i < ids.length; ++i)
		this.elements[i] = document.getElementById(ids[i]);
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
	"#main":			new Page(["page-main"], "#00adb3"),
	"#uumatter":		new Page(["page-uumatter", "foot-android"], "#690069"),
	"#tapwell":			new Page(["page-tapwell", "foot-android"], "#d6bd00"),
	"#leaf":			new Page(["page-leaf", "foot-android"], "#03ba01"),
	"#color-highlight":	new Page(["page-color-highlight", "foot-sublime"], "#2b81ab"),
	"#layout-spliter":	new Page(["page-layout-spliter", "foot-sublime"], "#3b3b3b")
};
var style = document.createElement("style");
document.getElementsByTagName("head")[0].appendChild(style);
var currPage = null;
var innerStyle = "::selection{background:{{color}};}" +
	"::-moz-selection{background:{{color}};}" +
	"#left-part{background-color:{{color}};}" +
	"#right-part a,.title-right{color:{{color}};}";

function showPage(pageName)
{
	var page = pageMap[pageName];
	if (!page)
		return;
	if (currPage)
		currPage.hide();
	currPage = page;
	page.show();
	style.innerHTML = repl(innerStyle, {"color": page.color});
	separation.color = page.color;
	separation.render();
}
if (pageMap[window.location.hash])
	showPage(window.location.hash);
else
	showPage(Object.keys(pageMap)[0]);


window.addEventListener("hashchange", function()
{
	showPage(window.location.hash);
}, false);
window.addEventListener("resize", function()
{
	separation.checkSize();
}, false);

})();
