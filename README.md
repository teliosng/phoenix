# MediaBucket

Main backend for MediaBucket project.

## ERD

![ERD](/misc/images/erd.png)

## System architecture

![System architecture](/misc/images/archi.png)

## Requirements

- `node >= 6.2.2`
- `mysql` (https://gist.github.com/nrollr/a8d156206fa1e53c6cd6)
- `memcached` (http://www.hacksparrow.com/install-memcached-on-mac-os-x.html)

## Setup

- Make sure MySQL is running (`mysql.server start`)
- Make sure Memcached is running (`memcached &`)
- Log into MySQL (`mysql -u root`)
- Create the databases : `CREATE DATABASE media_bucket;` and `CREATE DATABASE media_bucket_test;`
- Clone this project
- In the project's root, run `npm i`
- Run `npm run migrate -- --env test`
- Run `npm run migrate`
- Run `node servers/api`
- In another tab run `node servers/auth`

## Branches, commits, versions and deployments

#### Commit messages

**Template:** `:emoji: My commit message`

Commit Type | Emoji
----------  | -------------
Initial Commit | :tada: `:tada:`
Version Tag | :bookmark: `:bookmark:`
New Feature | :sparkles: `:sparkles:`
Bugfix | :bug: `:bug:`
Metadata | :card_index: `:card_index:`
Refactoring | :package: `:package:`
Documentation | :books: `:books:`
Performance | :racehorse: `:racehorse:`
Cosmetic | :lipstick: `:lipstick:`
Tooling | :wrench: `:wrench:`
Tests | :rotating_light: `:rotating_light:`
Deprecation | :poop: `:poop:`
Work In Progress (WIP) | :construction: `:construction:`
Other | [Be creative](http://www.emoji-cheat-sheet.com/)

#### Main branches

**Note:** Main branches are protected and cannot be pushed directly.

- `dev`: local branch, the go to branch for developments
- `release`: reflects what's deployed on the staging environment
- `master`: production branch

#### Feature branches

To start developing a new feature/task/bug :

- `git checkout dev`
- `git pull origin dev`
- `git checkout -b my_branch`

When your code is ready for review, just push and open a pull request on `dev`.

#### Versions

This project is versioned using the standard `major.medium.minor`.

- `minor`: bug fixes only, no new feature
- `medium`: new features
- `major`: breaking changes

Each merge into `master` must be tagged before it is deployed.

`git tag -a 0.4.2 -m '0.4.2' && push origin master --tags`

#### Deployments

Branches are hierarchically organized and need to remain in sync. As a result :
- anything that's on `master` must also be on `dev` and `release`
- anything that's on `release` must also be on `dev`

To deploy on staging, merge `dev` into `release`.
To deploy in production, merge `release` into `master`, version/tag `master`.

Finally run `./run tools/deploy --env staging` and monitor the deployment until completion.


#### HotFixes
 TBD.

## Servers

This project exposes 3 servers :
- `api`: main backend, contains all business logic
- `auth`: contains everything related to authentication, and particularly the OAuth@2.0 server
- `example`: simple example server to test OAuth procedures

## Migrations

SQL migrations are completed separated from the code and managed in a standalone way.

#### Creating a new migration

`./run tools/db/create-migration --name the-name-of-your-migration`

This will create a new file in `migrations/` with a predefined template.

#### Running migrations

`./run tools/db/migrate`

## Resources

- API Style Guide : https://github.com/phoenixmd/media-bucket-backend/wiki/API-Style-Guide
- API Documentation : https://github.com/phoenixmd/media-bucket-backend/wiki/API-Documentation