SOURCES = src/*.js src/plugins/*/*.js
JSRUN = ../jsdoc-toolkit

all: dist.js docs tests

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
			"src/" "src/plugins/" ; \
	else \
		echo "Unable to find jsdoc toolkit in $(JSRUN); no documentation created!"; \
	fi

tests: dist.js
	@if /usr/bin/test ! -e 'tests/resources' ; then \
		mkdir tests/resources ; \
	fi ; \
  curl http://code.jquery.com/qunit/qunit-1.12.0.css > tests/resources/qunit.css ; \
  curl http://code.jquery.com/qunit/qunit-1.12.0.js > tests/resources/qunit.js ; \
  curl https://raw.github.com/philikon/MockHttpRequest/master/lib/mock.js > tests/resources/mock.js

clean:
	@-rm -f dist.js
	@-rm -rf docs/*
	@-rm -f jsdoc.log
	@-rm -rf tests/resources
