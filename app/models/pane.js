var Pane = DS.Model.extend({
  paneType: DS.belongsTo('Glazier.PaneType'),
  dashboard: DS.belongsTo('Glazier.Dashboard'),
  position: DS.attr('number'),

  paneEntries: DS.attr('passthrough'),
  paneUserEntries: DS.attr('passthrough'),
  paneTypeUserEntries: DS.attr('passthrough'),
  cardData: function() {
    return {
      paneEntries: this.get('paneEntries') || {},
      paneUserEntries: this.get('paneUserEntries') || {},
      paneTypeUserEntries: this.get('paneTypeUserEntries') || {}
    };
  }.property('paneEntries', 'paneUserEntries', 'paneTypeUserEntries'),

  manifest: Ember.computed.alias('paneType.manifest'),
  displayName: Ember.computed.alias('paneType.displayName'),
  diplayCardTitle: function() {
    var cardTitle = this.get('cardTitle');
    if (cardTitle) { return cardTitle; }
    return this.get('displayName');
  }.property('displayName', 'cardTitle'),
  updatePaneEntry: function(key, value) {
    this.propertyWillChange('paneEntries');
    this.get('paneEntries')[key] = value;
    this.propertyDidChange('paneEntries');
  },
  removePaneEntry: function(key) {
    this.propertyWillChange('paneEntries');
    delete this.get('paneEntries')[key];
    this.propertyDidChange('paneEntries');
  },
  updatePaneUserEntry: function(key, value) {
    this.propertyWillChange('paneUserEntries');
    this.get('paneUserEntries')[key] = value;
    this.propertyDidChange('paneUserEntries');
  },
  removePaneUserEntry: function(key) {
    this.propertyWillChange('paneUserEntries');
    delete this.get('paneUserEntries')[key];
    this.propertyDidChange('paneUserEntries');
  },
  updatePaneTypeUserEntry: function(key, value) {
    this.propertyWillChange('paneTypeUserEntries');
    this.get('paneTypeUserEntries')[key] = value;
    this.propertyDidChange('paneTypeUserEntries');
  },
  removePaneTypeUserEntry: function(key) {
    this.propertyWillChange('paneTypeUserEntries');
    delete this.get('paneTypeUserEntries')[key];
    this.propertyDidChange('paneTypeUserEntries');
  }
});

export default Pane;
