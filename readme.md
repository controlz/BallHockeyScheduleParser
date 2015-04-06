# Schedule Parser
Command line utility for scraping my ball hockey team's schedule from the facility's website to store data as JSON so that it may be consumed by apps.

Note: This is tightly coupled to the facility's website structure. Feel free to fork this to use for your own needs.

### Options

* -p true|false //Run in Production
* -t 'Team Name' //Sets Team Name
* -l 'Leage ID' //Set league ID

If team (t) = '' then get all teams

### Usage

```
node bin.js -p true -t 'Vendetta' -l 1260

node bin.js -p true -t 'Weekend Warriors' -l 1259
```

This will produce two files: `team_schedule_vendetta.json` and `team_schedule_weekend_warriors.json`.
