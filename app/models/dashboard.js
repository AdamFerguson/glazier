import Section from 'glazier/models/section';

var Dashboard = DS.Model.extend({
  sections: DS.hasMany('section'),
  createSection: function(attributes) {
    var store = this.get('store');

    var section = store.createRecord('section', {
      dashboard: this,
      name: attributes.name,
      containerType: attributes.containerType,
      position: this.nextSectionPosition(),
      slug: Section.sluggerize(attributes.name)
    });

    return section.save();
  },
  nextSectionPosition: function() {
    return this.get('sections.length');
  },
  removeSection: function(section) {
    var store = this.get('store');
    section.get('panes').forEach(function(pane) {
      pane.unloadRecord();
    });
    section.deleteRecord();
    return section.save();
  }
});

export default Dashboard;
