import ajax from 'glazier/utils/ajax';

var UserController = Ember.Controller.extend({
  content: null,
  isLoggedIn: Ember.computed.bool('content'),
  username:  Ember.computed.oneWay('content.github_login'),
  accessToken: Ember.computed.oneWay('content.github_access_token'),
  avatarUrl: function(){
    var avatarId = this.get('content.gravatar_id');
    if (avatarId) {
      return "https://secure.gravatar.com/avatar/" + avatarId;
    }
  }.property('content'),
  githubClientId: function(){
    // TODO: Not this here:
    var key = 'github_client_id';
    return Ember.$('meta[name='+ key + ']').attr('content');
  }.property(),
  exchangeGithubOauthCode: function(authCode){
    var self = this;

    ajax(
      "/api/oauth/github/exchange?code=" + authCode, {
      type: 'post'
    }).then(function(accessToken) {
      self.loginWithGithub(accessToken);
    }).then(null, Conductor.error);
  },
  clickedUser: function(){
    this.toggleProperty('isShowingLogout');
  },
  logout: function() {
    document.cookie = "login=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    this.set('isShowingLogout', false);
    this.set('content', null);
  },
  loginWithGithub: function(githubAccessToken) {
    debugger;
    var self = this;

    function loginComplete() {
      self.set('isLoggingIn', false);
    }

    return ajax('/api/session.json', {
      type: 'POST',
      data: {
        github_access_token: githubAccessToken
      }
    }).then(function(data){
      self.set('content', data.user);
    }).then(null, Conductor.error).
      then(loginComplete, loginComplete);
  }
});

export default UserController;
