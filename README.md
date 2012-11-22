A webDAV client library
=======================

This is the repository for a general webDAV client library, written in
JavaScript. The main purpose is to support the built-in client for *BeeHub*.
However, we attempt to make it follow the webDAV RFC 4918 and any contributions
that help implement features of this and other webDAV standards are welcome.

Directory structure
-------------------

-   ./COPYING.LESSER.txt contains the GNU LGPL
-   ./LICENSE.txt contains the GNU GPL
-   ./Makefile is the makefile to build the library into one single file
-   ./README.md contains this text
-   ./src/ contains all the source files for the basic library
-   ./src/plugins/ contains directories with plugins (such as the ACL plugin)

Development
-----------

If you want to develope on the library code itself, you'll want to link to the
source files from within your HTML page. You should add all needed files
manually to the header with the default <script> tag. For example:

```html
<script type="text/javascript" src="/library_path/src/000_header.js"></script>
```

Make sure you link the source files in the same order as the Makefile will:

-   Files in ./src will be included in a sorted order first. This means:
    -   ./src/000_header.js should be linked first
    -   ./src/001_exception.js should be linked second
    -   then the other files follow
-   Directories in ./plugins/ will be included in a sorted order next. Their
    files will also be included in a sorted order.

This way, the basic library will be linked before the plugins are loaded

Using the library in another script
-----------------------------------

To use the library from other scripts, create a single file containing the
complete library:

```bash
make dist.js
```

Copy it to your webservers public folder and rename it for convenience:

```bash
cp dist.js /path_to_public_folder/webdavlib.js
```

Then link this file in your HTML file before your own scripts are linked.

```html
<script type="text/javascript" src="/webdavlib.js"></script>
```

Of course you are free to rename the dist.js file any way you like and place it
anywhere in your public folder. As long as you change the <script> tag
correspondingly.
