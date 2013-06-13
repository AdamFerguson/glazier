/*
  Provides unauthenticated github api access

  @class UnauthenticatedGithubApiConsumer
*/
var UnauthenticatedGithubApiService = Conductor.Oasis.Service.extend({

  /*
    @public

    @property requests
    @type Object
  */
  requests: {

    /*
      @public

      @method ajax
      @param promise {Conductor.Oasis.RSVP.Promise}
      @param ajaxOpts {Object}
    */
    ajax: function (promise, ajaxOpts) {
      var card = this.card;

      ajaxOpts.data = ajaxOpts.data = {};

      ajaxOpts.url = 'https://api.github.com' + ajaxOpts.url;
      delete ajaxOpts.data.access_token;

      return card.consumers.fullXhr.request('ajax', ajaxOpts).
        then(function (data) { promise.resolve(data); }).
        then(null, Conductor.error);
    }
  }
});

export = UnauthenticatedGithubApiService;
