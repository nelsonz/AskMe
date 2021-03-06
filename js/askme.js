var feedGrabber = 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=-1&callback=?&q=',
	numOfficers = 29,
	nameCol = 'A',
	areaCol = 'B',
	imgCol = 'C',
	spreadsheet = [];
	
function row(cell) {
	return parseInt(cell.substr(1));
}

function col(cell) {
	return cell[0];
}
	
function parseRSS(data, firstRow) {
	console.log("parsing RSS");
	var entries = data.responseData.feed.entries,
		content,
		cell;

	for (var i=0; i<entries.length; i++) {
		cell = entries[i].title;
		content = entries[i].content;
		switch (col(cell)) {
			case nameCol:
				spreadsheet.push({name: content});
				break;
				
			case areaCol:
				spreadsheet[row(cell) - firstRow].area = content;
				break;
				
			case imgCol:
				spreadsheet[row(cell) - firstRow].imgURL = content;
				break;
				
			default:
				break;
		}
	}
	display();
}

/* left out because getting the RSS feed for a single cell is slow for some reason.
number of officers must be hardcoded above.

// get numOfficers from the spreadsheet
console.log("getting numofficers");
$.ajax({
	url: feedGrabber + encodeURIComponent("https://spreadsheets.google.com/feeds/cells/0Agpa_QVONL1sdEotdUR5Ui1ZWUVyTXdHNm4xaGtZZnc/od6/public/basic?range=E1%3AE1&alt=rss"), 
	dataType: "json", 
	success: function(data) {
		console.log("got numofficers");
		numOfficers = parseInt(data.responseData.feed.entries[0].content);
		// grab the RSS feed, multiple times if >47 officers
		for (var i=0; i<Math.ceil(numOfficers/47); ++i) {
			var URL = "https://spreadsheets.google.com/feeds/cells/0Agpa_QVONL1sdEotdUR5Ui1ZWUVyTXdHNm4xaGtZZnc/od6/public/basic?range=A"+(3+47*i)+"%3AC"+(49+47*i)+"&alt=rss";
			
			(function(i) {
				console.log("grabbing rss");
				$.ajax({
					url: feedGrabber + encodeURIComponent(URL), 
					dataType: "json",
					success: function(data) {
						parseRSS(data, 3+47*i);
					}
				});
			})(i);
		}
	}
});
*/

// grab the RSS feed, multiple times if >47 officers
for (var i=0; i<Math.ceil(numOfficers/47); ++i) {
	var URL = "https://spreadsheets.google.com/feeds/cells/0Agpa_QVONL1sdEotdUR5Ui1ZWUVyTXdHNm4xaGtZZnc/od6/public/basic?range=A"+(3+47*i)+"%3AC"+(49+47*i)+"&alt=rss";
	
	(function(i) {
		console.log("grabbing rss");
		$.ajax({
			url: feedGrabber + encodeURIComponent(URL), 
			dataType: "json",
			success: function(data) {
				parseRSS(data, 3+47*i);
			}
		});
	})(i);
}

// display the officers
function display() {
	console.log(spreadsheet.length);
	for (var i=0; i<spreadsheet.length; i++) {
		var person = spreadsheet[i];
		if (person.area) {
			var personHTML = $('<div class="person" id="'+person.name+'"></div>');
			$('#people').append(personHTML);
			$(personHTML).append('<div class="personimage" style="background-image: url(\''+person.imgURL+'\');"></div>');
			$(personHTML).append('<div class="persontitle">'+person.name+'</div>');
			$(personHTML).append('<div class="personarea">'+person.area+'</div>');
		}
	}
	
	$('.filter').change(function() {
		var key = $(this).val();
		if (key) {
			$('#people').find('div:not(:Contains(' +key+ '))').parent().hide();
			$('#people').find('div:Contains('+key+')').parent().show();
		}
		else {
			$('.person').show();
		}
	}).keyup(function() {
		$(this).change();
	});
}

$.expr[':'].Contains = function(a, i, m){
    return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
};

