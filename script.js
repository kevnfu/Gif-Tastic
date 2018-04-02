const key = "aExZtytookBSVzlAfYuyRa519qcywPU3";
const limit = 10;

class Storage {
    get favs() {
        let x = localStorage.getItem("favs"); 
        x = Object.is(x, null) || Object.is(x, undefined) ? "[]" : x;
        return JSON.parse(x);
    }

    set favs(data) {
        localStorage.setItem("favs", JSON.stringify(data));
    }

    addFav(data) {
        let x = this.favs;
        x.push(data);
        this.favs = x;
    }

    empty() {
        this.favs = [];
    }
}

let topics = ["dog", "cat", "hampster", "turtle", "goldfish"];
let storage = new Storage();
let storedResponse, currentQuery;

function renderButtons() {
    $("#buttons").empty();
    topics.forEach(e => {
        $("#buttons").append($("<button>")
            .attr("type", "button")
            .addClass("button btn btn-default")
            .html(e));
    });
}

class Image {
    constructor(data) {
        this.data = data;
        this.play = false;
        this.isFav = false;
        this.img = $("<img>")
            .attr("src", data.images.fixed_height_still.url)
            // on image click, toggle play
            .bind("click", this.togglePlay.bind(this));
        this.div = $("<div>")
            .addClass("gif")
            .append(this.img)
            .append($("<br>"))
            .append($("<p>").html("Rating: " + data.rating));
    }

    togglePlay() {
        this.play = !this.play;
        if(this.play) {
            this.img.attr("src", this.data.images.fixed_height.url);
        } else {
            this.img.attr("src", this.data.images.fixed_height_still.url);
        }
        return this;
    }

    withFavButton() {
        this.div.append($("<button>")
            .addClass("btn btn-default")
            .html("Add to Fav")
            .on("click", () => {
                this.div.children().last().remove(); // remove button
                this.isFav = true;
                storage.addFav(this.data); // store in localstorage
                this.display();
            }));
        return this;
    }

    setFav(b) {
        this.isFav = b;
        return this;
    }

    display() {
        if(this.isFav) {
            $("#favs").append(this.div);
        } else {
            $("#display").append(this.div);
        }
        return this;
    }
}


// loads up to 10 images. hides #load button if no more to load.
function loadImages(query, offset) {
    $("#load").hide();

    $.ajax({
        url: "https://api.giphy.com/v1/gifs/search?" + $.param({
            api_key: key, 
            q : query, 
            limit: limit,
            offset: offset
        }),
        method: "GET"
    }).then(function(response) {
        console.log(response);
        response.data.forEach(function(e) {
            new Image(e).withFavButton().display();
        })

        // save response object, for pagination
        storedResponse = response;

        // manage #load button visibility
        let p = storedResponse.pagination;
        if(p.total_count >= p.offset + limit) {
            $("#load").show();
        }
    });
}

$(document).on("click", ".button", function() {
    $("#display").empty();
    $("#load").hide();
    currentQuery = $(this).html();
    loadImages(currentQuery, 0);
});

$(document).ready(function() {
    renderButtons();

    // load saved favorites
    storage.favs.forEach(e => {
        new Image(e).setFav(true).display();
    });

    $("#submit").on("click", function(event) {
        event.preventDefault();

        topics.push($("#input").val());
        $("#input").val("");
        renderButtons();
    });

    $("#load").on("click", function() {
        loadImages(currentQuery, storedResponse.pagination.offset + limit);
    });

    $("#clear-fav").on("click", function() {
        storage.empty();
        $("#favs").empty();
    });
});