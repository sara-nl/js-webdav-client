SOURCES = src/*.js src/plugins/*/*.js
JSRUN = ../jsdoc-toolkit

all: dist.js docs

dist.js: $(SOURCES)
	-rm -f $@
	for SOURCEFILE in $(SOURCES); do \
		cat $${SOURCEFILE} >> $@ && \
		echo >> $@; \
	done

docs: $(SOURCES)
	BASEDIR="$$(pwd)" && cd "$(JSRUN)" && ./jsrun.sh \
		--allfunctions \
		--directory="$${BASEDIR}"/$@ \
		--out="$${BASEDIR}"/jsdoc.log \
		--private \
		--template=templates/jsdoc \
		"$${BASEDIR}"/src/ "$${BASEDIR}"/src/plugins/

clean:
	-rm -f dist.js
	-rm -rf docs/*
	-rm -f jsdoc.log
