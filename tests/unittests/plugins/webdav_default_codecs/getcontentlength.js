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
 * Tests whether an XML piece representing a getcontentlength property is converted correctly to an object
 */
test( 'Getcontentlength Codec; conversion from XML to object', function() {
  // Prepare test values
  var length = 654321;
  
  // Prepare an XML document with a createiondate to test
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'getcontentlength', null );
  xmlDoc.documentElement.appendChild( xmlDoc.createCDATASection( length ) );
  
  // Test conversion with the codec set
  var producedLength = nl.sara.webdav.codec.GetcontentlengthCodec.fromXML( xmlDoc.documentElement.childNodes );
  deepEqual( producedLength, length, 'Returned value should represent the correct length' );
} );

/**
 * Tests whether an integer is converted correctly to XML
 */
test( 'Getcontentlength Codec; conversion from object to XML', function() {
  // Prepare test values
  var length = 654321;
  
  // Let's call the method we actually want to test
  var xmlDoc = nl.sara.webdav.codec.GetcontentlengthCodec.toXML( length, document.implementation.createDocument( 'DAV:', 'getcontentlength', null ) );
  
  // Assertions whether the formed XML is correct
  var lengthNode = xmlDoc.documentElement.childNodes[0];
  deepEqual( lengthNode.nodeType , 4                , 'Returned node should be of nodeType CDATA' );
  deepEqual( lengthNode.nodeValue, length.toString(), 'Returned node should contain correct length' );
} );

// End of file