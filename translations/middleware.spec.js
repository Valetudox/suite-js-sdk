/*eslint no-unused-expressions: 0*/
'use strict';

var FakeContext = require('../test-mocks').FakeContext;
var FakeDecorator = require('../test-mocks').FakeTranslationRenderDecorator;
var translationsDecoratorMiddleware = require('./middleware');
var SuiteAPI = require('../api');
var nock = require('nock');
var Translator = require('./translator');
var TranslateRenderDecorator = require('./render-decorator');
var TranslationRequiredParameterMissingError = require('./required-parameter-missing-error');

describe('Suite translation middleware', function() {

  var testTranslation = 'test';

  describe('#decorateRenderWithTranslations', function() {
    var context;
    var next;
    var generatorNext;
    var fakeApi;
    var fakeResponseForTranslations;
    var validValidatedData;

    beforeEach(function() {
      /*eslint-disable*/
      next = async function() { next.called = true; };
      generatorNext = function*() { generatorNext.called = true; };
      /*eslint-enable*/
      next.called = false;
      generatorNext.called = false;

      context = FakeContext.create();
      context.id = 5;

      fakeApi = {
        administrator: {
          getAdministrator: sinon.stub()
        }
      };

      validValidatedData = {
        environment: 'testEnvironment',
        customer_id: '12',
        admin_id: '21'
      };

      fakeResponseForTranslations = { messages: 'from mock' };

      sinon.stub(SuiteAPI, 'createWithCache').returns(fakeApi);

      fakeApi.administrator.getAdministrator
        .withArgs({ administrator_id: validValidatedData.admin_id })
        .resolves({ body: { data: { interface_language: 'mx' } } });
    });

    afterEach(function() {
      nock.cleanAll();
    });

    it('should throw error if it does not get testTranslation', async function() {
      context.setValidatedData(validValidatedData);

      try {
        await translationsDecoratorMiddleware.decorateRenderWithTranslations().call(context, next);
      } catch (ex) {
        expect(next.called).to.be.false;
        return expect(ex).to.be.an.instanceOf(TranslationRequiredParameterMissingError);
      }

      throw new Error('Missed exception');
    });

    it('should keep the original render data', async function() {
      httpBackendRespondWith(200, 'mx', fakeResponseForTranslations);

      var renderData = { someData: 1 };
      context.setValidatedData(validValidatedData);

      await translationsDecoratorMiddleware.decorateRenderWithTranslations(testTranslation).call(context, next);
      context.render('local.view.render', renderData);

      expect(context.getLastRenderData()).to.containSubset({
        someData: 1
      });
      expect(next.called).to.be.true;
    });

    it('should handle generator functions as well', async function() {
      httpBackendRespondWith(200, 'mx', fakeResponseForTranslations);

      var renderData = { someData: 1 };
      context.setValidatedData(validValidatedData);

      await translationsDecoratorMiddleware.decorateRenderWithTranslations(testTranslation).call(context, generatorNext);
      context.render('local.view.render', renderData);

      expect(context.getLastRenderData()).to.containSubset({
        someData: 1
      });
      expect(generatorNext.called).to.be.true;
    });

    it('should pass api options', async function() {
      httpBackendRespondWith(200, 'mx', fakeResponseForTranslations);

      var testApiOptions = { customerId: 5, host: 'tempuri.org' };
      context.setValidatedData(validValidatedData);

      await translationsDecoratorMiddleware
        .decorateRenderWithTranslations(testTranslation, testApiOptions).call(context, next);

      expect(fakeApi.administrator.getAdministrator).to.have.been.calledWith(
        { administrator_id: '21' },
        testApiOptions
      );
    });

    it('should pass the correct translation file name', async function() {
      var testTranslationId = 'anotherTest';
      sinon.stub(TranslateRenderDecorator, 'create').returns(FakeDecorator);

      await translationsDecoratorMiddleware.decorateRenderWithTranslations(testTranslationId).call(context, next);
      expect(TranslateRenderDecorator.create).to.have.been.calledWith(context, testTranslationId);
    });

    it('should add admin\'s language translations to the render data', async function() {
      httpBackendRespondWith(200, 'mx', fakeResponseForTranslations);

      var renderData = { someData: 1 };
      context.setValidatedData(validValidatedData);

      await translationsDecoratorMiddleware.decorateRenderWithTranslations(testTranslation).call(context, next);
      context.render('local.view.render', renderData);

      expect(SuiteAPI.createWithCache).to.have.been.calledWith(context.id);
      expect(context.getLastRenderData()).to.containSubset({
        translations: fakeResponseForTranslations
      });
    });


    it('should add language translations with the provided language\'s dictionary if the validated data has language', async function() {
      httpBackendRespondWith(200, 'mx', fakeResponseForTranslations);

      context.setValidatedData({ environment: validValidatedData.environment, language: 'mx' });

      await translationsDecoratorMiddleware.decorateRenderWithTranslations(testTranslation).call(context, next);
      context.render('local.view.render', {});

      expect(context.getLastRenderData()).to.containSubset({
        translations: fakeResponseForTranslations
      });
    });


    it('should add language translations with the default language\'s dictionary if environment and language is missing from validation data', async function() {
      httpBackendRespondWith(200, 'en', fakeResponseForTranslations);

      context.setValidatedData({ environment: validValidatedData.environment });

      await translationsDecoratorMiddleware.decorateRenderWithTranslations(testTranslation).call(context, next);
      context.render('local.view.render', {});

      expect(context.getLastRenderData()).to.containSubset({
        translations: fakeResponseForTranslations
      });
    });


    it('should add translation method with admin\'s dictionary', async function() {
      var fakeTranslator = { translate: sinon.spy() };
      sinon.stub(Translator, 'create').returns(fakeTranslator);

      httpBackendRespondWith(200, 'mx', fakeResponseForTranslations);

      var renderData = { someData: 2 };
      context.setValidatedData(validValidatedData);

      await translationsDecoratorMiddleware.decorateRenderWithTranslations(testTranslation).call(context, next);
      context.render('local.view.render', renderData);

      expect(context.getLastRenderData()).to.have.property('_').that.eql(fakeTranslator.translate);
      expect(Translator.create).to.have.been.calledWith(fakeResponseForTranslations);
    });


    it('should add empty admin\'s language translations to the render data if the request fails', async function() {
      httpBackendRespondWith(200, 'mx', null);

      var renderData = { someData: 1 };
      context.setValidatedData(validValidatedData);

      await translationsDecoratorMiddleware.decorateRenderWithTranslations(testTranslation).call(context, next);
      context.render('local.view.render', renderData);

      expect(context.getLastRenderData()).to.containSubset({
        translations: {}
      });
    });


    it('should add admin\'s language translations from cache after the first request', async function() {
      httpBackendRespondWith(200, 'mx', fakeResponseForTranslations);

      context.setValidatedData(validValidatedData);

      await translationsDecoratorMiddleware.decorateRenderWithTranslations(testTranslation).call(context, next);
      context.render('local.view.render', { anotherData: 2 });

      var renderData = { someData: 1 };
      await translationsDecoratorMiddleware.decorateRenderWithTranslations(testTranslation).call(context, next);
      context.render('local.view.render', renderData);

      expect(context.getLastRenderData()).to.containSubset({
        translations: fakeResponseForTranslations
      });
    });


    it('should thrown an error if the context do not have validated data', async function() {
      try {
        context.setValidatedData(null);
        context.validatedData = null;
        await translationsDecoratorMiddleware.decorateRenderWithTranslations(testTranslation).call(context, next);
      } catch (ex) {
        expect(next.called).to.be.false;
        expect(ex).to.be.an.instanceOf(Error);
        return expect(ex.message).to.eql('decorateRenderWithTranslations middleware need validatedData from request\'s');
      }

      throw new Error('Missed exception');
    });


    var invalidValidatedCases = [{
      message: 'if the context do no have environment and language_id',
      validatedData: {
        admin_id: 'admin_id',
        customer_id: 'customerId'
      }
    }];

    invalidValidatedCases.forEach(function(testCase) {
      it('should thrown an error ' + testCase.message, async function() {
        try {
          context.setValidatedData(testCase.validatedData);
          await translationsDecoratorMiddleware.decorateRenderWithTranslations().call(context, next);
        } catch (ex) {
          expect(next.called).to.be.false;
          expect(ex).to.be.an.instanceOf(Error);
          return expect(ex.message)
            .to
            .eql('decorateRenderWithTranslations middleware need environment from request\'s validatedData');
        }

        throw new Error('Missed exception');
      });
    });
  });


  var httpBackendRespondWith = function(errorCode, language, data) {
    nock('https://testEnvironment')
      .get('/js/translate/translate_' + testTranslation + '.js.php?lang=' + language)
      .times(1)
      .reply(errorCode, data);
  };
});
