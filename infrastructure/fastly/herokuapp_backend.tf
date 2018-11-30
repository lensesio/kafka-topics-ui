# vim: et sr sw=2 ts=2 smartindent:
#
# ORIGINALLY FROM https://github.com/opsgang/fastly/ - cfgs/herokuapp_backend
#
# set $FASTLY_API_KEY in env instead of an explicit
# provider block for fastly.
#
variable "audit_comment" {
  description = "use this to put governance info in your vcl and fastly service e.g. git info"
  default     = "... should put in git_info or something useful for governance here."
}

variable "dns_to_fastly" {
  description = "dns name used by end-users to access site via fastly"
}

variable "dns_to_origin" {
  description = "dns name for heroku f/e"
}

variable "service_name" {
  description = "name of service in fastly" 
}

variable "between_bytes_timeout" {
  default     = 10000
  description = "backend setting"
}

variable "connect_timeout" {
  default     = 2000
  description = "backend setting"
}

variable "heroku_ssl_name" {
  default     = "*.herokuapp.com"
  description = "ssl cert name served by your heroku app"
}

variable "heroku_sni_name" {
  default     = "*.herokuapp.com"
  description = "ssl sni name served by your heroku app - for a wildcard, use *.<domain>"
}

variable "first_byte_timeout" {
  default     = 10000
  description = "backend setting"
}

variable "health_check_path" {
  description = "url path in heroku app that will reliably return 200 on a HEAD request"
}

variable "max_conn" {
  default     = 400
  description = "backend setting"
}

variable "ttl_404_and_3xx" {
  default     = "10m"
  description = "how long to cache 404s and 3xx redirects"
}

variable "short_ttl_secs" {
  default     = "300"
  description = ""
}

variable "long_ttl_secs" {
  default     = "3600"
  description = ""
}

variable "default_ttl_secs" {
  default     = "3600"
  description = ""
}

provider "fastly" {
  version = "~> 0.1.4"
}

provider "template" {
  version = "~> 1.0.0"
}

resource "fastly_service_v1" "a" {
  name   = "${var.service_name}"

  domain {
    name    = "${var.dns_to_fastly}"
    comment = "${var.audit_comment}"
  }

  backend {
    name                  = "${var.dns_to_origin}"
    address               = "${var.dns_to_origin}"
    auto_loadbalance      = false
    between_bytes_timeout = "${var.between_bytes_timeout}"
    connect_timeout       = "${var.connect_timeout}"
    first_byte_timeout    = "${var.first_byte_timeout}"
    healthcheck           = "health_check"
    max_conn              = "${var.max_conn}"
    port                  = 443
    ssl_check_cert        = true
    ssl_cert_hostname     = "${var.heroku_ssl_name}"
    ssl_sni_hostname      = "${var.heroku_sni_name}"
    use_ssl               = true
  }

  request_setting {
    name          = "${var.service_name}"
    default_host  = "${var.dns_to_origin}"
    force_ssl     = true
  }

  gzip {
    name          = "gzip"
    extensions    = [
      "apng",
      "css",
      "eot",
      "html",
      "jpeg",
      "jpg",
      "js",
      "json",
      "ico",
      "otf",
      "png",
      "svg",
      "ttf"
    ]

    content_types = [
      "text/html",
      "application/x-javascript",
      "text/css",
      "application/javascript",
      "text/javascript",
      "application/json",
      "application/vnd.ms-fontobject",
      "application/x-font-opentype",
      "application/x-font-truetype",
      "application/x-font-ttf",
      "application/xml",
      "font/eot",
      "font/opentype",
      "font/otf",
      "image/apng",
      "image/gif",
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/svg+xml",
      "image/webp",
      "image/vnd.microsoft.icon",
      "text/plain",
      "text/xml"
    ]
  }

  healthcheck {
    name              = "health_check"
    host              = "${var.dns_to_origin}"
    path              = "${var.health_check_path}"
    check_interval    = 20000
    expected_response = 200
    initial           = 2
    method            = "HEAD"
    threshold         = 2
    timeout           = 12000
    window            = 3
  }

  vcl {
    name    = "herokuapp_backend"
    content = "${data.template_file.herokuapp_backend.rendered}"
    main    = true
  }

  vcl {
    name    = "http_security_headers"
    content = "${data.template_file.http_security_headers.rendered}"
    main    = false
  }
}

data "template_file" "herokuapp_backend" {

  template = "${file("herokuapp_backend.vcl.tpl")}" # ... CHANGE PATH IF YOU'RE USING A SUBDIR

  vars {
    audit_comment    = "${var.audit_comment}"
    default_ttl_secs = "${var.default_ttl_secs}"
    dns_to_fastly    = "${var.dns_to_fastly}"
    dns_to_origin    = "${var.dns_to_origin}"
    long_ttl_secs    = "${var.long_ttl_secs}"
    short_ttl_secs   = "${var.short_ttl_secs}"
    ttl_404_and_3xx  = "${var.ttl_404_and_3xx}"
  }
}

