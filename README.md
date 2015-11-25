# suite-js-sdk

[![Codeship Status for emartech/suite-js-sdk](https://codeship.com/projects/754d4680-a546-0132-cbce-72e52541da30/status?branch=master)](https://codeship.com/projects/66642)
[![Dependency Status](https://david-dm.org/emartech/suite-js-sdk.svg)](https://david-dm.org/emartech/suite-js-sdk)

Simple Javascript wrapper for the Emarsys API.

## Installation

    npm install --save suite-js-sdk

## Testing

    npm test

## Emarsys API Hint

This wrapper tries to implement all available methods of the Emarsys API in a
node fashion, exposing a **Promise-only interface**.

However, the Emarsys API lacks a decent amount of methods that you expect an API to provide.
Thus, if methods are missing or a certain implementation
style was choosen it is most likely due to the inconsistency of the API itself.
Feel free to get in touch or submit a pull request if you encounter any problems.

## Configuration and Setup

### Debug

If you want to debug. Set your environment variables

    DEBUG=suite-sdk,suiterequest

## Authentication middleware

### Prerequisites

The koa bodyparser module should be installed and in use **before** the use of
the koaMiddleware.

    npm install koa-bodyparser -S

In application configuration:

    var bodyParser = require('koa-bodyparser');

    var app = koa();
    app.use(bodyParser());

### Configuration

Set your environment variables

    SUITE_ESCHER_SECRET=yourEscherSecret
    SUITE_ESCHER_CREDENTIAL_SCOPE=yourEscherCredentialScope

### Usage

    var middleware = require('suite-js-sdk').authentication.koaMiddleware.getMiddleware();

If the authentication fails it throws an error with 401 code.
If the authentication success it decorates the request with a validatedData property. It contains the signed parameters.

## Translation middleware

### Configuration

    var middleware = require('suite-js-sdk').translations.koaMiddleware.decorateRenderWithTranslations();

The middleware use 'validatedData' from the request. 'validatedData' must contains an 'environment' property.
If you want to load an admins language then 'validatedData' must contains a 'customer_id' and an 'admin_id' properties.
If you want to load a specific language then 'validatedData' must contains a 'language' property.

### Usage

Middleware decorates the render method. It will add 'translations' object as render data. It also adds a '_' method as render data. So you can use it for transations.

    translations = {
        dialogs: {
            invitation: {
                confirmation: {
                    message: 'test string with %s and with %s'
                }
            }
        }
    }


in your jade file

    p.message= _('dialogs.invitation.confirmation.message', [ 'firstParameter', 'second parameter'])

## Interacting with the API

### Authentication

Authenticate with the api credentials provided by your Emarsys account manager.

Set your environment variables

    SUITE_API_KEY=yourApiKey
    SUITE_API_SECRET=yourSecretKey


After in your Codebase

    var SuiteAPI = require('suite-js-sdk').api;
    var suiteAPI = SuiteAPI.create(options);

#### Options

* `{String} customerId`: the id of the customer
* `{String} apiKey`: API key
* `{String} apiSecret`: API secret
* `{String} environment`: API environment

### SDK methods

Each of the following methods take a last `options` parameter as a last argument. With
this options set you can override the `customerId`, `escherOptions`, etc. that you had defined when created an
instance from the API client, like:


    var SuiteAPI = require('suite-js-sdk').api;
    var suiteAPI = SuiteAPI.create({
       customerId: 1083232
    });

    suiteAPI.administrator.getAdministrators({
        customerId: 20234245
    });

In the example above, the API will be called with `customerId = 20234245`.

#### Administrators

##### [List](http://documentation.emarsys.com/resource/developers/api/customers/list-administrators/)

    suiteAPI.administrator.getAdministrators(payload);

##### Get By Name

Data of an admin can be queried by providing its name.

    suiteAPI.administrator.getAdministratorByName(payload);

##### [Patch](http://documentation.emarsys.com/resource/developers/api/customers/update-administrator/)

    suiteAPI.administrator.patchAdministrator(payload);

##### [Create](http://documentation.emarsys.com/resource/developers/api/customers/create-administrator/)

    suiteAPI.administrator.createAdministrator(payload);

##### [Delete](http://documentation.emarsys.com/resource/developers/api/customers/delete-administrator/)

    suiteAPI.administrator.deleteAdministrator(payload);

##### Disable

Changes the status of the admin to disabled so logging in will not be possible.

    suiteAPI.administrator.disableAdministrator(payload);

##### Enable

Changes the status of the disabled admin back to enabled so logging in becomes possible.

    suiteAPI.administrator.enableAdministrator(payload);

##### [Get Interface Languages](http://documentation.emarsys.com/resource/developers/api/customers/administrator-ui-languages/)

    suiteAPI.administrator.getInterfaceLanguages(payload);

##### [Get Access Levels](http://documentation.emarsys.com/resource/developers/api/customers/access-levels/)

    suiteAPI.administrator.getAccessLevels(payload);

##### Promote to Superadmin

Levels up an admin to a superadmin.

    suiteAPI.administrator.promoteToSuperadmin(payload);

##### Create Superadmin

Creates a superadmin.

    suiteAPI.administrator.createSuperadmin(payload);

##### Invite Existing Administrator

Sets the status of the admin to disabled and invites the admin again. The admin can log in only after completing the
necessary data on the invitation form.

    suiteAPI.administrator.inviteExistingAdministrator(payload);

#### Condition

##### List

    suiteAPI.condition.list(payload);

##### List with contact fields

    suiteAPI.condition.listWithContactFields(payload);

#### Contact

##### [Create](http://documentation.emarsys.com/resource/developers/api/contacts/create-contact/)

    suiteAPI.contact.create(payload);

#### Contact List

##### [Create](http://documentation.emarsys.com/resource/developers/api/contacts/create-list/)

    suiteAPI.contactList.create(payload);

##### [List](http://documentation.emarsys.com/resource/developers/api/contacts/list-contact-data/)

    suiteAPI.contactList.list(payload);

##### [Add](http://documentation.emarsys.com/resource/developers/api/contacts/add-contacts-to-list/)

    suiteAPI.contactList.add(payload);

#### ExternalEvent

##### [Trigger](http://documentation.emarsys.com/resource/developers/api/external-events/trigger-event/)

    suiteAPI.externalEvent.trigger(payload);

#### Language

##### Translate

Lists available languages for a customer in the customer's own language.

    suiteAPI.language.translate(payload);

#### Settings

##### [Get](http://documentation.emarsys.com/resource/developers/api/customers/customer-settings/)

    suiteAPI.settings.getSettings(payload);

##### Get Corporate Domains

Lists the permitted corporate domains of the customer. If corporate domains are set, registration is possible only with
those email addresses which meet these requirements.

    suiteAPI.settings.getCorporateDomains(payload);

##### Set Corporate Domains

Accepted corporate domains can be defined.

    suiteAPI.settings.setCorporateDomains(payload);

##### Get IP Restrictions

Lists the permitted IP address rules (e.g. 192.168.* allows IP addresses which start with these two numbers and can end
in any numbers).

    suiteAPI.settings.getIpRestrictions(payload);

##### Set IP Restrictions

Possible IP address rules can be defined.

    suiteAPI.settings.setIpRestrictions(payload);

##### Get security settings

Get security settings (IP whitelisting enabled option)

    suiteAPI.settings.getSecuritySettings(payload);

##### Set security settings

Set security settings (IP whitelisting enabled option)

    suiteAPI.settings.setSecuritySettings(payload);

#### Email

##### [Copy](http://documentation.emarsys.com/resource/developers/api/email/copy-campaign/)

    suiteAPI.email.copy(payload);

##### [Update source](http://documentation.emarsys.com/resource/developers/api/email/update-source/)

    suiteAPI.email.updateSource(payload);

##### [Launch](http://documentation.emarsys.com/resource/developers/api/email/launch-campaign/)

    suiteAPI.email.launch(payload);

##### [Launch list](http://documentation.emarsys.com/resource/developers/api/email/list-launches/)

    suiteAPI.email.launchList(payload);

##### [List](http://documentation.emarsys.com/resource/developers/api/email/list-campaigns/)

    suiteAPI.email.list(payload);

##### [Get](http://documentation.emarsys.com/resource/developers/api/email/campaign-data/)

    suiteAPI.email.get(payload);

##### [Patch](http://documentation.emarsys.com/resource/developers/api/email/update-campaign/)

    suiteAPI.email.patch(payload);

##### [Sending a Test Email](http://documentation.emarsys.com/resource/developers/api/email/send-testmail/)

    suiteAPI.email.sendTestMail(payload);

##### Querying Email Personalizations

Lists all possible alternate texts with their email campaigns. Alternate texts are defined for a specific field, and
displayed in the email campaign if this field has no value.

    suiteAPI.email.getPersonalizations(payload);

##### Updating Email Personalizations

Updates alternate texts.

    suiteAPI.email.setPersonalizations(payload);

#### Segment

##### [List contacts](http://documentation.emarsys.com/resource/developers/api/contacts/list-contact-data/)

    suiteAPI.segment.listContacts(payload);

##### [List segments](http://documentation.emarsys.com/resource/developers/api/contacts/list-segments/)

    suiteAPI.segment.listSegments(payload);

#### Purchases

##### List

Lists the purchases of customers per day.

    suiteAPI.purchase.list(payload);

#### Contact Fields

##### [Listing Available Fields](http://documentation.emarsys.com/resource/developers/api/contacts/list-fields/)

    suiteAPI.field.get(payload);
