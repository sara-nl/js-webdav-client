/*
 * Copyright ©2013 SURFsara bv, The Netherlands
 *
 * This file is part of js-webdav-client.
 *
 * js-webdav-client is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * js-webdav-client is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with js-webdav-client.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

/**
 * Legacy test for old style contructor parameters (each option separate parameter)
 * Tests whether constructor parameters are correctly used to set object attributes
 */
asyncTest( 'Client; legacy constructor and URL construction', function() {
  // Prepare test values
  var host = 'surfsara.nl';
  var useHTTPS = true;
  var port = 8080;
  var testHeader = 'X-Default-Test-Header';
  var testHeaderValue = 'this is a useless, but default header';

  // Assertions to check the constructor with the host parameter
  var clientWith1Param = new nl.sara.webdav.Client( host );
  deepEqual( clientWith1Param.getUrl('')     , 'http://' + host + '/'    , 'Client with one constructor parameter should return correct result for empty call to getUrl()' );
  deepEqual( clientWith1Param.getUrl('niek') , 'http://' + host + '/niek', 'Client with one constructor parameter should return correct result for call to getUrl(\'niek\')' );

  // Assertions to check the constructor with the host and https parameters
  var clientWith2Param = new nl.sara.webdav.Client( host, useHTTPS );
  deepEqual( clientWith2Param.getUrl('')     , 'https://' + host + '/'    , 'Client with two constructor parameter should return correct result for empty call to getUrl()' );
  deepEqual( clientWith2Param.getUrl('niek') , 'https://' + host + '/niek', 'Client with two constructor parameter should return correct result for call to getUrl(\'niek\')' );

  // Assertions to check the constructor with the host, https and port parameters
  var clientWith3Param = new nl.sara.webdav.Client( host, useHTTPS, port );
  deepEqual( clientWith3Param.getUrl('')     , 'https://' + host + ':' + port + '/'    , 'Client with three constructor parameter should return correct result for empty call to getUrl()' );
  deepEqual( clientWith3Param.getUrl('niek') , 'https://' + host + ':' + port + '/niek', 'Client with three constructor parameter should return correct result for call to getUrl(\'niek\')' );

  // Assertions to check the constructor with default headers
  var defaultHeaders = {};
  defaultHeaders[testHeader] = testHeaderValue;
  var clientWithDefaultHeader = new nl.sara.webdav.Client( undefined, undefined, undefined, defaultHeaders );
  
  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.getRequestHeader( testHeader ), testHeaderValue, 'Any request should include the default headers');
    stop();
  } );
  server.start();
  clientWithDefaultHeader.get('/home/', function() {} );
  start();
  
  // End mocking of AJAX
  server.stop();
} );

/**
 * Tests whether constructor config is correctly used to set object attributes
 */
asyncTest( 'Client; constructor and URL construction', function() {
  // Prepare test values
  var host = 'surfsara.nl';
  var useHTTPS = false;
  var port = 8080;
  var testHeader = 'X-Default-Test-Header';
  var testHeaderValue = 'this is a useless, but default header';
  var username = 'johndoe';
  var password = 'best password ever: 1234';

  // Assertions to check the constructor without parameters
  var clientWithoutParams = new nl.sara.webdav.Client();
  deepEqual( clientWithoutParams.getUrl('')     , '/'    , 'Client with no constructor parameter should return / for empty call to getUrl()' );
  deepEqual( clientWithoutParams.getUrl('niek') , '/niek', 'Client with no constructor parameter should return /niek for call to getUrl(\'niek\')' );
  deepEqual( clientWithoutParams.getUrl('/niek'), '/niek', 'Client with no constructor parameter should return /niek for call to getUrl(\'/niek\')' );

  // Assertions to check the constructor with the host parameter
  var configWith1Param = { 'host': host };
  var clientWith1Param = new nl.sara.webdav.Client( configWith1Param);
  deepEqual( clientWith1Param.getUrl('')     , 'https://' + host + '/'    , 'Client with one constructor parameter should return correct result for empty call to getUrl()' );
  deepEqual( clientWith1Param.getUrl('niek') , 'https://' + host + '/niek', 'Client with one constructor parameter should return correct result for call to getUrl(\'niek\')' );

  // Assertions to check the constructor with the host and https parameters
  var configWith2Param = { 'host': host, 'useHTTPS': useHTTPS };
  var clientWith2Param = new nl.sara.webdav.Client( configWith2Param );
  deepEqual( clientWith2Param.getUrl('')     , 'http://' + host + '/'    , 'Client with two constructor parameter should return correct result for empty call to getUrl()' );
  deepEqual( clientWith2Param.getUrl('niek') , 'http://' + host + '/niek', 'Client with two constructor parameter should return correct result for call to getUrl(\'niek\')' );

  // Assertions to check the constructor with the host, https and port parameters
  var clientWith3Param = { 'host': host, 'useHTTPS': useHTTPS, 'port': port };
  var clientWith3Param = new nl.sara.webdav.Client( clientWith3Param );
  deepEqual( clientWith3Param.getUrl('')     , 'http://' + host + ':' + port + '/'    , 'Client with three constructor parameter should return correct result for empty call to getUrl()' );
  deepEqual( clientWith3Param.getUrl('niek') , 'http://' + host + ':' + port + '/niek', 'Client with three constructor parameter should return correct result for call to getUrl(\'niek\')' );

  // Assertions to check the constructor with default headers
  var defaultHeaders = {};
  defaultHeaders[testHeader] = testHeaderValue;
  var configWithDefaultHeader = { 'defaultHeaders': defaultHeaders };
  var clientWithDefaultHeader = new nl.sara.webdav.Client( configWithDefaultHeader );
  
  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.getRequestHeader( testHeader ), testHeaderValue, 'Any request should include the default headers');
    stop();
  } );
  server.start();
  clientWithDefaultHeader.get('/home/', function() {} );
  
  // End mocking of AJAX
  server.stop();

  // Assertions to check the constructor with username and password
  var configWithAuthentication = { 'username': username, 'password': password };
  var clientWithAuthentication = new nl.sara.webdav.Client( configWithAuthentication );
  
  // Prepare to mock AJAX
  var serverForAuthentication = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.user, username, 'Any request should include the username');
    deepEqual( request.password, password, 'Any request should include the password');
    stop();
  } );
  serverForAuthentication.start();
  clientWithAuthentication.get('/home/', function() {} );
  start();
  
  // End mocking of AJAX
  serverForAuthentication.stop();
} );

