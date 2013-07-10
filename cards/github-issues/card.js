import Consumer from 'conductor';

Conductor.require('/vendor/jquery.js');
Conductor.require('/vendor/handlebars.js');
Conductor.require('/vendor/ember-latest.js');
Conductor.require('/vendor/loader.js');
Conductor.requireCSS('/css/glazier_card.css');
Conductor.requireCSS('card.css');

import TestConsumer from 'app/consumers/test';

var card = Conductor.card({
  consumers: {
    'test': TestConsumer,
    'repository': Conductor.Oasis.Consumer,
    'authenticatedGithubApi': Conductor.Oasis.Consumer,
    'unauthenticatedGithubApi': Conductor.Oasis.Consumer
  },

  App: null,

  render: function (intent, dimensions) {
    document.body.innerHTML = "<div id=\"card\"></div>";
    Ember.run(this.App, 'advanceReadiness');
  },

  activate: function() {
    this.App = requireModule('app/application');
  },

  metadata: {
    document: function(promise) {
      promise.resolve({
        title: "Github Issues"
      });
    }
  }
});

export default card;
