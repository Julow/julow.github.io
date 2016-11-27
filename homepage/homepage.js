/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   homepage.js                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jaguillo <jaguillo@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2016/11/26 15:22:05 by jaguillo          #+#    #+#             */
/*   Updated: 2016/11/27 19:29:48 by jaguillo         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

(function(left_digit, right_digit){

var last_h = -1;
var last_m = -1;

function update()
{
	d = new Date();
	h = d.getHours();
	m = d.getMinutes();
	if (h != last_h)
	{
		last_h = h;
		left_digit.innerText = h;
	}
	if (m != last_m)
	{
		last_m = m;
		right_digit.innerText = ((m < 10) ? "0" : "") + m;
	}
	setTimeout(update, (61 - d.getSeconds()) * 1000);
}

update();

})(document.getElementById("left-digit"),
	document.getElementById("right-digit"));

/*
** ========================================================================== **
** Http request
*/

// string -> (string, string) dict option -> (string -> unit) -> (int -> unit) option -> unit
function http_request(url, post, on_success, on_error)
{
	var request = new XMLHttpRequest();

	request.onreadystatechange = function()
	{
		if (request.readyState === XMLHttpRequest.DONE)
		{
			if (request.status === 200)
				on_success(request.responseText);
			else if (on_error != null)
				on_error(request.status);
		}
	};

	request.open((post == null) ? 'GET' : 'POST', url, true);
	request.send(post);
}

// string -> int -> (string -> 'a) -> (('a -> unit) -> unit)
function Cached_http_request(url, expire_delta, data_process)
{
	var CACHE_KEY = "cache::" + url;
	var EXPIRE_KEY = "cache_expire::" + url;

	function get_from_cache(callback)
	{
		var expire = localStorage.getItem(EXPIRE_KEY);
		var data;

		if (expire == null)
			return (false);
		if (parseInt(expire) < Date.now())
			return (false);
		data = localStorage.getItem(CACHE_KEY);
		if (data == null)
			return (false);
		callback(JSON.parse(data));
		return (true);
	}

	function get_from_url(callback)
	{
		http_request(url, null, function(data)
		{
			data = data_process(data);
			localStorage.setItem(EXPIRE_KEY, (Date.now() + expire_delta * 1000).toString());
			localStorage.setItem(CACHE_KEY, JSON.stringify(data));
			callback(data);
		}, null);
	}

	return (function(callback)
	{
		get_from_cache(callback) || get_from_url(callback);
	});
}

/*
** ========================================================================== **
** Weather data
*/

// type current_location_data = {
// 	city			:string;
// 	state			:string;
// 	lon				:float;
// 	lat				:float;
// 	elevation		:float
// }

// type current_weather_data = {
// 	timestamp			:int;
// 	location			:current_location_data;
// 	weather_string		:string;
// 	temperature			:int; // celcius
// 	humidity			:int; // percent
// 	wind_dir			:int; // degree
// 	wind_speed			:int; // km/h
// 	wind_gust			:int; // km/h
// 	pressure			:int; // hpa
// 	pressure_trend		:int;
// 	dewpoint			:int; // celcius
// 	feelslike			:int; // celcius
// 	visibility			:float; // km
// 	condition			:string
// }

// type hourly_weather_data = {
// 	timestamp			:int;
// 	temperature			:int; // celcius
// 	dewpoint			:int; // celcius
// 	condition			:string;
// 	wind_speed			:int; // km/h
// 	wind_dir			:int; // degree
// 	humidity			:int; // percent
// 	feelslike			:int; // celcius
// 	pop					:int; // percent
// 	snow				:int;
// 	pressure			:int // hpa
// }

// type moon_phase = {
// 	illuminated			:int; // percent
// 	age					:int;
// 	hemisphere			:string;
// 	moonrise			:int * int; // hour, minute
// 	moonset				:int * int // hour, minute
// }

// type sun_phase = {
// 	sunrise				:int * int; // hour, minute
// 	sunset				:int * int // hour, minute
// }

// type weather_data = {
// 	current		:current_weather_data;
// 	hourly		:hourly_weather_data array;
// 	moon		:moon_phase;
// 	sun			:sun_phase
// }

