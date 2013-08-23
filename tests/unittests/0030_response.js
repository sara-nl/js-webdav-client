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
test( 'Response; constructor', function() {
  // Prepare test values
  var href = '/test1.txt';
  var status = 'HTTP/1.1 200 OK';
  var errorResp = 'This is an error on response level';
  var responsedescriptionResp = 'This is the response description on response level';
  var statusRedirect = 'HTTP/1.1 300 Moved Permanently';
  var location = '/redirected/test.txt';
  var propNamespace1 = 'tests://beehub.nl/';
  var propTagname1 = 'testpropertyforresponse';
  var propValue1 = 'example value of the testproperty';
  var propNamespace2 = 'tests://surfsara.nl/';
  var propTagname2 = 'anotherpropertyforresponse';
  var propValue2 = 'anotherproperty value';
  var errorPropstat = 'This is an error on propstat level';
  var responsDescPropstat = 'This is the response description on propstat level';
  
  // Prepare the xml elements for the constructor parameter
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'response', null );
  var hrefNode = xmlDoc.createElementNS( 'DAV:', 'href' );
  hrefNode.appendChild( xmlDoc.createCDATASection( href ) );
  var statusNode = xmlDoc.createElementNS( 'DAV:', 'status' );
  statusNode.appendChild( xmlDoc.createCDATASection( status ) );
  var propNameNode1 = xmlDoc.createElementNS( propNamespace1, propTagname1 );
  propNameNode1.appendChild( xmlDoc.createCDATASection( propValue1 ) );
  var propNameNode2 = xmlDoc.createElementNS( propNamespace2, propTagname2 );
  propNameNode2.appendChild( xmlDoc.createCDATASection( propValue2 ) );
  var propNode = xmlDoc.createElementNS( 'DAV:', 'prop' );
  propNode.appendChild( propNameNode1 );
  propNode.appendChild( propNameNode2 );
  var errorPropNode = xmlDoc.createElementNS( 'DAV:', 'error' );
  errorPropNode.appendChild( xmlDoc.createCDATASection( errorPropstat ) );
  var responsDescPropNode = xmlDoc.createElementNS( 'DAV:', 'responsedescription' );
  responsDescPropNode.appendChild( xmlDoc.createCDATASection( responsDescPropstat ) );
  var propstatNode = xmlDoc.createElementNS( 'DAV:', 'propstat' );
  propstatNode.appendChild( propNode );
  propstatNode.appendChild( statusNode );
  propstatNode.appendChild( errorPropNode );
  propstatNode.appendChild( responsDescPropNode );
  var errorRespNode = xmlDoc.createElementNS( 'DAV:', 'error' );
  errorRespNode.appendChild( xmlDoc.createCDATASection( errorResp ) );
  var respDescRespNode = xmlDoc.createElementNS( 'DAV:', 'responsedescription' );
  respDescRespNode.appendChild( xmlDoc.createCDATASection( responsedescriptionResp ) );
  var locationHrefNode = xmlDoc.createElementNS( 'DAV:', 'href' );
  locationHrefNode.appendChild( xmlDoc.createCDATASection( location ) );
  var locationNode = xmlDoc.createElementNS( 'DAV:', 'location' );
  locationNode.appendChild( locationHrefNode );
  
  // Assertions for the constructor with no parameters
  var responseNoParams = new nl.sara.webdav.Response();
  deepEqual( responseNoParams.href                      , null, 'Response without constructor parameters should have NULL value as href' );
  deepEqual( responseNoParams.status                    , null, 'Response without constructor parameters should have NULL value as status' );
  deepEqual( responseNoParams.error                     , null, 'Response without constructor parameters should have NULL value as error' );
  deepEqual( responseNoParams.responsedescription       , null, 'Response without constructor parameters should have NULL value as responsedescription' );
  deepEqual( responseNoParams.location                  , null, 'Response without constructor parameters should have NULL value as location' );
  deepEqual( responseNoParams.getNamespaceNames().length, 0   , 'Response without constructor parameters should have no (namespaces for) properties' );
  
  // Assertions for the constructor with propstat response
  xmlDoc.documentElement.appendChild( hrefNode );
  xmlDoc.documentElement.appendChild( propstatNode );
  xmlDoc.documentElement.appendChild( errorRespNode );
  xmlDoc.documentElement.appendChild( respDescRespNode );
  xmlDoc.documentElement.appendChild( statusNode );
  var responsePropstat = new nl.sara.webdav.Response( xmlDoc.documentElement );
  deepEqual( responsePropstat.href               , href                   , 'Response with propstat xml should have correct value as href' );
  deepEqual( responsePropstat.status             , status                 , 'Response with propstat xml should have correct value as status' );
  deepEqual( responsePropstat.error              , errorResp              , 'Response with propstat xml should have correct value as error' );
  deepEqual( responsePropstat.responsedescription, responsedescriptionResp, 'Response with propstat xml should have correct value as responsedescription' );
  deepEqual( responsePropstat.location           , null                   , 'Response with propstat xml should have NULL value as location' );
  
  // Assertions to check that the properties are correctly parsed
  deepEqual( responsePropstat.getNamespaceNames().length                            , 2                  , 'There should be 2 namespaces for properties' );
  deepEqual( responsePropstat.getPropertyNames( propNamespace1 )                    , [ propTagname1 ]   , 'The first namespaces should contain the first property' );
  deepEqual( responsePropstat.getPropertyNames( propNamespace2 )                    , [ propTagname2 ]   , 'The second namespaces should contain the second property' );
  // No need to check all aspects of the property; the property object has its own unit test
  var returnedProp = responsePropstat.getProperty( propNamespace2, propTagname2 );
  deepEqual( responsePropstat.getProperty( propNamespace1, propTagname1 ).toString(), propValue1         , 'The first property should be available' );
  deepEqual( returnedProp.toString()                                                , propValue2         , 'The second property should be available' );
  deepEqual( returnedProp.getErrors()[0].textContent                                , errorPropstat      , 'The second properties should have the correct error set' );
  deepEqual( returnedProp.responsedescription                                       , responsDescPropstat, 'The second properties should have the correct responsedescription set' );

  // Assertions for the constructor with a redirect status code
  statusNode.childNodes.item(0).textContent = statusRedirect;
  xmlDoc.documentElement.appendChild( locationNode );
  var responseRedirect = new nl.sara.webdav.Response( xmlDoc.documentElement );
  deepEqual( responseRedirect.href               , href                   , 'Response with a redirect status code should have correct value as href' );
  deepEqual( responseRedirect.status             , statusRedirect         , 'Response with a redirect status code should have correct value as status' );
  deepEqual( responseRedirect.error              , errorResp              , 'Response with a redirect status code should have correct value as error' );
  deepEqual( responseRedirect.responsedescription, responsedescriptionResp, 'Response with a redirect status code should have correct value as responsedescription' );
  deepEqual( responseRedirect.location           , location               , 'Response with a redirect status code should have correct value as location' );
} );

