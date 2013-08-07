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
 * mkcol
 * put
 * head
 * get
 * propfind
 * proppatch
 * copy
 * move
 * lock
 * unlock
 * post
 * remove
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

// End of file