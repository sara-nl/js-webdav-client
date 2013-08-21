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
 * Test acl()
 */
asyncTest( 'Client: acl', function() {
  // Prepare test values
  var testUrl = '/acl_resource';
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  var testStatus = 201;
  var grantdeny1 = nl.sara.webdav.Ace.GRANT;
  var grantdeny2 = nl.sara.webdav.Ace.DENY;
  var privilegeNS1 = 'test://';
  var privilegeName1 = 'test_privilege';
  var privilegeNS2 = 'test://more.tests';
  var privilegeName2 = 'another_test_privilege';
  var principal1 = '/users/a_user_principal';
  var principal2 = nl.sara.webdav.Ace.SELF;
  var parent = '/path/to/parent';
    
  // Prepare two properties to add
  var priv1 = new nl.sara.webdav.Privilege();
  priv1.namespace = privilegeNS1;
  priv1.tagname = privilegeName1;
  var ace1 = new nl.sara.webdav.Ace();
  ace1.grantdeny = grantdeny1;
  ace1.inherited = false;
  ace1.invertprincipal = false;
  ace1.isprotected = false;
  ace1.principal = principal1;
  ace1.addPrivilege( priv1 );
  
  var priv2 = new nl.sara.webdav.Privilege();
  priv2.namespace = privilegeNS2;
  priv2.tagname = privilegeName2;
  var ace2 = new nl.sara.webdav.Ace();
  ace2.grantdeny = grantdeny2;
  ace2.inherited = parent;
  ace2.invertprincipal = true;
  ace2.isprotected = true;
  ace2.principal = principal2;
  ace2.addPrivilege( priv2 );
  var acl = new nl.sara.webdav.Acl();
  acl.addAce( ace1, 0 );
  acl.addAce( ace2, 1 );
  
  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.method                        , 'ACL'          , 'acl() should initiate a ACL AJAX request');
    deepEqual( request.url                           , testUrl        , 'copy() AJAX request should use the correct URL');
    deepEqual( request.getRequestHeader( testHeader ), testHeaderValue, 'copy() AJAX request should use the correct custom header');
    
    // Test the body; is the ACL structure correct?
    var xmlDoc;
    if (window.DOMParser) {
      var parser = new DOMParser();
      xmlDoc = parser.parseFromString( request.requestText, "text/xml" );
    }else{ // Internet Explorer
      xmlDoc = new ActiveXObject( "Microsoft.XMLDOM" );
      xmlDoc.async = false;
      xmlDoc.loadXML( request.requestText );
    }
    // We test whether the Acl object parses XML correctly, so here we can assume it does: so let's use that
    var producedAcl = new nl.sara.webdav.Acl( xmlDoc.documentElement );
    deepEqual( producedAcl.getLength()     , 2             , 'ACL request should result in an ACL with 2 ACE\'s' );
    var producedAce1 = producedAcl.getAce( 0 );
    deepEqual( producedAce1.grantdeny      , grantdeny1    , 'ACL request should result in an ACL with first ACE which has correct value as grantdeny' );
    deepEqual( producedAce1.inherited      , false         , 'ACL request should result in an ACL with first ACE which has false value as inherited' );
    deepEqual( producedAce1.invertprincipal, false         , 'ACL request should result in an ACL with first ACE which has false value as invertprincipal' );
    deepEqual( producedAce1.isprotected    , false         , 'ACL request should result in an ACL with first ACE which has false value as isprotected' );
    deepEqual( producedAce1.principal      , principal1    , 'ACL request should result in an ACL with first ACE which has correct value as principal' );
    var namespaces1 = producedAce1.getNamespaceNames();
    deepEqual( namespaces1.length          , 1             , 'ACL request should result in an ACL with first ACE which has one namespace for properties' );
    deepEqual( namespaces1[0]              , privilegeNS1  , 'ACL request should result in an ACL with first ACE which has the correct namespace for its properties' );
    var privileges1 = producedAce1.getPrivilegeNames( namespaces1[0] );
    deepEqual( privileges1.length          , 1             , 'ACL request should result in an ACL with first ACE which has one properties' );
    deepEqual( privileges1[0]              , privilegeName1, 'ACL request should result in an ACL with first ACE which has the correct property name' );
    
    var producedAce2 = producedAcl.getAce( 1 );
    deepEqual( producedAce2.grantdeny      , grantdeny2    , 'ACL request should result in an ACL with second ACE which has correct value as grantdeny' );
    deepEqual( producedAce2.inherited      , false         , 'ACL request should result in an ACL with second ACE which has false value as inherited' );
    deepEqual( producedAce2.invertprincipal, true          , 'ACL request should result in an ACL with second ACE which has true value as invertprincipal' );
    deepEqual( producedAce2.isprotected    , false         , 'ACL request should result in an ACL with second ACE which has false value as isprotected' );
    deepEqual( producedAce2.principal      , principal2    , 'ACL request should result in an ACL with second ACE which has correct value as principal' );
    var namespaces2 = producedAce2.getNamespaceNames();
    deepEqual( namespaces2.length          , 1             , 'ACL request should result in an ACL with second ACE which has one namespace for properties' );
    deepEqual( namespaces2[0]              , privilegeNS2  , 'ACL request should result in an ACL with second ACE which has the correct namespace for its properties' );
    var privileges2 = producedAce2.getPrivilegeNames( namespaces2[0] );
    deepEqual( privileges2.length          , 1             , 'ACL request should result in an ACL with second ACE which has one properties' );
    deepEqual( privileges2[0]              , privilegeName2, 'ACL request should result in an ACL with second ACE which has the correct property name' );
    
    stop();
    
    // Prepare a response
    request.receive( testStatus );
  } );
  server.start();
  
  // Prepare the callback, as we need it multiple times
  function aclCallback( status ) {
    start();
    deepEqual( status, testStatus, 'ACL requests should return with the correct status code' );
  };
  
  // Start the actual request we want to test
  var client = new nl.sara.webdav.Client();
  var customHeaders = {};
  customHeaders[ testHeader ] = testHeaderValue;
  // Test an acl command
  client.acl(
          testUrl,
          aclCallback,
          acl,
          customHeaders
  );
  
  // End mocking of AJAX
  server.stop();
} );

