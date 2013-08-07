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
  var href1 = '/test1.txt';
  var href2 = '/test1.txt';
  var status = 'HTTP/1.1 200 OK';
  var errorResp = 'This is an error on response level';
  var responsedescriptionResp = 'This is the response description on response level';
  var statusRedirect = 'HTTP/1.1 300 Moved Permanently';
  var location = '/redirected/test.txt';
  
  // Prepare the xml elements for the constructor parameter
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'response', null );
  var hrefNode1 = xmlDoc.createElementNS( 'DAV:', 'href' );
  hrefNode1.appendChild( xmlDoc.createCDATASection( href1 ) );
  var hrefNode2 = xmlDoc.createElementNS( 'DAV:', 'href' );
  hrefNode2.appendChild( xmlDoc.createCDATASection( href2 ) );
  var statusNode = xmlDoc.createElementNS( 'DAV:', 'status' );
  statusNode.appendChild( xmlDoc.createCDATASection( status ) );
  var propNameNode = xmlDoc.createElementNS( 'tests://beehub.nl/', 'testproperty' );
  propNameNode.appendChild( xmlDoc.createCDATASection( 'example value of the testproperty' ) );
  var propNode = xmlDoc.createElementNS( 'DAV:', 'prop' );
  propNode.appendChild( propNameNode );
  var errorPropNode = xmlDoc.createElementNS( 'DAV:', 'error' );
  errorPropNode.appendChild( xmlDoc.createCDATASection( 'This is an error on propstat level' ) );
  var responsDescPropNode = xmlDoc.createElementNS( 'DAV:', 'responsedescription' );
  responsDescPropNode.appendChild( xmlDoc.createCDATASection( 'This is the response description on propstat level' ) );
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
  deepEqual( responseNoParams.href               , null, 'Response without constructor parameters should have NULL value as href' );
  deepEqual( responseNoParams.status             , null, 'Response without constructor parameters should have NULL value as status' );
  deepEqual( responseNoParams.error              , null, 'Response without constructor parameters should have NULL value as error' );
  deepEqual( responseNoParams.responsedescription, null, 'Response without constructor parameters should have NULL value as responsedescription' );
  deepEqual( responseNoParams.location           , null, 'Response without constructor parameters should have NULL value as location' );
  
  // Assertions for the constructor with propstat response
  xmlDoc.documentElement.appendChild( hrefNode1 );
  xmlDoc.documentElement.appendChild( propstatNode );
  xmlDoc.documentElement.appendChild( errorRespNode );
  xmlDoc.documentElement.appendChild( respDescRespNode );
  var responseNoParams = new nl.sara.webdav.Response( xmlDoc.documentElement );
  deepEqual( responseNoParams.href               , href1                  , 'Response with propstat xml should have correct value as href' );
  deepEqual( responseNoParams.status             , null                   , 'Response with propstat xml should have NULL value as status' );
  deepEqual( responseNoParams.error              , errorResp              , 'Response with propstat xml should have correct value as error' );
  deepEqual( responseNoParams.responsedescription, responsedescriptionResp, 'Response with propstat xml should have correct value as responsedescription' );
  deepEqual( responseNoParams.location           , null                   , 'Response with propstat xml should have NULL value as location' );
  
  // Assertions for the constructor with multiple hrefs in the response
  propstatNode.remove();
  xmlDoc.documentElement.appendChild( hrefNode2 );
  xmlDoc.documentElement.appendChild( statusNode );
  deepEqual( responseNoParams.href               , href1                  , 'Response with propstat xml should have correct value as href' );
  deepEqual( responseNoParams.status             , null                   , 'Response with propstat xml should have NULL value as status' );
  deepEqual( responseNoParams.error              , errorResp              , 'Response with propstat xml should have correct value as error' );
  deepEqual( responseNoParams.responsedescription, responsedescriptionResp, 'Response with propstat xml should have correct value as responsedescription' );
  deepEqual( responseNoParams.location           , null                   , 'Response with propstat xml should have NULL value as location' );
  
  // Assertions for the constructor with a redirect status code
  statusNode.childNodes.item(0).textValue = statusRedirect;
  xmlDoc.documentElement.appendChild( locationNode );
  deepEqual( responseNoParams.href               , href1                  , 'Response with propstat xml should have correct value as href' );
  deepEqual( responseNoParams.status             , null                   , 'Response with propstat xml should have NULL value as status' );
  deepEqual( responseNoParams.error              , errorResp              , 'Response with propstat xml should have correct value as error' );
  deepEqual( responseNoParams.responsedescription, responsedescriptionResp, 'Response with propstat xml should have correct value as responsedescription' );
  deepEqual( responseNoParams.location           , null                   , 'Response with propstat xml should have NULL value as location' );
} );

// End of file