function parse_weather_data(data)
{
	function parse_current(data)
	{
		function parse_current_location(data)
		{
			return ({
				city: data["city"],
				state: data["state"],
				lon: parseFloat(data["longitude"]),
				lat: parseFloat(data["latitude"]),
				elevation: parseFloat(data["elevation"]),
			});
		}

		return ({
			timestamp: parseInt(data["local_epoch"]),
			location: parse_current_location(data["display_location"]),
			weather_string: data["weather"],
			temperature: data["temp_c"],
			humidity: parseInt(data["relative_humidity"]),
			wind_dir: parseInt(data["wind_degrees"]),
			wind_speed: parseInt(data["wind_kph"]),
			wind_gust: parseInt(data["wind_gust_kph"]),
			pressure: parseInt(data["pressure_mb"]),
			pressure_trend: parseInt(data["pressure_trend"]),
			dewpoint: parseInt(data["dewpoint_c"]),
			feelslike: parseInt(data["feelslike_c"]),
			visibility: parseFloat(data["visibility_km"]),
			condition: data["icon"]
		});
	}

	function parse_hourly(data)
	{
		return ({
			timestamp: parseInt(data["FCTTIME"]["epoch"]),
			temperature: parseInt(data["temp"]["metric"]),
			dewpoint: parseInt(data["dewpoint"]["metric"]),
			condition: data["icon"],
			wind_speed: parseInt(data["wspd"]["metric"]),
			wind_dir: parseInt(data["wdir"]["degrees"]),
			humidity: parseInt(data["humidity"]),
			feelslike: parseInt(data["feelslike"]["metric"]),
			pop: parseInt(data["pop"]),
			snow: parseInt(data["snow"]["metric"]),
			pressure: parseInt(data["mslp"]["metric"])
		});
	}

	function parse_moon_phase(data)
	{
		return ({
			illuminated: parseInt(data["percentIlluminated"]),
			age: parseInt(data["ageOfMoon"]),
			hemisphere: data["hemisphere"],
			moonrise: [parseInt(data["moonrise"]["hour"]), parseInt(data["moonrise"]["minute"])],
			moonset: [parseInt(data["moonset"]["hour"]), parseInt(data["moonset"]["minute"])]
		});
	}

	function parse_sun_phase(data)
	{
		return ({
			sunrise: [parseInt(data["sunrise"]["hour"]), parseInt(data["sunrise"]["minute"])],
			sunset: [parseInt(data["sunset"]["hour"]), parseInt(data["sunset"]["minute"])]
		});
	}

	data = JSON.parse(data);

	return ({
		current: parse_current(data["current_observation"]),
		hourly: data["hourly_forecast"].map(parse_hourly),
		moon: parse_moon_phase(data["moon_phase"]),
		sun: parse_sun_phase(data["sun_phase"])
	});
}

/*
** ========================================================================== **
** Canvas util
*/

var Canvas_util = function(canvas)
{
	var context = canvas.getContext("2d");

	function map_path(data, get_x, get_y)
	{
		context.beginPath();
		context.moveTo(get_x(0, data[0]), get_y(0, data[0]));
		for (var i = 1; i < data.length; i++)
			context.lineTo(get_x(i, data[i]), get_y(i, data[i]));
		context.stroke();
	}

	function clear()
	{
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	}

	function set(attrs)
	{
		for (k in attrs)
			context[k] = attrs[k];
	}

	return ({
		context: context,
		width: context.canvas.width,
		height: context.canvas.height,
		clear: clear,
		set: set,
		map_path: map_path
	});
};

/*
** ========================================================================== **
*/

(function(){

var LOOP_INTERVAL = 60;

var weather_request = Cached_http_request(
	"http://api.wunderground.com/api/b08b95a1341330dd/astronomy/conditions/hourly/bestfct:1/q/48.8566,2.3522.json",
	30 * 60,
	parse_weather_data)

function WeatherGraph(canvas, stroke_style, minmin, maxmax, get_data)
{
	var canvas = Canvas_util(canvas);

	var GRAPH_OFFSET_X = 10;
	var GRAPH_OFFSET_Y = 5;
	var GRAPH_WIDTH = canvas.width - GRAPH_OFFSET_X - 10;
	var GRAPH_HEIGHT = canvas.height - GRAPH_OFFSET_Y - 15;

	var STYLES = {
		"lineWidth": 2,
		"lineCap": "square",
		"textAlign": "center",
		"font": "10px Arial, sans-serif",
		"strokeStyle": stroke_style
	};

	// 'a array -> ('a -> number) -> number * number
	function array_minmax_map(array, f)
	{
		var tmp;
		var min, max;

		tmp = f(array[0]);
		min = max = tmp;
		for (var i = 1; i < array.length; i++)
		{
			tmp = f(array[i]);
			if (tmp > max)
				max = tmp;
			if (tmp < min)
				min = tmp;
		}
		return ([min, max]);
	}

	function draw_graph(data)
	{
		var [min, max] = array_minmax_map(data, get_data);
		var [min, max] = [Math.min(minmin, min), Math.max(maxmax, max)];

		function get_x(i, _)
		{
			return (GRAPH_WIDTH * i / (data.length - 1) + GRAPH_OFFSET_X);
		}

		function get_y(_, data)
		{
			data = get_data(data);
			return ((max - data) * GRAPH_HEIGHT / (max - min) + GRAPH_OFFSET_Y);
		}

		canvas.clear();
		canvas.set(STYLES);
		canvas.map_path(data, get_x, get_y);

		for (var i = 0; i < data.length; i++)
		{
			canvas.context.fillText(get_data(data[i]).toString(), get_x(i, null), 200);
		}
	}

	return (draw_graph);
}

var temp_graph = WeatherGraph(document.getElementById("forecast-temp"), "red",
		0, 15, function(data){ return (data.temperature); });
var rain_graph = WeatherGraph(document.getElementById("forecast-rain"), "blue",
		0, 30, function(data){ return (data.pop); });
var wind_graph = WeatherGraph(document.getElementById("forecast-wind"), "gray",
		5, 20, function(data){ return (data.wind_dir); });

var temp_current = document.getElementById("current-temp");
var wind_current = document.getElementById("current-wind");

function render(data)
{
	var hourly_data = data.hourly.slice(0, 15);
	temp_graph(hourly_data);
	rain_graph(hourly_data);
	wind_graph(hourly_data);

	temp_current.innerText = data.current.temperature;
	wind_current.innerText = data.current.wind_speed;
}

function requestTimeout(callback, t)
{
	setTimeout(function(){ requestAnimationFrame(callback); }, t);
}

function render_loop()
{
	weather_request(function(data)
	{
		render(data);
		requestTimeout(render_loop, LOOP_INTERVAL * 1000);
	});
}

render_loop();

})();
