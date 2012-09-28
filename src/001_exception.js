"use strict"
/*
 * Copyright ©2012 SARA bv, The Netherlands
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

// If nl.sara.webdav.Exception is already defined, we have a namespace clash!
if (nl.sara.webdav.Exception !== undefined) {
  throw 'Class name nl.sara.webdav.Exception already taken, could not load JavaScript library for WebDAV connectivity.';
}

/**
 * @class an exception
 * @param  {String}  message  A human readable message
 * @param  {Number}     code     The error code. It is best to use the class constants to set this.
 */
nl.sara.webdav.Exception = function(message, code) {
  this._message = null;
  this._code = null;
  
  // Constructor logic
  if (message !== undefined) {
    this.setMessage(message);
  }
  if (code !== undefined) {
    this.setCode(code);
  }
}

/**#@+
 * Declaration of the error code constants
 */
nl.sara.webdav.Exception.WRONG_TYPE = 1;
nl.sara.webdav.Exception.NAMESPACE_TAKEN = 2;
nl.sara.webdav.Exception.UNEXISTING_PROPERTY = 3;
nl.sara.webdav.Exception.WRONG_XML = 4;
nl.sara.webdav.Exception.WRONG_VALUE = 5;
nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER = 6;
nl.sara.webdav.Exception.AJAX_ERROR = 7;
nl.sara.webdav.Exception.NOT_IMPLEMENTED = 8;
/**#@-*/

/**
 * Sets the message
 * 
 * @param   {String}  message  The message
 * @returns  {nl.sara.webdav.Exception}        self
 */
nl.sara.webdav.Exception.prototype.setMessage = function(message) {
  this._message = message;
  return this;
}

/**
 * Gets the message
 * 
 * @returns           The message
 */
nl.sara.webdav.Exception.prototype.getMessage = function() {
  return this._message;
}

/**
 * Sets the code
 * 
 * @param   {Number}        code  The code
 * @returns  {nl.sara.webdav.Exception}        self
 */
nl.sara.webdav.Exception.prototype.setCode = function(code) {
  if (isNaN(code)) {
    throw new nl.sara.webdav.Exception('nl.sara.webdav.Exception.setCode(code) expects an integer', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  this._code = parseInt(code, 10);
  return this;
}

/**
 * Gets the code
 * 
 * @returns  {Number}  The code
 */
nl.sara.webdav.Exception.prototype.getCode = function() {
  return this._code;
}
    
/**
 * Overloads the default toString() method so it returns the message of this exception
 * 
 * @returns  {String}  A string representation of this property
 */
nl.sara.webdav.Exception.prototype.toString = function() {
  return this.getMessage();
}

// End of library
