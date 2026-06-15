#!/bin/bash
# Generate version.json with latest commit info
git log -1 --pretty=format:'{"commit": "%h", "message": "%s", "date": "%ci"}' > version.json
echo "" >> version.json

# Made with Bob
