#!/bin/bash

# Validate env vars

REQUIRED_VARS="
    HEROKU_LOGIN
    HEROKU_API_KEY
    HEROKU_APP
"

FAILED_VALIDATION=''

function check_var_defined() {
    var_name="$1"
    var_val="${!var_name}"
    if [[ -z $var_val ]]; then
        echo "$0 ERROR: You must pass \$$var_name to this script" >&2
        FAILED_VALIDATION="you bet'cha"
        return 1
    fi
}

for this_var in $REQUIRED_VARS; do
    check_var_defined $this_var
done

if [[ ! -z $FAILED_VALIDATION ]]; then
    echo "$0 EXIT: FAILURE. One of more required vars not passed to this script."
    exit 1
fi

cat > ~/.netrc << EOF
machine api.heroku.com
  login $HEROKU_LOGIN
  password $HEROKU_API_KEY
machine git.heroku.com
  login $HEROKU_LOGIN
  password $HEROKU_API_KEY
EOF

# Add heroku.com to the list of known hosts
mkdir -p ~/.ssh
touch ~/.ssh/known_hosts
ssh-keyscan -H heroku.com >> ~/.ssh/known_hosts

#cd ~/project && rm -rf .git && cd ~/project/app && git init
#cd ~/project/app && rm -rf node_modules && git add -f * && git config --global user.email "eurostar.digital.tools+heroku.github@gmail.com" && git config --global user.name "eurostar" && git commit -am "deploy"
#cd ~/project/app && git remote add heroku git@heroku.com:$HEROKU_APP.git
#cd ~/project/app && git push git@heroku.com:$HEROKU_APP.git master -f
if [[ $1 == "subtree" ]]; then
  git remote add heroku git@heroku.com:$HEROKU_APP.git
  token=$(git subtree split -q --prefix $2 master)
  git push heroku $token:master --force
else
  git push git@heroku.com:$HEROKU_APP.git master
fi
