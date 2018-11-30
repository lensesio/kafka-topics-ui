# vim: et sr sw=2 ts=2 smartindent:
terraform {
  required_version = "~> 0.11.0"
  backend "s3" {}
}
