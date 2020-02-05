#!/bin/sh

set -e

printf "\033[0;32mStarting local server...\033[0m\n"

hugo server --theme book --baseUrl http://localhost:1313/

