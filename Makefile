
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

$(BUILD)/static/index.html: $(BUILD)/static src/static/index.html
	cp src/static/index.html $(BUILD)/static/index.html

$(BUILD)/static/main.js: $(BUILD)/static src/static/main.js
	cp src/static/main.js $(BUILD)/static/main.js

# TODO Add prefixes.json build rule using generate_prefixes.py
$(BUILD)/static/prefixes.json: $(BUILD)/static src/static/prefixes.json
	cp src/static/prefixes.json $(BUILD)/static/prefixes.json

$(BUILD)/server.js: $(BUILD) src/server.js
	cp src/server.js $(BUILD)/server.js

