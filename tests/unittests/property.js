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
 * @returns  void
 */
test("Property; constructor test", function() {
  var testNamespace = 'tests://beehub.nl/';
  var testPropertyName = 'testproperty';
  var xmlDoc = document.implementation.createDocument(testNamespace, 'testDoc', null);
  var firstError = xmlDoc.createElementNS( testNamespace, 'exampleerror' );
  firstError.appendChild( xmlDoc.createTextNode( 'First test error' ) );
  var secondError = xmlDoc.createElementNS( testNamespace, 'exampleerror' );
  secondError.appendChild( xmlDoc.createTextNode( 'Second test error' ) );
  var thirdError = xmlDoc.createElementNS( testNamespace, 'exampleerror' );
  thirdError.appendChild( xmlDoc.createTextNode( 'And yet another test error' ) );
  var testXmlNode = xmlDoc.createElementNS( testNamespace, testPropertyName );
  testXmlNode.appendChild( xmlDoc.createTextNode( 'Example value of the testproperty' ) );
  
  var testPropertyValue       = testXmlNode.childNodes;
  var testStatus              = 604;
  var testResponsedescription = "Example response description";
  var testErrors              = [ firstError, secondError, thirdError ];
  
  var propertyNoParams    = new nl.sara.webdav.Property();
  var propertyOneParam    = new nl.sara.webdav.Property( testXmlNode );
  var propertyTwoParams   = new nl.sara.webdav.Property( testXmlNode, testStatus );
  var propertyThreeParams = new nl.sara.webdav.Property( testXmlNode, testStatus, testResponsedescription );
  var propertyFourParams  = new nl.sara.webdav.Property( testXmlNode, testStatus, testResponsedescription, testErrors );
  
  deepEqual( propertyNoParams.xmlvalue           , null, 'Property without constructor parameters should have NULL value as xmlvalue' );
  deepEqual( propertyNoParams.namespace          , null, 'Property without constructor parameters should have NULL value as namespace' );
  deepEqual( propertyNoParams.tagname            , null, 'Property without constructor parameters should have NULL value as tagname' );
  deepEqual( propertyNoParams.status             , null, 'Property without constructor parameters should have NULL value as status' );
  deepEqual( propertyNoParams.responsedescription, null, 'Property without constructor parameters should have NULL value as responsedescription' );
  deepEqual( propertyNoParams.getErrors()        , []  , 'Property without constructor parameters should not contain any errors' );
  
  deepEqual( propertyOneParam.xmlvalue           , testPropertyValue      , 'Property with all constructor parameters should have xmlvalue set properly' );
  deepEqual( propertyOneParam.namespace          , testNamespace          , 'Property with all constructor parameters should have namespace set properly' );
  deepEqual( propertyOneParam.tagname            , testPropertyName       , 'Property with all constructor parameters should have tagname set properly' );
  deepEqual( propertyOneParam.status             , null, 'Property without constructor parameters should have NULL value as status' );
  deepEqual( propertyOneParam.responsedescription, null, 'Property without constructor parameters should have NULL value as responsedescription' );
  deepEqual( propertyOneParam.getErrors()        , []  , 'Property without constructor parameters should not contain any errors' );
  
  deepEqual( propertyTwoParams.xmlvalue           , testPropertyValue      , 'Property with all constructor parameters should have xmlvalue set properly' );
  deepEqual( propertyTwoParams.namespace          , testNamespace          , 'Property with all constructor parameters should have namespace set properly' );
  deepEqual( propertyTwoParams.tagname            , testPropertyName       , 'Property with all constructor parameters should have tagname set properly' );
  deepEqual( propertyTwoParams.status             , testStatus             , 'Property with all constructor parameters should have status set properly' );
  deepEqual( propertyTwoParams.responsedescription, null, 'Property without constructor parameters should have NULL value as responsedescription' );
  deepEqual( propertyTwoParams.getErrors()        , []  , 'Property without constructor parameters should not contain any errors' );
  
  deepEqual( propertyThreeParams.xmlvalue           , testPropertyValue      , 'Property with all constructor parameters should have xmlvalue set properly' );
  deepEqual( propertyThreeParams.namespace          , testNamespace          , 'Property with all constructor parameters should have namespace set properly' );
  deepEqual( propertyThreeParams.tagname            , testPropertyName       , 'Property with all constructor parameters should have tagname set properly' );
  deepEqual( propertyThreeParams.status             , testStatus             , 'Property with all constructor parameters should have status set properly' );
  deepEqual( propertyThreeParams.responsedescription, testResponsedescription, 'Property with all constructor parameters should have responsedescription set properly' );
  deepEqual( propertyThreeParams.getErrors()        , []  , 'Property without constructor parameters should not contain any errors' );
  
  deepEqual( propertyFourParams.xmlvalue           , testPropertyValue      , 'Property with all constructor parameters should have xmlvalue set properly' );
  deepEqual( propertyFourParams.namespace          , testNamespace          , 'Property with all constructor parameters should have namespace set properly' );
  deepEqual( propertyFourParams.tagname            , testPropertyName       , 'Property with all constructor parameters should have tagname set properly' );
  deepEqual( propertyFourParams.status             , testStatus             , 'Property with all constructor parameters should have status set properly' );
  deepEqual( propertyFourParams.responsedescription, testResponsedescription, 'Property with all constructor parameters should have responsedescription set properly' );
  deepEqual( propertyFourParams.getErrors()        , testErrors             , 'Property with all constructor parameters should have errors set properly' );
});