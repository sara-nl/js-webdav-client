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
test( 'Exception; constructor', function() {
  // Prepare some example values / constructor parameters
  var testMessage = 'test message';
  var testCode    = 3467;
  
  // Assertions for the constructor with no parameters
  var exceptionNoParams  = new nl.sara.webdav.Exception();
  deepEqual( exceptionNoParams.message, null, "Exception without constructor parameters should have NULL value as message" );
  deepEqual( exceptionNoParams.code   , null, "Exception without constructor parameters should have NULL value as code" );
  
  // Assertions for the constructor with one parameter
  var exceptionOneParam  = new nl.sara.webdav.Exception( testMessage );
  deepEqual( exceptionOneParam.message, testMessage, "Exception without code parameter should have the message set correctly" );
  deepEqual( exceptionOneParam.code   , null       , "Exception without code parameter should have NULL value as code" );
  
  // Assertions for the constructor with two parameters
  var exceptionTwoParams = new nl.sara.webdav.Exception( testMessage, testCode );
  deepEqual( exceptionTwoParams.message, testMessage, "Exception with all parameters should have the message set correctly" );
  deepEqual( exceptionTwoParams.code   , testCode   , "Exception with all parameters should have the code set correctly" );
} );

// End of file