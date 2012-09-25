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

// If nl.sara.webdav.Acl is already defined, we have a namespace clash!
if (nl.sara.webdav.Acl !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.Acl already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * This class describes an ACL
 * 
 * @param   Node  xmlNode  Optionally; the xmlNode describing the acl object (should be compliant with RFC 3744)
 */
nl.sara.webdav.Acl = function(xmlNode) {
  this._aces = [];
  
  // Constructor logic  
  // Parse the XML
  if (xmlNode instanceof Node) {
    if ((xmlNode.namespaceURI != 'DAV:') || (xmlNode.localName != 'acl')) {
      throw new nl.sara.webdav.Exception('Node is not of type DAV:acl', nl.sara.webdav.Exception.WRONG_XML);
    }
    for (var i = 0; i < xmlNode.childNodes.length; i++) {
      var child = xmlNode.childNodes.item(i);
      if ((child.namespaceURI == null) || (child.namespaceURI != 'DAV:') || (child.localName != 'ace')) { // Skip if not the right element
        continue;
      }
      this.addAce(new nl.sara.webdav.Ace(child));
    }
  }
}

/**
 * Adds an ACE
 * 
 * @param   Ace  ace       The ACE to add
 * @param   int  position  Optional; The position to add this ACE. If the position is lower than 1, 0 is assumed, of the position is higher than the current length of the ACL or not specified, the ACE is appended to the end.
 * @return  Acl            The ACL itself for chaining methods
 */
nl.sara.webdav.Acl.prototype.addAce = function(ace, position) {
  if (!(ace instanceof nl.sara.webdav.Ace)) {
    throw new nl.sara.webdav.Exception('Ace should be instance of Ace', nl.sara.webdav.Exception.WRONG_TYPE);
  }
  if ((position === undefined) || (position > (this._aces.length - 1))) {
    this._aces.push(ace);
  }else{
    position = Number(position);
    if (position < 1) {
      this._aces.unshift(ace);
    }else{
      this._aces.splice(position, 0, ace);
    }
  }
  return this;
}

/**
 * Gets the ACL as an array
 * 
 * @return  Ace[]  An array of the ACE's in this ACL
 */
nl.sara.webdav.Acl.prototype.getAces = function() {
  return this._aces;
}

/**
 * Gets one ACE from a certain position
 * 
 * @param   int  position  The position of the ACE
 * @return  Ace            The ACE
 */
nl.sara.webdav.Acl.prototype.getAce = function(position) {
  position = Number(position);
  if ((position < 0) || (position >= this.getLength())) {
    throw new nl.sara.webdav.Exception('No ACE found on position ' + position, nl.sara.webdav.Exception.UNEXISTING_PROPERTY);
  }
  return this._aces[position];
}

/**
 * Gets the length of the ACL
 * 
 * @return  int  The length of the ACL
 */
nl.sara.webdav.Acl.prototype.getLength = function() {
  return this._aces.length;
}

// End of library
