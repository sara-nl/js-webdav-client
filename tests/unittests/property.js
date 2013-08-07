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
test( 'Property; constructor', function() {
  // Prepare some example values
  var testNamespace = 'tests://beehub.nl/';
  var testPropertyName = 'testproperty';
  var xmlDoc = document.implementation.createDocument(testNamespace, 'testDoc', null);
  var firstError = xmlDoc.createElementNS( testNamespace, 'exampleerror' );
  firstError.appendChild( xmlDoc.createCDATASection( 'First test error' ) );
  var secondError = xmlDoc.createElementNS( testNamespace, 'exampleerror' );
  secondError.appendChild( xmlDoc.createCDATASection( 'Second test error' ) );
  var thirdError = xmlDoc.createElementNS( testNamespace, 'exampleerror' );
  thirdError.appendChild( xmlDoc.createCDATASection( 'And yet another test error' ) );
  var testXmlNode = xmlDoc.createElementNS( testNamespace, testPropertyName );
  testXmlNode.appendChild( xmlDoc.createCDATASection( 'Example value of the testproperty' ) );
  
  // Prepare the constructor parameters
  var testPropertyValue       = testXmlNode.childNodes;
  var testStatus              = 604;
  var testResponsedescription = "Example response description";
  var testErrors              = [ firstError, secondError, thirdError ];
  
  // Assertions for the constructor with no parameters
  var propertyNoParams    = new nl.sara.webdav.Property();
  deepEqual( propertyNoParams.xmlvalue           , null, 'Property without constructor parameters should have NULL value as xmlvalue' );
  deepEqual( propertyNoParams.namespace          , null, 'Property without constructor parameters should have NULL value as namespace' );
  deepEqual( propertyNoParams.tagname            , null, 'Property without constructor parameters should have NULL value as tagname' );
  deepEqual( propertyNoParams.status             , null, 'Property without constructor parameters should have NULL value as status' );
  deepEqual( propertyNoParams.responsedescription, null, 'Property without constructor parameters should have NULL value as responsedescription' );
  deepEqual( propertyNoParams.getErrors()        , []  , 'Property without constructor parameters should not contain any errors' );
  
  // Assertions for the constructor with one parameter
  var propertyOneParam    = new nl.sara.webdav.Property( testXmlNode );
  deepEqual( propertyOneParam.xmlvalue           , testPropertyValue      , 'Property with all constructor parameters should have xmlvalue set properly' );
  deepEqual( propertyOneParam.namespace          , testNamespace          , 'Property with all constructor parameters should have namespace set properly' );
  deepEqual( propertyOneParam.tagname            , testPropertyName       , 'Property with all constructor parameters should have tagname set properly' );
  deepEqual( propertyOneParam.status             , null, 'Property without constructor parameters should have NULL value as status' );
  deepEqual( propertyOneParam.responsedescription, null, 'Property without constructor parameters should have NULL value as responsedescription' );
  deepEqual( propertyOneParam.getErrors()        , []  , 'Property without constructor parameters should not contain any errors' );
  
  // Assertions for the constructor with two parameters
  var propertyTwoParams   = new nl.sara.webdav.Property( testXmlNode, testStatus );
  deepEqual( propertyTwoParams.xmlvalue           , testPropertyValue      , 'Property with all constructor parameters should have xmlvalue set properly' );
  deepEqual( propertyTwoParams.namespace          , testNamespace          , 'Property with all constructor parameters should have namespace set properly' );
  deepEqual( propertyTwoParams.tagname            , testPropertyName       , 'Property with all constructor parameters should have tagname set properly' );
  deepEqual( propertyTwoParams.status             , testStatus             , 'Property with all constructor parameters should have status set properly' );
  deepEqual( propertyTwoParams.responsedescription, null, 'Property without constructor parameters should have NULL value as responsedescription' );
  deepEqual( propertyTwoParams.getErrors()        , []  , 'Property without constructor parameters should not contain any errors' );
  
  // Assertions for the constructor with three parameters
  var propertyThreeParams = new nl.sara.webdav.Property( testXmlNode, testStatus, testResponsedescription );
  deepEqual( propertyThreeParams.xmlvalue           , testPropertyValue      , 'Property with all constructor parameters should have xmlvalue set properly' );
  deepEqual( propertyThreeParams.namespace          , testNamespace          , 'Property with all constructor parameters should have namespace set properly' );
  deepEqual( propertyThreeParams.tagname            , testPropertyName       , 'Property with all constructor parameters should have tagname set properly' );
  deepEqual( propertyThreeParams.status             , testStatus             , 'Property with all constructor parameters should have status set properly' );
  deepEqual( propertyThreeParams.responsedescription, testResponsedescription, 'Property with all constructor parameters should have responsedescription set properly' );
  deepEqual( propertyThreeParams.getErrors()        , []  , 'Property without constructor parameters should not contain any errors' );
  
  // Assertions for the constructor with four parameters
  var propertyFourParams  = new nl.sara.webdav.Property( testXmlNode, testStatus, testResponsedescription, testErrors );
  deepEqual( propertyFourParams.xmlvalue           , testPropertyValue      , 'Property with all constructor parameters should have xmlvalue set properly' );
  deepEqual( propertyFourParams.namespace          , testNamespace          , 'Property with all constructor parameters should have namespace set properly' );
  deepEqual( propertyFourParams.tagname            , testPropertyName       , 'Property with all constructor parameters should have tagname set properly' );
  deepEqual( propertyFourParams.status             , testStatus             , 'Property with all constructor parameters should have status set properly' );
  deepEqual( propertyFourParams.responsedescription, testResponsedescription, 'Property with all constructor parameters should have responsedescription set properly' );
  deepEqual( propertyFourParams.getErrors()        , testErrors             , 'Property with all constructor parameters should have errors set properly' );
} );

