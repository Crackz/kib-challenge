
#### Architecture
##### System Design
<a href="https://raw.githubusercontent.com/Crackz/kib-challenge/refs/heads/master/diagrams/architecture.png">
<img src="https://raw.githubusercontent.com/Crackz/kib-challenge/refs/heads/master/diagrams/architecture.png" width="400" />
</a>


#### Assumptions: 
- Initial data is scrapped from tmdb and stored in postgres on app bootstrap (10k movies)
> Note: you can find the scrapper at "modules/movies/services/movies.scrapper.service.ts"
- TMDB configurations are loaded from environment variables (for simplicity)
- Genres are hardcoded into the code (for simplicity)
- Genres should be implemented as many to many relationship between `Movie` and `Genre` tables with a join table for filtering (ignored to save time)
- Average rating is an average of all ratings (not a weighted average)
- API KEY AUTH is implemented instead of JWT. 3 dummy users are created on app bootstrap with tokens `USER1_AUTH_TOKEN`, `USER2_AUTH_TOKEN`, `USER3_AUTH_TOKEN`
- Caching layer is implemented across all apis but in real world scenario I would implement custom one to fit the specific use case
- We should implement a worker to fetch the new data from tmdb periodically then push it to db and also reset the cache. note that might have a great impact on latency if we have a large data set. (not implemented)
> Note: you can take a look at [GameOfThree](https://github.com/Crackz/game-of-three/tree/main) project it's utilizing a message queue to push the jobs to the workers

---

#### Setup

- Install lts versions of nodejs, docker and docker compose
- Install task cli globally (it's similar to [Make](https://www.computerhope.com/unix/umake.htm) in linux)
    -  `npm install -g @go-task/cli`
- Run `task init`

> Note: if you don't like the fact that you need to setup "Task" to run the project, you can just look at the `Taskfile.yml` and execute the commands yourself.
--- 

#### Start the development
##### Run the server
- `task run`

--- 

#### Docs
> Make sure to run the server first
- [View Docs](http://localhost:3000/docs)

---

#### Tests

##### Run the unit tests 
<del>
- `task test:run`
</del>


##### Run the e2e tests
> Initialize the test containers first using `task test:e2e:init`
- `task test:e2e:run`
--- 


#### Migrations
> Migrations are run automatically on the development, testing environments

##### Create a new migration
- `task migration:create -- {migration-name}`

##### Run all migrations
- `task migration:run`

##### Revert the latest migration
- `task migration:revert`

---

#### Miscellaneous

You may notice there is a warning when install packages it's being caused by a dependency related to `jest` which is not a big deal since it will only affect the test environment. read further details [here](https://github.com/jestjs/jest/issues/15173)

