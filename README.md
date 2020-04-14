# News

A personal news RSS feed aggregator, News is built using Jekyll and Github Pages. Meant to be easy to swap out feeds in order to personalize to taste.

Motivation for building News grew out of frustration with Apple News which never quite seemed to understand my interests and having full control over the news sources I see.

News directly displays the RSS feeds of sources I've personally selected to suit my own taste. Please fork the gh-pages branch of this repo and make it your own.

## Build Locally

To build the site locally [install Jekyll](https://jekyllrb.com/docs/installation/), then run,
```
bundle exec jekyll build
```
then navigate to [http://localhost:4000](http://localhost:4000).

Make changes if desired, push to 'dev' branch and merge with gh-pages branch to deploy.

## Customization

### Feeds

Feed URLs and their titles are specified in the front matter of each category's page in the format of a javascript array of arrays,

```
var sources = [
  ['title', 'URL'],
  ['title', 'URL'],
  ['title', 'URL'],
  ['title', 'URL']
];
```

Add as many sources as you would like to each page. Feeds are displayed in columns. News displays no more than four feeds at a time. If using more than four feeds, scroll horizontally to bring them into view.

### Categories

News feed categories are represented by their own pages. To create new categories, add a new file to this repository named after the category itself. All each category page needs to include is front matter that specifies 'title', 'layout', and 'sources'. For example,

oklahoma.html

```
---
title: Oklahoma
layout: default
sources: var sources = [
  ['title', 'URL'],
  ['title', 'URL'],
  ['title', 'URL'],
  ['title', 'URL']
];
---
```
The News menu will populate with new category pages when rebuilt.


## Feed URLs and APIs

The feeds of some sources can be difficult to track down. This is a reminder about how to get at the feeds whose API required a little be of reverse engineering.

### NPR

[http://api.npr.org/list?id=3002](http://api.npr.org/list?id=3002)

IDs that identify NPR's feeds are listed here. Perform a search (command + F) for the topic you'd like the feed of –insert its corresponding ID as the id parameter of this URL:

```
https://www.npr.org/rss/rss.php?id=1019
```
