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

// If nl.sara.webdav.Property is already defined, we have a namespace clash!
if (nl.sara.webdav.Property !== undefined) {
  throw new nl.sara.webdav.Exception('Class name nl.sara.webdav.Property already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * This class describes a WebDAV property
 * 
 * @param   Node  xmlNode  Optionally; the xmlNode describing the propstat object (should be compliant with RFC 4918)
 */
nl.sara.webdav.Property = function(xmlNode) {
  this._defaultprops = {
    'namespace'           : null,
    'tagname'             : null,
    'value'               : null,
    'xmlvalue'            : null,
    'status'              : null,
    'responsedescription' : null
  }
  this._errors = [];
  
  // Constructor logic
  if (xmlNode instanceof Node) {
    this.set('xmlvalue', xmlNode);  // this also sets value, namespace and tagname
  }
}
  
/**
 * Sets a property
 * 
 * @param   string    prop   The property to update
 * @param   mixed     value  The value
 * @return  Property         The property itself for chaining methods
 */
nl.sara.webdav.Property.prototype.set = function(prop, value) {
  if (this._defaultprops[prop] === undefined) {
    throw new nl.sara.webdav.Exception('Property ' + prop + ' does not exist', nl.sara.webdav.Exception.UNEXISTING_PROPERTY);
  }
  switch (prop) {
    case 'xmlvalue':
      if (!(value instanceof Node)) {
        throw new nl.sara.webdav.Exception('xmlvalue must be an instance of Node', nl.sara.webdav.Exception.WRONG_TYPE);
      }

      // If we get a new xmlvalue, update the corresponding properties too: value, namespace and tagname
      if (value.childNodes.length > 0) {
        if ((value.childNodes.item(0).nodeType == 3) || (value.childNodes.item(0).nodeType == 4)) { // Make sure text and CDATA content is stored, even in older browsers
          this.set('value', value.childNodes.item(0).nodeValue);
        }else{
          this.set('value', null);
        }
      }else{
        this.set('value', null);
      }
      this.set('namespace', value.namespaceURI);
      this.set('tagname', value.localName);
      break;
    case 'value':
    case 'namespace':
    case 'tagname':
      this._defaultprops['xmlvalue'] = null;
      break;
    case 'status':
      value = parseInt(value);
      if ((value < 200) || (value >= 600)) {
        throw new nl.sara.webdav.Exception('Status must be between 200 and 599 (inclusive)', nl.sara.webdav.Exception.WRONG_VALUE);
      }
      break;
  }
  this._defaultprops[prop] = value;
  return this;
}

/**
 * Gets a property
 * 
 * @param   string  prop  The property to get
 * @return  mixed         The value of the property
 */
nl.sara.webdav.Property.prototype.get = function(prop) {
  if (this._defaultprops[prop] === undefined) {
    throw new nl.sara.webdav.Exception('Property ' + prop + ' does not exist', nl.sara.webdav.Exception.UNEXISTING_PROPERTY);
  }
  return this._defaultprops[prop];
}

/**
 * Adds an error to this property
 * 
 * @return  Node  The Node which represents the error
 */
nl.sara.webdav.Property.prototype.addError = function(error) {
  if (!(error instanceof Node)) {
    throw new nl.sara.webdav.Exception('Error must be an instance of Node', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  this._errors.push(error);
  return this;
}

/**
 * Returns all errors
 * 
 * @return  array  An array of Node representing the error
 */
nl.sara.webdav.Property.prototype.getErrors = function() {
  return this._errors;
}

/**
 * Overloads the default toString() method so it returns the value of this property
 * 
 * @return  string  A string representation of this property
 */
nl.sara.webdav.Property.prototype.toString = function() {
  return this.get('value');
}

// End of library