/**
 * Test copy()
 */
asyncTest( 'Client: copy', function() {
  // Prepare test values
  var testUrl = '/old_resource';
  var testDestination = '/new_destination';
  var overwrite = nl.sara.webdav.Client.FAIL_ON_OVERWRITE;
  var testOverwrite = 'F';
  var depth = 0;
  var testDepth = 0;
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  var testStatus = 207;
  var testMultistatusStatus = 'HTTP/1.1 423 Locked';
  
  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.method                            , 'COPY'         , 'copy() should initiate a COPY AJAX request');
    deepEqual( request.url                               , testUrl        , 'copy() AJAX request should use the correct URL');
    deepEqual( request.getRequestHeader( 'Destination' ) , testDestination, 'copy() AJAX request should use the correct destination header');
    deepEqual( request.getRequestHeader( 'Overwrite' )   , testOverwrite  , 'copy() AJAX request should use the correct overwrite header');
    deepEqual( request.getRequestHeader( 'Depth' )       , testDepth      , 'copy() AJAX request should use the correct depth header');
    deepEqual( request.getRequestHeader( testHeader )    , testHeaderValue, 'copy() AJAX request should use the correct custom header');
    stop();
    
    // Prepare a response
    request.receive( testStatus,
  '<?xml version="1.0" encoding="utf-8" ?> \
  <d:multistatus xmlns:d="DAV:"> \
    <d:response> \
      <d:href>' + testDestination + '</d:href> \
      <d:status>' + testMultistatusStatus + '</d:status> \
      <d:error><d:lock-token-submitted/></d:error>\
    </d:response> \
  </d:multistatus>' );
  } );
  server.start();
  
  // Prepare the callback, as we need it multiple times
  function copyCallback( status, data ) {
    start();
    deepEqual( status, testStatus, 'COPY requests should return with the correct status code' );
    if ( status === 207 ) {
      deepEqual( data.getResponse( testDestination ).status, testMultistatusStatus, 'COPY response with status code 207 return with a multistatus object with the correct path and status' );
    }
  };
  
  // Start the actual request we want to test
  var client = new nl.sara.webdav.Client();
  var customHeaders = {};
  customHeaders[ testHeader ] = testHeaderValue;
  // Test a copy command without overwrite and with Depth: 0
  client.copy(
          testUrl,
          copyCallback,
          testDestination,
          overwrite,
          depth,
          customHeaders
  );
  stop();
  // And a copy command with overwrite and with Depth: infinity
  overwrite = nl.sara.webdav.Client.SILENT_OVERWRITE;
  testOverwrite = undefined;
  depth = nl.sara.webdav.Client.INFINITY;
  testDepth = 'infinity';
  client.copy(
          testUrl,
          copyCallback,
          testDestination,
          overwrite,
          depth,
          customHeaders
  );
  
  // End mocking of AJAX
  server.stop();
} );

/**
 * Test get()
 */
asyncTest( 'Client: get', function() {
  // Prepare test values
  var testUrl = '/resource.txt';
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  var testStatus = 200;
  var testBody = 'This is the contents of resource.txt';
  var testContentType = 'plain/text';
  
  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.method                        , 'GET'          , 'get() should initiate a GET AJAX request');
    deepEqual( request.url                           , testUrl        , 'get() AJAX request should use the correct URL');
    deepEqual( request.getRequestHeader( testHeader ), testHeaderValue, 'get() AJAX request should use the correct custom header');
    stop();
    
    // Prepare a response
    request.setResponseHeader( 'Content-Type', testContentType );
    request.receive( testStatus, testBody );
  } );
  server.start();
  
  // Start the actual request we want to test
  var client = new nl.sara.webdav.Client();
  var customHeaders = {};
  customHeaders[ testHeader ] = testHeaderValue;
  client.get(
          testUrl,
          function( status, data, headers ) {
            start();
            deepEqual( status, testStatus                                          , 'GET requests should return with the correct status code' );
            ok( (new RegExp('Content-Type: ' + testContentType, 'i')).test(headers), 'GET requests should return with the correct Content-Type header');
            deepEqual( data  , testBody                                            , 'GET requests should return with the correct body' );
          },
          customHeaders
  );
  
  // End mocking of AJAX
  server.stop();
} );

