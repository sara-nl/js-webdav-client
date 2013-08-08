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
 * Tests whether constructor parameters are correctly used to set object attributes
 */
test( 'Client; constructor and URL construction', function() {
  // Prepare test values
  var host = 'surfsara.nl';
  var useHTTPS = true;
  var port = 8080;

  // Assertions to check the constructor without parameters
  var clientWithoutParams = new nl.sara.webdav.Client();
  deepEqual( clientWithoutParams.getUrl('')     , '/'    , 'Client with no constructor parameter should return / for empty call to getUrl()' );
  deepEqual( clientWithoutParams.getUrl('niek') , '/niek', 'Client with no constructor parameter should return /niek for call to getUrl(\'niek\')' );
  deepEqual( clientWithoutParams.getUrl('/niek'), '/niek', 'Client with no constructor parameter should return /niek for call to getUrl(\'/niek\')' );

  // Assertions to check the constructor without parameters
  var clientWith1Param = new nl.sara.webdav.Client( host );
  deepEqual( clientWith1Param.getUrl('')     , 'http://' + host + '/'    , 'Client with one constructor parameter should return correct result for empty call to getUrl()' );
  deepEqual( clientWith1Param.getUrl('niek') , 'http://' + host + '/niek', 'Client with one constructor parameter should return correct result for call to getUrl(\'niek\')' );

  // Assertions to check the constructor without parameters
  var clientWith2Param = new nl.sara.webdav.Client( host, useHTTPS );
  deepEqual( clientWith2Param.getUrl('')     , 'https://' + host + '/'    , 'Client with two constructor parameter should return correct result for empty call to getUrl()' );
  deepEqual( clientWith2Param.getUrl('niek') , 'https://' + host + '/niek', 'Client with two constructor parameter should return correct result for call to getUrl(\'niek\')' );

  // Assertions to check the constructor without parameters
  var clientWith3Param = new nl.sara.webdav.Client( host, useHTTPS, port );
  deepEqual( clientWith3Param.getUrl('')     , 'https://' + host + ':' + port + '/'    , 'Client with three constructor parameter should return correct result for empty call to getUrl()' );
  deepEqual( clientWith3Param.getUrl('niek') , 'https://' + host + ':' + port + '/niek', 'Client with three constructor parameter should return correct result for call to getUrl(\'niek\')' );
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
test( 'Client: propfind', function() {
  ok( false, 'ToDo: implement' );
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
  
  // Prepare the callback, as we need it multiple times

  
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