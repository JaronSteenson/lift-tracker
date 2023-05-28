(git diff HEAD $(. ci/last-success-hash.sh)  --exit-code --name-only {app/**,composer.json,**.php}) && echo 'no-changes'