/**
 * Test head()
 */
asyncTest( 'Client: head', function() {
  // Prepare test values
  var testUrl = '/resource.txt';
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  var testStatus = 200;
  var testContentType = 'plain/text';
  
  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.method                        , 'HEAD'         , 'head() should initiate a HEAD AJAX request');
    deepEqual( request.url                           , testUrl        , 'head() AJAX request should use the correct URL');
    deepEqual( request.getRequestHeader( testHeader ), testHeaderValue, 'head() AJAX request should use the correct custom header');
    stop();
    
    // Prepare a response
    request.setResponseHeader( 'Content-Type', testContentType );
    request.receive( testStatus );
  } );
  server.start();
  
  // Start the actual request we want to test
  var client = new nl.sara.webdav.Client();
  var customHeaders = {};
  customHeaders[ testHeader ] = testHeaderValue;
  client.head(
          testUrl,
          function( status, data, headers ) {
            start();
            deepEqual( status, testStatus                                          , 'HEAD requests should return with the correct status code' );
            ok( (new RegExp('Content-Type: ' + testContentType, 'i')).test(headers), 'HEAD requests should return with the correct Content-Type header');
          },
          customHeaders
  );
  
  // End mocking of AJAX
  server.stop();
} );

/**
 * Test mkcol()
 */
asyncTest( 'Client: mkcol', function() {
  // Prepare test values
  var testUrl = '/new_folder';
  var testStatus = 201;
  var testBody = 'example body for this request';
  var testContentType = 'text/plain';
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  
  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.method                            , 'MKCOL'        , 'mkcol() should initiate a MKCOL AJAX request');
    deepEqual( request.url                               , testUrl        , 'mkcol() AJAX request should use the correct URL');
    deepEqual( request.requestText                       , testBody       , 'mkcol() AJAX request should use the correct body');
    deepEqual( request.getRequestHeader( 'Content-Type' ), testContentType, 'mkcol() AJAX request should use the correct Content-Type header');
    deepEqual( request.getRequestHeader( testHeader )    , testHeaderValue, 'mkcol() AJAX request should use the correct custom header');
    stop();
    
    // Prepare a response
    request.receive( testStatus );
  } );
  server.start();
  
  // Start the actual request we want to test
  var client = new nl.sara.webdav.Client();
  var customHeaders = {};
  customHeaders[ testHeader ] = testHeaderValue;
  client.mkcol(
          testUrl,
          function( status, data ) {
            start();
            deepEqual( status, testStatus, 'MKCOL requests should return with the correct status code' );
          },
          testBody,
          testContentType,
          customHeaders
  );
  
  // End mocking of AJAX
  server.stop();
} );

/**
 * Test move()
 */
asyncTest( 'Client: move', function() {
  // Prepare test values
  var testUrl = '/old_resource';
  var testDestination = '/new_destination';
  var overwrite = nl.sara.webdav.Client.FAIL_ON_OVERWRITE;
  var testOverwrite = 'F';
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  var testStatus = 207;
  var testMultistatusStatus = 'HTTP/1.1 423 Locked';
  
  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.method                            , 'MOVE'         , 'move() should initiate a MOVE AJAX request');
    deepEqual( request.url                               , testUrl        , 'move() AJAX request should use the correct URL');
    deepEqual( request.getRequestHeader( 'Destination' ) , testDestination, 'move() AJAX request should use the correct destination header');
    deepEqual( request.getRequestHeader( 'Overwrite' )   , testOverwrite  , 'move() AJAX request should use the correct overwrite header');
    deepEqual( request.getRequestHeader( testHeader )    , testHeaderValue, 'move() AJAX request should use the correct custom header');
    stop();
    
    // Prepare a response
    request.receive( testStatus,
  '<?xml version="1.0" encoding="utf-8" ?> \
  <d:multistatus xmlns:d="DAV:"> \
    <d:response> \
      <d:href>' + testDestination + '</d:href> \
      <d:status>' + testMultistatusStatus + '</d:status> \
      <d:error><d:lock-token-submitted/></d:error>\
    </d:response> \
  </d:multistatus>' );
  } );
  server.start();
  
  // Prepare the callback, as we need it multiple times
  function copyCallback( status, data ) {
    start();
    deepEqual( status, testStatus, 'MOVE requests should return with the correct status code' );
    if ( status === 207 ) {
      deepEqual( data.getResponse( testDestination ).status, testMultistatusStatus, 'MOVE response with status code 207 return with a multistatus object with the correct path and status' );
    }
  };
  
  // Start the actual request we want to test
  var client = new nl.sara.webdav.Client();
  var customHeaders = {};
  customHeaders[ testHeader ] = testHeaderValue;
  // Test a copy command without overwrite and with Depth: 0
  client.move(
          testUrl,
          copyCallback,
          testDestination,
          overwrite,
          customHeaders
  );
  stop();
  // And a copy command with overwrite and with Depth: infinity
  overwrite = nl.sara.webdav.Client.SILENT_OVERWRITE;
  testOverwrite = undefined;
  client.move(
          testUrl,
          copyCallback,
          testDestination,
          overwrite,
          customHeaders
  );
  stop();
  // And a copy command with truncate on overwrite
  overwrite = nl.sara.webdav.Client.TRUNCATE_ON_OVERWRITE;
  testOverwrite = 'T';
  client.move(
          testUrl,
          copyCallback,
          testDestination,
          overwrite,
          customHeaders
  );
  
  // End mocking of AJAX
  server.stop();
} );

