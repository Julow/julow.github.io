var showPage;

(function(){

function SeparationCanvas(canvas)
{
	this.canvas = canvas;
	this.context = canvas.getContext('2d');

	this.rightColor = "#e9e9e9";
	this.leftColor = "#606459";

	this.x = canvas.width / 2;

	this.newHeight = 0;

	this.checkSize();
}
SeparationCanvas.prototype.checkSize = function()
{
	this.newHeight = document.body.offsetHeight;
};
SeparationCanvas.prototype.render = function()
{
	if (this.newHeight != 0)
	{
		this.canvas.height = this.newHeight;
		this.newHeight = 0;
	}
	this.context.fillStyle = this.rightColor;
	this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.context.fillStyle = this.leftColor;
	this.context.beginPath();
	this.context.moveTo(this.x, 0);
	var y = 0;
	for (; y < this.canvas.height; y += 9)
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


var pageMap = {
	"#blabla-0": {"html": document.getElementById("page-0"), "color": "#03d6dd"},
	"#blabla-1": {"html": document.getElementById("page-1"), "color": "#f58319"},
}
var style = document.createElement("style");
document.getElementsByTagName("head")[0].appendChild(style);
var currPage = null;
var innerStyle = "::selection{background:{{color}};}" +
	"::-moz-selection{background:{{color}};}" +
	"#left-part{background-color:{{color}};}" +
	"#right-part a{color:{{color}};}";
showPage = function(pageName)
{
	var page = pageMap[pageName];
	if (!page)
		return;
	if (currPage)
	{
		currPage.html.style.display = "none";
	}
	currPage = page;
	page.html.style.display = "block";
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
