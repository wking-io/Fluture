# Contribution guide

## Making a contribution

* Fork and clone the project
* Commit changes to a branch named after the work that was done
* Make sure the tests pass locally (should happen automatically when you commit)
* Create a pull request

## NPM Scripts

* `npm run clean`: Remove build files and error logs
* `npm run lint`: Lint the source code
* `npm run lint:readme`: Lint the readme for broken internal links
* `npm run release major`: Release a new major version
* `npm run release minor`: Release a new minor version
* `npm run release patch`: Release a new patch version
* `npm run test`: Test everything and sends coverage reports to codecov
* `npm run test:all`: Test everything
* `npm run test:coverage`: Run unit tests and generate a code coverage report
* `npm run test:mem`: Run memory test
* `npm run test:opt`: Run optimization test
* `npm run test:unit`: Run unit tests
* `npm run toc`: Generate a table of contents for the README
