/*
 * Copyright ©2014 SARA bv, The Netherlands
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

// If nl.sara.webdav.codec.Inherited_acl_setCodec is already defined, we have a namespace clash!
if (nl.sara.webdav.codec.Inherited_acl_setCodec !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.codec.Inherited_acl_setCodec already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
}

/**
 * @class Adds a codec that converts DAV: inherited-acl-set to an array with the uri's object
 * @augments nl.sara.webdav.Codec
 */
nl.sara.webdav.codec.Inherited_acl_setCodec = new nl.sara.webdav.Codec();
nl.sara.webdav.codec.Inherited_acl_setCodec.namespace = 'DAV:';
nl.sara.webdav.codec.Inherited_acl_setCodec.tagname = 'inherited-acl-set';

nl.sara.webdav.codec.Inherited_acl_setCodec.fromXML = nl.sara.webdav.codec.Principal_collection_setCodec.fromXML;
nl.sara.webdav.codec.Inherited_acl_setCodec.toXML = nl.sara.webdav.codec.Principal_collection_setCodec.toXML;

nl.sara.webdav.Property.addCodec(nl.sara.webdav.codec.Inherited_acl_setCodec);

// End of file