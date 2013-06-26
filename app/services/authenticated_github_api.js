import 'conductor' as Conductor;

var AuthenticatedGithubApiService = Conductor.Oasis.Service.extend({

  accessToken: function(){
    return this.userController.get('accessToken');
  },
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
    ajax: function(promise, ajaxOpts) {
      var accessToken = this.accessToken();

      if (!accessToken) {
        // TODO: once request handlers following resolution precedures, we can simply throw
        try {
          throw new Error('no gthub acccess token');
        } catch(error) {
          promise.reject(error);
        }
        return;
      }

      if (!ajaxOpts.data) {
        ajaxOpts.data = {};
      }

      ajaxOpts.url = 'https://api.github.com' + ajaxOpts.url;
      ajaxOpts.beforeSend = function(xhr){
        xhr.setRequestHeader('Authorization', "token " + accessToken);
      };

      $.ajax(ajaxOpts).then(function(value){
        promise.resolve(value);
      }).then(null, function(jqXhr) {
        promise.reject(failureResultFromJqXhr(jqXhr));
      }).then(null, Conductor.error);
    }
  }
});

function failureResultFromJqXhr(jqXhr){
  return {
    responseText: jqXhr.responseText,
    status: jqXhr.status,
    rawHeaders: jqXhr.getAllResponseHeaders()
  };
}
export = AuthenticatedGithubApiService;
