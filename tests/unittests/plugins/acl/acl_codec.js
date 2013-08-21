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
test( 'ACL codec; conversion from XML to object', function() {
  // Prepare test values
  var principal = '/users/a_user_principal';
  var privilegeNS1 = 'test://';
  var privilegeName1 = 'test_privilege';
  var privilegeNS2 = 'test://more.tests';
  var privilegeName2 = 'another_test_privilege';
  var parent = '/path/to/parent';
  
  // Prepare an XML document with an ACL to test
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'acl', null );
  var principalHrefNode = xmlDoc.createElementNS( 'DAV:', 'href' );
  principalHrefNode.appendChild( xmlDoc.createCDATASection( principal ) );
  var principalNode1 = xmlDoc.createElementNS( 'DAV:', 'principal' );
  principalNode1.appendChild( principalHrefNode );
  var privilegeTypeNode1 = xmlDoc.createElementNS( privilegeNS1, privilegeName1 );
  var privilegeNode1 = xmlDoc.createElementNS( 'DAV:', 'privilege' );
  privilegeNode1.appendChild( privilegeTypeNode1 );
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
  var privilegeTypeNode2 = xmlDoc.createElementNS( privilegeNS2, privilegeName2 );
  var privilegeNode2 = xmlDoc.createElementNS( 'DAV:', 'privilege' );
  privilegeNode2.appendChild( privilegeTypeNode2 );
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
  
  // Test conversion with the codec set
  var acl = nl.sara.webdav.codec.AclCodec.fromXML( xmlDoc.documentElement.childNodes );
  var aces = acl.getAces();
  deepEqual( aces.length            , 2                       , 'Acl returned by fromXML should have correct number of ACEs (2 in this case)' );
  // Check whether the ACEs are parsed correctly
  deepEqual( aces[0].grantdeny      , nl.sara.webdav.Ace.GRANT, 'Acl returned by fromXML should have the first ACE with GRANT value as grantdeny' );
  deepEqual( aces[0].inherited      , false                   , 'Acl returned by fromXML should have the first ACE with NULL value as inherited' );
  deepEqual( aces[0].invertprincipal, false                   , 'Acl returned by fromXML should have the first ACE with NULL value as invertprincipal' );
  deepEqual( aces[0].isprotected    , false                   , 'Acl returned by fromXML should have the first ACE with NULL value as isprotected' );
  deepEqual( aces[0].principal      , principal               , 'Acl returned by fromXML should have the first ACE with correct value as principal' );
  var namespaces1 = aces[0].getNamespaceNames();
  deepEqual( namespaces1.length      , 1                      , 'Acl returned by fromXML should have the first ACE with one namespace for properties' );
  deepEqual( namespaces1[0]          , privilegeNS1           , 'Acl returned by fromXML should have the first ACE with the correct namespace for its properties' );
  var privileges1 = aces[0].getPrivilegeNames( privilegeNS1 );
  deepEqual( privileges1.length      , 1                      , 'Acl returned by fromXML should have the first ACE with one property' );
  deepEqual( privileges1[0]          , privilegeName1         , 'Acl returned by fromXML should have the first ACE with the correct property name' );
  
  deepEqual( aces[1].grantdeny      , nl.sara.webdav.Ace.DENY, 'Acl returned by fromXML should have the second ACE with DENY value as grantdeny' );
  deepEqual( aces[1].inherited      , parent                 , 'Acl returned by fromXML should have the second ACE with correct value as inherited' );
  deepEqual( aces[1].invertprincipal, true                   , 'Acl returned by fromXML should have the second ACE with true value as invertprincipal' );
  deepEqual( aces[1].isprotected    , true                   , 'Acl returned by fromXML should have the second ACE with true value as isprotected' );
  deepEqual( aces[1].principal      , nl.sara.webdav.Ace.ALL , 'Acl returned by fromXML should have the second ACE with correct value as principal' );
  var namespaces2 = aces[1].getNamespaceNames();
  deepEqual( namespaces2.length      , 1                     , 'Acl returned by fromXML should have the second ACE with one namespace for properties' );
  deepEqual( namespaces2[0]          , privilegeNS2          , 'Acl returned by fromXML should have the second ACE with the correct namespace for its properties' );
  var privileges2 = aces[1].getPrivilegeNames( privilegeNS2 );
  deepEqual( privileges2.length      , 1                     , 'Acl returned by fromXML should have the second ACE with one property' );
  deepEqual( privileges2[0]          , privilegeName2        , 'Acl returned by fromXML should have the second ACE with the correct property name' );
} );

/**
 * Tests whether an ACL object is converted correctly to XML
 */
