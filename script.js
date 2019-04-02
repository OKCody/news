// Note: some RSS feeds can't be loaded in the browser due to CORS security.
// To get around this, you can use a proxy.
CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

parser = new RSSParser({
  defaultRSS: 2.0,
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:group', 'media:content', {keepArray: false}],
      ['media:thumbnail', 'media:content'],
      ['content:encoded', 'content:encoded'],
      ['title_detail', 'title_detail']
    ]
  }
});

/*  // Example source format expected by main function
sources = [
  ['NY Times','http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'],
  ['NPR','https://www.npr.org/rss/rss.php?id=1019'],
  ['PBS','https://www.pbs.org/newshour/feeds/rss/headlines'],
  ['BBC','http://feeds.bbci.co.uk/news/rss.xml'],
  ['NY Times','http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'],
  ['NPR','https://www.npr.org/rss/rss.php?id=1019'],
  ['PBS','https://www.pbs.org/newshour/feeds/rss/headlines'],
  ['BBC','http://feeds.bbci.co.uk/news/rss.xml']
];
*/

// Function for extracting image information from parsed feed json. All sources
// seem to include image information differently.  This function aims to handle
// all cases with a single operation, but still some sources require their own
// special handlers.
function addImage(item, article){
  var onErrorScript = null;
  // Necessary to reduce object to string, then perform a search for an image
  // URL because all sources seem to include images differently. This is a
  // compromise between createing special code for each source and
  var regex = /(https?:\/\/((?!\").)*\"{0}\.(?:png|jpg|gif))/ig;
  var src = JSON.stringify(item).match(regex);
  //console.log(src);
  if(item['link'].includes('spectrum.ieee.org')){
    //console.log(item['media:content']['$'].url);
    src = [];
    src[0] = 'https://spectrum.ieee.org' + item['media:content']['$'].url;
  }
  if(src != null){
    src = src[0];
    // By defaulft, NYTimes images are very small and square.
    // This will make them look more like images provided by other sources.
    if(src.includes('nyt.com/images/') && src.includes('-moth.jpg')){
      src = src.replace('-moth.jpg', '-largeHorizontalJumbo.jpg');
      onErrorScript = function(){
        if(!this.src.includes('-facebookLarge.jpg')){
          this.src = this.src.replace('-largeHorizontalJumbo.jpg', '-facebookLarge.jpg');
        }
        if(this.src.includes('-facebookLarge.jpg')){
          console.log(this);
          this.remove();
        }
      };
      // threeByTwoLargeAt2X-v2.jpg
      //static01.nyt.com/images/2019/03/28/us/AFFIRMATIVE-photos-slide-0CY5/AFFIRMATIVE-photos-slide-0CY5-threeByTwoLargeAt2X-v2.jpg?quality=75&auto=webp&disable=upscale&width=1620
    }
    var img = document.createElement('img');
    img.setAttribute('src', src);
    img.onerror = onErrorScript;
    article.appendChild(img);
  }
}

// Main function: for parsing feeds and populating #content with thier contents
var content = document.getElementById('content');
for(j=0; j<sources.length; j++){
  function makeCol(){
    var source = sources[j];
    var column = document.createElement('div');
    column.classList.add('column');

    function fetchSource(source){
      // CORS_PROXY +
      var feed = parser.parseURL(CORS_PROXY + source, function(err, feed) {
        console.log(feed);
        for(var i=0; i<10; i++){
          // Create Article
          var article = document.createElement('a');
          article.setAttribute('href', feed.items[i].link);
          // Append Title
          var h1 = document.createElement('h1');
          var title = document.createTextNode(feed.items[i].title);
          h1.appendChild(title);
          article.appendChild(h1);
          // Append Image
          addImage(feed.items[i], article);
          // Append Snippet
          var p = document.createElement('p');
          var content = document.createTextNode(feed.items[i].contentSnippet);
          p.appendChild(content);
          article.appendChild(p);
          article.classList.add('article');
          column.appendChild(article);
        }
      });
      return feed
    }

    if(Array.isArray(source[1])){
      for(k=0; k<source[1].length; k++){
        console.log(source[1][k]);
        feed = fetchSource(source[1][k]);
      }
    }
    else{
      console.log(source[1]);
      feed = fetchSource(source[1]);
    }
    var a = document.createElement('a');
    var org = document.createTextNode(source[0]);
    a.classList.add('org');
    if('link' in feed){a.setAttribute('href', feed.link)};
    a.appendChild(org);
    column.insertBefore(a, column.firstChild);
    return column;
  }
  content.appendChild(makeCol());
}

// Sets date at top of page
function setDate(){
  var d = new Date();
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var dateNode = document.getElementById('date');
  var date = document.createTextNode(days[d.getDay()] + ', ' + months[d.getMonth()] +' '+ d.getDate().toString() +', '+ d.getFullYear().toString());
  dateNode.appendChild(date);
}
setDate();

// Display: block; / Display: none; toggle
function toggle(id){
  var elem = document.querySelector(id);
  var state = window.getComputedStyle(elem).display;
  if(state != 'none'){
  	elem.style.display = 'none';
  }
  else{
  	elem.style.display = 'block';
  }
};

window.addEventListener('resize', function(){
  // Display menu appropriately when screen width changes no matter current
  // menu display state.
  var menu = document.getElementById('menu');
  if(window.innerWidth > 1000 && menu.style.display != 'block'){
    menu.style.display = 'block';
  }
  if(window.innerWidth <= 1000 && menu.style.display == 'block'){
    menu.style.display = 'none';
  }
  // Set up mobile view and horizontal pan events for one-column
  if(window.innerWithd <= 1000){
    for(var m=0; m<columns.length; m++){
      columns[m].style.display = 'none';
    }
    columns[col].style.display = 'block';
  }
});


// Get a reference to an element.
var content = document.querySelector('#content');
// Create an instance of Hammer with the reference.
hammer = new Hammer(content);
col = 0;
columns = document.querySelectorAll('.column');
debounce = 0;

var width = window.innerWidth;
// Subscribe to a quick start event: press, tap, or doubletap.
// For a full list of quick start events, read the documentation.
hammer.on('panmove panstart', function(e) {
  if(e.deltaX > 0){
    var dir = 'left';
  }
  else{
    var dir = 'right';
  }
  if(dir == 'left' && Math.abs(e.deltaX/e.deltaY) > 10  && e.distance/width > .25 && debounce == 0){
    debounce = 1;
    for(var m=0; m<columns.length; m++){
      columns[m].style.display = 'none';
    }
    if(0 < col && col <= columns.length - 1){
      col = col - 1;
    }
  }
  if(dir == 'right' && Math.abs(e.deltaX/e.deltaY) > 10 && e.distance/width > .25 && debounce == 0){
    debounce = 1;
    for(var m=0; m<columns.length; m++){
      columns[m].style.display = 'none';
    }
    if(0 <= col && col < columns.length - 1){
      col = col + 1;
    }
  }
  setTimeout(function(){
    debounce = 0;
  }, 500);
  columns[col].style.display = 'block';
  console.log(e.deltaX/e.deltaY, e.distance/width, col, debounce);
});