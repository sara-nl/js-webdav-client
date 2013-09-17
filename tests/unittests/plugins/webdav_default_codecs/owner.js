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
 * Tests whether an XML piece representing a owner property is converted correctly to an object
 */
test( 'Owner Codec; conversion from XML to object', function() {
  // Prepare test values
  var url = '/system/users/test';
  
  // Prepare an XML document with a owner to test
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'owner', null );
  var hrefNode = xmlDoc.createElementNS( 'DAV:', 'href' );
  hrefNode.appendChild( xmlDoc.createCDATASection( url ) );
  xmlDoc.documentElement.appendChild( hrefNode );
  
  // Test conversion with the codec set
  var producedUrl = nl.sara.webdav.codec.OwnerCodec.fromXML( xmlDoc.documentElement.childNodes );
  deepEqual( producedUrl, url, 'Returned value should represent the correct url' );
  
  // Prepare an XML document with a owner to test
  var xmlText = '<?xml version="1.0" encoding="utf-8"?>\
<D:multistatus xmlns:D="DAV:">\
<D:owner><D:href>' + url + '</D:href></D:owner>\
</D:multistatus>';
  var parsedXml;
  if ( window.DOMParser ) {
    var parser = new DOMParser();
    parsedXml = parser.parseFromString( xmlText, "text/xml" );
  }else{ // Internet Explorer
    parsedXml = new ActiveXObject( "Microsoft.XMLDOM" );
    parsedXml.async = false;
    parsedXml.loadXML( xmlText );
  }
  
  // Test conversion with the codec set
  var producedParsedUrl = nl.sara.webdav.codec.OwnerCodec.fromXML( parsedXml.documentElement.childNodes[0].childNodes );
  deepEqual( producedParsedUrl, url, 'Returned value should represent the correct url if we use namespace alias' );
  
  // Prepare an XML document with wrong xml input
  var wrongXmlDoc = document.implementation.createDocument( 'DAV:', 'owner', null );
  var wrongHrefNode = wrongXmlDoc.createElementNS( 'DAV', 'href' );
  wrongHrefNode.appendChild( wrongXmlDoc.createCDATASection( url ) );
  wrongXmlDoc.documentElement.appendChild( wrongHrefNode );
  
  // Test conversion with the codec set
  var wrongProducedUrl = nl.sara.webdav.codec.OwnerCodec.fromXML( wrongXmlDoc.documentElement.childNodes );
  deepEqual( wrongProducedUrl, null, 'Returned value should be null' );
} );

/**
 * Tests whether an url is converted correctly to XML
 */
test( 'Owner Codec; conversion from object to XML', function() {
  // Prepare test values
  var url = 'system/user/test';
  
  // Let's call the method we actually want to test
  var xmlDoc = nl.sara.webdav.codec.OwnerCodec.toXML( url, document.implementation.createDocument( 'DAV:', 'owner', null ) );
  
  // Assertions whether the formed XML is correct
  var hrefNode = xmlDoc.documentElement.childNodes[0];
  deepEqual( hrefNode.nodeType      , 1       , 'Returned node should be of nodeType element' );
  deepEqual( hrefNode.namespaceURI  , 'DAV:'  , 'Returned node should have namespace DAV' );
  deepEqual( hrefNode.nodeName      , 'href'  , 'Returned node should be href' );
  
  var urlNode = hrefNode.childNodes[0];
  deepEqual( urlNode.nodeType   , 4   , 'Child node should be of type CDATA' );
  deepEqual( urlNode.nodeValue  , url , 'Child node should contain correct url' );
} );

// End of file