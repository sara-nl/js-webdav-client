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
"use strict";

// If nl.sara.webdav.codec.AclCodec is already defined, we have a namespace clash!
if (nl.sara.webdav.codec.AclCodec !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.codec.AclCodec already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class Adds a codec that converts DAV: acl to an nl.sara.webdav.Acl object
 * @augments nl.sara.webdav.Codec
 */
nl.sara.webdav.codec.AclCodec = new nl.sara.webdav.Codec();
nl.sara.webdav.codec.AclCodec.namespace = 'DAV:';
nl.sara.webdav.codec.AclCodec.tagname = 'acl';

nl.sara.webdav.codec.AclCodec.fromXML = function(nodelist) {
  // The constructor of Acl will parse a DAV: acl node itself, so just make sure this nodelist is part of a DAV: acl node
  var acl = document.implementation.createDocument("DAV:", "acl", null).documentElement;
  for (var i = 0; i < nodelist.length; i++) {
    acl.appendChild(nodelist.item(i));
  }
  return new nl.sara.webdav.Acl(acl);
};

nl.sara.webdav.codec.AclCodec.toXML = function(value, xmlDoc){
  var aclLength = acl.getLength();
  for (var i = 0; i < aclLength; i++) { // Loop over the ACE's in this ACL
    var ace = acl.getAce(i);
    var aceBody = xmlDoc.createElementNS('DAV:', 'ace');

    // First create a principal node
    var principal = xmlDoc.createElementNS('DAV:', 'principal');
    var princVal = ace.principal;
    switch (princVal) {
      case nl.sara.webdav.Ace.ALL:
        principal.appendChild(xmlDoc.createElementNS('DAV:', 'all'));
        break;
      case nl.sara.webdav.Ace.AUTHENTICATED:
        principal.appendChild(xmlDoc.createElementNS('DAV:', 'authenticated'));
        break;
      case nl.sara.webdav.Ace.UNAUTHENTICATED:
        principal.appendChild(xmlDoc.createElementNS('DAV:', 'unauthenticated'));
        break;
      case nl.sara.webdav.Ace.SELF:
        principal.appendChild(xmlDoc.createElementNS('DAV:', 'self'));
        break;
      default: // If it isn't one of the constants, it should be either a Property object or a string/URL
        if (!(princVal instanceof nl.sara.webdav.Property)) { // It is a string; the URL of the principal
          var href = xmlDoc.createElementNS('DAV:', 'href');
          href.appendChild(xmlDoc.createCDATASection(princVal));
          principal.appendChild(href);
        }else{ // And else it is a property
          var property = xmlDoc.createElementNS('DAV:', 'property');
          var prop = xmlDoc.createElementNS(princVal.namespace, princVal.tagname);
          if (princVal.xmlvalue != null) {
            for (var j = 0; j < princVal.xmlvalue.length; j++) {
              prop.appendChild(princVal.xmlValue.item(j));
            }
          }
          property.appendChild(prop);
          principal.appendChild(property);
        }
      break;
    }

    // If the principal should be inverted, put it in an 'invert' element
    if (ace.invertprincipal) {
      var invert = xmlDoc.createElementNS('DAV:', 'invert');
      invert.appendChild(principal);
      aceBody.appendChild(invert);
    }else{
      aceBody.appendChild(principal);
    }

    // Then prepare the privileges
    // grant or deny?
    var privilegeParent = null;
    if (ace.grantdeny == nl.sara.webdav.Ace.DENY) {
      privilegeParent = aceBody.createElementNS('DAV:', 'deny');
    }else if (ace.grantdeny == nl.sara.webdav.Ace.GRANT) {
      privilegeParent = aceBody.createElementNS('DAV:', 'grant');
    }else{
      throw new nl.sara.webdav.Exception('\'grantdeny\' property not set on one of the ACE\'s in this ACL', nl.sara.webdav.Exception.WRONG_VALUE);
    }
    var namespaces = ace.getNamespaceNames();
    for (j = 0; j < namespaces.length; j++) { // loop through namespaces
      var namespace = namespaces[j];
      var privileges = ace.getPrivilegeNames(namespace);
      for (var k = 0; k < privileges.length; k++) { // loop through each privilege in this namespace
        var privilege = privileges[k];
        var privilegeElement = xmlDoc.createElementNS('DAV:', 'privilege');
        var priv = xmlDoc.createElementNS(privilege.namespace, privilege.tagname);
        if (privilege.xmlvalue != null) {
          for (var l = 0; l < privilege.xmlvalue.length; l++) {
            priv.appendChild(privilege.xmlValue.item(j));
          }
        }
        privilegeElement.appendChild(priv);
        privilegeParent.appendChild(privilegeElement);
      }
    }
    aceBody.appendChild(privilegeParent);

    xmlDoc.documentElement.appendChild(aceBody);

    return xmlDoc;
  }
};

nl.sara.webdav.Property.addCodec(nl.sara.webdav.codec.AclCodec);

// End of file
