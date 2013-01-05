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

// If nl.sara.webdav.Ie is already defined, we have a namespace clash!
if (nl.sara.webdav.Ie !== undefined) {
  throw 'Class name nl.sara.webdav.Ie already taken, could not load JavaScript library for WebDAV connectivity.';
}

/**
 * @class This class holds all IE hacks
 */
nl.sara.webdav.Ie = function() {
}

/**
 * Although this library has no intent to work in IE older than versions 9, it should work in IE and sometimes requires some special attention for this wonderful browser
 *
 * @var  Boolean  True if the current browser is IE
 */
nl.sara.webdav.Ie.isIE = false;
/*@cc_on
nl.sara.webdav.Ie.isIE = true;
@*/

//########################## DEFINE PUBLIC METHODS #############################
/**
 * Returns the localName of a DOM Node object
 *
 * @returns  {String}  The local name
 */
nl.sara.webdav.Ie.getLocalName = function(node) {
  if (nl.sara.webdav.Ie.isIE && node.baseName) {
    return node.baseName;
  }else{
    return node.localName;
  }
}

// End of library
