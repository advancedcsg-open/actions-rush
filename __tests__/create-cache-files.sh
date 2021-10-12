#!/bin/sh

# Validate args
prefix="$1"
if [ -z "$prefix" ]; then
  echo "Must supply prefix argument"
  exit 1
fi

path="$2"
if [ -z "$path" ]; then
  echo "Must supply path argument"
  exit 1
fi

# Sanity check GITHUB_RUN_ID defined
if [ -z "$GITHUB_RUN_ID" ]; then
  echo "GITHUB_RUN_ID not defined"
  exit 1
fi

echo "$(pwd)"
mkdir -p $path
echo "$prefix $GITHUB_RUN_ID" > $path/test-file.txt

content="$(cat $file)"
echo "File content: of $path\n$content"
