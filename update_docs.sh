#!/bin/sh

set -e

cd AFLplusplus
git pull

cp -v docs/*.md ../content/docs/
