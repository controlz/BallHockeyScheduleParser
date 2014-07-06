// load schedule file from remote source or demo file
var request = require('request')
	,fs = require('fs')
	,lib = require('./lib');

// command line parsing args
var argv = require('minimist')(process.argv.slice(2));

// setup app variables
var production = false
	,team = ''
	,output = '';

var games = [];

if (argv['p']) {
	production = true;
}

if (argv['t']) {
	team = argv['t'];
}

if (argv['o']) {
	output = argv['o'];
}

if (production == false) {
	// staging - read from file
	fs.readFile("samples/schedule.htm", 'utf8', function(err, data) {	

		if (err) {
			console.log('Error reading file');
			return false;
		} else {
			games = lib.get_all_games(data);
		}

		// team will be true if -t is entered without supply a team name
		if (team !== true)
			lib.get_team_schedule(team);
		else
			console.log('Team was created.');
	});
} else {
	// production
	var url = 'http://www.ballhockey-canada.com/ballhockey/maxsolutions/niagara/schedules/LSch_Mens_1102.htm';
	request(url, function(error, response, html) {
		if (!error && response.statusCode == 200) {
			games = get_all_games(html);

			// team will be true if -t is entered without supply a team name
			if (team !== true)
				lib.get_team_schedule(team);
		} else {
			console.log('Error with HTTP Request');
			return false;
		}
	});
}

