var Dashboard = DS.Model.extend({
  sections: DS.hasMany('Glazier.Section'),
  createSection: function(attributes) {
    var store = this.get('store');
    var transaction = store.transaction();

    transaction.createRecord(Glazier.Section, {
      dashboard: this,
      name: attributes.name,
      containerType: attributes.containerType,
      position: this.nextSectionPosition(),
      slug: attributes.name.dasherize()
    });

    return transaction.commit();
  },
  nextSectionPosition: function() {
    return this.get('sections.length');
  },
  removeSection: function(section) {
    var store = this.get('store');
    var transaction = store.transaction();
    transaction.add(section);
    section.get('panes').forEach(function(pane) {
      pane.unloadRecord()
    });
    section.deleteRecord();
    transaction.commit();
  }
});

export default Dashboard;
