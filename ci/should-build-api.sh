#!/bin/bash

git diff HEAD $(. ci/last-success-hash.sh)  --exit-code --name-only -- {'bitbucket-pipelines.yml','LiftTrackerApi/**','LiftTrackerApi.Tests/**'} && noChanges=true;
if [[ $noChanges ]]; then
    echo 'No changes since last successful build, skipping build';
    exit 0;
else
    echo 'Changes since last successful build, running build';
fi;