/**
 * Check whether we can add properties and retrieve them again
 */
test( 'Response; add and retrieve properties', function() {
  // Prepare the test values
  var propNamespace1 = 'tests://beehub.nl/';
  var propTagname1 = 'testpropertyforresponse';
  var propValue1 = 'example value of the testproperty';
  var propNamespace2 = 'tests://surfsara.nl/';
  var propTagname2 = 'anotherpropertyforresponse';
  var propValue2 = 'anotherproperty value';
  
  // Prepare two properties to add
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'prop', null );
  var propNameNode1 = xmlDoc.createElementNS( propNamespace1, propTagname1 );
  propNameNode1.appendChild( xmlDoc.createCDATASection( propValue1 ) );
  var propNameNode2 = xmlDoc.createElementNS( propNamespace2, propTagname2 );
  propNameNode2.appendChild( xmlDoc.createCDATASection( propValue2 ) );
  var prop1 = new nl.sara.webdav.Property( propNameNode1 );
  var prop2 = new nl.sara.webdav.Property( propNameNode2 );
  
  // Assertions with 1 property added
  var resp = new nl.sara.webdav.Response();
  resp.addProperty( prop1 );
  deepEqual( resp.getNamespaceNames().length                            , 1                  , 'After adding 1 property, there should be 1 namespace for properties' );
  deepEqual( resp.getPropertyNames( propNamespace1 )                    , [ propTagname1 ]   , 'After adding 1 property, the first namespaces should contain the first property' );
  deepEqual( resp.getProperty( propNamespace1, propTagname1 ).toString(), propValue1         , 'After adding 1 property, the first property should be available' );
  
  // Assertions with 2 property added
  resp.addProperty( prop2 );
  deepEqual( resp.getNamespaceNames().length                            , 2                  , 'After adding 2 properties, there should be 2 namespaces for properties' );
  deepEqual( resp.getPropertyNames( propNamespace1 )                    , [ propTagname1 ]   , 'After adding 2 properties, the first namespaces should contain the first property' );
  deepEqual( resp.getProperty( propNamespace1, propTagname1 ).toString(), propValue1         , 'After adding 2 properties, the first properties should be available' );
  deepEqual( resp.getPropertyNames( propNamespace2 )                    , [ propTagname2 ]   , 'After adding 2 properties, the second namespaces should contain the second property' );
  deepEqual( resp.getProperty( propNamespace2, propTagname2 ).toString(), propValue2         , 'After adding 2 properties, the second property should be available' );
} );

// End of file