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

var pageMap = {
	"#main":			{"color": "#00cad1", "html": document.getElementById("page-main")},
	"#color-highlight":	{"color": "#3296c8", "html": document.getElementById("page-color-highlight")},
	"#sublime-layout":	{"color": "#232323", "html": document.getElementById("page-sublime-layout")},
	"#uumatter":		{"color": "#86009e", "html": document.getElementById("page-uumatter")},
	"#tapwell":			{"color": "#d6bd00", "html": document.getElementById("page-tapwell")},
	"#leaf":			{"color": "#03c200", "html": document.getElementById("page-leaf")}
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
