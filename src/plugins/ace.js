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

// If nl.sara.webdav.Ace is already defined, we have a namespace clash!
if (nl.sara.webdav.Ace !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.Ace already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class WebDAV property
 * 
 * @param   {Node}  xmlNode  Optionally; the xmlNode describing the ace object (should be compliant with RFC 3744)
 */
nl.sara.webdav.Ace = function(xmlNode) {
  this._namespaces = {};
  this._defaultprops = {
    'principal'           : null,
    'invertprincipal'     : false,
    'grantdeny'           : null,
    'protected'           : false,
    'inherited'           : false
  }
  
  // Constructor logic
  function parsePrincipal(object, child) {
    if (!(child instanceof Node)) {
      throw new nl.sara.webdav.Exception('Principal XML node not recognized!', nl.sara.webdav.Exception.WRONG_XML);
    }
    for (var j = 0; j < child.childNodes.length; j++) {
      var principal = child.childNodes.item(j);
      if ((principal.nodeType != 1) || (principal.namespaceURI == null) || (principal.namespaceURI.toLowerCase() != 'dav:')) { // Skip if not from the right namespace
        continue;
      }
      switch (principal.localName) {
        case 'href':
          object.set('principal', principal.childNodes.item(0).nodeValue);
          break;
        case 'all':
          object.set('principal', nl.sara.webdav.Ace.ALL);
          break;
        case 'authenticated':
          object.set('principal', nl.sara.webdav.Ace.AUTHENTICATED);
          break;
        case 'unauthenticated':
          object.set('principal', nl.sara.webdav.Ace.UNAUTHENTICATED);
          break;
        case 'property':
          for (var k = 0; k < principal.childNodes.length; k++) {
            var element = principal.childNodes.item(k);
            if (element.nodeType != 1) {
              continue;
            }
            var prop = new nl.sara.webdav.Property();
            prop.set('xmlvalue', element);
            object.set('principal', prop);
            break;
          }
          break;
        case 'self':
          object.set('principal', nl.sara.webdav.Ace.SELF);
          break;
        default:
          throw new nl.sara.webdav.Exception('Principal XML Node contains illegal child node: ' + principal.localName, nl.sara.webdav.Exception.WRONG_XML);
        break;
      }
    }
  }
  
  function parsePrivileges(object, privilegeList) {
    for (var i = 0; i < privilegeList.length; i++) {
      var privilege = privilegeList.item(i);
      if (privilege.nodeType == 1) {
        object.addPrivilege(new nl.sara.webdav.Privilege(privilege));
      }
    }
  }
  
  // Parse the XML
  if (xmlNode instanceof Node) {
    if ((xmlNode.namespaceURI != 'DAV:') || (xmlNode.localName != 'ace')) {
      throw new nl.sara.webdav.Exception('Node is not of type DAV:ace', nl.sara.webdav.Exception.WRONG_XML);
    }
    var data = xmlNode.childNodes;
    for (var i = 0; i < data.length; i++) {
      var child = data.item(i);
      if ((child.namespaceURI == null) || (child.namespaceURI != 'DAV:')) { // Skip if not from the right namespace
        continue;
      }
      switch (child.localName) {
        case 'principal':
          this.set('invertprincipal', false);
          parsePrincipal(this, child);
          break;
        case 'invert':
          this.set('invertprincipal', true);
          for (var j = 0; j < child.childNodes.length; j++) {
            var element = child.childNodes.item(j);
            if ((element.namespaceURI != 'DAV:') || (element.localName != 'principal')) {
              continue;
            }
            parsePrincipal(this, element);
          }
          break;
        case 'grant':
          this.set('grantdeny', nl.sara.webdav.Ace.GRANT);
          parsePrivileges(this, child.childNodes);
          break;
        case 'deny':
          this.set('grantdeny', nl.sara.webdav.Ace.DENY);
          parsePrivileges(this, child.childNodes);
          break;
        case 'protected':
          this.set('protected', true);
          break;
        case 'inherited':
          for (var j = 0; j < child.childNodes.length; j++) {
            var element = child.childNodes.item(j);
            if ((element.namespaceURI != 'DAV:') || (element.localName != 'href')) {
              continue;
            }
            this.set('inherited', child.childNodes.item(j).childNodes.item(0).nodeValue);
          }
        break;
      }
    }
  }
}

/**
 * Class constants
 */
nl.sara.webdav.Ace.GRANT = 1;
nl.sara.webdav.Ace.DENY = 2;
nl.sara.webdav.Ace.ALL = 3;
nl.sara.webdav.Ace.AUTHENTICATED = 4;
nl.sara.webdav.Ace.UNAUTHENTICATED = 5;
nl.sara.webdav.Ace.SELF = 6;
  
/**
 * Sets a property
 * 
 * @param   {String}    prop   The property to update
 * @param               value  The value
 * @returns  {nl.sara.webdav.Ace}              The ace itself for chaining methods
 */
nl.sara.webdav.Ace.prototype.set = function(prop, value) {
  if (this._defaultprops[prop] === undefined) {
    throw new nl.sara.webdav.Exception('Property ' + prop + ' does not exist', nl.sara.webdav.Exception.UNEXISTING_PROPERTY);
  }
  switch (prop) {
    case 'principal':
      switch (value) {
        case nl.sara.webdav.Ace.ALL:
        case nl.sara.webdav.Ace.AUTHENTICATED:
        case nl.sara.webdav.Ace.UNAUTHENTICATED:
        case nl.sara.webdav.Ace.SELF:
          break;
        default: // If it isn't one of the constants, it should be either a Property object or a string/URL
          if (!(value instanceof nl.sara.webdav.Property)) {
            value = String(value);
          }
        break;
      }
      break;
    case 'invertprincipal':
    case 'protected':
      value = Boolean(value);
      break;
    case 'grantdeny':
      if ((value != nl.sara.webdav.Ace.GRANT) && (value != nl.sara.webdav.Ace.DENY)) {
        throw new nl.sara.webdav.Exception('grantdeny must be either nl.sara.webdav.Ace.GRANT or nl.sara.webdav.Ace.DENY', nl.sara.webdav.Exception.WRONG_VALUE);
      }
      break;
    case 'inherited':
      if (Boolean(value)) {
        value = String(value);
      }else{
        value = false;
      }
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
nl.sara.webdav.Ace.prototype.get = function(prop) {
  if (this._defaultprops[prop] === undefined) {
    throw new nl.sara.webdav.Exception('Property ' + prop + ' does not exist', nl.sara.webdav.Exception.UNEXISTING_PROPERTY);
  }
  return this._defaultprops[prop];
}

/**
 * Adds a WebDAV privilege
 * 
 * @param   {nl.sara.webdav.Privilege}  privilege  The privilege to add
 * @returns  {nl.sara.webdav.Ace}                   The ace itself for chaining methods
 */
nl.sara.webdav.Ace.prototype.addPrivilege = function(privilege) {
  if (!(privilege instanceof nl.sara.webdav.Privilege)) {
    throw new nl.sara.webdav.Exception('Privilege should be instance of Privilege', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  var namespace = privilege.get('namespace');
  if (namespace) {
    if (this._namespaces[namespace] === undefined) {
      this._namespaces[namespace] = {};
    }
  }else{
    throw new nl.sara.webdav.Exception('Privilege should have a namespace', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  
  this._namespaces[namespace][privilege.get('tagname')] = privilege;
  return this;
}

/**
 * Gets a WebDAV privilege
 * 
 * @param   {String}     namespace  The namespace of the privilege
 * @param   {String}     privilege  The privilege to get
 * @returns  {nl.sara.webdav.Privilege}             The value of the privilege or undefined if the privilege doesn't exist
 */
nl.sara.webdav.Ace.prototype.getPrivilege = function(namespace, privilege) {
  if ((this._namespaces[namespace] === undefined) || (this._namespaces[namespace][privilege] === undefined)) {
    return undefined;
  }
  return this._namespaces[namespace][privilege];
}

/**
 * Gets the namespace names
 * 
 * @returns  {String[]}  The names of the different namespaces
 */
nl.sara.webdav.Ace.prototype.getNamespaceNames = function() {
  return Object.keys(this._namespaces);
}

/**
 * Gets the privilege names of a namespace
 * 
 * @param   {String}    namespace  The namespace of the privilege
 * @returns  {String[]}             The names of the different privilege of a namespace
 */
nl.sara.webdav.Ace.prototype.getPrivilegeNames = function(namespace) {
  if (this._namespaces[namespace] === undefined) {
    return new Array();
  }
  return Object.keys(this._namespaces[namespace]);
}

// End of library