/**
 * Test lock()
 */
asyncTest( 'Client: lock', function() {
  // Prepare test values
  var testUrl = '/report/path';
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  var testStatus = 200;
  var testOwner = 'http://beehub.nl/lockowner';

  var lockBody = document.implementation.createDocument("DAV:", "lockinfo", null);
  var exclusive = lockBody.createElementNS('DAV:', 'exclusive');
  var lockscope = lockBody.createElementNS('DAV:', 'lockscope');
  lockscope.appendChild( exclusive );
  var write = lockBody.createElementNS('DAV:', 'write');
  var locktype = lockBody.createElementNS('DAV:', 'locktype');
  locktype.appendChild( write );
  var href = lockBody.createElementNS('DAV:', 'href');
  href.appendChild( lockBody.createCDATASection( testOwner ) );
  var owner = lockBody.createElementNS('DAV:', 'owner');
  owner.appendChild( href );
  lockBody.documentElement.appendChild( lockscope );
  lockBody.documentElement.appendChild( locktype );
  lockBody.documentElement.appendChild( owner );

  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.method                        , 'LOCK'         , 'lock() should initiate a LOCK AJAX request');
    deepEqual( request.url                           , testUrl        , 'lock() AJAX request should use the correct URL');
    deepEqual( request.getRequestHeader( testHeader ), testHeaderValue, 'lock() AJAX request should use the correct custom header');

    // And the assertions to check whether the XML was well formed
    var xmlDoc;
    if ( window.DOMParser ) {
      var parser = new DOMParser();
      xmlDoc = parser.parseFromString( request.requestText, "text/xml" );
    }else{ // Internet Explorer
      xmlDoc = new ActiveXObject( "Microsoft.XMLDOM" );
      xmlDoc.async = false;
      xmlDoc.loadXML( request.requestText );
    }
    deepEqual( xmlDoc.documentElement.namespaceURI, 'DAV:'       , 'lock() should create an XML body with correct root element namespace' );
    deepEqual( xmlDoc.documentElement.nodeName    , 'lockinfo'   , 'lock() should create an XML body with correct root element nodeName' );
    var rootSubnodes = xmlDoc.documentElement.childNodes;
    deepEqual( rootSubnodes.length                , 3            , 'lock() should create an XML body with root element, containing 3 child node' );

    stop();

    // Prepare a response
    request.receive( testStatus,
      '<?xml version="1.0" encoding="utf-8" ?>\
      <D:prop xmlns:D="DAV:">\
        <D:lockdiscovery>\
          <D:activelock>\
            <D:locktype><D:write/></D:locktype>\
            <D:lockscope><D:exclusive/></D:lockscope>\
            <D:depth>infinity</D:depth>\
            <D:owner>\
              <D:href>' + testOwner + '</D:href>\
            </D:owner>\
            <D:timeout>Second-604800</D:timeout>\
            <D:locktoken>\
              <D:href>urn:uuid:e71d4fae-5dec-22d6-fea5-00a0c91e6be4</D:href>\
            </D:locktoken>\
            <D:lockroot>\
              <D:href>' + testUrl + '</D:href>\
            </D:lockroot>\
          </D:activelock>\
        </D:lockdiscovery>\
      </D:prop>' );
  } );
  server.start();

  // Start the actual request we want to test
  var client = new nl.sara.webdav.Client();
  var customHeaders = {};
  customHeaders[ testHeader ] = testHeaderValue;
  client.lock(
          testUrl,
          function( status, data ) {
            start();
            deepEqual( status, testStatus, 'LOCK requests should return with the correct status code' );
          },
          lockBody,
          customHeaders
  );

  // End mocking of AJAX
  server.stop();
} );

/**
 * Test unlock()
 */
asyncTest( 'Client: unlock', function() {
  // Prepare test values
  var testUrl = '/resource.txt';
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  var testLockToken = '<urn:uuid:a515cfa4-5da4-22e1-f5b5-00a0451e6bf7>';
  var testStatus = 204;

  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.method                          , 'UNLOCK'       , 'unlock() should initiate an UNLOCK AJAX request');
    deepEqual( request.url                             , testUrl        , 'unlock() AJAX request should use the correct URL');
    deepEqual( request.getRequestHeader( 'Lock-Token' ), testLockToken  , 'unlock() AJAX request should use the correct Lock-Token header' );
    deepEqual( request.getRequestHeader( testHeader )  , testHeaderValue, 'unlock() AJAX request should use the correct custom header');
    stop();

    // Prepare a response
    request.receive( testStatus );
  } );
  server.start();

  // Start the actual request we want to test
  var client = new nl.sara.webdav.Client();
  var customHeaders = {};
  customHeaders[ testHeader ] = testHeaderValue;
  client.unlock(
          testUrl,
          function( status ) {
            start();
            deepEqual( status, testStatus, 'UNLOCK requests should return with the correct status code' );
          },
          testLockToken,
          customHeaders
  );

  // End mocking of AJAX
  server.stop();
} );

