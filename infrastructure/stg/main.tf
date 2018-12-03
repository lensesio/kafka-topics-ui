variable "product"                 { default = "eil-kafka-topics-ui" }
variable "env"                     { default = "stg" }
variable "heroku_region"           { default = "eu" }
variable "heroku_email"            { description = "export TF_VAR_heroku_email as env variable or enter here" }
variable "heroku_api_key"          { description = "export TF_VAR_heroku_api_key as env variable or enter here" }
variable "heroku_organisation"     { default = "eurostar" }
variable "app_bind_address"        { default = "0.0.0.0" }
variable "log_drain_endpoint"      { default = "syslog+tls://logs2.papertrailapp.com:13150" }

terraform {
  required_version = ">= 0.11.2"
  backend "s3" {
    bucket = "eil-tf-states"
    key    = "kafka-topics-ui/stg/terraform.tfstate"
    region = "eu-west-1"
  }
}

provider "heroku" {
  email = "${var.heroku_email}"
  api_key = "${var.heroku_api_key}"
}

data "terraform_remote_state" "common" {
  backend = "s3"
  config {
    bucket = "eil-tf-states"
    key    = "kafka-topics-ui/common/terraform.tfstate"
    region = "eu-west-1"
  }
}

resource "heroku_app" "main" {
  name = "${var.product}-${var.env}"
  region = "${var.heroku_region}"
  organization {
    name = "${var.heroku_organisation}"
  }
  config_vars {
    HOST = "${var.app_bind_address}"
  }
}

resource "heroku_drain" "papertrail" {
  app = "${heroku_app.main.name}"
  url = "${var.log_drain_endpoint}"
}

resource "heroku_pipeline_coupling" "main" {
  app      = "${heroku_app.main.name}"
  pipeline = "${data.terraform_remote_state.common.heroku_pipeline_id}"
  stage    = "staging"
}