/**
 * Test report()
 */
asyncTest( 'Client: report', function() {
  // Prepare test values
  var testUrl = '/report/path';
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  var testStatus = 207;
  var testMultistatusStatus = 'HTTP/1.1 423 Locked';
  var testDestination = '/report/path/child';
  
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'acl-principal-prop-set', null );
  var displaynameNode = xmlDoc.createElementNS( 'DAV:', 'displayname' );
  var propNode = xmlDoc.createElementNS( 'DAV:', 'prop' );
  propNode.appendChild( displaynameNode );
  xmlDoc.documentElement.appendChild( propNode );
  
  // Prepare to mock AJAX
  var server = new MockHttpServer( function ( request ) {
    start();
    deepEqual( request.method                        , 'REPORT'       , 'report() should initiate a REPORT AJAX request');
    deepEqual( request.url                           , testUrl        , 'report() AJAX request should use the correct URL');
    deepEqual( request.getRequestHeader( testHeader ), testHeaderValue, 'report() AJAX request should use the correct custom header');

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
    deepEqual( xmlDoc.documentElement.namespaceURI, 'DAV:'                  , 'Report() should create an XML body with correct root element namespace' );
    deepEqual( xmlDoc.documentElement.nodeName    , 'acl-principal-prop-set', 'Report() should create an XML body with correct root element nodeName' );
    var rootSubnodes = xmlDoc.documentElement.childNodes;
    deepEqual( rootSubnodes.length                , 1                       , 'Report() should create an XML body with root element, containing 1 child node' );
    deepEqual( rootSubnodes[0].namespaceURI       , 'DAV:'                  , 'Report() should create an XML body with correct subroot element namespace' );
    deepEqual( rootSubnodes[0].nodeName           , 'prop'                  , 'Report() should create an XML body with correct subroot element nodeName' );
    var subrootSubnodes = rootSubnodes[0].childNodes;
    deepEqual( subrootSubnodes.length             , 1                       , 'Report() should create an XML body with subroot element, containing 1 child node' );
    deepEqual( subrootSubnodes[0].namespaceURI    , 'DAV:'                  , 'Report() should create an XML body with correct property element namespace' );
    deepEqual( subrootSubnodes[0].nodeName        , 'displayname'           , 'Report() should create an XML body with correct property element nodeName' );

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
  
  // Start the actual request we want to test
  var client = new nl.sara.webdav.Client();
  var customHeaders = {};
  customHeaders[ testHeader ] = testHeaderValue;
  client.report(
          testUrl,
          function( status, data, headers ) {
            start();
            deepEqual( status, testStatus, 'REPORT requests should return with the correct status code' );
            if ( status === 207 ) {
              deepEqual( data.getResponse( testDestination ).status, testMultistatusStatus, 'REPORT response with status code 207 return with a multistatus object with the correct path and status' );
            }
          },
          xmlDoc,
          customHeaders
  );
  
  // End mocking of AJAX
  server.stop();
} );

// End of file