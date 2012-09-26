SOURCES = src/*.js src/plugins/*.js
JSRUN = ../jsdoc-toolkit

all: dist.js docs

dist.js: $(SOURCES)
	-rm $@
	for SOURCEFILE in $(SOURCES); do \
		cat $${SOURCEFILE} >> $@ && \
		echo >> $@; \
	done

docs: $(SOURCES)
	-rm -rf $@
	-rm jsdoc.log
	BASEDIR="$$(pwd)" && cd "$(JSRUN)" && ./jsrun.sh \
		--allfunctions \
		--directory="$${BASEDIR}"/$@ \
		--out="$${BASEDIR}"/jsdoc.log \
		--private \
		--template=templates/jsdoc \
		"$${BASEDIR}"/src/ "$${BASEDIR}"/src/plugins/

clean:
	-rm dist.js
	-rm -rf docs
	-rm jsdoc.log
