// Note: some RSS feeds can't be loaded in the browser due to CORS security.
// To get around this, you can use a proxy.
CORS_PROXY = 'https://cody-cors.herokuapp.com/'; //"https://cors-anywhere.herokuapp.com/";

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
  },
  header: {'pragma': 'no-cache',
           'cache-control': 'no-cache'}
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
  var img = document.createElement('img');
  var onErrorScript = null;
  // Necessary to reduce object to string, then perform a search for an image
  // URL because all sources seem to include images differently. This is a
  // compromise between createing special code for each source and
  var regex = /(https?:\/\/((?!\").)*\"{0}\.(?:png|jpg|gif))/ig;
  var src = JSON.stringify(item).match(regex);
  //console.log(src);
  if(src != null){
    src = src[0];
    // By defaulft, NYTimes images are very small and square.
    // This will make them look more like images provided by other sources.
    if(src.includes('nyt.com/images/') && src.includes('-moth.jpg')){
      src = src.replace('-moth.jpg', '-largeHorizontalJumbo.jpg');
      onErrorScript = function(){
        if(this.src.includes('-largeHorizontalJumbo.jpg')){
          console.log('facebook');
          this.setAttribute('data', 'moth');
          this.src = this.src.replace('-largeHorizontalJumbo.jpg', '-facebookLarge.jpg');
        }
        if(this.src.includes('-facebookLarge.jpg') && this.getAttribute('data') == 'moth'){
          console.log('moth');
          this.setAttribute('data', 'remove');
          this.src = this.src.replace('-facebookLarge.jpg', '-moth.jpg');
        }
      };
      // threeByTwoLargeAt2X-v2.jpg
      //static01.nyt.com/images/2019/03/28/us/AFFIRMATIVE-photos-slide-0CY5/AFFIRMATIVE-photos-slide-0CY5-threeByTwoLargeAt2X-v2.jpg?quality=75&auto=webp&disable=upscale&width=1620
    }
    // NPR: For articles that do not include an image, NPR inserts a 1x1px image
    // for tracking purposes. I'm fine with this, I want NPR to know I'm using
    // their RSS feed so that they keep supporting it, but I don't want it to
    // cause display problems like it is so I'm setting them to
    // display: none here.
    if(src == 'https://media.npr.org/include/images/tracking/npr-rss-pixel.png'){
      img.setAttribute('style', 'display:none');
    }
    img.setAttribute('src', src);
    img.onerror = onErrorScript;
    article.appendChild(img);
  }
}



function fetchSource(column, source){
  // CORS_PROXY +
  var d = new Date();
  var feed = parser.parseURL(CORS_PROXY + source, function(err, feed) {
    console.log(feed);
    for(var i=0; i<10; i++){
      // Create Article
      var article = document.createElement('a');
      article.setAttribute('href', feed.items[i].link);
      // Append Title
      var headline = document.createElement('h1');
      headline.innerHTML = unescape(feed.items[i].title);
      article.appendChild(headline);
      // Append Image
      addImage(feed.items[i], article);
      // Append Snippet
      if(feed.items[i].contentSnippet){
        var snippet = document.createElement('p');
        snippet.innerHTML = unescape(feed.items[i].contentSnippet.slice(0,280));
        article.appendChild(snippet);
      }
      // Append Date

      article.classList.add('article');
      column.appendChild(article);
    }
  });
  return column
}



if(window.location.hash) {
  var page = decodeURIComponent(window.location.hash.replace('#',''));
  console.log(page);
} else {
  var page = 'Headlines';
}
document.getElementById('title').innerHTML = '<h1>News: '+ page +'</h1>';
// Main function: for parsing feeds and populating #content with thier contents
var pageSources = sources[page];
var k = Object.keys(pageSources);
//var sources = sources[k[]]
var content = document.getElementById('content');
for(j=0; j<k.length; j++){
  // make column
  console.log('makeCol');
  var column = document.createElement('div');
  column.classList.add('column');
  var div = document.createElement('div');
  var org = document.createTextNode(k[j]);
  div.appendChild(org);
  div.classList.add('org');
  column.appendChild(div);
  for (m=0; m<pageSources[k[j]].length; m++){
    // append articles
    console.log(pageSources[k[j]][m]);
    content.appendChild(fetchSource(column, pageSources[k[j]][m]));
  }
}

// Create menu
window.addEventListener('hashchange', function(){window.location.reload()});
function makeMenu(sources){
    var menu = document.getElementById('menu');
    var topics = Object.keys(sources);
    //console.log(sources);
    for(var i=0; i<topics.length; i++){
      var topic = document.createElement('a');
      topic.innerText = topics[i];
      topic.href = '/#'+encodeURIComponent(topics[i]);
      //topic.onclick = function(){window.location = self.href;};
      menu.appendChild(topic);
    }
}
makeMenu(sources);

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


/*
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
  // Set up breakpoints. cols is number of columns to display in addition to reference or 0th column
  width = window.innerWidth;
  if(width > 1000){
    ref=0;
    cols = columns.length;  // Desktop
  }
  if(750 < width && width <= 1000){
    cols = 1;  // Tablet
  }
  if(width <= 750){
    cols = 0;  // Phone
  }
  for(var k=0; k<columns.length; k++){
    if(ref<=k && k<=(ref+cols)){
      columns[k].style.display = 'block';
    }
    else{
      columns[k].style.display = 'none';
    }
  }
  console.log('resize');
});
*/



//////////////////////////////////////////////
var columns = document.querySelectorAll('.column');
var ref = 0;
//let pageWidth = window.innerWidth;

/////////////////////////////////////////////////////

// Set up breakpoints. cols is number of columns to display in addition to reference or 0th column
/*
if(pageWidth > 1000){
  ref=0;
  cols = columns.length;  // Desktop
}
if(750 < pageWidth && pageWidth <= 1000){
  cols = 1;  // Tablet
}
if(pageWidth <= 750){
  cols = 0;  // Phone
}
for(var k=0; k<columns.length; k++){
  if(ref<=k && k<=(ref+cols)){
    columns[k].style.display = 'block';
  }
  else{
    columns[k].style.display = 'none';
  }
}
console.log('load');
*/
