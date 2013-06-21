import 'conductor' as Conductor;

var PaneView = Ember.View.extend({
  classNames: ['pane'],
  init: function () {
    this._super();
    this.cardManager = this.container.lookup('cardManager:main');
  },

  didInsertElement: function () {
    var self = this;
    var cardManager = this.cardManager;
    var pane = this.get('content');
    pane.then(function() {
      var providers = pane.get('capabilityProviders');
      var type = pane.get('cardManifest');

      var promises = [type];
      if (providers && providers.get('length') > 0) {
        promises.push(providers);
      }

      return Ember.RSVP.all(promises).then(function () {
        var card = cardManager.load(pane);
        self.appendCard(card);
      });

    }).then(null, Conductor.error);
  },

  willDestroyElement: function() {
    var pane = this.get('content');
    this.cardManager.unload(pane);
  },

  appendCard: function(card) {
    var element = this.get('element');

    card.appendTo(element).promise.then(function(card) {
      card.render();
    }).then(null, Conductor.error);

  }
});

export = PaneView;
