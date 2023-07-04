#! /bin/sh

# First argument must have pattern ^[a-zA-z]+(-[a-zA-Z]+)*$

if [ $# -lt 2 ]; then
    echo "Invalid number of arguments"
    exit 1
fi

if ! echo "$1" | grep -qE '^[a-zA-Z]+(-[a-zA-Z]+)*$'; then
    echo "Error: Invalid library name"
    exit 1
fi

# second argument must be either "data-access", "feature", or "util"

if [ $# -ne 2 ]; then
    echo "Must have exactly two arguments"
    exit 1
fi

if ! echo "$2" | grep -qE '^(data-access|feature|util)$'; then
    echo "Error: Invalid library type (must be either data-access, feature, or util)"
    exit 1
fi

# make arguments lowercase

library_name=$(echo "$1" | tr '[:upper:]' '[:lower:]')
library_type=$2

directory="./libs/api/$library_name/$library_type"
# test if directory exists
if [ -d "$directory" ]; then
    echo "Error: Directory $directory already exists"
    exit 1
fi

# generate library

npx nx g @nrwl/js:library $library_type --directory=api/$library_name --no-interactive --dry-run

# if second argument is "feature", then 
if [ "$library_type" = "feature" ]; then
    # create files library_name.module.ts, library_name.services.ts, and library_name.sagas.ts in src directory
    touch "$directory/src/$library_name.module.ts"
    touch "$directory/src/$library_name.services.ts"
    touch "$directory/src/$library_name.sagas.ts"

    # create directories commands, events, and models with index.ts files inside
    mkdir -p "$directory/src/commands"
    mkdir -p "$directory/src/events"
    mkdir -p "$directory/src/models"
    touch "$directory/src/commands/index.ts"
    touch "$directory/src/events/index.ts"
    touch "$directory/src/models/index.ts"
fi