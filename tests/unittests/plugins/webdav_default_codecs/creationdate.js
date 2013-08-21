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
 * Tests whether an XML piece representing an ACL is converted correctly to an object
 */
test( 'Creationdate Codec; conversion from XML to object', function() {
  // Prepare test values
  var date = '1985-01-12T12:34:56Z';
  
  // Prepare an XML document with a createiondate to test
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'creationdate', null );
  xmlDoc.documentElement.appendChild( xmlDoc.createCDATASection( date ) );
  
  // Test conversion with the codec set
  var producedDate = nl.sara.webdav.codec.CreationdateCodec.fromXML( xmlDoc.documentElement.childNodes );
  deepEqual( producedDate.getTime(), (new Date( date )).getTime(), 'Returned value should represent the correct date' );
} );

/**
 * Tests whether an ACL object is converted correctly to XML
 */
test( 'Creationdate Codec; conversion from object to XML', function() {
  // Prepare test values
  var date = new Date( 2013, 1, 12, 12, 34, 56, 0 );
  
  // Let's call the method we actually want to test
  var xmlDoc = nl.sara.webdav.codec.CreationdateCodec.toXML( date, document.implementation.createDocument( 'DAV:', 'creationdate', null ) );
  
  // Assertions whether the formed XML is correct
  var dateNode = xmlDoc.documentElement.childNodes[0];
  deepEqual( dateNode.nodeType , 4                 , 'Returned node should be of nodeType CDATA' );
  deepEqual( dateNode.nodeValue, date.toISOString(), 'Returned node should contain correct date in ISO format' );
} );

// End of file