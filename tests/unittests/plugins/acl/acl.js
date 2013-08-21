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
test( 'Acl; constructor', function() {
  // Prepare test values
  var principal = '/users/a_user_principal';
  var privilegeNS1 = 'test://';
  var privilegeName1 = 'test_privilege';
  var privilegeNS2 = 'test://more.tests';
  var privilegeName2 = 'another_test_privilege';
  var parent = '/path/to/parent';
  
  // Prepare the xml elements for the constructor parameter
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'acl', null );
  var principalHrefNode = xmlDoc.createElementNS( 'DAV:', 'href' );
  principalHrefNode.appendChild( xmlDoc.createCDATASection( principal ) );
  var principalNode1 = xmlDoc.createElementNS( 'DAV:', 'principal' );
  principalNode1.appendChild( principalHrefNode );
  var privilegeNode1 = xmlDoc.createElementNS( privilegeNS1, privilegeName1 );
  var grantNode = xmlDoc.createElementNS( 'DAV:', 'grant' );
  grantNode.appendChild( privilegeNode1 );
  var aceNode1 = xmlDoc.createElementNS( 'DAV:', 'ace' );
  aceNode1.appendChild( principalNode1 );
  aceNode1.appendChild( grantNode );
  xmlDoc.documentElement.appendChild( aceNode1 );
  
  var principalAllNode = xmlDoc.createElementNS( 'DAV:', 'all' );
  var principalNode2 = xmlDoc.createElementNS( 'DAV:', 'principal' );
  principalNode2.appendChild( principalAllNode );
  var invertNode = xmlDoc.createElementNS( 'DAV:', 'invert' );
  invertNode.appendChild( principalNode2 );
  var privilegeNode2 = xmlDoc.createElementNS( privilegeNS2, privilegeName2 );
  var denyNode = xmlDoc.createElementNS( 'DAV:', 'deny' );
  denyNode.appendChild( privilegeNode2 );
  var protectedNode = xmlDoc.createElementNS( 'DAV:', 'protected' );
  var inheritedHrefNode = xmlDoc.createElementNS( 'DAV:', 'href' );
  inheritedHrefNode.appendChild( xmlDoc.createCDATASection( parent ) );
  var inheritedNode = xmlDoc.createElementNS( 'DAV:', 'inherited' );
  inheritedNode.appendChild( inheritedHrefNode );
  var aceNode2 = xmlDoc.createElementNS( 'DAV:', 'ace' );
  aceNode2.appendChild( invertNode );
  aceNode2.appendChild( denyNode );
  aceNode2.appendChild( protectedNode );
  aceNode2.appendChild( inheritedNode );
  xmlDoc.documentElement.appendChild( aceNode2 );
  
  // Assertions for the constructor with no parameters
  var aclNoParams = new nl.sara.webdav.Acl();
  deepEqual( aclNoParams.getLength(), 0, 'Acl without constructor parameters should have no ACEs' );
  
  // Assertions for the constructor with a href principal being granted some privilege
  var acl = new nl.sara.webdav.Acl( xmlDoc.documentElement );
  var aces = acl.getAces();
  deepEqual( aces.length            , 2                       , 'Acl with constructor parameter should have correct number of ACEs (2 in this case)' );
  // Check whether the ACEs are parsed correctly
  deepEqual( aces[0].grantdeny      , nl.sara.webdav.Ace.GRANT, 'Acl with constructor parameter should have the first ACE with GRANT value as grantdeny' );
  deepEqual( aces[0].inherited      , false                   , 'Acl with constructor parameter should have the first ACE with NULL value as inherited' );
  deepEqual( aces[0].invertprincipal, false                   , 'Acl with constructor parameter should have the first ACE with NULL value as invertprincipal' );
  deepEqual( aces[0].isprotected    , false                   , 'Acl with constructor parameter should have the first ACE with NULL value as isprotected' );
  deepEqual( aces[0].principal      , principal               , 'Acl with constructor parameter should have the first ACE with correct value as principal' );
  var namespaces1 = aces[0].getNamespaceNames();
  deepEqual( namespaces1.length      , 1                      , 'Acl with constructor parameter should have the first ACE with one namespace for properties' );
  deepEqual( namespaces1[0]          , privilegeNS1           , 'Acl with constructor parameter should have the first ACE with the correct namespace for its properties' );
  var privileges1 = aces[0].getPrivilegeNames( privilegeNS1 );
  deepEqual( privileges1.length      , 1                      , 'Acl with constructor parameter should have the first ACE with one property' );
  deepEqual( privileges1[0]          , privilegeName1         , 'Acl with constructor parameter should have the first ACE with the correct property name' );
  
  deepEqual( aces[1].grantdeny      , nl.sara.webdav.Ace.DENY, 'Acl with constructor parameter should have the second ACE with DENY value as grantdeny' );
  deepEqual( aces[1].inherited      , parent                 , 'Acl with constructor parameter should have the second ACE with correct value as inherited' );
  deepEqual( aces[1].invertprincipal, true                   , 'Acl with constructor parameter should have the second ACE with true value as invertprincipal' );
  deepEqual( aces[1].isprotected    , true                   , 'Acl with constructor parameter should have the second ACE with true value as isprotected' );
  deepEqual( aces[1].principal      , nl.sara.webdav.Ace.ALL , 'Acl with constructor parameter should have the second ACE with correct value as principal' );
  var namespaces2 = aces[1].getNamespaceNames();
  deepEqual( namespaces2.length      , 1                     , 'Acl with constructor parameter should have the second ACE with one namespace for properties' );
  deepEqual( namespaces2[0]          , privilegeNS2          , 'Acl with constructor parameter should have the second ACE with the correct namespace for its properties' );
  var privileges2 = aces[1].getPrivilegeNames( privilegeNS2 );
  deepEqual( privileges2.length      , 1                     , 'Acl with constructor parameter should have the second ACE with one property' );
  deepEqual( privileges2[0]          , privilegeName2        , 'Acl with constructor parameter should have the second ACE with the correct property name' );
} );

