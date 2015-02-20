SOURCES = src/*.js src/plugins/*/*.js
TESTS = tests/unittests/*.js tests/unittests/plugins/*/*.js
JSRUN = ./jsdoc-toolkit

all: dist.js docs tests

dist.js: dist-unminified.js check-minifier-dependencies
	@if test ! -e yuicompressor.jar ; then \
		curl --location https://github.com/downloads/yui/yuicompressor/yuicompressor-2.4.7.zip > yuicompressor-2.4.7.zip ; \
		unzip -p yuicompressor-2.4.7.zip yuicompressor-2.4.7/build/yuicompressor-2.4.7.jar > yuicompressor.jar ; \
		rm -rf yuicompressor-2.4.7.zip ; \
	fi
	@java -jar yuicompressor.jar --type js --charset utf-8 --preserve-semi -o $@ dist-unminified.js
	@echo "dist.js is created and contains the complete library."

check-minifier-dependencies:
	@scripts/check_dependencies.sh

dist-unminified.js: $(SOURCES)
	@rm -f $@ dist-unminified.js
	@for SOURCEFILE in $(SOURCES); do \
		cat $${SOURCEFILE} >> dist-unminified.js && \
		echo >> dist-unminified.js; \
		echo "Added to build file: $${SOURCEFILE}"; \
	done

tests: dist.js $(TESTS) $(SOURCES)
	@rm -f temp_footer.html
	@for TESTFILE in $(TESTS); do \
		echo "    <script src=\"../$${TESTFILE}\"></script>" >> temp_footer.html ; \
	done
	@cat tests/templates/tests_footer.html >> temp_footer.html
	@cp tests/templates/tests_header.html tests/run_dev_tests.html
	@for SOURCEFILE in $(SOURCES); do \
		echo "    <script src=\"../$${SOURCEFILE}\"></script>" >> tests/run_dev_tests.html ; \
	done
	@cat temp_footer.html >> tests/run_dev_tests.html
	@cp tests/templates/tests_header.html tests/run_dist_tests.html
	@echo "    <script src=\"../dist.js\"></script>" >> tests/run_dist_tests.html
	@cat temp_footer.html >> tests/run_dist_tests.html
	@rm -f temp_footer.html
	@echo "To run the tests for the development files, open tests/run_dev_tests.html in a browser"
	@echo "To run the tests for the distribution file (dist.js), open tests/run_dist_tests.html in a browser"

docs: $(SOURCES)
	@if test ! -d $(JSRUN) ; then \
		curl http://jsdoc-toolkit.googlecode.com/files/jsdoc_toolkit-2.4.0.zip > jsdoc_toolkit-2.4.0.zip ; \
		unzip jsdoc_toolkit-2.4.0.zip ; \
		mv -vf jsdoc_toolkit-2.4.0/jsdoc-toolkit ./ ; \
		rm -rf jsdoc_toolkit-2.4.* ; \
	fi
	@export JSDOCDIR=$(JSRUN) ; \
	bash $(JSRUN)/jsrun.sh \
		--allfunctions \
		--directory=./$@ \
		--out=./jsdoc.log \
		--private \
		--template=$(JSRUN)/templates/jsdoc \
		"src/" "src/plugins/" "src/plugins/acl" "src/plugins/webdav_default_codecs"

clean:
	@rm -rf dist.js dist-unminified.js docs/* docs/.git jsdoc.log yuicompressor.jar jsdoc-toolkit tests/resources temp_footer.html tests/run_dev_tests.html tests/run_dist_tests.html
