SOURCES = src/*.js src/plugins/*/*.js
JSRUN = ../jsdoc-toolkit

all: dist.js docs

dist.js: $(SOURCES)
	@-rm -f $@
	@for SOURCEFILE in $(SOURCES); do \
		cat $${SOURCEFILE} >> $@ && \
		echo >> $@; \
		echo "Added to dist.js: $${SOURCEFILE}"; \
	done
	@echo "dist.js is created and should contain the complete library. If used in a production environment, don't forget to minify!";

docs: $(SOURCES)
	@if /usr/bin/test -d $(JSRUN) ; then \
		export JSDOCDIR=$(JSRUN) ; \
		bash $(JSRUN)/jsrun.sh \
			--allfunctions \
			--directory=./$@ \
			--out=./jsdoc.log \
			--private \
			--template=$(JSRUN)/templates/jsdoc \
			"src/" "src/plugins/" "src/plugins/acl" "src/plugins/webdav_default_codecs" ; \
	else \
		echo "Unable to find jsdoc toolkit in $(JSRUN); no documentation created!"; \
	fi

clean:
	@-rm -f dist.js
	@-rm -rf docs/*
	@-rm -f jsdoc.log
