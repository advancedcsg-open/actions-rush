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

mkdir -p $path
echo "$prefix $GITHUB_RUN_ID" > $path/test-file.txt

# Verify file exists
file="$path/test-file.txt"
echo "Checking for $file"
if [ ! -e $file ]; then
  echo "File does not exist"
  exit 1
fi

# Verify file content
content="$(cat $file)"
echo "File content: of $path\n$content"
