all: install check run

install:
	yarn --silent

check:
	yarn run --silent tsc -p tsconfig.json --noemit --pretty false || true

run:
	yarn run --silent ts-node src/index.ts