/**
 * Test options()
 */
asyncTest( 'Client: options', function() {
  // Prepare test values
  var testUrl = '/resource.txt';
  var testRequestBody = 'This is the contents of resource.txt';
  var testRequestContentType = 'application/x-www-form-urlencoded';
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  var testStatus = 200;
  var testResponseBody = 'This is the contents of resource.txt';
  var testContentType = 'plain/text';
  
  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.method                            , 'OPTIONS'             , 'options() should initiate a OPTIONS AJAX request');
    deepEqual( request.url                               , testUrl               , 'options() AJAX request should use the correct URL');
    deepEqual( request.requestText                       , testRequestBody       , 'options() AJAX request should use the correct body');
    deepEqual( request.getRequestHeader( 'Content-Type' ), testRequestContentType, 'options() AJAX request should use the correct content type');
    deepEqual( request.getRequestHeader( testHeader )    , testHeaderValue       , 'options() AJAX request should use the correct custom header');
    stop();
    
    // Prepare a response
    request.setResponseHeader( 'Content-Type', testContentType );
    request.receive( testStatus, testResponseBody );
  } );
  server.start();
  
  // Start the actual request we want to test
  function optionsCallback( status, data, headers ) {
    start();
    deepEqual( status, testStatus                                          , 'OPTIONS requests should return with the correct status code' );
    ok( (new RegExp('Content-Type: ' + testContentType, 'i')).test(headers), 'OPTIONS requests should return with the correct Content-Type header');
    deepEqual( data  , testResponseBody                                    , 'OPTIONS requests should return with the correct body' );
  }
  var client = new nl.sara.webdav.Client();
  var customHeaders = {};
  customHeaders[ testHeader ] = testHeaderValue;
  client.options(
          testUrl,
          optionsCallback,
          testRequestBody,
          undefined, // We sent undefined as content type. The options() method should then automatically use "application/x-www-form-urlencoded"
          customHeaders
  );
  stop();
  // And with a Content-Type
  testRequestContentType = 'application/octet-stream';
  client.options(
          testUrl,
          optionsCallback,
          testRequestBody,
          testRequestContentType,
          customHeaders
  );
  
  // End mocking of AJAX
  server.stop();
} );

/**
 * Test post()
 */
asyncTest( 'Client: post', function() {
  // Prepare test values
  var testUrl = '/resource.txt';
  var testRequestBody = 'This is the contents of resource.txt';
  var testRequestContentType = 'application/x-www-form-urlencoded';
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  var testStatus = 200;
  var testResponseBody = 'This is the contents of resource.txt';
  var testContentType = 'plain/text';
  
  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.method                            , 'POST'                , 'post() should initiate a POST AJAX request');
    deepEqual( request.url                               , testUrl               , 'post() AJAX request should use the correct URL');
    deepEqual( request.requestText                       , testRequestBody       , 'post() AJAX request should use the correct body');
    deepEqual( request.getRequestHeader( 'Content-Type' ), testRequestContentType, 'post() AJAX request should use the correct content type');
    deepEqual( request.getRequestHeader( testHeader )    , testHeaderValue       , 'post() AJAX request should use the correct custom header');
    stop();
    
    // Prepare a response
    request.setResponseHeader( 'Content-Type', testContentType );
    request.receive( testStatus, testResponseBody );
  } );
  server.start();
  
  // Start the actual request we want to test
  function postCallback( status, data, headers ) {
    start();
    deepEqual( status, testStatus                                          , 'POST requests should return with the correct status code' );
    ok( (new RegExp('Content-Type: ' + testContentType, 'i')).test(headers), 'POST requests should return with the correct Content-Type header');
    deepEqual( data  , testResponseBody                                    , 'POST requests should return with the correct body' );
  }
  var client = new nl.sara.webdav.Client();
  var customHeaders = {};
  customHeaders[ testHeader ] = testHeaderValue;
  client.post(
          testUrl,
          postCallback,
          testRequestBody,
          undefined, // We sent undefined as content type. The post() method should then automatically use "application/x-www-form-urlencoded"
          customHeaders
  );
  stop();
  // And with a Content-Type
  testRequestContentType = 'application/octet-stream';
  client.post(
          testUrl,
          postCallback,
          testRequestBody,
          testRequestContentType,
          customHeaders
  );
  
  // End mocking of AJAX
  server.stop();
} );

/**
 * Test propfind()
 */
