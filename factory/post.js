'use strict';

var request = require('request'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    Q = require('q');

var BLOGGER_HOST = 'https://www.blogger.com/feeds/9174986572743472561/posts/default?alt=json&max-results=';

// Fetches data from linda Ikeji's blog
function fetchTopStories(count, cb) {
  request(BLOGGER_HOST + count, function (err, res) {
    if (!err && res.statusCode == 200) {
      var data = JSON.parse(res.body);
      cb(data);
    }
  });
}

// Pre processing all the data from the platform
function processContent(data) {
  var entries = data.feed.entry,
      stories = [];

  for (var i = 0; i < entries.length; i++) {
    var item = entries[i],
        postTitle = item.title.$t,
        content   = item.content.$t,
        url       = item.link[4].href,
        timePublished = item.published.$t,
        timeUpdated = item.updated.$t;

    var story = {
      url: url,
      headline: postTitle,
      content: content,
      timePublished: timePublished,
      timeUpdated: timeUpdated
    };

    stories.push(story);
  }

  return stories;
}

function getTrending(count) {
  var deferred = Q.defer();

  fetchTopStories(count, function (res) {
    if (!res) {
      return deferred.reject();
    }
    var posts = processContent(res);
      deferred.resolve(posts);
  });

  return deferred.promise;
}

module.exports = {
  getTrending: getTrending
};
