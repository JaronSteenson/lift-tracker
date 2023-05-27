(git diff HEAD $(. ci/last-success-hash.sh)  --exit-code --name-only {app/**,composer.json,bitbucket-pipelines.yml,**.php}) && echo 'no-changes'
