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
test( 'Privilege; constructor', function() {
  // Prepare some example values
  var testNamespace = 'tests://';
  var testPrivilegeName = 'testprivilege';
  var testValue = 'privilege value (although I think this should actually be ignored?';
  
  var xmlDoc = document.implementation.createDocument(testNamespace, testPrivilegeName, null);
  xmlDoc.documentElement.appendChild( xmlDoc.createCDATASection( testValue ) );
  
  // Assertions for the constructor with no parameters
  var privilegeNoParams = new nl.sara.webdav.Privilege();
  deepEqual( privilegeNoParams.xmlvalue , null, 'Privilege without constructor parameters should have NULL value as xmlvalue' );
  deepEqual( privilegeNoParams.namespace, null, 'Privilege without constructor parameters should have NULL value as namespace' );
  deepEqual( privilegeNoParams.tagname  , null, 'Privilege without constructor parameters should have NULL value as tagname' );
  
  // Assertions for the constructor with parameter
  var privilegeWithParam = new nl.sara.webdav.Privilege( xmlDoc.documentElement );
  deepEqual( privilegeWithParam.xmlvalue.length      , 1                , 'Privilege with constructor parameter should have xmlvalue with length 1' );
  deepEqual( privilegeWithParam.xmlvalue[0].nodeType , 4                , 'Privilege with constructor parameter should have a CDATA node as xmlvalue' );
  deepEqual( privilegeWithParam.xmlvalue[0].nodeValue, testValue        , 'Privilege with constructor parameter should have xmlvalue set properly' );
  deepEqual( privilegeWithParam.namespace            , testNamespace    , 'Privilege with constructor parameter should have namespace set properly' );
  deepEqual( privilegeWithParam.tagname              , testPrivilegeName, 'Privilege with constructor parameter should have tagname set properly' );
} );

/**
 * Tests all conversion methods to generate xml elements from regular values and vice versa. Both with and without codecs.
 */
test( 'Privilege; xml conversion', function() {
  // Prepare the return values
  var initialParsedValue1 = 'Example value of the testprivilege';
  var initialParsedValue2 = 'Second value of the testprivilege';
  var returnValueFromXml = 'This is a string which will always be returned';
  var returnValueToXml = 'This is a nodelist element which will always be returned';
  
  // Prepare some parameters
  var testNamespace = 'tests://';
  var testPrivilegeName = 'testprivilege';
  var xmlDoc = document.implementation.createDocument(testNamespace, 'testDoc', null);
  var testXmlNode = xmlDoc.createElementNS( testNamespace, testPrivilegeName );
  testXmlNode.appendChild( xmlDoc.createCDATASection( initialParsedValue1 ) );
  testXmlNode.appendChild( xmlDoc.createCDATASection( initialParsedValue2 ) );
  var testCodec = new nl.sara.webdav.Codec(
          testNamespace,
          testPrivilegeName,
          function( value, xmlDoc ) { // toXml
            xmlDoc.documentElement.appendChild( xmlDoc.createTextNode( 'default text' ) );
            xmlDoc.documentElement.appendChild( xmlDoc.createCDATASection( value ) );
            return xmlDoc;
          },
          function( nodelist ) { // fromXml
            return returnValueFromXml;
          }
        );

  // Test conversion without a codec set
  var privilege = new nl.sara.webdav.Privilege( testXmlNode );
  deepEqual( privilege.getParsedValue(), initialParsedValue1 + initialParsedValue2, 'Without a codec, the inital text nodes should be concatenated' );
  privilege.setValueAndRebuildXml( returnValueToXml );
  var xmlValue = privilege.xmlvalue;
  deepEqual( xmlValue.length           , 1               , 'Without a codec, the nodeList should contain 1 element' );
  var cdataNode = xmlValue.item( 0 );
  deepEqual( cdataNode.nodeType        , 4               , 'Without a codec, the nodeList should contain a CDATA element' );
  deepEqual( cdataNode.nodeValue       , returnValueToXml, 'Without a codec, the CDATA element should contain the text set with setValueAndRebuildXml' );
  deepEqual( privilege.getParsedValue(), returnValueToXml, 'Without a codec, the parsed value should be the same as the value set with setValueAndRebuildXml' );
  deepEqual( privilege.toString()      , returnValueToXml, 'Without a codec, the string representation should be the same as the value set with setValueAndRebuildXml' );
  
  // Test conversion with the codec set
  nl.sara.webdav.Privilege.addCodec( testCodec );
  var privilegeWithCodec = new nl.sara.webdav.Privilege( testXmlNode );
  deepEqual( privilegeWithCodec.getParsedValue(), returnValueFromXml, 'With a codec, the return value of the fromXml() method should be used' );
  privilegeWithCodec.setValueAndRebuildXml( returnValueToXml );
  var xmlValueWithCodec = privilegeWithCodec.xmlvalue;
  deepEqual( xmlValueWithCodec.length           , 2                 , 'With a codec, the nodeList should contain all elements set in the toXml() method (2 in this test)' );
  var cdataNodeWithCodec = xmlValueWithCodec.item( 1 );
  deepEqual( cdataNodeWithCodec.nodeType        , 4                 , 'With a codec, the second element of the nodeList should be a CDATA element' );
  deepEqual( cdataNodeWithCodec.nodeValue       , returnValueToXml  , 'With a codec, the CDATA element should contain the text set with setValueAndRebuildXml' );
  deepEqual( privilegeWithCodec.getParsedValue(), returnValueFromXml, 'With a codec, the parsed value should not change (in this test!), because the fromXml() method always returns the same static value' );
  deepEqual( privilegeWithCodec.toString()      , returnValueFromXml, 'With a codec, the string representation should not change (in this test!), because the fromXml() method always returns the same static value' );
} );

// End of file