asyncTest( 'Client: propfind', function() {
  // Prepare test values
  var testUrl = '/old_resource';
  var testDepth = 0;
  var testProps = nl.sara.webdav.Client.ALLPROP;
  var testNamespace1 = 'DAV:';
  var testNamespace2 = 'tests://beehub.nl/';
  var testProp1 = 'includeprop1';
  var testProp2 = 'includeprop2';
  var testInclude = [];
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  var testStatus = 207;
  var testMultistatusStatus = 'HTTP/1.1 423 Locked';
  
  // Create two properties to use as parameters;
  var prop1 = new nl.sara.webdav.Property();
  prop1.namespace = testNamespace1;
  prop1.tagname = testProp1;
  var prop2 = new nl.sara.webdav.Property();
  prop2.namespace = testNamespace2;
  prop2.tagname = testProp2;
  
  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.method                        , 'PROPFIND'     , 'propfind() should initiate a PROPFIND AJAX request');
    deepEqual( request.url                           , testUrl        , 'propfind() AJAX request should use the correct URL');
    if ( testDepth === nl.sara.webdav.Client.INFINITY ) {
      deepEqual( request.getRequestHeader( 'depth' ) , 'infinity'     , 'propfind() AJAX request with infinite depth should use \'infinity\' as Depth header');
    }else{
      deepEqual( request.getRequestHeader( 'depth' ) , testDepth      , 'propfind() AJAX request should use the correct Depth header');
    }
    deepEqual( request.getRequestHeader( testHeader ), testHeaderValue, 'propfind() AJAX request should use the correct custom header');

    // And the assertions to check whether the XML was well formed
    var xmlDoc;
    if (window.DOMParser) {
      var parser = new DOMParser();
      xmlDoc = parser.parseFromString( request.requestText, "text/xml" );
    }else{ // Internet Explorer
      xmlDoc = new ActiveXObject( "Microsoft.XMLDOM" );
      xmlDoc.async = false;
      xmlDoc.loadXML( request.requestText );
    }
    deepEqual( xmlDoc.documentElement.namespaceURI, 'DAV:'    , 'PROPFIND request should have DAV: as namespace for the root element');
    deepEqual( xmlDoc.documentElement.nodeName    , 'propfind', 'PROPFIND request should have propfind as nodeName for the root element');
    var firstElement = xmlDoc.documentElement.childNodes.item( 0 );
    deepEqual( firstElement.namespaceURI, 'DAV:', 'PROPFIND request should have \'DAV:\' as namespace for the first child element');
    switch ( testProps ) {
      case nl.sara.webdav.Client.PROPNAME:
        deepEqual( firstElement.nodeName    , 'propname' , 'PROPFIND request with propname should have \'propname\' as nodeName for the first child element');
        deepEqual( xmlDoc.documentElement.childNodes.length, 1, 'PROPFIND request with propname should not have a second child element for the root' );
        break;
      case nl.sara.webdav.Client.ALLPROP:
        deepEqual( firstElement.nodeName    , 'allprop' , 'PROPFIND request with allprop should have \'allprop\' as nodeName for the first child element');
        if ( testInclude.length > 0 ) {
          var secondElement = xmlDoc.documentElement.childNodes.item( 1 );
          deepEqual( secondElement.namespaceURI, 'DAV:'  , 'PROPFIND request with include should have \'DAV:\' as namespace for the second child element');
          deepEqual( secondElement.nodeName    , 'include', 'PROPFIND request with include should have \'include\' as nodeName for the second child element');
          var firstIncludeElement = secondElement.childNodes.item( 0 );
          deepEqual( firstIncludeElement.namespaceURI, testNamespace1  , 'First include prop should have the correct namespace');
          deepEqual( firstIncludeElement.nodeName    , testProp1, 'First include prop to add should have the correct prop name');
          var secondIncludeElement = secondElement.childNodes.item( 1 );
          deepEqual( secondIncludeElement.namespaceURI, testNamespace2  , 'Second include prop should have the correct namespace');
          deepEqual( secondIncludeElement.nodeName    , testProp2, 'Second include prop should have the correct prop name');
        }
        break;
      default:
        deepEqual( firstElement.nodeName    , 'prop' , 'PROPFIND request with specified properties should have \'prop\' as nodeName for the first child element');
        deepEqual( xmlDoc.documentElement.childNodes.length, 1, 'PROPFIND request with specified properties should not have a second child element for the root' );
        var firstPropElement = firstElement.childNodes.item( 0 );
        deepEqual( firstPropElement.namespaceURI, testNamespace1  , 'First requested prop should have the correct namespace');
        deepEqual( firstPropElement.nodeName    , testProp1, 'First requested prop to add should have the correct prop name');
        var secondPropElement = firstElement.childNodes.item( 1 );
        deepEqual( secondPropElement.namespaceURI, testNamespace2  , 'Second requested prop should have the correct namespace');
        deepEqual( secondPropElement.nodeName    , testProp2, 'Second requested prop should have the correct prop name');
      break;
    }
    
    stop();
    
    // Prepare a response
    request.receive( testStatus,
  '<?xml version="1.0" encoding="utf-8" ?> \
  <d:multistatus xmlns:d="DAV:"> \
    <d:response> \
      <d:href>' + testUrl + '</d:href> \
      <d:status>' + testMultistatusStatus + '</d:status> \
      <d:error><d:lock-token-submitted/></d:error>\
    </d:response> \
  </d:multistatus>' );
  } );
  server.start();
  
  // Start the actual request we want to test
  function propfindCallback( status, data ) {
    start();
    deepEqual( status, testStatus, 'PROPFIND requests should return with the correct status code' );
    if ( status === 207 ) {
      deepEqual( data.getResponse( testUrl ).status, testMultistatusStatus, 'PROPFIND response with status code 207 return with a multistatus object with the correct path and status' );
    }
  }
  var client = new nl.sara.webdav.Client();
  var customHeaders = {};
  customHeaders[ testHeader ] = testHeaderValue;
  client.propfind(
          testUrl,
          propfindCallback,
          undefined, // undefined should be depth 0
          undefined, // undefined should be allprop
          undefined, // undefined should not set the include element
          customHeaders
  );
  stop();
  // And one with allprop and include
  testDepth = 1;
  testProps = nl.sara.webdav.Client.ALLPROP;
  testInclude = [ prop1, prop2 ];
  client.propfind(
          testUrl,
          propfindCallback,
          testDepth,
          testProps,
          testInclude,
          customHeaders
  );
  stop();
  // And one with propname
  testDepth = nl.sara.webdav.Client.INFINITY;
  testProps = nl.sara.webdav.Client.PROPNAME;
  client.propfind(
          testUrl,
          propfindCallback,
          testDepth,
          testProps,
          testInclude,
          customHeaders
  );
  stop();
  // And one with specific properties
  testProps = [ prop1, prop2 ];
  client.propfind(
          testUrl,
          propfindCallback,
          testDepth,
          testProps,
          testInclude,
          customHeaders
  );
  
  // End mocking of AJAX
  server.stop();
} );

