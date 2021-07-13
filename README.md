# Configurator Example Application

This is an example application using the Onshape external APIs to provide a CAD configurator.

A running version of this can be found at: https://configurator.onshape.app/

The application comprises a Java server and an Angular client. The server uses the Onshape Java client (https://github.com/onshape-public/java-client) to access assembly, part, and configuration data from Onshape. The client includes components for viewing 3D models with WebGL (via three.js), and for interaction with the server component to fetch or change configuration data.

As well as configurators, this could be used as the basis of a range of applications that use Onshape as a platform for engineering data - such as fetching geometry of a given configuration for CAE analyses, or providing 3D views of products in an online catalog.


# Before anything

Prerequisites:
* node + npm (v10)
* jdk (1.8)
* mvn (3)
* docker

```
cd client
npm install
cd ..
```

# Environment variables

You will need the following environment variables defined with the access key and secret key from dev-portal.onshape.com:

ONSHAPE_API_ACCESSKEY
ONSHAPE_API_SECRETKEY


# How to run: development

Run the server:

```
mvn jetty:stop jetty:run
cd ..
```

Run the client, the following will build and run the client and launch the browser:

```
cd client
npm run start
cd ..
```

# Docker

First build a Docker image called "configurator":
```
mvn package -DskipTests=true
```

The following will run the configurator at http://localhost:8080:

```
docker run -d -p 8080:8080 -e ONSHAPE_API_ACCESSKEY -e ONSHAPE_API_SECRETKEY configurator
```
