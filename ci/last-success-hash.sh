#!/bin/bash

git fetch origin "refs/notes/*:refs/notes/*" -f
git log | grep 'ci-build-pass' -B 7 | awk '{print substr($0,8,46); exit}';
