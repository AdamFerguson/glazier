var loadEmberApp = function() {
  var App = Ember.Application.create({
    rootElement: '#card'
  });

  console.log('bro');
  App.deferReadiness();
  requireModule('templates');
  return App;
};

export loadEmberApp;