/**
 * Check whether we can add Ace's and retrieve them again
 */
test( 'Acl; add and retrieve Ace\'s', function() {
  // Prepare test values
  var privilegeNS1 = 'test://';
  var privilegeName1 = 'test_privilege';
  var privilegeNS2 = 'test://more.tests';
  var privilegeName2 = 'another_test_privilege';
  var privilegeNS3 = 'test://even.more.tests';
  var privilegeName3 = 'and_yet_another_test_privilege';
  
  // Prepare the xml elements for the constructor parameter
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'acl', null );
  
  var principalAllNode = xmlDoc.createElementNS( 'DAV:', 'all' );
  var principalNode1 = xmlDoc.createElementNS( 'DAV:', 'principal' );
  principalNode1.appendChild( principalAllNode );
  var privilegeNode1 = xmlDoc.createElementNS( privilegeNS1, privilegeName1 );
  var grantNode = xmlDoc.createElementNS( 'DAV:', 'grant' );
  grantNode.appendChild( privilegeNode1 );
  var aceNode1 = xmlDoc.createElementNS( 'DAV:', 'ace' );
  aceNode1.appendChild( principalNode1 );
  aceNode1.appendChild( grantNode );
  
  var principalAuthenticatedNode = xmlDoc.createElementNS( 'DAV:', 'authenticated' );
  var principalNode2 = xmlDoc.createElementNS( 'DAV:', 'principal' );
  principalNode2.appendChild( principalAuthenticatedNode );
  var privilegeNode2 = xmlDoc.createElementNS( privilegeNS2, privilegeName2 );
  var denyNode = xmlDoc.createElementNS( 'DAV:', 'deny' );
  denyNode.appendChild( privilegeNode2 );
  var aceNode2 = xmlDoc.createElementNS( 'DAV:', 'ace' );
  aceNode2.appendChild( principalNode2 );
  aceNode2.appendChild( denyNode );
  
  var principalUnauthenticatedNode = xmlDoc.createElementNS( 'DAV:', 'unauthenticated' );
  var principalNode3 = xmlDoc.createElementNS( 'DAV:', 'principal' );
  principalNode3.appendChild( principalUnauthenticatedNode );
  var privilegeNode3 = xmlDoc.createElementNS( privilegeNS3, privilegeName3 );
  var denyNode = xmlDoc.createElementNS( 'DAV:', 'allow' );
  denyNode.appendChild( privilegeNode3 );
  var aceNode3 = xmlDoc.createElementNS( 'DAV:', 'ace' );
  aceNode3.appendChild( principalNode3 );
  aceNode3.appendChild( denyNode );
  
  // Prepare two properties to add
  var ace1 = new nl.sara.webdav.Ace( aceNode1 );
  var ace2 = new nl.sara.webdav.Ace( aceNode2 );
  var ace3 = new nl.sara.webdav.Ace( aceNode3 );
  
  // Assertions with 1 privilege added
  var acl = new nl.sara.webdav.Acl();
  deepEqual( acl.getLength(), 0   , 'Before adding Ace\'s, the length should be 0' );
  acl.addAce( ace1, 0 );
  deepEqual( acl.getLength(), 1   , 'After adding 1 Ace, the length should be 1' );
  deepEqual( acl.getAce( 0 ), ace1, 'After adding 1 Ace, the first Ace should be correctly returned' );
  
  // Assertions with 2 privileges added
  acl.addAce( ace2, 1 );
  deepEqual( acl.getLength(), 2   , 'After adding 2 Ace\'s, the length should be 2' );
  deepEqual( acl.getAce( 0 ), ace1, 'After adding 2 Ace\'s, the first Ace should be correctly returned' );
  deepEqual( acl.getAce( 1 ), ace2, 'After adding 2 Ace\'s, the second Ace should be correctly returned' );
  
  // Assertions with 3 privileges added
  acl.addAce( ace3, 1 ); // Note that we insert ace3 on position 1, so between ace1 and ace2!
  deepEqual( acl.getLength(), 3   , 'After adding 3 Ace\'s, the length should be 3' );
  deepEqual( acl.getAce( 0 ), ace1, 'After adding 3 Ace\'s, the first Ace should be correctly returned' );
  deepEqual( acl.getAce( 1 ), ace3, 'After adding 3 Ace\'s, the second Ace should be correctly returned' ); // Note that we insert ace3 on position 1, so between ace1 and ace2!
  deepEqual( acl.getAce( 2 ), ace2, 'After adding 3 Ace\'s, the third Ace should be correctly returned' ); // Note that we insert ace3 on position 1, so between ace1 and ace2!
  var aces = acl.getAces();
  deepEqual( acl.getAce( 0 ), aces[0], 'The first element of the array with Ace\'s should be the first Ace' );
  deepEqual( acl.getAce( 1 ), aces[1], 'The second element of the array with Ace\'s should be the second Ace' );
  deepEqual( acl.getAce( 2 ), aces[2], 'The third element of the array with Ace\'s should be the third Ace' );
} );

// End of file