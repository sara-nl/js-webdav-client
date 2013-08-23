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
test( 'Codec; constructor', function() {
  // Prepare some example values
  var testToXMLReturnValue   = 'this should normally be an XML element object';
  var testFromXMLReturnValue = 'this should normally be a string element object';
  
  // Prepare the constructor parameters
  var testNamespace = 'tests://beehub.nl/';
  var testTagname   = 'test_tag';
  var testToXML     = function() { return testToXMLReturnValue; };
  var testFromXML   = function() { return testFromXMLReturnValue; };
  
  // Assertions for the constructor with no parameters
  var codecNoParams    = new nl.sara.webdav.Codec();
  deepEqual( codecNoParams.namespace, null     , "Codec without constructor parameters should have NULL value as namespace" );
  deepEqual( codecNoParams.tagname  , null     , "Codec without constructor parameters should have NULL value as tagname" );
  deepEqual( codecNoParams.toXML    , undefined, "Codec without constructor parameters should have undefined value as toXML" );
  deepEqual( codecNoParams.fromXML  , undefined, "Codec without constructor parameters should have undefined value as fromXML" );
  
  // Assertions for the constructor with one parameter
  var codecOneParam    = new nl.sara.webdav.Codec( testNamespace );
  deepEqual( codecOneParam.namespace, testNamespace, "Codec with one constructor parameters should have namespace property set properly" );
  deepEqual( codecOneParam.tagname  , null         , "Codec with one constructor parameters should have NULL value as tagname" );
  deepEqual( codecOneParam.toXML    , undefined    , "Codec with one constructor parameters should have undefined value as toXML" );
  deepEqual( codecOneParam.fromXML  , undefined    , "Codec with one constructor parameters should have undefined value as fromXML" );
  
  // Assertions for the constructor with two parameters
  var codecTwoParams   = new nl.sara.webdav.Codec( testNamespace, testTagname );
  deepEqual( codecTwoParams.namespace, testNamespace, "Codec with two constructors parameters should have namespace property set properly" );
  deepEqual( codecTwoParams.tagname  , testTagname  , "Codec with two constructors parameters should have tagname property set properly" );
  deepEqual( codecTwoParams.toXML    , undefined    , "Codec with two constructors parameters should have undefined value as toXML" );
  deepEqual( codecTwoParams.fromXML  , undefined    , "Codec with two constructors parameters should have undefined value as fromXML" );
  
  // Assertions for the constructor with three parameters
  var codecThreeParams = new nl.sara.webdav.Codec( testNamespace, testTagname, testToXML );
  deepEqual( codecThreeParams.namespace, testNamespace       , "Codec with three constructors parameters should have namespace property set properly" );
  deepEqual( codecThreeParams.tagname  , testTagname         , "Codec with three constructors parameters should have tagname property set properly" );
  deepEqual( codecThreeParams.toXML()  , testToXMLReturnValue, "Codec with three constructors parameters should have toXML property set properly" );
  deepEqual( codecThreeParams.fromXML  , undefined           , "Codec with three constructors parameters should have undefined value as fromXML" );
  
  // Assertions for the constructor with four parameters
  var codecFourParams  = new nl.sara.webdav.Codec( testNamespace, testTagname, testToXML, testFromXML );
  deepEqual( codecFourParams.namespace, testNamespace         , "Codec with four constructors parameters should have namespace property set properly" );
  deepEqual( codecFourParams.tagname  , testTagname           , "Codec with four constructors parameters should have tagname property set properly" );
  deepEqual( codecFourParams.toXML()  , testToXMLReturnValue  , "Codec with four constructors parameters should have toXML property set properly" );
  deepEqual( codecFourParams.fromXML(), testFromXMLReturnValue, "Codec with four constructors parameters should have fromXML property set properly" );
} );

// End of file