(git diff HEAD $(. ci/last-success-hash.sh)  --exit-code --name-only {resources/**,package.json,bitbucket-pipelines.yml,**.js}) && echo 'no-changes'