test( 'ACL codec; conversion from object to XML', function() {
  // Prepare test values
  var testUrl = '/acl_resource';
  var testHeader = 'X-Test-Header';
  var testHeaderValue = 'this is a useless header';
  var testStatus = 201;
  var grantdeny1 = nl.sara.webdav.Ace.GRANT;
  var grantdeny2 = nl.sara.webdav.Ace.DENY;
  var privilegeNS1 = 'test://';
  var privilegeName1 = 'test_privilege';
  var privilegeNS2 = 'test://more.tests';
  var privilegeName2 = 'another_test_privilege';
  var principal1 = '/users/a_user_principal';
  var principal2 = nl.sara.webdav.Ace.SELF;
  var parent = '/path/to/parent';
    
  // Prepare two properties to add
  var priv1 = new nl.sara.webdav.Privilege();
  priv1.namespace = privilegeNS1;
  priv1.tagname = privilegeName1;
  var ace1 = new nl.sara.webdav.Ace();
  ace1.grantdeny = grantdeny1;
  ace1.inherited = false;
  ace1.invertprincipal = false;
  ace1.isprotected = false;
  ace1.principal = principal1;
  ace1.addPrivilege( priv1 );
  
  var priv2 = new nl.sara.webdav.Privilege();
  priv2.namespace = privilegeNS2;
  priv2.tagname = privilegeName2;
  var ace2 = new nl.sara.webdav.Ace();
  ace2.grantdeny = grantdeny2;
  ace2.inherited = parent;
  ace2.invertprincipal = true;
  ace2.isprotected = true;
  ace2.principal = principal2;
  ace2.addPrivilege( priv2 );
  var acl = new nl.sara.webdav.Acl();
  acl.addAce( ace1, 0 );
  acl.addAce( ace2, 1 );
  
  // Let's call the method we actually want to test
  var xmlDoc = nl.sara.webdav.codec.AclCodec.toXML( acl, document.implementation.createDocument( 'DAV:', 'acl', null ) );
  
  // We test whether the Acl object parses XML correctly elsewhere, so here we can assume it does: so let's use that
  var producedAcl = new nl.sara.webdav.Acl( xmlDoc.documentElement );
  deepEqual( producedAcl.getLength()     , 2             , 'ACL XML returned by toXML should result in an ACL with 2 ACE\'s' );
  var producedAce1 = producedAcl.getAce( 0 );
  deepEqual( producedAce1.grantdeny      , grantdeny1    , 'ACL XML returned by toXML should result in an ACL with first ACE which has correct value as grantdeny' );
  deepEqual( producedAce1.inherited      , false         , 'ACL XML returned by toXML should result in an ACL with first ACE which has false value as inherited' );
  deepEqual( producedAce1.invertprincipal, false         , 'ACL XML returned by toXML should result in an ACL with first ACE which has false value as invertprincipal' );
  deepEqual( producedAce1.isprotected    , false         , 'ACL XML returned by toXML should result in an ACL with first ACE which has false value as isprotected' );
  deepEqual( producedAce1.principal      , principal1    , 'ACL XML returned by toXML should result in an ACL with first ACE which has correct value as principal' );
  var namespaces1 = producedAce1.getNamespaceNames();
  deepEqual( namespaces1.length          , 1             , 'ACL XML returned by toXML should result in an ACL with first ACE which has one namespace for properties' );
  deepEqual( namespaces1[0]              , privilegeNS1  , 'ACL XML returned by toXML should result in an ACL with first ACE which has the correct namespace for its properties' );
  var privileges1 = producedAce1.getPrivilegeNames( namespaces1[0] );
  deepEqual( privileges1.length          , 1             , 'ACL XML returned by toXML should result in an ACL with first ACE which has one properties' );
  deepEqual( privileges1[0]              , privilegeName1, 'ACL XML returned by toXML should result in an ACL with first ACE which has the correct property name' );

  var producedAce2 = producedAcl.getAce( 1 );
  deepEqual( producedAce2.grantdeny      , grantdeny2    , 'ACL XML returned by toXML should result in an ACL with second ACE which has correct value as grantdeny' );
  deepEqual( producedAce2.inherited      , false         , 'ACL XML returned by toXML should result in an ACL with second ACE which has false value as inherited' );
  deepEqual( producedAce2.invertprincipal, true          , 'ACL XML returned by toXML should result in an ACL with second ACE which has true value as invertprincipal' );
  deepEqual( producedAce2.isprotected    , false         , 'ACL XML returned by toXML should result in an ACL with second ACE which has false value as isprotected' );
  deepEqual( producedAce2.principal      , principal2    , 'ACL XML returned by toXML should result in an ACL with second ACE which has correct value as principal' );
  var namespaces2 = producedAce2.getNamespaceNames();
  deepEqual( namespaces2.length          , 1             , 'ACL XML returned by toXML should result in an ACL with second ACE which has one namespace for properties' );
  deepEqual( namespaces2[0]              , privilegeNS2  , 'ACL XML returned by toXML should result in an ACL with second ACE which has the correct namespace for its properties' );
  var privileges2 = producedAce2.getPrivilegeNames( namespaces2[0] );
  deepEqual( privileges2.length          , 1             , 'ACL XML returned by toXML should result in an ACL with second ACE which has one properties' );
  deepEqual( privileges2[0]              , privilegeName2, 'ACL XML returned by toXML should result in an ACL with second ACE which has the correct property name' );
} );

// End of file