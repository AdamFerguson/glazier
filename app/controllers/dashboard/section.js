var DashboardSectionController = Ember.ObjectController.extend({
  needs: ['dashboard', 'pane_types'],
  hidePanes: false,
  isPerformingReorder: false,
  cardManager: null,
  paneTypes: Ember.computed.alias('controllers.pane_types'),
  isAdmin: Ember.computed.alias('controllers.dashboard.isAdmin'),

  scheduleSetupCardManager: function() {
    Ember.run.once(this, this.setupCardManager);
  }.observes('content', 'isPerformingReorder'),

  contentWillChange: function() {
    if (this.cardManager) {
      this.cardManager.destroy();
      this.cardManager = null;
    }
  }.observesBefore('content'),

  setupCardManager: function() {
    if (this.get('content')) {
      this.cardManager = this.container.lookup('card_manager:main');
      this.cardManager.setProviderCardCatalog(this.get('content'));
    }
  },

  actions: {
    removePane: function(pane) {
      if (window.confirm('Are you sure you want to remove ' + pane.get('displayName') + '?')) {
        pane.get('section.panes').removeObject(pane);
        pane.deleteRecord();
        this.cardManager.unload(pane);
        pane.save();
      }
    },

    addPane: function(paneType, repository, paneEntries) {
      var store = this.get('store');
      var dependencies = this.paneTypesToAdd(paneType);

      // TODO: make recursively handle dependencies. (YAGNI?)
      var section = this.get('content');

      repository = repository || this.get('dashboard.id'); // default to dashboard id
      paneEntries = paneEntries || {};

      if (dependencies) {
        dependencies.forEach(function(paneType) {
          store.createRecord('pane', {
            section: section,
            paneType: paneType,
            position: section.get('nextPanePosition')
          }).save();
        }, this);
      }

      store.createRecord('pane', {
        section: section,
        paneType: paneType,
        repository: repository,
        position: section.get('nextPanePosition'),
        paneEntries: paneEntries
      }).save();

      this.send('hideModal');

      this.scrollLastPaneIntoView();
    }
  },

  scrollLastPaneIntoView: function() {
    // Scroll the new pane into view after for modal-close animation is done
    // Doing it sooner results in an odd scroll position
    Ember.run.later(this, function() {
      var lastPane = $('.pane').last();
      var scrollTop = lastPane.offset().top + lastPane.height();
      $('body').scrollTop(scrollTop);
    }, 500);
  },

  paneTypesToAdd: function(paneType) {
    var consumes = paneType.get('manifest.consumes');
    var conductorServices = Conductor.services;

    var paneProvides = [];

    this.get('panes').forEach(function(pane) {
      var provides = pane.get('manifest.provides');
      if (provides && provides.length) {
        paneProvides = paneProvides.concat(provides);
      }
    });
    var dep, dependencies = [];
    var paneTypes = this.get('paneTypes');

    consumes.forEach(function(consume) {
      if (!paneProvides.contains(consume) && !conductorServices.hasOwnProperty(consume)) {
        dep = paneTypes.find(function(paneType) {
          var provides = paneType.get('manifest.provides');
          if (provides) {
            return provides.contains(consume);
          }
        });
        if (dep) {
          dependencies.push(dep);
        }
      }
    }, this);

    return dependencies;
  }
});

export default DashboardSectionController;
