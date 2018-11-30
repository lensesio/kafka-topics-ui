# http\_security\_headers

Terraform and vcl to include that makes a Fastly service
decorate all responses with http security headers.

It also removes certain response headers that reveal information
about the underlying tech stack.

The values of each header are configurable.

The defaults should deter most skr1pt k1ddi3z.

Check out https://securityheaders.io to see how your site
fares before and after.

## USAGE

>
> Only relevant if your Fastly service is allowed to upload custom vcl.
>
> Speak to support@fastly.com if not.
>

### 1. Grab files in this subdir

Drop them in your project dir.

That's the dir in which you will run terraform cmds, where main.tf would reside.

### 2. Include vcl in yours

Amend your main vcl file to include the http\_security\_headers.vcl:

e.g.

```
sub vcl_deliver {
  #FASTLY deliver

  include "http_security_headers" ;

  [ ... other stuff ... ]  

```

### 3. Add vcl to terraform resource

Incorporate it in your terraform fastly resource by adding a vcl {}
to the `fastly_service_v1` resource in your own.

**This is in addition to the vcl block that describes your main vcl file.**

e.g.
```
resource "fastly_service_v1" "my_service" {
  vcl {
    name    = "http_security_headers"
    content = "${data.template_file.http_security_headers.rendered}"
    main    = false
  }

  [ ... other stuff ... ]
}  
```

