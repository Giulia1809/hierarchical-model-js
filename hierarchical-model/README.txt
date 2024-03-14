 Due to browsers' same origin policy security restrictions, loading models and/or textures from a file system will fail with a security exception. 
 
 Thus, it's necessary to run a local server: for example, from a Python server:
 
 - Open terminal and cd to the working directory of the HTML file (e.g., here from Final_Project_IG)
 - type (for Python 3.x): 
   python -m http.server 
 - open a browser and in the address bar type:
   http://localhost:8000/
   
This will serve files from the current directory at localhost under port 8000.

For further info, visit: 
https://threejs.org/docs/index.html#manual/en/introduction/How-to-run-things-locally


NOTE: running from localhost will automatically run index.html and the libraries - MV.js and InitShaders.js -in the same directory. ELSE: need to host locally the images and edit src to "http.localhost..."