/**
 * Tests all conversion methods to generate xml elements from regular values and vice versa. Both with and without codecs.
 */
test( 'Property; xml conversion', function() {
  // Prepare the return values
  var initialParsedValue1 = 'Example value of the testproperty';
  var initialParsedValue2 = 'Second value of the testproperty';
  var returnValueFromXml = 'This is a string which will always be returned';
  var returnValueToXml = 'This is a nodelist element which will always be returned';
  
  // Prepare some parameters
  var testNamespace = 'tests://beehub.nl/';
  var testPropertyName = 'testproperty';
  var xmlDoc = document.implementation.createDocument(testNamespace, 'testDoc', null);
  var testXmlNode = xmlDoc.createElementNS( testNamespace, testPropertyName );
  testXmlNode.appendChild( xmlDoc.createCDATASection( initialParsedValue1 ) );
  testXmlNode.appendChild( xmlDoc.createCDATASection( initialParsedValue2 ) );
  var testCodec = new nl.sara.webdav.Codec(
          testNamespace,
          testPropertyName,
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
  var property = new nl.sara.webdav.Property( testXmlNode );
  deepEqual( property.getParsedValue(), initialParsedValue1 + initialParsedValue2, 'Without a codec, the inital text nodes should be concatenated' );
  property.setValueAndRebuildXml( returnValueToXml );
  var xmlValue = property.xmlvalue;
  ok( xmlValue.length === 1, 'Without a codec, the nodeList should contain 1 element' );
  var cdataNode = xmlValue.item( 0 );
  ok( cdataNode.nodeType === 4, 'Without a codec, the nodeList should contain a CDATA element' );
  deepEqual( cdataNode.nodeValue, returnValueToXml, 'Without a codec, the CDATA element should contain the text set with setValueAndRebuildXml' );
  deepEqual( property.getParsedValue(), returnValueToXml, 'Without a codec, the parsed value should be the same as the value set with setValueAndRebuildXml' );
  deepEqual( property.toString(), returnValueToXml, 'Without a codec, the string representation should be the same as the value set with setValueAndRebuildXml' );
  
  // Test conversion with the codec set
  nl.sara.webdav.Property.addCodec( testCodec );
  var propertyWithCodec = new nl.sara.webdav.Property( testXmlNode );
  deepEqual( propertyWithCodec.getParsedValue(), returnValueFromXml, 'With a codec, the return value of the fromXml() method should be used' );
  propertyWithCodec.setValueAndRebuildXml( returnValueToXml );
  var xmlValueWithCodec = propertyWithCodec.xmlvalue;
  ok( xmlValueWithCodec.length === 2, 'With a codec, the nodeList should contain all elements set in the toXml() method (2 in this test)' );
  var cdataNodeWithCodec = xmlValueWithCodec.item( 1 );
  ok( cdataNodeWithCodec.nodeType === 4, 'With a codec, the second element of the nodeList should be a CDATA element' );
  deepEqual( cdataNodeWithCodec.nodeValue, returnValueToXml, 'With a codec, the CDATA element should contain the text set with setValueAndRebuildXml' );
  deepEqual( propertyWithCodec.getParsedValue(), returnValueFromXml, 'With a codec, the parsed value should not change (in this test!), because the fromXml() method always returns the same static value' );
  deepEqual( propertyWithCodec.toString(), returnValueFromXml, 'With a codec, the string representation should not change (in this test!), because the fromXml() method always returns the same static value' );
} );

/**
 * Tests adding and looking up (webDAV) errors
 */
test( 'Property; checking and adding (webDAV) errors', function() {
  // Prepare some sample errors
  var testNamespace = 'tests://beehub.nl/';
  var xmlDoc = document.implementation.createDocument(testNamespace, 'testDoc', null);
  var firstError = xmlDoc.createElementNS( testNamespace, 'exampleerror' );
  firstError.appendChild( xmlDoc.createCDATASection( 'First test error' ) );
  var secondError = xmlDoc.createElementNS( testNamespace, 'exampleerror' );
  secondError.appendChild( xmlDoc.createCDATASection( 'Second test error' ) );
  var thirdError = xmlDoc.createElementNS( testNamespace, 'exampleerror' );
  thirdError.appendChild( xmlDoc.createCDATASection( 'And yet another test error' ) );
  
  // Test the error handling functions
  var property = new nl.sara.webdav.Property();
  deepEqual( property.getErrors().length, 0, 'Initially, the list of errors should be empty' );
  property.addError( firstError );
  deepEqual( property.getErrors().length, 1, 'After adding one error, the list should be 1 long' );
  property.addError( secondError );
  deepEqual( property.getErrors().length, 2, 'After adding one error, the list should be 1 long' );
  property.addError( thirdError );
  var allReturnedErrors = property.getErrors();
  deepEqual( allReturnedErrors.length, 3, 'After adding one error, the list should be 1 long' );
  deepEqual( allReturnedErrors[0], firstError, 'The first error added, should also be the first element in the error array' );
  deepEqual( allReturnedErrors[1], secondError, 'The second error added, should also be the second element in the error array' );
  deepEqual( allReturnedErrors[2], thirdError, 'The third error added, should also be the third element in the error array' );
} );

// End of file