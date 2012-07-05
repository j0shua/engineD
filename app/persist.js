//persistance, currently just dumps to files

var fs = require('fs');

//gets the saved data from the file and passes it to the success callback
function retrieve(success) {
	fs.readFile('./data.js', function(err,data){
		if(err) {
			console.error("Could not open file: %s", err);
			process.exit(1);
		}
		success(JSON.parse(data));
	});

}
function save(data,success,location) {
	fs.writeFile(location || './data.js', JSON.stringify(data), function (err) {
		if (err) {
			console.error("Could not open file: %s", err);
			process.exit(1);
		}
	});
}

module.exports = {
	retrieve: retrieve,
	save: save
};