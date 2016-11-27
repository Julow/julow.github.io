/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   homepage.js                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jaguillo <jaguillo@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2016/11/26 15:22:05 by jaguillo          #+#    #+#             */
/*   Updated: 2016/11/27 15:44:46 by jaguillo         ###   ########.fr       */
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
function cached_http_request(url, expire_delta, data_process)
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
	})
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
		"current": parse_current(data["current_observation"]),
		"hourly": data["hourly_forecast"].map(parse_hourly),
		"moon": parse_moon_phase(data["moon_phase"]),
		"sun": parse_sun_phase(data["sun_phase"])
	});
}

/*
** ========================================================================== **
*/

function render(data)
{
	console.log("render", data);
}

/*
** ========================================================================== **
*/

var weather_request = cached_http_request(
	"http://api.wunderground.com/api/b08b95a1341330dd/astronomy/conditions/hourly/bestfct:1/q/48.8566,2.3522.json",
	30 * 60,
	parse_weather_data)

weather_request(render);
