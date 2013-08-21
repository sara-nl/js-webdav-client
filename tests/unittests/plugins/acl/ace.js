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
test( 'Ace; constructor', function() {
  // Prepare test values
  var principal = '/users/a_user_principal';
  var privilegeNS = 'test://';
  var privilegeName = 'test_privilege';
  var parent = '/path/to/parent';
  var propertyNS = 'propertyNS://';
  var propertyName = 'test_property_as_privilege';
  
  // Prepare the xml elements for the constructor parameter
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'ace', null );
  var principalHrefNode = xmlDoc.createElementNS( 'DAV:', 'href' );
  principalHrefNode.appendChild( xmlDoc.createCDATASection( principal ) );
  var principalNode = xmlDoc.createElementNS( 'DAV:', 'principal' );
  principalNode.appendChild( principalHrefNode );
  var privilegeNode = xmlDoc.createElementNS( privilegeNS, privilegeName );
  var grantNode = xmlDoc.createElementNS( 'DAV:', 'grant' );
  grantNode.appendChild( privilegeNode );
  var denyNode = xmlDoc.createElementNS( 'DAV:', 'deny' );
  var invertNode = xmlDoc.createElementNS( 'DAV:', 'invert' );
  var protectedNode = xmlDoc.createElementNS( 'DAV:', 'protected' );
  var inheritedHrefNode = xmlDoc.createElementNS( 'DAV:', 'href' );
  inheritedHrefNode.appendChild( xmlDoc.createCDATASection( parent ) );
  var inheritedNode = xmlDoc.createElementNS( 'DAV:', 'inherited' );
  inheritedNode.appendChild( inheritedHrefNode );
  var principalAllNode = xmlDoc.createElementNS( 'DAV:', 'all' );
  var principalAuthenticatedNode = xmlDoc.createElementNS( 'DAV:', 'authenticated' );
  var principalUnauthenticatedNode = xmlDoc.createElementNS( 'DAV:', 'unauthenticated' );
  var propertyNode = xmlDoc.createElementNS( propertyNS, propertyName );
  var principalPropertyNode = xmlDoc.createElementNS( 'DAV:', 'property' );
  principalPropertyNode.appendChild( propertyNode );
  var principalSelfNode = xmlDoc.createElementNS( 'DAV:', 'self' );
  
  // Assertions for the constructor with no parameters
  var aceNoParams = new nl.sara.webdav.Ace();
  deepEqual( aceNoParams.grantdeny                 , null , 'Ace without constructor parameters should have NULL value as grantdeny' );
  deepEqual( aceNoParams.inherited                 , false, 'Ace without constructor parameters should have false value as inherited' );
  deepEqual( aceNoParams.invertprincipal           , false, 'Ace without constructor parameters should have false value as invertprincipal' );
  deepEqual( aceNoParams.isprotected               , false, 'Ace without constructor parameters should have false value as isprotected' );
  deepEqual( aceNoParams.principal                 , null , 'Ace without constructor parameters should have NULL value as principal' );
  deepEqual( aceNoParams.getNamespaceNames().length, 0    , 'Ace without constructor parameters should have no (namespaces for) properties' );
  
  // Assertions for the constructor with a href principal being granted some privilege
  xmlDoc.documentElement.appendChild( principalNode );
  xmlDoc.documentElement.appendChild( grantNode );
  var aceGrantHref = new nl.sara.webdav.Ace( xmlDoc.documentElement );
  deepEqual( aceGrantHref.grantdeny      , nl.sara.webdav.Ace.GRANT, 'Ace with grant and href principal should have GRANT value as grantdeny' );
  deepEqual( aceGrantHref.inherited      , false                   , 'Ace with grant and href principal should have NULL value as inherited' );
  deepEqual( aceGrantHref.invertprincipal, false                   , 'Ace with grant and href principal should have NULL value as invertprincipal' );
  deepEqual( aceGrantHref.isprotected    , false                   , 'Ace with grant and href principal should have NULL value as isprotected' );
  deepEqual( aceGrantHref.principal      , principal               , 'Ace with grant and href principal should have correct value as principal' );
  var namespaces = aceGrantHref.getNamespaceNames();
  deepEqual( namespaces.length           , 1                       , 'Ace with grant and href principal should have one namespace for properties' );
  deepEqual( namespaces[0]               , privilegeNS             , 'Ace with grant and href principal should have the correct namespace for its properties' );
  var privileges = aceGrantHref.getPrivilegeNames( privilegeNS );
  deepEqual( privileges.length           , 1                       , 'Ace with grant and href principal should have one properties' );
  deepEqual( privileges[0]               , privilegeName           , 'Ace with grant and href principal should have the correct property name' );
  
  // Assertions for the constructor with an inverted 'all' principal being denied some privilege, which is protected and inherited
  denyNode.appendChild( privilegeNode );
  xmlDoc.documentElement.replaceChild( denyNode, grantNode );
  xmlDoc.documentElement.appendChild( protectedNode );
  xmlDoc.documentElement.appendChild( inheritedNode );
  xmlDoc.documentElement.replaceChild( invertNode, principalNode );
  principalNode.replaceChild(  principalAllNode, principalNode.childNodes[0] );
  invertNode.appendChild( principalNode );
  var aceInvertAllDenyProtectedInherited = new nl.sara.webdav.Ace( xmlDoc.documentElement );
  deepEqual( aceInvertAllDenyProtectedInherited.grantdeny      , nl.sara.webdav.Ace.DENY, 'Ace with deny and an inverted ALL principal and which is protected and inherited should have DENY value as grantdeny' );
  deepEqual( aceInvertAllDenyProtectedInherited.inherited      , parent                 , 'Ace with deny and an inverted ALL principal and which is protected and inherited should have correct value as inherited' );
  deepEqual( aceInvertAllDenyProtectedInherited.invertprincipal, true                   , 'Ace with deny and an inverted ALL principal and which is protected and inherited should have true value as invertprincipal' );
  deepEqual( aceInvertAllDenyProtectedInherited.isprotected    , true                   , 'Ace with deny and an inverted ALL principal and which is protected and inherited should have true value as isprotected' );
  deepEqual( aceInvertAllDenyProtectedInherited.principal      , nl.sara.webdav.Ace.ALL , 'Ace with deny and an inverted ALL principal and which is protected and inherited should have correct value as principal' );
  
  // Assertions for the constructor with an 'authenticated' principal
  principalNode.replaceChild( principalAuthenticatedNode, principalNode.childNodes[0] );
  var aceAuthenticated = new nl.sara.webdav.Ace( xmlDoc.documentElement );
  deepEqual( aceAuthenticated.principal, nl.sara.webdav.Ace.AUTHENTICATED, 'Ace with an \'authenticated\' principal should have correct value as principal' );
  
  // Assertions for the constructor with an 'unauthenticated' principal
  principalNode.replaceChild( principalUnauthenticatedNode, principalNode.childNodes[0] );
  var aceUnauthenticated = new nl.sara.webdav.Ace( xmlDoc.documentElement );
  deepEqual( aceUnauthenticated.principal, nl.sara.webdav.Ace.UNAUTHENTICATED, 'Ace with an \'unauthenticated\' principal should have correct value as principal' );
  
  // Assertions for the constructor with a 'property' principal
  principalNode.replaceChild( principalPropertyNode, principalNode.childNodes[0] );
  var aceProperty = new nl.sara.webdav.Ace( xmlDoc.documentElement );
  deepEqual( aceProperty.principal.namespace, propertyNS  , 'Ace with a \'property\' principal should have correct namespace for the principal property' );
  deepEqual( aceProperty.principal.tagname  , propertyName, 'Ace with a \'property\' principal should have correct tagname for the principal property' );
  
  // Assertions for the constructor with a 'self' principal
  principalNode.replaceChild( principalSelfNode, principalNode.childNodes[0] );
  var aceSelf = new nl.sara.webdav.Ace( xmlDoc.documentElement );
  deepEqual( aceSelf.principal, nl.sara.webdav.Ace.SELF, 'Ace with a \'self\' principal should have correct value as principal' );
} );

