#!/bin/bash
# vim: et sr sw=4 ts=4 smartindent:
#
# ./deploy.sh
#
# This script must sit in the same dir as your fastly terraform.
#
# - you must have set your aws mfa session
#   (plus your AWS user must have perms to access credstash)
#
# - you must run this script from the dir containing this deploy.sh script
#
AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-eu-west-1}"
CREDT="credstash-eil-shared-all"
DEVMODE="${DEVMODE:-}"
REG="eu-west-1"
TFSTATE_BUCKET="eil-tf-states"

#== MODIFY $REQUIRED_VARS AS APPROPRIATE
# ... these are the vars you want defined
# to successfully parse your terraform and template.
REQUIRED_VARS="
    AWS_USER_ARN
    FASTLY_API_KEY
    GIT_REPO
    GIT_SHA
    TFSTATE_BUCKET
    TFSTATE_FOLDER
    TFSTATE_PATH
    TF_VAR_stack_name
    TF_VAR_audit_comment
"

check_for_changes() {
    if git diff-index --quiet HEAD --
    then
        echo "INFO $0:... none found."
    else
        echo "ERROR $0: ... local changes in $(pwd)" >&2
        echo "ERROR $0:     commit them then deploy." >&2
        exit 1
    fi
}

sha_in_origin() {
    local sha="$1"
    local b=""

    echo "INFO $0:... checking git sha $sha exists in origin"
    b=$(git branch -r --contains ${sha} 2>/dev/null)
    if [[ $? -ne 0 ]] || [[ -z "$b" ]]; then
        echo "ERROR $0: This commit ($sha) does not exist on origin." >&2
        echo "ERROR $0: Did you push these changes?" >&2
        return 1
    else
        echo "INFO $0:... all looking copacetic."
        return 0
    fi
}

fastly_api_key() {
    echo "${FASTLY_API_KEY:-$(credstash -r $REG -t $CREDT get FASTLY_API_KEY)}"
}

validate_env() {
    ! [[ "$(pwd)" == "$SD" ]] && echo "ERROR: RUN deploy.sh from it's containing dir" >&2 && return 1
    [[ -z "$AWS_SESSION_TOKEN" ]] && echo "ERROR $0: you need an AWS mfa session ..." >&2 && return 1

    if [[ "$STACK_NAME" != "stg" ]] && [[ "$STACK_NAME" != "prod" ]]; then
        echo "ERROR $0: you must set \$STACK_NAME to 'stg' or 'prod'" >&2
        return 1
    fi

    return 0

}

# consume_vars()
# vars files consumed in this order:
# 1) defaults
# 2) stg | prod (determined by $STACK_NAME)
# 3) after-stack-vars
#
# If a var is defined in 2 files, the val in the later one applies.
consume_vars() {
    local f="" fn="" rc=0
    for f in defaults $STACK_NAME after-stack-vars; do

        local fn="vars/$f"
        if grep -P '^\s*[^\s#].*=.?REPLACE_ME' $fn>/dev/null 2>&1
        then
            echo "ERROR $0: ... var file $fn still contains a token REPLACE_ME." 2>&1
            echo "ERROR $0: ... remove it or replace it, before running ./deploy.sh" 2>&1
            rc=1
            continue
        fi
        # ... non-existent or unreadable file does not cause failure.
        #     BUT an existing, readable but unsourceable file does.
        [[ -r $fn ]] && ! . $fn && rc=1

    done
    return $rc
}

#== VALIDATE SCRIPT ENV
# Dir this script is in.
SD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

validate_env || exit 1

#== GET GOVERNANCE/AUDIT INFO
echo "INFO $0: ... getting governance / audit info for \$TF_VAR_audit_comment"
AWS_USER_ARN=$(aws sts get-caller-identity --query 'Arn' --output text) || exit 1
GIT_REPO=$(git config remote.origin.url)
GIT_SHA=$(git rev-parse --short=8 --verify HEAD)

DEPLOYER_INFO="deployed by $AWS_USER_ARN"
GIT_INFO="repo:$GIT_REPO sha:$GIT_SHA"

#== GET SECRETS IN THIS SECTION
echo "INFO $0: ... getting secrets"
FASTLY_API_KEY=$(fastly_api_key) || exit 1
export FASTLY_API_KEY

#== CONSUME VARS FILES 
echo "INFO $0: ... consuming ./vars cfg $(pwd)"
! consume_vars && echo "ERROR $0: failed to source all vars files" &&  exit 1

#== STATE FILE CFG
TFSTATE_PATH="$TFSTATE_FOLDER/fastly/$STACK_NAME"
echo "INFO $0: tfstate : s3://$TFSTATE_BUCKET/$TFSTATE_PATH"

#== SET RUN-TIME TF_VAR_* IN THIS SECTION
# e.g. when the val can only be determined at run-time
# or after all var files have been consumed.
export TF_VAR_stack_name=$STACK_NAME
export TF_VAR_audit_comment="$DEPLOYER_INFO $GIT_INFO"

#== VALIDATE ALL REQUIRED VARS HAVE BEEN SET
rc=0
for var in $REQUIRED_VARS; do
    if [[ -z "${!var}" ]]; then
        echo "ERROR $0: \$$var must be set in env."
        rc=1
    fi
done ; [[ $rc -ne 0 ]] && exit 1

#== TERRAFORMING
echo "INFO $0: ... terraform -> cleanup -> init -> plan"
rm -rf .terraform || true
terraform init \
    -backend-config="bucket=$TFSTATE_BUCKET" \
    -backend-config="key=$TFSTATE_PATH" \
    -backend-config="region=$AWS_DEFAULT_REGION" \
|| exit 1

terraform plan -input=false || exit 1

if [[ -z "$DEVMODE" ]]; then
    echo "INFO $0: ... terraform -> <if remote repo up-to-date> -> apply"
    check_for_changes $SD || exit 1
    sha_in_origin $GIT_SHA || exit 1
    terraform apply -input=false -auto-approve || exit 1
else
    echo "INFO $0: DEVMODE so will not apply terraform."
    exit 0
fi

