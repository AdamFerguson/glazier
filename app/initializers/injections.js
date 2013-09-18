import CardManager from 'glazier/card_manager';
import CardDataManager from 'glazier/card_data_manager';

var initializer = {
  name: 'injections',
  initialize: function (container, application) {
    application.register('card_manager:main', CardManager, {singleton: false});
    application.register('card_data_manager:main', CardDataManager);

    application.inject('card_data_manager:main', 'userController', 'controller:user');
    application.inject('card_data_manager:main', 'repositoryController', 'controller:repository');

    application.inject('card_manager:main', 'cardDataManager', 'card_data_manager:main');
    application.inject('card_manager:main', 'store', 'store:main');

    application.inject('state_manager:section_navigation', 'router', 'router:main');
    application.inject('state_manager:section_navigation', 'store', 'store:main');

    application.inject('card_manager:main', 'conductor', 'conductor:main');
    application.inject('service:identity', 'userController', 'controller:user');
    application.inject('service:authenticated_github_api', 'userController', 'controller:user');
    application.inject('service:oauth', 'oauthController', 'controller:oauth');
    application.inject('service:intent', 'target', 'controller:intents');
  }
};

export default initializer;

