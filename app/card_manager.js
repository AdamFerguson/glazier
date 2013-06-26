import 'glazier/services/proxy' as ProxyService;
import 'conductor' as Conductor;

/*
  @class CardManager
  @extends Ember.Object
*/
var CardManager = Ember.Object.extend({
  init: function () {
    this.instances = {}; // track instances by id
    this.providerCardDeferreds = {};
  },

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

  /*
    @private

    @method _load
    @param pane {Glazier.Pane}
    @return {Conductor.Card} the panes card
  */
  _load: function (pane) {
    var manifest = pane.get('cardManifest.manifest');
    var capabilities = [];
    var consumes = this._processConsumes(manifest, capabilities);
    var provides = this._processProvides(manifest, capabilities);

    var paneId = pane.get('id');
    var cardUrl = manifest.cardUrl;

    if (!cardUrl) {
      throw new Error("cardUrl cannot be null or undefined");
    }

    var env = (/glazier\.herokuapp\.com/.test(window.location.hostname)) ? 'prod' : 'dev';
    manifest.env = manifest.env || {};

    this.conductor.loadData(cardUrl, paneId, {
      env: manifest.env[env]
    });

    var card = this.conductor.load(cardUrl, paneId, {
      capabilities: capabilities
    });

    // attach wiretapping for the analytics panel
    if (window.StarterKit) window.StarterKit.wiretapCard(card);

    card.providerPromises = {};
    //card.targets = this._getTargets(pane);
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
  },

  /*
    @private

    @method _getTargets
    @param pane {Glazier.Pane}
    @return {Object} list of targets
  */
  _getTargets: function (pane) {
    var targets = {};
    var instances = this.instances;
    var capabilityProviders = pane.get('capabilityProviders');
    if (capabilityProviders) {
      capabilityProviders.forEach(function (capabilityProvider) {
        targets[capabilityProvider.get('capability')] = instances[capabilityProvider.get('provider.id')];
      });
    }
    return targets;
  }
});

export = CardManager;
