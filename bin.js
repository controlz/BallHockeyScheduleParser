// load schedule file from remote source or demo file

var cheerio = require('cheerio')
	,request = require('request')
	,fs = require('fs')
	,moment = require('moment');

var argv = require('minimist')(process.argv.slice(2));

var production = false
	team = '';

if (argv['p']) {
	production = true;
}

if (production == false) {
	// staging - read from file
	fs.readFile("samples/schedule.htm", 'utf8', function(err, data) {	

		if (err) {
			console.log('Error reading file');
			return false;
		} else {
			do_main(data);
		}
	});
} else {
	// production
	var url = 'http://www.ballhockey-canada.com/ballhockey/maxsolutions/niagara/schedules/LSch_Mens_1102.htm';
	request(url, function(error, response, html) {
		if (!error && response.statusCode == 200) {
			do_main(html);
		}
	});
}

function do_main(data) {
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
	
	var headers = [];
	var games = [];
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


	fs.writeFile("data/schedule.json", JSON.stringify(games, null, 4), function(err) {
		if (err) {
			console.log('Error writing to file');
		} else {
			console.log('File Written!');
		}
	});
}