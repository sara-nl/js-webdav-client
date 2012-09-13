// If nl.sara.webdav.Exception is already defined, we have a namespace clash!
if (nl.sara.webdav.Exception !== undefined) {
  throw 'Namespace nl.sara.webdav.Exception already taken, could not load JavaScript library for WebDAV connectivity.';
}

/**
 * This class describes an exception
 * @public
 * @param  string  message  A human readable message
 * @param  int     code     The error code. It is best to use the class constants to set this.
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

/**
 * Declaration of the error code constants
 */
nl.sara.webdav.Exception.WRONG_TYPE = 1;
nl.sara.webdav.Exception.NAMESPACE_TAKEN = 2;
nl.sara.webdav.Exception.UNEXISTING_PROPERTY = 3;
nl.sara.webdav.Exception.WRONG_XML = 4;
nl.sara.webdav.Exception.WRONG_VALUE = 5;
nl.sara.webdav.Exception.MISSING_REQUIRED_PARAMETER = 6;
nl.sara.webdav.Exception.AJAX_ERROR = 7;

/**
 * Sets the message
 * @public
 * @param   string  message   The message
 * @return  int               0 on error, 1 on success
 */
nl.sara.webdav.Exception.prototype.setMessage = function(message) {
  this._message = message;
  return 1;
}

/**
 * Gets the message
 * @public
 * @return  mixed  The message
 */
nl.sara.webdav.Exception.prototype.getMessage = function() {
  return this._message;
}

/**
 * Sets the code
 * @public
 * @param   int  code  The code
 * @return  int        0 on error, 1 on success
 */
nl.sara.webdav.Exception.prototype.setCode = function(code) {
  if (isNaN(code)) {
    throw new nl.sara.webdav.Exception('nl.sara.webdav.Exception.setCode(code) expects an integer', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  this._code = parseInt(code);
  return 1;
}

/**
 * Gets the code
 * @public
 * @return  mixed  The code
 */
nl.sara.webdav.Exception.prototype.getCode = function() {
  return this._code;
}
    
/**
 * Overloads the default toString() method so it returns the message of this exception
 * @public
 * @return  string  A string representation of this property
 */
nl.sara.webdav.Exception.prototype.toString = function() {
  return this.getMessage();
}

// End of library
