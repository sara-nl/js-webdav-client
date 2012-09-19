// If nl.sara.webdav.Property is already defined, we have a namespace clash!
if (nl.sara.webdav.Property !== undefined) {
  throw new nl.sara.webdav.Exception('Namespace nl.sara.webdav.Property already taken, could not load JavaScript library for WebDAV connectivity.', nl.sara.webdav.Exception.NAMESPACE_TAKEN);
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
    if ((xmlNode.namespaceURI.toLowerCase() != 'dav:') || (xmlNode.localName.toLowerCase() != 'propstat')) {
      throw new nl.sara.webdav.Exception('Node is not of type DAV:propstat', nl.sara.webdav.Exception.WRONG_XML);
    }
    var data = xmlNode.childNodes;
    for (var i = 0; i < data.length; i++) {
      var child = data.item(i);
      if ((child.namespaceURI == null) || (child.namespaceURI.toLowerCase() != 'dav:')) { // Skip if not from the right namespace
        continue;
      }
      switch (child.localName) {
        case 'status':
        case 'responsedescription':
          // always CDATA, so just take the text
          this.set(child.localName, child.childNodes.item(0).nodeValue);
          break;
        case 'error':
          for (var j = 0; j < child.childNodes.length; j++) {
            this.addError(child.childNodes.item(j));
          }
          break;
        case 'prop':
          if (child.childNodes.length > 0) {
            this.set('xmlvalue', child.childNodes.item(0));  // this also sets value, namespace and tagname
          }
        break;
      }
    }
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
    case 'status':
      value = parseInt(value);
      if ((value < 200) || (value >= 600)) {
        throw new nl.sara.webdav.Exception('Status must be between 200 and 599 (inclusive)', nl.sara.webdav.Exception.WRONG_TYPE);
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
