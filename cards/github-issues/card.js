Conductor.require('/vendor/jquery.js');
Conductor.require('/vendor/handlebars.js');
Conductor.require('/vendor/ember-latest.js');
Conductor.require('/vendor/loader.js');
Conductor.requireCSS('/cards/github-issues.css');

var card = Conductor.card({
  consumers: {
    'repository': Conductor.Oasis.Consumer,
    'unauthenticatedGithubApi': Conductor.Oasis.Consumer,
    'github:authenticated:read': Conductor.Oasis.Consumer,
    test: Conductor.Oasis.Consumer.extend({
      requests: {
        runTest:  function(promise, testData){
          var testFn = new Function('return ' + testData.fnString)();
          testFn.call(window, card, promise);
        }
      }
    })
  },

  render: function (intent, dimensions) {
    if (!dimensions) {
      dimensions = {width:500,height:2000};
    }

    document.body.innerHTML = "<div id=\"card\"></div>";

    Ember.run(App, 'advanceReadiness');
    return App.then(function(){
      return card.consumers.repository.request('getRepository').then(function(repoName){
        Em.run(function(){
          App.__container__.lookup('controller:application').set('repositoryName', repoName);
        });

        // unauth for now
        return card.consumers.unauthenticatedGithubApi.request("ajax", {
          url: '/repos/' + repoName + '/issues',
          dataType: 'json'
        }).then(function(issues) {
          Em.run(function() {
            App.__container__.lookup('controller:application').set('model', issues);
          });
        });
      });
    }).then(null, Conductor.error);
  },

  activate: function() {
    window.App = requireModule('app/application');
  },

  metadata: {
    document: function(promise) {
      promise.resolve({
        title: "Github Issues"
      });
    }
  },

  resize: function(dimensions) {
    var width = Math.min(dimensions.width, 500);
    var height = Math.min(dimensions.height, 500);

    $('body>div').css({
      width: width
    });
  }
});

export = card;
