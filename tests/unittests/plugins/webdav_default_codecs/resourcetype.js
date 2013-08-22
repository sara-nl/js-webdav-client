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
 * Tests whether an XML piece representing a resourcetype property is converted correctly to an object
 */
test( 'Resourcetype Codec; conversion from XML to object', function() {
  // Prepare test values
  var resourcetype = 'Fri, 13 Sep 2013 12:34:56 GMT';
  
  // Prepare an XML document with a createiondate to test
  var xmlDocCollection = document.implementation.createDocument( 'DAV:', 'resourcetype', null );
  xmlDocCollection.documentElement.appendChild( xmlDocCollection.createElementNS( 'DAV:', 'collection' ) );
  var xmlDocPrincipal = document.implementation.createDocument( 'DAV:', 'resourcetype', null );
  xmlDocPrincipal.documentElement.appendChild( xmlDocPrincipal.createElementNS( 'DAV:', 'principal' ) );
  var xmlDocUnknown = document.implementation.createDocument( 'DAV:', 'resourcetype', null );
  xmlDocUnknown.documentElement.appendChild( xmlDocUnknown.createElementNS( 'tests://test/', 'unknown_type' ) );
  var xmlDocUnspecified = document.implementation.createDocument( 'DAV:', 'resourcetype', null );
  
  // Test conversion with the codec set
  var collectionType = nl.sara.webdav.codec.ResourcetypeCodec.fromXML( xmlDocCollection.documentElement.childNodes );
  var principalType = nl.sara.webdav.codec.ResourcetypeCodec.fromXML( xmlDocPrincipal.documentElement.childNodes );
  var unknownType = nl.sara.webdav.codec.ResourcetypeCodec.fromXML( xmlDocUnknown.documentElement.childNodes );
  var unspecifiedType = nl.sara.webdav.codec.ResourcetypeCodec.fromXML( xmlDocUnspecified.documentElement.childNodes );
  
  deepEqual( collectionType , nl.sara.webdav.codec.ResourcetypeCodec.COLLECTION , 'Collection node should convert to the correct resourcetype' );
  deepEqual( principalType  , nl.sara.webdav.codec.ResourcetypeCodec.PRINCIPAL  , 'Principal node should convert to the correct resourcetype' );
  deepEqual( unknownType    , nl.sara.webdav.codec.ResourcetypeCodec.UNSPECIFIED, 'Unknown node should convert to the correct resourcetype' );
  deepEqual( unspecifiedType, nl.sara.webdav.codec.ResourcetypeCodec.UNSPECIFIED, 'Unspecified node should convert to the correct resourcetype' );
} );

/**
 * Tests whether a resourcetype is converted correctly to XML
 */
test( 'Resourcetype Codec; conversion from object to XML', function() {
  // Test with a different resource types
  var xmlDocCollection = nl.sara.webdav.codec.ResourcetypeCodec.toXML( nl.sara.webdav.codec.ResourcetypeCodec.COLLECTION, document.implementation.createDocument( 'DAV:', 'resourcetype', null ) );
  var xmlDocPrincipal = nl.sara.webdav.codec.ResourcetypeCodec.toXML( nl.sara.webdav.codec.ResourcetypeCodec.PRINCIPAL, document.implementation.createDocument( 'DAV:', 'resourcetype', null ) );
  var xmlDocUnspecified = nl.sara.webdav.codec.ResourcetypeCodec.toXML( nl.sara.webdav.codec.ResourcetypeCodec.UNSPECIFIED, document.implementation.createDocument( 'DAV:', 'resourcetype', null ) );
  
  // Assertions whether the formed XML is correct
  var collectionNode = xmlDocCollection.documentElement.childNodes[0];
  deepEqual( collectionNode.nodeType    , 1           , 'Collection resourcetype should be of nodeType Element' );
  deepEqual( collectionNode.namespaceURI, 'DAV:'      , 'Collection resourcetype should have the correct namespace' );
  deepEqual( collectionNode.nodeName    , 'collection', 'Collection resourcetype should have the correct nodename' );
  
  var principalNode = xmlDocPrincipal.documentElement.childNodes[0];
  deepEqual( principalNode.nodeType    , 1          , 'Principal resourcetype should be of nodeType Element' );
  deepEqual( principalNode.namespaceURI, 'DAV:'     , 'Principal resourcetype should have the correct namespace' );
  deepEqual( principalNode.nodeName    , 'principal', 'Principal resourcetype should have the correct nodename' );
  
  deepEqual( xmlDocUnspecified.documentElement.childNodes.length, 0 , 'Unspecified resourcetype should not contain any child nodes' );
} );

// End of file