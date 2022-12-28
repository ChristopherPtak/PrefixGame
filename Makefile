
BUILD ?= build


.PHONY: all
all: $(BUILD)/static/index.html
all: $(BUILD)/static/main.js
all: $(BUILD)/static/prefixes.json
all: $(BUILD)/server.js

.PHONY: clean
clean:
	rm -rf $(BUILD)


$(BUILD):
	mkdir $(BUILD)

$(BUILD)/static: $(BUILD)
	mkdir $(BUILD)/static

$(BUILD)/static/index.html: src/static/index.html | $(BUILD)/static
	cp src/static/index.html $(BUILD)/static/index.html

$(BUILD)/static/main.js: src/static/main.js | $(BUILD)/static
	cp src/static/main.js $(BUILD)/static/main.js

# TODO Add prefixes.json build rule using generate_prefixes.py
$(BUILD)/static/prefixes.json: src/static/prefixes.json | $(BUILD)/static
	cp src/static/prefixes.json $(BUILD)/static/prefixes.json

$(BUILD)/server.js: src/server.js | $(BUILD)
	cp src/server.js $(BUILD)/server.js

