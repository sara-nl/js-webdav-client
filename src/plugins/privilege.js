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

// If nl.sara.webdav.Privilege is already defined, we have a namespace clash!
if (nl.sara.webdav.Privilege !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.Privilege already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class WebDAV ACL privilege
 * 
 * @param   {Node}  xmlNode  Optionally; the xmlNode describing the privilege object
 */
nl.sara.webdav.Privilege = function(xmlNode) {
  this._defaultprops = {
    'namespace'           : null,
    'tagname'             : null,
    'value'               : null,
    'xmlvalue'            : null
  }
  
  // Constructor logic
  if (xmlNode instanceof Node) {
    this.set('xmlvalue', xmlNode);
  }
}
  
/**
 * Sets a property
 * 
 * @param   {String}    prop   The property to update
 * @param               value  The value
 * @returns  {nl.sara.webdav.Privilege}        The privilege itself for chaining methods
 */
nl.sara.webdav.Privilege.prototype.set = function(prop, value) {
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
        }else if (value.textContent) { // For other type of nodes we just hope this will do something useful, although you probably want to examine the xmlvalue yourself anyway.
          this.set('value', value.textContent); // This could fail in older browsers, but that's no problem. See comments in the line above.
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
      this._defaultprops['xmlvalue'] = null;
    break;
  }
  this._defaultprops[prop] = value;
  return this;
}

/**
 * Gets a property
 * 
 * @param   {String}  prop  The property to get
 * @returns                  The value of the property
 */
nl.sara.webdav.Privilege.prototype.get = function(prop) {
  if (this._defaultprops[prop] === undefined) {
    throw new nl.sara.webdav.Exception('Property ' + prop + ' does not exist', nl.sara.webdav.Exception.UNEXISTING_PROPERTY);
  }
  return this._defaultprops[prop];
}

/**
 * Overloads the default toString() method so it returns the value of this privilege
 * 
 * @returns  {String}  A string representation of this privilege
 */
nl.sara.webdav.Privilege.prototype.toString = function() {
  return this.get('value');
}

// End of library
