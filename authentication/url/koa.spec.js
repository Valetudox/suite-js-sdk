'use strict';

var SuiteSignedUrlAuthenticator = require('./');
var middlewareFactory = require('./koa');
var FakeContext = require('../../test-mocks').FakeContext;
var _ = require('lodash');


describe('Suite API authentication middleware', function() {

  var context;
  var next;

  beforeEach(function() {
    /*eslint-disable*/
    next = async function() { next.called = true; };

    /*eslint-enable*/
    next.called = false;

    context = FakeContext.create();

    _.extend(context.request, {
      query: {
        'queryPar1': '1',
        'queryPar2': '2'
      },
      body: {
        'bodyPar1': '1',
        'bodyPar2': '2'
      },
      url: 'testUrl',
      header: {
        host: 'testHost'
      }
    });

    sinon.spy(SuiteSignedUrlAuthenticator, 'create');
  });


  it('should thrown an 401 error if the authentication fails', async function() {
    var middleware = middlewareFactory.getMiddleware({ option1: 1 });
    sinon.stub(SuiteSignedUrlAuthenticator.prototype, 'authenticate').throws(new Error('errorMessage'));

    await middleware(context, next);

    expect(context.throw).to.have.been.calledWith(401, 'errorMessage');
    /*eslint-disable*/
    expect(next.called).to.be.true;
    /*eslint-enable*/
    expect(SuiteSignedUrlAuthenticator.prototype.authenticate).to.have.been.calledWith('testUrl', 'testHost');
    expect(SuiteSignedUrlAuthenticator.create).to.have.been.calledWith({ option1: 1 });
  });


  it('should decorate the request with validatedData from query parameters if the request is a GET', async function() {
    var middleware = middlewareFactory.getMiddleware({ option2: 2 });
    sinon.stub(SuiteSignedUrlAuthenticator.prototype, 'authenticate');
    context.request.method = 'GET';

    await middleware(context, next);

    /*eslint-disable*/
    expect(next.called).to.be.true;
    /*eslint-enable*/
    expect(SuiteSignedUrlAuthenticator.prototype.authenticate).to.have.been.calledWith('testUrl', 'testHost');
    expect(context.request.validatedData).to.eql({
      'queryPar1': '1',
      'queryPar2': '2'
    });
    expect(SuiteSignedUrlAuthenticator.create).to.have.been.calledWith({ option2: 2 });
  });


  it('should decorate the request with validatedData from body parameters if the request is a POST', async function() {
    var middleware = middlewareFactory.getMiddleware({ option3: 3 });
    sinon.stub(SuiteSignedUrlAuthenticator.prototype, 'authenticate');
    context.request.method = 'POST';

    await middleware(context, next);

    /*eslint-disable*/
    expect(next.called).to.be.true;
    /*eslint-enable*/
    expect(SuiteSignedUrlAuthenticator.prototype.authenticate).to.have.been.calledWith('testUrl', 'testHost');
    expect(context.request.validatedData).to.eql({
      'bodyPar1': '1',
      'bodyPar2': '2'
    });
    expect(SuiteSignedUrlAuthenticator.create).to.have.been.calledWith({ option3: 3 });
  });


  it('should decorate the request with validatedData from query parameters if the request is a HEAD', async function() {
    var middleware = middlewareFactory.getMiddleware({ option4: 4 });
    sinon.stub(SuiteSignedUrlAuthenticator.prototype, 'authenticate');
    context.request.method = 'HEAD';

    await middleware(context, next);

    /*eslint-disable*/
    expect(next.called).to.be.true;
    /*eslint-enable*/
    expect(SuiteSignedUrlAuthenticator.prototype.authenticate).to.have.been.calledWith('testUrl', 'testHost');
    expect(context.request.validatedData).to.eql({
      'queryPar1': '1',
      'queryPar2': '2'
    });
    expect(SuiteSignedUrlAuthenticator.create).to.have.been.calledWith({ option4: 4 });
  });
});
