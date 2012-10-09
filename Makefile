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
		BASEDIR="$$(pwd)" && cd "$(JSRUN)" && ./jsrun.sh \
			--allfunctions \
			--directory="$${BASEDIR}"/$@ \
			--out="$${BASEDIR}"/jsdoc.log \
			--private \
			--template=templates/jsdoc \
			"$${BASEDIR}"/src/ "$${BASEDIR}"/src/plugins/ ; \
	else \
		echo "Unable to find jsdoc toolkit in $(JSRUN); no documentation created!"; \
	fi

clean:
	@-rm -f dist.js
	@-rm -rf docs/*
	@-rm -f jsdoc.log
