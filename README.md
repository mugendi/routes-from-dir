# What

Load multiple Express Js routes by traversing a directory tree and adding a prefix to each route in the same way that you would use `app.use("/prefix", require("/path/to/route"))`.

```javascript

// require
let routesLoader = require('routes-loader);

// load
routesLoader({
    // Instance of express()
    app:app, 
    // Optional. Prefix to apply to all routes
    prefix: "/api", 
    //Optional. Directory where the path js files are found
    dir:"/path/to/api/dir" 
});

```

**NOTE:**

- This module will recursively walk the directory passed and load all routes.
- It only loads .js files
- It only loads files that export the Router object ```require('express').Router()```
- This module avails a special route ```/prefix/__info!``` that you can use to list all the routes that have been loaded. This route is only created when you have specified a prefix.
- If no prefix is provided, then prefixes are created using the directory structure

