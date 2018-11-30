# vim: et sr sw=2 ts=2 smartindent:
#
# ORIGINALLY FROM https://github.com/opsgang/fastly/ - cfgs/http_security_headers
#
# var.vcl_*: vars used in vcl template for security headers
#
# 1) Drop this file and http_security_headers.tpl in to your terrafor
#    project dir.
#
# 2) See the .tpl file for instructions on including it in your main VCL
#
# 3) Incorporate it in your terraform fastly resource by adding another vcl {}
#    to the fastly_service_v1 resource in your own.
#
#     e.g.
#
#     resource "fastly_service_v1" "my_service" {
#       vcl {
#         name    = "http_security_headers"
#         content = "${data.template_file.http_security_headers.rendered}"
#         main    = false
#       }
#     
#       [ ... other stuff ... ]
#     }
#
variable "vcl_content_security_policy" {
  description = "https://developers.google.com/web/fundamentals/security/csp/"
  default     = "default-src * data: blob: filesystem: https: 'unsafe-inline' 'unsafe-eval'"
}

variable "vcl_x_content_type_options" {
  description = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options"
  default     = "nosniff"
}

variable "vcl_referrer_policy" {
  description = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy"
  default     = "strict-origin-when-cross-origin"
}

variable "vcl_strict_transport_security" {
  description = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security"
  default     = "max-age=31536000; includeSubDomains"
}

variable "vcl_x_frame_options" {
  description = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options"
  default     = "SAMEORIGIN"
}

variable "vcl_x_xss_protection" {
  description = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection"
  default     = "1; mode=block"
}

data "template_file" "http_security_headers" {

  template = "${file("http_security_headers.vcl.tpl")}" # ... CHANGE PATH IF YOU'RE USING A SUBDIR

  vars {
    vcl_content_security_policy   = "${var.vcl_content_security_policy}"
    vcl_x_content_type_options    = "${var.vcl_x_content_type_options}"
    vcl_referrer_policy           = "${var.vcl_referrer_policy}"
    vcl_strict_transport_security = "${var.vcl_strict_transport_security}"
    vcl_x_frame_options           = "${var.vcl_x_frame_options}"
    vcl_x_xss_protection          = "${var.vcl_x_xss_protection}"
  }
}
