var Requests = (function() {

  class Request {
    constructor(query, emails) {
      // Results containers
      this.results = [];
      this.start = true;

      // Creating array of emails
      if (Array.isArray(emails))
        this.emails = emails;
      else
        this.emails = [emails];
      // Query
      this.query = query;
    };
    returnDifferences(newResults) {
      if(newResults.length > 0)
         return newResults.filter(res => !includesObject(this.results, res));
      return this.results;
    };
    updateResults(res) {
      this.results = res;
    }
  }

  // Array containing all request
  let requests = [];

  // Functions
  function compareObjects(obj1, obj2) {
    for (let prop in obj1) {
      if (obj1[prop] != obj2[prop])
        return false;
    }
    return true;
  }

  function includesObject(array, object) {
    for (let el of array) {
      if (compareObjects(el, object));
      return true;
    }
    return false;
  }

  var get = function() {
    return requests;
  };

  var add = function({
    query,
    emails
  }) {
    // Leaving only query
    if (query.includes('zalando.pl'))
      query = query.slice(query.indexOf('pl') + 2);

    for (let req of requests) {
      if (req.query == query) {
        // Creating array of emails
        if (Array.isArray(emails))
          req.emails.push(...emails);
        else
          req.emails.push(emails);
        return true;
      }
    }

    let r = new Request(query, emails);
    requests.push(r);
  }

  var update = function(request, results) {
    requests[requests.indexOf(request)].updateResults(results);
  }

  return {
    get,
    add,
    update
  };
})();

module.exports = Requests;
