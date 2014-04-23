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
 * Tests whether an XML piece representing a current-user-privilege-set property is converted correctly to an object
 */
test( 'Current-user-privilege-set Codec; conversion from XML to object', function() {
  // Prepare an XML document with a createiondate to test
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'current-user-privilege-set', null );
  var readPrivilege = xmlDoc.createElementNS( 'DAV:', 'read' );
  xmlDoc.documentElement.appendChild( readPrivilege );
  var writePrivilege = xmlDoc.createElementNS( 'test:', 'steal' );
  xmlDoc.documentElement.appendChild( writePrivilege );
  
  // Test conversion with the codec set
  var producedData = nl.sara.webdav.codec.Current_user_privilege_setCodec.fromXML( xmlDoc.documentElement.childNodes );
  deepEqual( producedData.length, 2, 'Returned value should contain 2 privileges' );
  
  if ( producedData[0].namespace === 'DAV:' ) { // Because we don't care about the order of the privileges, let's support both orders
    var readIndex = 0;
    var stealIndex = 1;
  }else{
    var readIndex = 1;
    var stealIndex = 0;
  }
  
  deepEqual( producedData[ readIndex ].namespace , 'DAV:' , 'The read privilege should be in namespace DAV:' );
  deepEqual( producedData[ readIndex ].tagname   , 'read' , 'The read privilege should be present' );
  deepEqual( producedData[ stealIndex ].namespace, 'test:', 'The steal privilege should be in namespace test:' );
  deepEqual( producedData[ stealIndex ].tagname  , 'steal', 'The steal privilege should be present' );
} );

/**
 * Tests whether a current-user-privilege-set is converted correctly to XML
 */
test( 'Current-user-privilege-set Codec; conversion from object to XML', function() {
  // Prepare test values
  var readPrivilege = new nl.sara.webdav.Privilege();
  readPrivilege.namespace = 'DAV:';
  readPrivilege.tagname = 'read';
  var stealPrivilege = new nl.sara.webdav.Privilege();
  stealPrivilege.namespace = 'test:';
  stealPrivilege.tagname = 'steal';
  var privileges = [ readPrivilege, stealPrivilege ];
  
  // Let's call the method we actually want to test
  var xmlDoc = nl.sara.webdav.codec.Current_user_privilege_setCodec.toXML( privileges, document.implementation.createDocument( 'DAV:', 'current-user-privilege-set', null ) );
  
  // Assertions whether the formed XML is correct
  var privilegesNodes = xmlDoc.documentElement.childNodes;
  deepEqual( privilegesNodes.length         , 2      , 'There should be 2 child nodes defined (one for each privilege)' );
  deepEqual( privilegesNodes[0].nodeName    , 'read' , 'The first child node should be a \'read\' node' );
  deepEqual( privilegesNodes[0].namespaceURI, 'DAV:' , 'The first child node should be in the DAV: namespace' );
  deepEqual( privilegesNodes[1].nodeName    , 'steal', 'The second child node should be a \'steal\' node' );
  deepEqual( privilegesNodes[1].namespaceURI, 'test:', 'The second child node should be in the test: namespace' );
} );

// End of file