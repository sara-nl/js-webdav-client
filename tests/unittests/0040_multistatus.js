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
test( 'Multistatus; constructor', function() {
  // Prepare test values
  var href1 = '/test1.txt';
  var href2 = '/test2.txt';
  var href3 = '/test3.txt';
  var status1 = 'HTTP/1.1 200 OK';
  var status2 = 'HTTP/1.1 403 Forbidden';
  var responsedescription = 'This is the response description';
  
  // Prepare the xml elements for the constructor parameter
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'multistatus', null );
  var hrefNode1 = xmlDoc.createElementNS( 'DAV:', 'href' );
  hrefNode1.appendChild( xmlDoc.createCDATASection( href1 ) );
  var hrefNode2 = xmlDoc.createElementNS( 'DAV:', 'href' );
  hrefNode2.appendChild( xmlDoc.createCDATASection( href2 ) );
  var statusNode1 = xmlDoc.createElementNS( 'DAV:', 'status' );
  statusNode1.appendChild( xmlDoc.createCDATASection( status1 ) );
  var response1 = xmlDoc.createElementNS( 'DAV:', 'response' );
  response1.appendChild( hrefNode1 );
  response1.appendChild( hrefNode2 );
  response1.appendChild( statusNode1 );
  var hrefNode3 = xmlDoc.createElementNS( 'DAV:', 'href' );
  hrefNode3.appendChild( xmlDoc.createCDATASection( href3 ) );
  var statusNode2 = xmlDoc.createElementNS( 'DAV:', 'status' );
  statusNode2.appendChild( xmlDoc.createCDATASection( status2 ) );
  var response2 = xmlDoc.createElementNS( 'DAV:', 'response' );
  response2.appendChild( hrefNode3 );
  response2.appendChild( statusNode2 );
  var responsdescriptionNode = xmlDoc.createElementNS( 'DAV:', 'responsedescription' );
  responsdescriptionNode.appendChild( xmlDoc.createCDATASection( responsedescription ) );
  xmlDoc.documentElement.appendChild( response1 );
  xmlDoc.documentElement.appendChild( response2 );
  xmlDoc.documentElement.appendChild( responsdescriptionNode );
  
  // Assertions to check the constructor without parameters
  var multistatusWithoutParam = new nl.sara.webdav.Multistatus();
  deepEqual( multistatusWithoutParam.responsedescription      , null, 'Multistatus with no constructor parameter should have NULL value as responsedescription' );
  deepEqual( multistatusWithoutParam.getResponseNames().length, 0   , 'Multistatus with no constructor parameter should have no response names' );
  
  // Assertions to check the constructor with a multiresponse XML element as parameter
  var multistatusWithParam = new nl.sara.webdav.Multistatus( xmlDoc.documentElement );
  deepEqual( multistatusWithParam.responsedescription        , responsedescription, 'Multistatus with parameter should have correct value as responsedescription' );
  deepEqual( multistatusWithParam.getResponseNames().length  , 3                  , 'Multistatus with parameter should have three response names' );
  deepEqual( multistatusWithParam.getResponse( href1 ).status, status1            , 'Multistatus with parameter should have correct status for the first href' );
  deepEqual( multistatusWithParam.getResponse( href2 ).status, status1            , 'Multistatus with parameter should have correct status for the second href' );
  deepEqual( multistatusWithParam.getResponse( href3 ).status, status2            , 'Multistatus with parameter should have correct status for the third href' );
} );

// End of file