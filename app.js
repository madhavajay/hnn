// Add this function to search IMDB and store the result in local storage
async function searchAndStoreIMDB(name) {
  console.log("search name", name);
  const apiKey = "010de1bcf60f0e14b92765a3f9485662"; // Replace this with your actual API key
  const searchUrl = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(
    name
  )}`;

  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    console.log("got data", data);
    if (data && data.results && data.results.length > 0) {
      const actor = data.results[0];
      console.log("got results", actor);
      const actorData = {
        name: actor.name,
        link: `https://www.themoviedb.org/person/${actor.id}`,
        image: `https://image.tmdb.org/t/p/w500${actor.profile_path}`,
      };

      let customActors =
        JSON.parse(window.localStorage.getItem("customActors")) || [];

      // Check if the actor is already in the list
      const isDuplicate = customActors.some(
        (customActor) => customActor.name === actorData.name
      );

      if (!isDuplicate) {
        customActors.push(actorData);
        console.log("customActors", customActors);
        window.localStorage.setItem(
          "customActors",
          JSON.stringify(customActors)
        );
      }
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error searching TMDb:", error);
    return false;
  }
}

function getList(key) {
  namedSet = window.localStorage.getItem(key);
  if (namedSet == null) {
    return new Set();
  } else {
    if (typeof namedSet === "string") {
      namedSet = JSON.parse(namedSet);
    }
    return new Set(namedSet);
  }
}

function getAnswered() {
  correct = getList("correct");
  incorrect = getList("incorrect");
  return new Set(Array.from(correct).concat(Array.from(incorrect)));
}

function resetAnswered() {
  window.localStorage.setItem("correct", JSON.stringify([]));
  window.localStorage.setItem("incorrect", JSON.stringify([]));
}

function addData(name, correct) {
  listKey = "incorrect";
  if (correct == true) {
    listKey = "correct";
  }
  answered = getList(listKey);
  answered.add(name);
  window.localStorage.setItem(listKey, JSON.stringify(Array.from(answered)));
}

function updateScores() {
  try {
    correct = getList("correct");
    incorrect = getList("incorrect");
  } catch (err) {
    resetAnswered();
    correct = getList("correct");
    incorrect = getList("incorrect");
  }
  $("#correct").html(correct.size);
  $("#incorrect").html(incorrect.size);
}

function checkAnswer(clicked_id) {
  button_ids = [1, 2, 3, 4];
  var correct = false;
  $("#correct_name_link").show();
  var name = "";
  for (const button_id of button_ids) {
    var rel = $("#option" + button_id).attr("rel");
    if ($("#option" + button_id).attr("correct") == "1") {
      name = $("#option" + button_id).attr("value");
      if (rel == clicked_id) {
        $("#option" + button_id).addClass("correct");
        correct = true;
      } else {
        $("#option" + button_id).addClass("reveal");
      }
    } else {
      $("#option" + button_id).addClass("incorrect");
    }
  }
  addData(name, correct);
  updateScores();
  showNext();
}

function showNext() {
  $("#next_container").show();
}

async function getRandomActor() {
  return getAllActors().then((actors) => {
    const size = actors.length;
    const random_actor = Math.floor(Math.random() * size);
    return actors[random_actor];
  });
}

function getAllActors() {
  return new Promise((resolve) => {
    const localActors =
      JSON.parse(window.localStorage.getItem("customActors")) || [];
    const allActorsSet = new Set(localActors);

    $.getJSON("actors.json", function (actor_json) {
      try {
        // Combine actors from the JSON file with local storage actors
        actor_json.forEach((actor) => {
          if (!allActorsSet.has(actor)) {
            allActorsSet.add(actor);
          }
        });

        // Convert the Set back to an array and resolve the promise
        resolve(Array.from(allActorsSet));
      } catch (err) {
        console.log("got error", err);
        resolve(localActors);
      }
    });
  });
}

async function showRandomActor() {
  console.log("do nothing");
  getAllActors().then(async (actors) => {
    $("#next_container").hide();
    var answered = getAnswered();

    if (answered.size >= actors.length) {
      resetAnswered();
      answered = getAnswered();
    }

    chosen_actors = new Set();

    var correct_actor = await getRandomActor();
    while (answered.has(correct_actor.name)) {
      correct_actor = await getRandomActor();
    }

    $("#correct_name_link").attr("href", correct_actor.link);
    $("#correct_name_link").html(correct_actor.name);
    $("#correct_name_link").hide();
    button_ids = [1, 2, 3, 4];
    // reset correct attr
    for (const button_id of button_ids) {
      $("#option" + button_id).attr("correct", "0");
      $("#option" + button_id).removeClass("correct");
      $("#option" + button_id).removeClass("incorrect");
      $("#option" + button_id).removeClass("reveal");
    }

    random_button = Math.floor(Math.random() * 4);
    correct_button = button_ids[random_button];
    button_ids.splice(random_button, 1);
    $("#option" + correct_button).attr("value", correct_actor.name);
    $("#option" + correct_button).attr("correct", "1");
    while (chosen_actors.size < 3) {
      var button_actor = await getRandomActor();
      if (
        !chosen_actors.has(button_actor.name) &&
        button_actor.name != correct_actor.name
      ) {
        chosen_actors.add(button_actor.name);
      }
    }

    const actor_array = Array.from(chosen_actors.values());
    for (const button_id of button_ids) {
      const index = button_id - 1;
      const actor_name = actor_array.pop();
      $("#option" + button_id).attr("value", actor_name);
    }

    $("#image").attr("src", correct_actor.image);
  });
}

function displayNextButton() {
  $("#next_container").css("display", "flex");
}

function disableButtons() {
  $(".button").prop("disabled", true);
}

function enableButtons() {
  $(".button").prop("disabled", false);
}

$(document).ready(function () {
  // Add this event listener for the "Add" button
  $("#addCustomName").click(async function () {
    const name = $("#customName").val();
    if (name) {
      const success = await searchAndStoreIMDB(name);
      if (success) {
        alert("Custom name added successfully!");
        $("#customName").val("");
      } else {
        alert("No results found. Please try a different name.");
      }
    } else {
      alert("Please enter a name.");
    }
  });

  $(".button").click(function (e) {
    disableButtons();
    var clicked_id = $(this).attr("rel");
    checkAnswer(clicked_id);
  });

  $("#next").click(function (e) {
    enableButtons();
    showRandomActor();
  });

  updateScores();
  showRandomActor();
});
