(function(doc, win, animFrame){

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
		for (var y = 0; y < this.canvas.height; y += 9)
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
	canvas.render();
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
function colorDiff(c1, c2)
{
	return Math.max(c1.r, c2.r) - Math.min(c1.r, c2.r)
		+ Math.max(c1.g, c2.g) - Math.min(c1.g, c2.g)
		+ Math.max(c1.b, c2.b) - Math.min(c1.b, c2.b);
}

var Page = fus(function(id, color)
{
	this.element = doc.getElementById(id);
	this.color = color;
}, {
	setVisible: function(visible)
	{
		this.element.className = (visible)? this.element.className + " visible" : this.element.className.replace("visible", "");
	}
});

var CasePage = fus(function(id, color, json)
{
	CasePage.super(this)(id, color);
	this.cases = [];
	if (this.element.className.indexOf("case-table") < 0)
		this.element.className += " case-table";
	for (var i = 0; i < json.length; ++i)
	{
		var c = json[i];
		var div = doc.createElement("div");
		if (c.type === "image")
		{
			div.className = "case big-center";
			var img = doc.createElement("img");
			img.src = c.img;
			if (c.link)
			{
				var link = doc.createElement("a");
				link.href = c.link;
				link.target = "_blank";
				link.appendChild(img);
				div.appendChild(link);
			}
			else
				div.appendChild(img);
		}
		else
		{
			div.className = "case";
			if (c.title)
			{
				var title = doc.createElement("h2");
				title.innerHTML = c.title;
				div.appendChild(title);
			}
			div.innerHTML += c.content || "";
			if (c.links)
			{
				for (var j = 0; j < c.links.length; ++j)
				{
					var link = c.links[j];
					var p = doc.createElement("p");
					var a = doc.createElement("a");
					a.href = link.href;
					a.target = "_blank";
					a.innerHTML = link.text;
					p.appendChild(a);
					div.appendChild(p);
				}
			}
		}
		if (c.large)
			div.className += " large";
		if (c.labels)
		{
			for (var l in c.labels)
			{
				var label = doc.createElement("div");
				label.className = l;
				if (c.category && l === "type")
				{
					var a = doc.createElement("a");
					a.href = "#" + c.category;
					a.innerHTML = c.labels[l];
					label.appendChild(a);
				}
				else
				{
					label.innerHTML = c.labels[l];
				}
				div.appendChild(label);
			}
		}
		if (c.data)
		{
			for (var data in c.data)
				div.setAttribute("data-" + data, c.data[data]);
		}
		this.cases.push(div);
	}
}, {
	setVisible: function(visible)
	{
		for (var i = 0; i < this.cases.length; ++i)
		{
			if (visible)
				this.element.appendChild(this.cases[i]);
			else
				this.element.removeChild(this.cases[i]);
		}
		CasePage.super(this, "setVisible")(visible);
	}
}, Page);

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
		lastAnim = new Animation(colorDiff(fromColor, toColor) * 1.5, function()
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

var mainPageJSON = [
	{
		"title": "Juloo Color Schemes",
		"category": "sublime-text",
		"content": "<p>My color schemes for Sublime Text.</p>",
		"links": [
			{
				"href": "https://github.com/Julow/Juloo-Color-Schemes",
				"text": "Github repo"
			}
		],
		"labels": {
			"type": "Sublime Text"
		}
	},
	{
		"title": "lslAbFh",
		"category": "sh",
		"content": "<p>An alias for the <i>ls</i> command<br />with a colorful and easy to read output.</p>",
		"links": [
			{
				"href": "https://github.com/Julow/lslAbFh",
				"text": "Github repo"
			}
		],
		"labels": {
			"type": "Shell"
		}
	},
	{
		"title": "Fus 2",
		"category": "js",
		"content": "<p>OOP base.<br />Inline class creation and inheritance</p>",
		"links": [
			{
				"href": "https://github.com/Julow/Fus2",
				"text": "Github repo"
			}
		],
		"labels": {
			"version": "v2.0",
			"type": "Javascript"
		}
	},
	{
		"title": "Color.js",
		"category": "js",
		"content": "<p>Parse/Convert/Format colors.<br />Hex, RGB, HSL, int...</p>",
		"links": [
			{
				"href": "https://github.com/Julow/Color.js",
				"text": "Github repo"
			}
		],
		"labels": {
			"version": "v2.2.0",
			"type": "Javascript"
		}
	},
	{
		"category": "android",
		"type": "image",
		"large": true,
		"link": "https://play.google.com/store/apps/details?id=fr.juloo.leaf",
		"img": "images/leaf-banner.png",
		"labels": {
			"type": "Android Game"
		},
		"data": {
			"bgcolor": "#258023"
		}
	},
	{
		"title": "ColorHighlight",
		"category": "sublime-text",
		"content": "<img alt=\"color highlight\" src=\"https://raw.githubusercontent.com/Julow/JulooColorHighlight/master/captures/highlight-example.png\" style=\"max-width:100%;\" /><p>Highlight colors in code<br />&amp; color conversion commands.</p>",
		"links": [
			{
				"href": "https://github.com/Julow/JulooColorHighlight",
				"text": "Github repo"
			}
		],
		"labels": {
			"type": "Sublime Text plugin"
		}
	},
	{
		"title": "LayoutSpliter",
		"category": "sublime-text",
		"content": "<img alt=\"layout spliter\" src=\"https://raw.githubusercontent.com/Julow/LayoutSpliter/master/captures/commands.png\" style=\"max-width:100%;\" /><p>Split layout as you want.<br /><i>No limit !</i></p>",
		"links": [
			{
				"href": "https://github.com/Julow/LayoutSpliter",
				"text": "Github repo"
			}
		],
		"labels": {
			"version": "v1.1.0",
			"type": "Sublime Text plugin"
		}
	},
	{
		"category": "android",
		"type": "image",
		"large": true,
		"link": "https://play.google.com/store/apps/details?id=fr.juloo.uumatter",
		"img": "images/uumatter-banner.png",
		"labels": {
			"type": "Android Game"
		},
		"data": {
			"bgcolor": "#6a2f6a"
		}
	},
	{
		"title": "LanguageInjector",
		"category": "sublime-text",
		"content": "<p>Inject native language regex.</p>",
		"links": [
			{
				"href": "https://sublime.wbond.net/packages/LanguageInjector",
				"text": "Package Control page"
			},
			{
				"href": "https://github.com/Julow/LanguageInjector",
				"text": "Github repo"
			}
		],
		"labels": {
			"version": "v1.1.1",
			"type": "Sublime Text plugin"
		}
	},
	{
		"category": "android",
		"type": "image",
		"link": "https://play.google.com/store/apps/details?id=fr.juloo.tapwell",
		"img": "images/tapwell-banner.png",
		"labels": {
			"type": "Android Game"
		},
		"data": {
			"bgcolor": "#927020"
		}
	},
	{
		"title": "StopFlash",
		"category": "chrome",
		"content": "<p>Block flash objects on web pages.</p>",
		"links": [
			{
				"href": "https://chrome.google.com/webstore/detail/stopflash-flash-blocker/oiiohfpnbijbgdidjfcpcljcfbmkaooi",
				"text": "Chrome Webstore page"
			},
			{
				"href": "https://github.com/Julow/StopFlash",
				"text": "Github repo"
			}
		],
		"labels": {
			"version": "v0.1.5",
			"type": "Chrome Extensions"
		}
	},
	{
		"title": "Kikoo!",
		"category": "chrome",
		"links": [
			{
				"href": "https://chrome.google.com/webstore/detail/kikoo/bplbefadcjgjpihpgndelkalllpgfnke",
				"text": "Chrome Webstore page"
			},
			{
				"href": "https://github.com/Julow/Kikoo",
				"text": "Github repo"
			}
		],
		"labels": {
			"type": "Chrome Extensions"
		}
	}
];

function getJSONCategory(cat)
{
	var data = [];
	for (var i = 0; i < mainPageJSON.length; ++i)
	{
		if (mainPageJSON[i]["category"] === cat)
			data.push(mainPageJSON[i]);
	}
	return data;
}

var pageMap = {
	"#main": new CasePage("page-main", "#ab8903", mainPageJSON),
	"#android": new CasePage("page-android", "#698825", getJSONCategory("android")),
	"#js": new CasePage("page-js", "#c96508", getJSONCategory("js")),
	"#sublime-text": new CasePage("page-sublime-text", "#292929", getJSONCategory("sublime-text")),
	"#chrome": new CasePage("page-chrome", "#188386", getJSONCategory("chrome")),
	"#sh": new CasePage("page-shell", "#900404", getJSONCategory("sh"))
};
var currPage = null;

function showPage(pageName)
{
	var page = pageMap[pageName];
	if (!page)
		return;
	if (currPage)
		currPage.setVisible(false);
	setColor(page.color);
	currPage = page;
	page.setVisible(true);
	canvas.checkSize();
}

if (pageMap[win.location.hash])
	showPage(win.location.hash);
else
	showPage(Object.keys(pageMap)[0]);

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
	var c = getAttribute(e.relatedTarget, "data-bgcolor") || currPage.color;
	if (c != "none")
		setColor(c);
}, false);

win.addEventListener("hashchange", function()
{
	showPage(win.location.hash);
}, false);
win.addEventListener("resize", function()
{
	canvas.checkSize();
}, false);

})(document, window, requestAnimationFrame || function(c){setTimeout(c, 20);});
