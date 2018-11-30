# vim: et sr sw=2 ts=2 smartindent syntax=vcl:
#
# ORIGINALLY FROM https://github.com/opsgang/fastly/ - cfgs/http_security_headers
#
# VCL snippet to be included in another vcl.
#
# Will set some http security response headers to pass to client if not sent by backend.
# 
# Include in vcl_deliver after the #FASTLY deliver macro
# e.g.
#   sub vcl_deliver {
#     #FASTLY deliver
#
#     include "http_security_headers.vcl" ; 
#     
#     [ ... other stuff ... ]
#
#
  if (!resp.http.Content-Security-Policy) {
    set resp.http.Content-Security-Policy = "${vcl_content_security_policy}";
  }

  if (!resp.http.X-Content-Type-Options) {
    set resp.http.X-Content-Type-Options = "${vcl_x_content_type_options}";
  }

  if (!resp.http.Referrer-Policy) {
    set resp.http.Referrer-Policy = "${vcl_referrer_policy}";
  }

  if (!resp.http.Strict-Transport-Security) {
    set resp.http.Strict-Transport-Security = "${vcl_strict_transport_security}";
  }

  if (!resp.http.X-Frame-Options) {
    set resp.http.X-Frame-Options = "${vcl_x_frame_options}";
  }

  if (!resp.http.X-Xss-Protection) {
    set resp.http.X-Xss-Protection = "${vcl_x_xss_protection}";
  }

  unset resp.http.Server ;
  unset resp.http.Via ;
  unset resp.http.X-Generator ;
  unset resp.http.X-Powered-By ;
