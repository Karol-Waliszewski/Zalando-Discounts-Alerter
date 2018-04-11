const phantom = require('x-ray-phantom');
const xray = require('x-ray');
const config = require('../config');

const Crawler = (function() {

  var promotionItems = [];
  var page = '';
  var rerun = 0;

  var X = xray().driver(phantom({
    weak: false,
    webSecurity: false,
  }));

  var nthIndex = function(str, pat, n) {
    var L = str.length,
      i = -1;
    while (n-- && i++ < L) {
      i = str.indexOf(pat, i);
      if (i < 0) break;
    }
    return i;
  }

  var reset = () => {
    promotionItems = [];
    page = '';
  };

  var nextPage = () => {
    if (page.includes('&p=')) {
      let pageIndex = page.charAt(page.length - 1);
      page = page.slice(0, page.length - 1) + (parseInt(pageIndex) + 1);
    } else {
      page = '&p=2';
    }
  }

  var getDiscounts = function(query, callback) {

    X(config.url + query + page, {
      pagination: ['.cat_link-8qswi@href'],
      articles: X('.cat_articleContain-1Z60A', [{
        //discount: '.z-flag.z-flag-sale',
        name: '.cat_articleName--arFp',
        brand: '.cat_brandName-2XZRz',
        oldPrice: '.cat_originalPrice-2Oy4G',
        newPrice: '.cat_promotionalPrice-3GRE7',
        image: '.cat_image-1byrW@src',
        link: '.cat_imageLink-OPGGa@href',
      }])
    })((err, res) => {
      // Checking for errors
      if (err) console.log(err);

      if (res.articles.length == 0 || res.pagination.length == 0) {

        console.log('No Articles|Pagination found, reseting');

        // Reruning if response had 0 articles or pagination
        rerun++;
        // If request was reruned 5 times and there is still no response just skip it
        if (rerun != 5)
          getDiscounts(query, callback);

        // Preventing continuing function
        return false;
      }

      // Resets rerun counter
      rerun = 0;

      // Editing names
      for (let article of res.articles) {
        let newName = article.name.slice(0, article.name.indexOf('-')) + article.name.slice(nthIndex(article.name, '-', 2));
        article.name = newName;
      }
      // Adding articles to main array
      promotionItems.push(...res.articles);

      console.log('Articles: ' + res.articles.length);
      console.log('Page: ' + page);
      // Checking for next page
      if (res.pagination[1].length > 0) {
        // New url
        nextPage();
        getDiscounts(query, callback);
      } else {
        callback(promotionItems);
        reset();
      }
    });
  };

  return {
    getDiscounts,
    reset
  }
})();

module.exports = Crawler;