/**
 * Check whether we can add privileges and retrieve them again
 */
test( 'Ace; add and retrieve privileges', function() {
  // Prepare the test values
  var privNamespace1 = 'tests://beehub.nl/';
  var privTagname1 = 'testprivilegeforace';
  var privValue1 = 'example value of the testprivilege';
  var privNamespace2 = 'tests://surfsara.nl/';
  var privTagname2 = 'anotherprivilegeforace';
  var privValue2 = 'anotherprivilege value';
  
  // Prepare two properties to add
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'privilege', null );
  var privNameNode1 = xmlDoc.createElementNS( privNamespace1, privTagname1 );
  privNameNode1.appendChild( xmlDoc.createCDATASection( privValue1 ) );
  var privNameNode2 = xmlDoc.createElementNS( privNamespace2, privTagname2 );
  privNameNode2.appendChild( xmlDoc.createCDATASection( privValue2 ) );
  var priv1 = new nl.sara.webdav.Privilege( privNameNode1 );
  var priv2 = new nl.sara.webdav.Privilege( privNameNode2 );
  
  // Assertions with 1 privilege added
  var ace = new nl.sara.webdav.Ace();
  ace.addPrivilege( priv1 );
  deepEqual( ace.getNamespaceNames().length                             , 1                  , 'After adding 1 privilege, there should be 1 namespace for privileges' );
  deepEqual( ace.getPrivilegeNames( privNamespace1 )                    , [ privTagname1 ]   , 'After adding 1 privilege, the first namespaces should contain the first privilege' );
  deepEqual( ace.getPrivilege( privNamespace1, privTagname1 ).toString(), privValue1         , 'After adding 1 privilege, the first privilege should be available' );
  
  // Assertions with 2 privileges added
  ace.addPrivilege( priv2 );
  deepEqual( ace.getNamespaceNames().length                             , 2                  , 'After adding 2 privileges, there should be 2 namespaces for privileges' );
  deepEqual( ace.getPrivilegeNames( privNamespace1 )                    , [ privTagname1 ]   , 'After adding 2 privileges, the first namespaces should contain the first privilege' );
  deepEqual( ace.getPrivilege( privNamespace1, privTagname1 ).toString(), privValue1         , 'After adding 2 privileges, the first privilege should be available' );
  deepEqual( ace.getPrivilegeNames( privNamespace2 )                    , [ privTagname2 ]   , 'After adding 2 privileges, the second namespaces should contain the second privilege' );
  deepEqual( ace.getPrivilege( privNamespace2, privTagname2 ).toString(), privValue2         , 'After adding 2 privileges, the second privilege should be available' );
} );

// End of file