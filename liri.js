//LIRI App

//Twitter keys and install requires
var Twitter = require('twitter');
var twitterAcct = require("./keys.js");
var consKey = twitterAcct.twitterKeys.consumer_key;
var consSec = twitterAcct.twitterKeys.consumer_secret;
var accsKey = twitterAcct.twitterKeys.access_token_key;
var accsSec = twitterAcct.twitterKeys.access_token_secret;

//inquirer package:
var inquirer = require('inquirer');

//MovieDB node.js library
const MovieDB = require('moviedb')('edd19c4e733b1cd3715b4ee5b5926008');
//needed to read, write, append to files
var fs = require("fs");

//needed to request spotify db; npm install spotify
var spotify = require('spotify');

//---------Method 1: obtaining command input via process.argv----//
//comment lines 24-28 and 32-48; uncomment lines 209-249no to use prompts--//
// var command = process.argv[2];
// var title   = process.argv[3];
// if(title){
//     console.log(title);
// }

// Create a switch-case statement (if-then would also work).
// The switch-case will direct which function to run.
// switch (command) {
//   case "my-tweets":
//     showTweets();
//     break;

//   case "spotify-this-song":
//     showSong(title);
//     break;

//   case "movie-this":
//     showMovie(title);
//     break;

//   case "do-what-it-says":
//     doRandom();
//     break;
// }

//if my-tweets is called:
function showTweets(){
    var client = new Twitter(twitterAcct.twitterKeys);
    var params = {
        screen_name: "naya_bz",
        count: 20
        };
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (!error) {
            console.log("Tweet History");
            for(i=0; i<tweets.length; i++){
                console.log(`
                Tweet#:  ${i} 
                Tweet:   ${tweets[i].text}
                Created: ${tweets[i].created_at}
                ----------------------------`);
                fs.appendFile("log.txt","Tweet#"+i+" Tweet: "+tweets[i].text +" \nCreated: "+tweets[i].created_at +"\n", function(err){
                    if(err){
                        console.log(err);
                    }
                    
                });//end append file
            }
            fs.appendFile("log.txt","\nContent added to log.txt" + Date() +"\n--------------\n",function(err){
                if(err) throw err;
            });                    
        }
        else{
            console.log(error);
        }
    });//end: twitter client.get

}//end showTweets fxn

//if do-what-it-says is called:
function doRandom(){
    //read in random.txt to get the file
    fs.readFile("random.txt", "utf8", function(err,data) {
        if(err){
            console.log(err);
        }
        data = data.split(",");
        command = data[0];
        title = data[1];
        //if random.txt is changed, fxn can handle the other 3 commands.
        switch (command) {
            case "my-tweets":
            showTweets();
            break;

            case "spotify-this-song":
            showSong(title);
            break;

            case "movie-this":
            showMovie(title);
            break;
        }
        
    });

}//end doRandom fxn


//if spotify-this-song is called:
function showSong(title){
    //Default song if no song was initially given
    var song = "The Sign";
    //check if a song title was input at command line
    if(title){
        song = title;
    }

    spotify.search({ type: 'track', query: song, limit:5 }, function(err, data) {
    if ( err ) {
        console.log('Error occurred: ' + err);
        return;
    }
 
    // console.log(JSON.stringify(data,null,4));
    //Artist(s)
    artistName= data.tracks.items[0].album.artists[0].name;
    //The song's name
    songTitle = data.tracks.items[0].name;
    //A review link of the song from Spotify
    reviewLink = data.tracks.items[0].preview_url;
    //the album the song is from
    songAlbum = data.tracks.items[0].album.name;
    console.log(`
        Spotify Result

        Artist(s):    ${artistName}
        Song Title:   ${songTitle}
        Song Preview: ${reviewLink}
        Song Album:   ${songAlbum} 
        ----------------------------`)
    fs.appendFile("log.txt",`
        Spotify Result

        Artist(s):    ${artistName}
        Song Title:   ${songTitle}
        Song Preview: ${reviewLink}
        Song Album:   ${songAlbum} `+"\nContent Added: "+Date()+"\n--------------\n", function(err){
                    if(err){
                        console.log(err);
                    }
                    
                });//end append file

});//end spotify.search

}//end showSong fxn

//show movie fxn (themoviedb api):
function showMovie(title){
     //Default song if no song was initially given
    var movie = "Mr. Nobody";
    //Check if a movie title was input at command line
    if (title){
        movie = title;
    }
    MovieDB.searchMovie({ query: movie }, (err, res) => {
        if(!err){
            var movieTitle  = res.results[0].original_title;
            var releaseDate = res.results[0].release_date;
            var rating      = res.results[0].popularity;
            var language    = res.results[0].original_language;
            var plot        = res.results[0].overview;  
            console.log(`
                MovieDB Result

                Movie Title:      ${movieTitle}
                Release Date:     ${releaseDate}
                Rating:           ${rating} 
                Language:         ${language}
                Plot:             ${plot} 
            ----------------------------`)
            fs.appendFile("log.txt",`
            Movie Title:      ${movieTitle}
                Release Date:     ${releaseDate}
                Rating:           ${rating} 
                Language:         ${language}
                Plot:             ${plot}  `+"\nContent Added: "+Date()+"\n--------------\n", function(err){
                    if(err){
                        console.log(err);
                    }
                    
            });//end append file
        }
        else{
            console.log(err)
        }
    });//end MovieDB.search
}//end showMoie fxn


//--------------------------------------------------------------//
//---------Method 2: using userprompt (inquirer package)--------

function chooseCommand(){
    inquirer.prompt([
        {
            type:"list",
            name:"command",
            message:"I am LIRI, what can I do for you? (bad British accent)",
            choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"]

        },
        {
            type: "input",
            name: "title",
            message: "Enter a title if applicable; leave blank for default"
        }

        ]).then(function(userSelections) {
            var command = userSelections.command;
            var title = userSelections.title;
            switch (command) {
              case "my-tweets":
                showTweets();
                break;

              case "spotify-this-song":
                showSong(title);
                break;

              case "movie-this":
                showMovie(title);
                break;

              case "do-what-it-says":
                doRandom();
                break;
            }

        });
}//end chooseCommand fxn

//Prompt user to engage with LIRI
chooseCommand();


// console.log(`
//                 MovieDB Result

//                 Movie Title:      ${movieTitle}
//                 Release Date:     ${releaseDate}
//                 Rating:           ${rating} 
//                 Country of origin:${coutry}
//                 Language:         ${language}
//                 Plot:             ${plot}
//                 Actors:           ${actors}
//                 URL:              ${url} 
//             ----------------------------`)