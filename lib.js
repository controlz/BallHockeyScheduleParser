var cheerio = require('cheerio')
	,fs = require('fs')
	,moment = require('moment');

var games = [];
var headers = [];

exports.get_all_games = function (data) {
	// we are good to parse schedule
	var $ = cheerio.load(data)
		,title = $('.ReportTitle1').text()
		,table = $('table.TableBody2')
		,finalJSON = {};


	if (!title) {
		// if title not found, output message but don't stop
		console.log('Could not find title');
	}

	if (!table.html()) {
		// if table not found, halt everything!
		console.log('Could not find html.');
		return false;
	}
	
	var currentGame = 0;
	var currentDate = '';
	table.find('tr').each(function(i, row) {
		// loop through each header
		$(row).find('th').each(function(ii, header) {
			var text = $(header).text().trim();
			if (text == 'Pts') {
				text = headers[ii-1] + 'Pts';
			}
			headers[ii] = text;
		});

		if (i === 0) {
			// this is the header row, skip the td processing
			return;
		}

		var newGameMade = false;
		$(row).find('td').each(function(ii, main) {
			if (ii == 0) {
				//check for date
				if ($(main).text().trim() == '') {
					// real game, create game object, todo: make this actual Object
					games[currentGame] = {};
					newGameMade = true;
				} else {
					currentDate = moment(new Date($(main).text())).format('YYYY-MM-DD');
					return;
				}
			}

			if ( currentDate !== '' ) {
				if (games[currentGame]) {
					var text = $(main).text().trim();

					switch (headers[ii]) {
						case 'Facility' :
							games[currentGame][headers[ii]] = text.replace(' Rink', '').trim();
							break;
						case 'Date' :
							games[currentGame][headers[ii]] = currentDate;
							break;
						default :
							games[currentGame][headers[ii]] = text;
							break;
					}
					
				}
			}
		
		});

		if (newGameMade) {
			currentGame++;
			newGameMade = 0;
		}
	});


	fs.writeFile("data/full_schedule.json", JSON.stringify(games, null, 4), function(err) {
		if (err) {
			console.log('Error writing to file');
		} else {
			console.log('Full Schedule Written to file!');
		}
	});

	return games;
}

exports.get_team_schedule = function (team) {
	console.log(team);
	if (!team || team == '' || typeof team == 'undefined') {
		return false;
	}

	var solo_games = [];

	for (var i in games) {
		if (games[i]['Home'] == team.trim() || games[i]['Visitor'] == team.trim()) {
			solo_games.push(games[i]);
		}
	}

	fs.writeFile("data/team_schedule_" + team.toLowerCase() + ".json", JSON.stringify(solo_games, null, 4), function(err) {
		if (err) {
			console.log('Error writing to team file');
		} else {
			console.log('Team Schedule Written to file!');
		}
	});

	return games;
};