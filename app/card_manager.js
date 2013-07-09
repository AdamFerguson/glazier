import ProxyService from 'glazier/services/proxy';
import Conductor from 'conductor';

/*
  @class CardManager
  @extends Ember.Object
*/
var CardManager = Ember.Object.extend({
  cardDataManager: null,

  init: function () {
    this.instances = {}; // track instances by id
    this.providerCardDeferreds = {};
  },

  userDidChange: function() {
    var userData = this.get('cardDataManager.user');
    this._updateUserData(userData);
  }.observes('cardDataManager.user'),


  /*
    @public

    @method load
    @param pane {Glazier.Pane}
    @return {Conductor.Card} the panes card
  */
  load: function (pane) {
    var id = pane.get('id');
    var card = this.instances[id];
    if (!card) {
      card = this._load(pane);
      this.instances[id] = card;
    }
    return card;
  },

  /*
    @public

    Unloads the provided pane

    @method unload
    @param pane {Glazier.Pane}
  */
  unload: function (pane) {
    // unload in the future should card.destroy
    delete this.instances[pane.get('id')];
  },

  _updateUserData: function (userData) {
    this._getCards().forEach(function(card) {
      card.updateData('user', userData);
    });
  },

  _getCards: function () {
    var card, cards = [];
    Ember.keys(this.instances).forEach(function(paneId) {
      card = this.instances[paneId];
      cards.push(card);
    }, this);
    return cards;
  },

  /*
    @private

    @method _load
    @param pane {Glazier.Pane}
    @return {Conductor.Card} the panes card
  */
  _load: function (pane) {
    var capabilities = [],
        manifest = pane.get('paneType.manifest'),
        consumes = this._processConsumes(manifest, capabilities),
        provides = this._processProvides(manifest, capabilities),
        paneId = pane.get('id'),
        cardData = this._cardData(pane, manifest),
        cardUrl = manifest.cardUrl,
        ambientData,
        data;

    if (!cardUrl) {
      throw new Error("cardUrl cannot be null or undefined");
    }

    ambientData = this.cardDataManager.getAmbientData();

    data = Ember.$.extend({}, ambientData, cardData);
    this.conductor.loadData(cardUrl, paneId, data);

    var card = this.conductor.load(cardUrl, paneId, {
      capabilities: capabilities
    });

    // attach wiretapping for the analytics panel
    if (window.StarterKit) window.StarterKit.wiretapCard(card);

    card.providerPromises = {};
    for (var capability in this.providerCardDeferreds) {
      if (!this.providerCardDeferreds.hasOwnProperty(capability)) continue;
      var deferred = this.providerCardDeferreds[capability];
      if (consumes[capability]) {
        card.providerPromises[capability] = deferred.promise;
      } else if (provides[capability]) {
        deferred.resolve(card);
      }
    }
    card.consumes = consumes;
    card.provides = provides;
    card.hidden = (manifest.ui === false);
    return card;
  },

  _cardData: function(pane, manifest) {
    var env = (/glazier\.herokuapp\.com/.test(window.location.hostname)) ? 'prod' : 'dev',
        paneData = pane.get('cardData');
    manifest.env = manifest.env || {};
    return Ember.merge({ env: manifest.env[env] }, paneData);
  },

  /*
    @private

    @method _processConsumes
    @param  manifest {Object
    @param  capabilities {Object}
    @return {Object}
  */
  _processConsumes: function (manifest, capabilities) {
    var conductorServices = this.conductor.services;
    var providerCardDeferreds = this.providerCardDeferreds;
    var consumes = {};
    if (manifest.consumes) {
      manifest.consumes.forEach(function (capability) {
        if (!conductorServices[capability]) {
          conductorServices[capability] = ProxyService;
          if (!providerCardDeferreds[capability]) {
            providerCardDeferreds[capability] = Conductor.Oasis.RSVP.defer();
          }
        }
        consumes[capability] = true;
        capabilities.push(capability);
      });
    }
    return consumes;
  },

  /*
    @public

    @method load
    @return {Conductor.Card} the panes card
  */
  _processProvides: function (manifest, capabilities) {
    var conductorServices = this.conductor.services;
    var providerCardDeferreds = this.providerCardDeferreds;
    var provides = {};
    if (manifest.provides) {
      manifest.provides.forEach(function (capability) {
        if (!conductorServices[capability]) {
          conductorServices[capability] = ProxyService;
          if (!providerCardDeferreds[capability]) {
            providerCardDeferreds[capability] = Conductor.Oasis.RSVP.defer();
          }
        }
        provides[capability] = true;
        capabilities.push(capability);
      });
    }
    return provides;
  }
});

export default CardManager;
