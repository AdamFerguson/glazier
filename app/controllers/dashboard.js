var DashboardController = Ember.ObjectController.extend({
  needs: ['user'],
  user: Ember.computed.alias('controllers.user'),
  repositoryName: Ember.computed.alias('id'),

  init: function() {
    this._super();
    Glazier.PaneType.find();
  },

  canAddPanes: function() {
    return this.get('isAdmin') && !this.get('addingPane');
  }.property('isAdmin', 'addingPane'),

  isAdmin: function() {
    var user = this.get('user.content'),
      repositoryName = this.get('repositoryName'),
      repos = user && user.editable_repositories;
    return repos && repos.indexOf(repositoryName) !== -1;
  },

  addablePanes: function() {
    return Glazier.PaneType.all();
  }.property(),

  addingPane: false,
  addPane: function() {
    this.toggleProperty('addingPane');
  }
});
export default DashboardController;
