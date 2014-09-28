(function(){

function SeparationCanvas(canvas)
{
	this.canvas = canvas;
	this.context = canvas.getContext('2d');

	this.leftColor = "#606459";

	this.x = canvas.width / 2;

	this.checkSize();
}
SeparationCanvas.prototype.checkSize = function()
{
	this.canvas.height = 0;
	var e = document.documentElement;
	this.canvas.height = Math.max(e.clientHeight, e.scrollHeight);
	this.render();
};
SeparationCanvas.prototype.render = function()
{
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.context.fillStyle = this.leftColor;
	this.context.beginPath();
	this.context.moveTo(this.x, 0);
	var y = 0;
	for (; y < this.canvas.height; y += 9)
		this.context.lineTo(Math.random() * 8 - 4 + this.x, y);
	y = this.canvas.height;
	this.context.lineTo(Math.random() * 8 - 4 + this.x, y);
	this.context.lineTo(0, y);
	this.context.lineTo(0, 0);
	this.context.lineTo(this.x, 0);
	this.context.fill();
};

var separation = new SeparationCanvas(document.getElementById("separation"));
setInterval(function()
{
	separation.render();
}, 200);


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
	"#main":			new Page(["page-main"], "#00cad1"),
	"#uumatter":		new Page(["page-uumatter", "foot-android"], "#86009e"),
	"#tapwell":			new Page(["page-tapwell", "foot-android"], "#d6bd00"),
	"#leaf":			new Page(["page-leaf", "foot-android"], "#03c200"),
	"#color-highlight":	new Page(["page-color-highlight", "foot-sublime"], "#3296c8"),
	"#layout-spliter":	new Page(["page-layout-spliter", "foot-sublime"], "#393939")
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
	separation.leftColor = page.color;
	style.innerHTML = repl(innerStyle, {"color": page.color});
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
