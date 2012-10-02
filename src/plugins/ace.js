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
"use strict"

// If nl.sara.webdav.Ace is already defined, we have a namespace clash!
if (nl.sara.webdav.Ace !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.Ace already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class WebDAV property
 *
 * @param  {Node}  xmlNode  Optionally; the xmlNode describing the ace object (should be compliant with RFC 3744)
 * @property  {mixed}    principal        The principal. Is one of the class constants ALL, AUTHENTICATED, UNAUTHENTICATED or SELF or a String with the path to the principal or a property. See RFC 3744 for more information on this.
 * @property  {Boolean}  invertprincipal  Whether to invert the principal; true means 'all principals except the one specified'. Default is false.
 * @property  {Boolean}  isprotected      Whether this ACE is protected. Default is false.
 * @property  {Number}   grantdeny        Grant or deny ACE? Is one of the class constants GRANT or DENY.
 * @property  {mixed}    inherited        False if the ACE is not inherited, else a String with the path to the parent collection from which this ACE is inherited.
 */
nl.sara.webdav.Ace = function(xmlNode) {
  // First define private attributes
  Object.defineProperty(this, '_namespaces', {
    'value': {},
    'enumerable': false,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, '_principal', {
    'value': null,
    'enumerable': false,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, '_invertprincipal', {
    'value': false,
    'enumerable': false,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, '_grantdeny', {
    'value': null,
    'enumerable': false,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, '_isprotected', {
    'value': false,
    'enumerable': false,
    'configurable': false,
    'writable': true
  });
  Object.defineProperty(this, '_inherited', {
    'value': false,
    'enumerable': false,
    'configurable': false,
    'writable': true
  });

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
          object.principal = principal.childNodes.item(0).nodeValue;
          break;
        case 'all':
          object.principal = nl.sara.webdav.Ace.ALL;
          break;
        case 'authenticated':
          object.principal = nl.sara.webdav.Ace.AUTHENTICATED;
          break;
        case 'unauthenticated':
          object.principal = nl.sara.webdav.Ace.UNAUTHENTICATED;
          break;
        case 'property':
          for (var k = 0; k < principal.childNodes.length; k++) {
            var element = principal.childNodes.item(k);
            if (element.nodeType != 1) {
              continue;
            }
            var prop = new nl.sara.webdav.Property(element);
            object.principal = prop;
            break;
          }
          break;
        case 'self':
          object.principal = nl.sara.webdav.Ace.SELF;
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
          this.invertprincipal = false;
          parsePrincipal(this, child);
          break;
        case 'invert':
          this.invertprincipal = true;
          for (var j = 0; j < child.childNodes.length; j++) {
            var element = child.childNodes.item(j);
            if ((element.namespaceURI != 'DAV:') || (element.localName != 'principal')) {
              continue;
            }
            parsePrincipal(this, element);
          }
          break;
        case 'grant':
          this.grantdeny = nl.sara.webdav.Ace.GRANT;
          parsePrivileges(this, child.childNodes);
          break;
        case 'deny':
          this.grantdeny = nl.sara.webdav.Ace.DENY;
          parsePrivileges(this, child.childNodes);
          break;
        case 'protected':
          this.isprotected = true;
          break;
        case 'inherited':
          for (var j = 0; j < child.childNodes.length; j++) {
            var element = child.childNodes.item(j);
            if ((element.namespaceURI != 'DAV:') || (element.localName != 'href')) {
              continue;
            }
            this.inherited = child.childNodes.item(j).childNodes.item(0).nodeValue;
          }
        break;
      }
    }
  }
}

/**#@+
 * Class constant
 */
nl.sara.webdav.Ace.GRANT = 1;
nl.sara.webdav.Ace.DENY = 2;
nl.sara.webdav.Ace.ALL = 3;
nl.sara.webdav.Ace.AUTHENTICATED = 4;
nl.sara.webdav.Ace.UNAUTHENTICATED = 5;
nl.sara.webdav.Ace.SELF = 6;
/**#@-*/

//######################### DEFINE PUBLIC ATTRIBUTES ###########################
Object.defineProperty(nl.sara.webdav.Ace.prototype, 'principal', {
  'set': function(value) {
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
    this._principal = value;
  },
  'get': function() {
    return this._principal;
  }
});

Object.defineProperty(nl.sara.webdav.Ace.prototype, 'invertprincipal', {
  'set': function(value) {
    this._invertprincipal = Boolean(value);
  },
  'get': function() {
    return this._invertprincipal;
  }
});

Object.defineProperty(nl.sara.webdav.Ace.prototype, 'isprotected', {
  'set': function(value) {
    this._isprotected = Boolean(value);
  },
  'get': function() {
    return this._isprotected;
  }
});

Object.defineProperty(nl.sara.webdav.Ace.prototype, 'grantdeny', {
  'set': function(value) {
    if ((value != nl.sara.webdav.Ace.GRANT) && (value != nl.sara.webdav.Ace.DENY)) {
      throw new nl.sara.webdav.Exception('grantdeny must be either nl.sara.webdav.Ace.GRANT or nl.sara.webdav.Ace.DENY', nl.sara.webdav.Exception.WRONG_VALUE);
    }
    this._grantdeny = value;
  },
  'get': function() {
    return this._grantdeny;
  }
});

Object.defineProperty(nl.sara.webdav.Ace.prototype, 'inherited', {
  'set': function(value) {
    if (Boolean(value)) {
      this._inherited = String(value);
    }else{
      this._inherited = false;
    }
  },
  'get': function() {
    return this._inherited;
  }
});

//########################## DEFINE PUBLIC METHODS #############################
/**
 * Adds a WebDAV privilege
 *
 * @param    {nl.sara.webdav.Privilege}  privilege  The privilege to add
 * @returns  {nl.sara.webdav.Ace}                   The ace itself for chaining methods
 */
nl.sara.webdav.Ace.prototype.addPrivilege = function(privilege) {
  if (!(privilege instanceof nl.sara.webdav.Privilege)) {
    throw new nl.sara.webdav.Exception('Privilege should be instance of Privilege', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  var namespace = privilege.namespace;
  if (namespace) {
    if (this._namespaces[namespace] === undefined) {
      this._namespaces[namespace] = {};
    }
  }else{
    throw new nl.sara.webdav.Exception('Privilege should have a namespace', nl.sara.webdav.Exception.WRONG_TYPE);
  }

  this._namespaces[namespace][privilege.tagname] = privilege;
  return this;
}

/**
 * Gets a WebDAV privilege
 *
 * @param    {String}                    namespace  The namespace of the privilege
 * @param    {String}                    privilege  The privilege to get
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
 * @param    {String}    namespace  The namespace of the privilege
 * @returns  {String[]}             The names of the different privilege of a namespace
 */
nl.sara.webdav.Ace.prototype.getPrivilegeNames = function(namespace) {
  if (this._namespaces[namespace] === undefined) {
    return new Array();
  }
  return Object.keys(this._namespaces[namespace]);
}

// End of library