/**
 * Test proppatch()
 */
asyncTest( 'Client: proppatch', function() {
  // Prepare test values
  var testUrl = '/resource.txt';
  var testNamespace1 = 'DAV:';
  var testNamespace2 = 'tests://beehub.nl/';
  var testSetProp1 = 'addprop1';
  var testSetVal1 = 'value of first property';
  var testSetProp2 = 'addprop2';
  var testSetVal2 = 'value of second property';
  var testdelProp1 = 'delprop1';
  var testdelProp2 = 'delprop2';
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  var testStatus = 200;
  
  // Prepare to mock AJAX; this will include parsing the XML produced as part of the PROPPATCH request and checking it was done right
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.method                                            , 'PROPPATCH'       , 'proppatch() should initiate a PROPPATCH AJAX request');
    deepEqual( request.url                                               , testUrl           , 'proppatch() AJAX request should use the correct URL');
    deepEqual( request.getRequestHeader( 'Content-Type' ).substr( 0, 16 ), 'application/xml;', 'proppatch() AJAX request should use the correct content type');
    deepEqual( request.getRequestHeader( testHeader )                    , testHeaderValue   , 'proppatch() AJAX request should use the correct custom header');

    // And the assertions to check whether the XML was well formed
    var xmlDoc;
    if (window.DOMParser) {
      var parser = new DOMParser();
      xmlDoc = parser.parseFromString( request.requestText, "text/xml" );
    }else{ // Internet Explorer
      xmlDoc = new ActiveXObject( "Microsoft.XMLDOM" );
      xmlDoc.async = false;
      xmlDoc.loadXML( request.requestText );
    }
    deepEqual( xmlDoc.documentElement.namespaceURI, 'DAV:'          , 'PROPPATCH request should have DAV: as namespace for the root element');
    deepEqual( xmlDoc.documentElement.nodeName    , 'propertyupdate', 'PROPPATCH request should have propertyupdate as nodeName for the root element');
    var firstElement = xmlDoc.documentElement.childNodes.item( 0 );
    deepEqual( firstElement.namespaceURI, 'DAV:', 'PROPPATCH request should have \'DAV:\' as namespace for the first child element');
    deepEqual( firstElement.nodeName    , 'set' , 'PROPPATCH request should have \'set\' as nodeName for the first child element');
    var firstProp = firstElement.childNodes.item( 0 );
    deepEqual( firstProp.namespaceURI, 'DAV:', '\'set\' node should have a childnode with namespace \'DAV:\'');
    deepEqual( firstProp.nodeName    , 'prop', '\'set\' node should have a childnode with nodeName \'prop\'');
    var firstAddElement = firstProp.childNodes.item( 0 );
    deepEqual( firstAddElement.namespaceURI                    , testNamespace1, 'First prop to add should have the correct namespace');
    deepEqual( firstAddElement.nodeName                        , testSetProp1  , 'First prop to add should have the correct prop name');
    deepEqual( firstAddElement.childNodes.item( 0 ).textContent, testSetVal1   , 'First prop to add should have the correct value');
    var secondAddElement = firstProp.childNodes.item( 1 );
    deepEqual( secondAddElement.namespaceURI                    , testNamespace2, 'Second prop to add should have the correct namespace');
    deepEqual( secondAddElement.nodeName                        , testSetProp2  , 'Second prop to add should have the correct prop name');
    deepEqual( secondAddElement.childNodes.item( 0 ).textContent, testSetVal2   , 'Second prop to add should have the correct value');
    var secondElement = xmlDoc.documentElement.childNodes.item( 1 );
    deepEqual( secondElement.namespaceURI, 'DAV:'  , 'PROPPATCH request should have \'DAV:\' as namespace for the second child element');
    deepEqual( secondElement.nodeName    , 'remove', 'PROPPATCH request should have \'remove\' as nodeName for the second child element');
    var secondProp = secondElement.childNodes.item( 0 );
    deepEqual( secondProp.namespaceURI, 'DAV:', '\'remove\' node should have a childnode with namespace \'DAV:\'');
    deepEqual( secondProp.nodeName    , 'prop', '\'remove\' node should have a childnode with nodeName \'prop\'');
    var firstDelElement = secondProp.childNodes.item( 0 );
    deepEqual( firstDelElement.namespaceURI, testNamespace1, 'First prop to add should have the correct namespace');
    deepEqual( firstDelElement.nodeName    , testdelProp1  , 'First prop to add should have the correct prop name');
    var secondDelElement = secondProp.childNodes.item( 1 );
    deepEqual( secondDelElement.namespaceURI, testNamespace2, 'Second prop to add should have the correct namespace');
    deepEqual( secondDelElement.nodeName    , testdelProp2  , 'Second prop to add should have the correct prop name');
    
    stop();
    
    // Prepare a response
    request.receive( testStatus );
  } );
  server.start();
  
  // Prepare the properties to set and unset
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'prop', null );
  var setProp1Xml = xmlDoc.createElementNS( testNamespace1, testSetProp1 );
  setProp1Xml.appendChild( xmlDoc.createCDATASection( testSetVal1 ) );
  var setProp1 = new nl.sara.webdav.Property( setProp1Xml );
  var setProp2Xml = xmlDoc.createElementNS( testNamespace2, testSetProp2 );
  setProp2Xml.appendChild( xmlDoc.createCDATASection( testSetVal2 ) );
  var setProp2 = new nl.sara.webdav.Property( setProp2Xml );
  var setProps = [ setProp1, setProp2 ];
  var delProp1 = new nl.sara.webdav.Property();
  delProp1.namespace = testNamespace1;
  delProp1.tagname = testdelProp1;
  var delProp2 = new nl.sara.webdav.Property();
  delProp2.namespace = testNamespace2;
  delProp2.tagname = testdelProp2;
  var delProps = [ delProp1, delProp2 ];
  
  // Start the actual request we want to test
  var client = new nl.sara.webdav.Client();
  var customHeaders = {};
  customHeaders[ testHeader ] = testHeaderValue;
  client.proppatch(
          testUrl,
          function ( status, data, headers ) {
            start();
            deepEqual( status, testStatus, 'PROPPATCH requests should return with the correct status code' );
          },
          setProps,
          delProps,
          customHeaders
  );
  
  // End mocking of AJAX
  server.stop();
} );

