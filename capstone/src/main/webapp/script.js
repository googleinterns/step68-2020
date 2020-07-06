// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Packages/variables needed for certain APIs and functions
 */
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);
var slideIndex;
/** 
 * Responds to dropdown question on welcome page
 */
function techAnswer(){
  const incorrect = document.querySelector('#wrong');
  visibleText(incorrect);
}

/** 
 * Give up response to dropdown question on welcome page
 */
function giveUp(){
  const incorrect = document.querySelector('#wrong');
  const response = document.querySelector('#right');
  const choices = document.querySelector('#welcome_question');
  const submit = document.querySelector('#submit');
  const answer = document.querySelector('#answer');
  invisibleText(incorrect);
  invisibleText(choices);
  invisibleText(submit);
  invisibleText(answer);
  visibleText(response);
}

/**
 * Makes item invisible
 */
function invisibleText(item){
  item.style.visibility = 'hidden';
  item.style.display = 'none';
}

/**
 * Makes item visible
 */
function visibleText(item){
  item.style.visibility = 'visible';
  item.style.display = 'block';
}

/**
 * Code editor to put on page.
 */
function codeEditor() {
  var codeText = 
    "int number = 0;" + 
    "\nfor(int i=0; i<3; i++){" + 
    "\n  number++;" + 
    "\n  console.writeln(\"Current Number: \" + number);" + 
    "\n}" + 
    "\nconsole.writeln(\"Final Number: \" + number)";

  var myCodeEditor = CodeMirror.fromTextArea(document.querySelector('#js'), {
    autocorrect: true,
    lineNumbers: true,
    mode: "javascript",
    spellcheck: true,
    theme: "base16-dark",
    value: codeText
  });
}

/**
 * "Runs" the code in the looping code editor.
 */
function compile() {
  // Display the output of the code on the page
  document.querySelector('#code').style.visibility = 'visible';
  document.querySelector('#code').style.display = 'block';
}

/**
 * Deletes all the comments from the 'Comments' servlet.
 */
async function deleteDataUsingAsyncAwait() {
  // Retrieve the data from '/comments' and delete the comments from the admin page
  /* TODO: handle errors */
  const response = await fetch('/comments', {
    method: 'DELETE',
  });
  
  // Delete the data from the page
  const dataContainer = document.querySelector('#data-container');
  dataContainer.style.visibility = 'hidden';
  dataContainer.style.display = 'block';
  dataContainer.innerHTML = data;
}

/**
  * Fetches looping submissions and uses it to create a chart.
  */
function drawChart() {
  fetch('/looping').then(response => response.json())
  .then((loopAnswers) => {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Points');
    data.addColumn('number', 'Submissions');
    Object.keys(loopAnswers).forEach((points) => {
      data.addRow([points, loopAnswers[points]]);
    });

    const options = {
      'title': 'Looping Answers',
      'width': 550,
      'height': 500,
      'backgroundColor': '#b0b7bc',
      'pieHole': 0.4,
    };

    const chart = new google.visualization.PieChart(
        document.querySelector('#chart-container'));
    chart.draw(data, options);
  });
  
  // Display the chart on to the page
  document.querySelector('#chart-container').style.visibility = 'visible';
  document.querySelector('#chart-container').style.display = 'block';
}

/**
 * Adds the data from the Comments servlet using async/await (the return values are used directly), and converts it to a JSON.
 */
async function getDataUsingAsyncAwait() {
  // Retrieve the data from '/comments'
  /* TODO: handle errors */
  const response = await fetch('/comments?numComments=' + document.querySelector('#numComments').value);
  const data = await response.json();
  var text = "";
  for(i = 0; i < data.length; i++){
    text += "<b>" + data[i].name + " " + data[i].email + "</b>" + " " + "<i>" + data[i].comment + "</i><br>";
  }

  // Add the data to the page
  const dataContainer = document.querySelector('#data-container');
  dataContainer.style.visibility = 'visible';
  dataContainer.style.display = 'block';
  dataContainer.innerHTML = text;
}

/**
 * Manages the visibility of certain content based on the login status of the user.
 */
function manageVisibility() {
  let dataContainer = document.querySelectorAll('.requiresauth');
  let unauth = document.querySelector('#unauth');
  fetch('/authstatus', {
    method: 'GET',
  }).then(function (response) {
    if (response.ok) {
      for (let item of dataContainer) {
       item.style.visibility = 'visible';
       item.style.display = 'block'; 
      }
      unauth.style.visibility = 'hidden';
      unauth.style.display = 'none';
      getDataUsingAsyncAwait();
    }
    else {
      for (let item of dataContainer) {
        item.style.visibility = 'hidden';
        item.style.display = 'none'; 
      }
      unauth.style.visibility = 'visible';
      unauth.style.display = 'block';
    }
  })
  .catch(function() { 
    for (let item of dataContainer) {
      item.style.visibility = 'hidden';
      item.style.display = 'none'; 
    }
    unauth.style.visibility = 'hidden';
    unauth.style.display = 'none';
    });
  codeEditor();
  slideIndex = 1;
  showSlides(slideIndex);
  }

/**
 * Adds or subtracts one to the slideIndex.
 */
function moveSlide(n) {
  showSlides(slideIndex += n);
}

/**
 * Shows the image with the given slideIndex and hides the other images.
 */
function showSlides(n) {
  var slides = document.querySelectorAll('.loopSlides');
  var exp = document.querySelectorAll('.explanation');
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = 'none';
    exp[i].style.display = 'none';
  }
  slides[slideIndex-1].style.display = 'block';
  exp[slideIndex-1].style.display = 'block';
}

/**
 * Shows if the answer is correct or not.
 */
async function submitAnswer() {
  // Retrieve the data from '/looping'
  const data = {
    'points': document.querySelector('#selectpoints').value,
  };
  const response = await fetch('/looping', {
    method: 'POST',
  });

  const answer = document.querySelector('#selectpoints').value;
  const dropdown = document.querySelector('#dropdown');
  const right = document.querySelector('#right');
  const wrong = document.querySelector('#wrong');

  if (answer == 'eighteen') {
    right.style.visibility = 'visible';
    right.style.display = 'block';
    wrong.style.visibility = 'hidden';
    wrong.style.display = 'none';
    dropdown.style.visibility = 'hidden';
    dropdown.style.display = 'none';
  }
  else {
    wrong.style.visibility = 'visible';
    wrong.style.display = 'block';
    right.style.visibility = 'hidden';
    right.style.display = 'none';
  }
  
  // Put the submission on the chart
  drawChart();
}

/**
 * Submits the comment to the '/comment' servlet.
 */
async function submitComment() {
  // Retrieve the data from '/comments'
  const data = {
    'name': document.querySelector('#username').value,
    'comment': document.querySelector('#comment').value,
  };
  const response = await fetch('/comments', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  // Set the values to empty strings so the next data can be itself
  document.querySelector('#username').value = "";
  document.querySelector('#comment').value = "";

  // Put the text on the page
  getDataUsingAsyncAwait();
}

/**
 * Submits the vote to the '/sports' servlet.
 */
async function submitVote() {
  // Retrieve the data from '/comments'
  const data = {
    'sport': document.querySelector('#selectsport').value,
  };
  const response = await fetch('/sports', {
    method: 'POST',
  });

  // Set the values to empty strings so the next data can be itself
  document.querySelector('#selectsport').value = "";

  // Put the vote on the graph
  drawChart();
}
