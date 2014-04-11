/*
 * Copyright ©2014 SURFsara bv, The Netherlands
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
 * Tests whether an XML piece representing a principal-collection-set property is converted correctly to an object
 */
test( 'Principal-collection-set Codec; conversion from XML to object', function() {
  // Prepare test values
  var usersCollection = '/users/';
  var groupsCollection = '/groups/';
  
  // Prepare an XML document with a createiondate to test
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'principal-collection-set', null );
  var usersHref = xmlDoc.createElementNS( 'DAV:', 'href' );
  usersHref.appendChild( xmlDoc.createCDATASection( usersCollection ) );
  xmlDoc.documentElement.appendChild( usersHref );
  var groupsHref = xmlDoc.createElementNS( 'DAV:', 'href' );
  groupsHref.appendChild( xmlDoc.createCDATASection( groupsCollection ) );
  xmlDoc.documentElement.appendChild( groupsHref );
  
  // Test conversion with the codec set
  var producedData = nl.sara.webdav.codec.Principal_collection_setCodec.fromXML( xmlDoc.documentElement.childNodes );
  deepEqual( producedData, [ usersCollection, groupsCollection ], 'Returned value should represent the correct principal collections' );
} );

/**
 * Tests whether a principal-collection-set is converted correctly to XML
 */
test( 'Principal-collection-set Codec; conversion from object to XML', function() {
  // Prepare test values
  var usersCollection = '/users/';
  var groupsCollection = '/groups/';
  var collections = [ usersCollection, groupsCollection ];
  
  // Let's call the method we actually want to test
  var xmlDoc = nl.sara.webdav.codec.Principal_collection_setCodec.toXML( collections, document.implementation.createDocument( 'DAV:', 'principal-collection-set', null ) );
  
  // Assertions whether the formed XML is correct
  var collectionsNodes = xmlDoc.documentElement.childNodes;
  deepEqual( collectionsNodes.length                    , 2               , 'There should be 2 child nodes defined (one for each collection)' );
  deepEqual( collectionsNodes[0].nodeName               , 'href'          , 'The first child node should be a href node' );
  deepEqual( collectionsNodes[0].namespaceURI           , 'DAV:'          , 'The first child node should be in the DAV: namespace' );
  deepEqual( collectionsNodes[0].childNodes[0].nodeValue, usersCollection , 'The first collection should be the users collection' );
  deepEqual( collectionsNodes[1].nodeName               , 'href'          , 'The second child node should be a href node' );
  deepEqual( collectionsNodes[1].namespaceURI           , 'DAV:'          , 'The second child node should be in the DAV: namespace' );
  deepEqual( collectionsNodes[1].childNodes[0].nodeValue, groupsCollection, 'The second collection should be the groups collection' );
} );

// End of file