import Application from 'glazier/application';
import ApplicationRoute from 'glazier/routes/application';
import IndexRoute from 'glazier/routes/index';
import DashboardRoute from 'glazier/routes/dashboard';
import DashboardView from 'glazier/views/dashboard';
import ApplicationView from 'glazier/views/application';
import CardRegistry from 'glazier/card_registry';
import ConfigurationService from 'glazier/services/configuration';
import FullXhrService from 'glazier/services/full_xhr';
import UserStorageService from 'glazier/services/user_storage';
import IdentityService from 'glazier/services/identity';
import Card from 'glazier/models/card';
import CapabilityProvider from 'glazier/models/capability_provider';
import CardType from 'glazier/models/card_type';
import Dashboard from 'glazier/models/dashboard';


import 'glazier/fixtures' as Fixtures;

var Glazier = Application.create();

Glazier.Card = Card;
Glazier.CapabilityProvider = CapabilityProvider;
Glazier.CardType = CardType;
Glazier.Dashboard = Dashboard;

Glazier.IndexRoute = IndexRoute;
Glazier.ApplicationRoute = ApplicationRoute;
Glazier.ApplicationView = ApplicationView;
Glazier.DashboardRoute = DashboardRoute;
Glazier.DashboardView = DashboardView;

var conductor = new Conductor();
var cardRegistry = new CardRegistry(conductor);

Glazier.register('conductor:main', conductor, { instantiate: false});
Glazier.register('cardRegistry:main', cardRegistry, { instantiate: false});


Conductor.services['configuration'] = ConfigurationService;
Conductor.services['fullXhr'] = FullXhrService;
Conductor.services['userStorage'] = UserStorageService;
Conductor.services['identity'] = IdentityService;

export Glazier;