/**
 * Test put()
 */
asyncTest( 'Client: put', function() {
  // Prepare test values
  var testUrl = '/resource.txt';
  var testRequestBody = 'This is the contents of resource.txt';
  var testRequestContentType = 'application/octet-stream';
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  var testStatus = 200;
  
  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.method                            , 'PUT'                 , 'put() should initiate a PUT AJAX request');
    deepEqual( request.url                               , testUrl               , 'put() AJAX request should use the correct URL');
    deepEqual( request.requestText                       , testRequestBody       , 'put() AJAX request should use the correct body');
    deepEqual( request.getRequestHeader( 'Content-Type' ), testRequestContentType, 'put() AJAX request should use the correct content type');
    deepEqual( request.getRequestHeader( testHeader )    , testHeaderValue       , 'put() AJAX request should use the correct custom header');
    stop();
    
    // Prepare a response
    request.receive( testStatus );
  } );
  server.start();
  
  // Start the actual request we want to test
  var client = new nl.sara.webdav.Client();
  var customHeaders = {};
  customHeaders[ testHeader ] = testHeaderValue;
  client.put(
          testUrl,
          function ( status, data, headers ) {
            start();
            deepEqual( status, testStatus                                          , 'PUT requests should return with the correct status code' );
          },
          testRequestBody,
          testRequestContentType,
          customHeaders
  );
  
  // End mocking of AJAX
  server.stop();
} );

/**
 * Test remove()
 */
asyncTest( 'Client: remove', function() {
  // Prepare test values
  var testUrl = '/old_resource';
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  var testStatus = 207;
  var testMultistatusStatus = 'HTTP/1.1 423 Locked';
  
  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.method                            , 'DELETE'       , 'remove() should initiate a DELETE AJAX request');
    deepEqual( request.url                               , testUrl        , 'remove() AJAX request should use the correct URL');
    deepEqual( request.getRequestHeader( testHeader )    , testHeaderValue, 'remove() AJAX request should use the correct custom header');
    stop();
    
    // Prepare a response
    request.receive( testStatus,
  '<?xml version="1.0" encoding="utf-8" ?> \
  <d:multistatus xmlns:d="DAV:"> \
    <d:response> \
      <d:href>' + testUrl + '</d:href> \
      <d:status>' + testMultistatusStatus + '</d:status> \
      <d:error><d:lock-token-submitted/></d:error>\
    </d:response> \
  </d:multistatus>' );
  } );
  server.start();

  // Start the actual request we want to test
  var client = new nl.sara.webdav.Client();
  var customHeaders = {};
  customHeaders[ testHeader ] = testHeaderValue;
  client.remove(
          testUrl,
          function( status, data ) {
            start();
            deepEqual( status, testStatus, 'DELETE requests should return with the correct status code' );
            if ( status === 207 ) {
              deepEqual( data.getResponse( testUrl ).status, testMultistatusStatus, 'DELETE response with status code 207 return with a multistatus object with the correct path and status' );
            }
          },
          customHeaders
  );
  
  // End mocking of AJAX
  server.stop();
} );

// End of file