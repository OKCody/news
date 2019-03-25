// Note: some RSS feeds can't be loaded in the browser due to CORS security.
// To get around this, you can use a proxy.
CORS_PROXY = "https://cors-anywhere.herokuapp.com/"

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
/*
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
function addImage(item, article){
  // Necessary to reduce object to string, then perform a search for an image
  // URL because all sources seem to include images differently. This is a
  // compromise between createing special code for each source and
  var regex = /(https?:\/\/((?!\").)*\"{0}\.(?:png|jpg|gif))/ig;
  var src = JSON.stringify(item).match(regex);
  console.log(src);
  if(src != null){
    src = src[0];
    // By defaulft, NYTimes images are very small and square.
    // This will make them look more like images provided by other sources.
    if(src.includes('nyt.com/images/') && src.includes('-moth.jpg')){
      src = src.replace('-moth.jpg', '-facebookJumbo.jpg');
    }
    var img = document.createElement('img');
    img.setAttribute('src', src);
    article.appendChild(img);
  }
}

var content = document.getElementById('content');
for(j=0; j<sources.length; j++){
  function addArticles(){
    var source = sources[j];
    var column = document.createElement('div');
    column.classList.add('column');

    parser.parseURL(CORS_PROXY + source[1], function(err, feed) {
      console.log(feed);
      var a = document.createElement('a');
      var org = document.createTextNode(source[0]);
      a.classList.add('org');
      a.setAttribute('href', feed.link);
      a.appendChild(org);
      column.appendChild(a);
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
    return column;
  }
  content.appendChild(addArticles());
}

function setDate(){
  var d = new Date();
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var dateNode = document.getElementById('date');
  var date = document.createTextNode(days[d.getDay()] + ', ' + months[d.getMonth()] +' '+ d.getDate().toString() +', '+ d.getFullYear().toString());
  dateNode.appendChild(date);
}
setDate();
