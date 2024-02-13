# Twitter clone
This project is a Twitter clone backend built with Fastify TypeScript. It provides functionality similar to Twitter, including user authentication, tweet storage, follow relationships, and timeline generation. The backend architecture is modular, consisting of separate plugins for each feature, such as user management, tweet handling, follow management, and timeline generation.

## Features

- **User Management**: Handles user authentication, registration, login, profile retrieval, and search functionalities.
- **Tweet Handling**: Manages storage and retrieval of tweets, including adding tweets, fetching tweets by user ID, retrieving tweets tagged with specific users, and fetching all tweets.
- **Follow Management**: Manages user follow relationships using Redis, including following, unfollowing, and retrieving followers and following users.
- **Timeline Generation**: Generates a user's timeline by fetching tweets from followed users and tagged tweets, providing a personalized view of recent tweets.

## Installation

To run this project locally, follow these steps:

1. Clone the repository to your local machine.
2. Install dependencies using `npm install`.
3. Build the project using `npm run build`.
4. Start the server using `npm run start`.

## Usage

Once the server is running, you can interact with the API endpoints provided by each plugin to perform user authentication, tweet management, follow actions, and timeline retrieval.

### Architecture

The backend is divided into separate modules, or plugins, each responsible for a specific aspect of functionality:
- *user*: Manages user authentication and user database operations.
- *tweet*:  Handles storage and retrieval of tweets along with tagging and notifications
- *follow*: Manages storage related to user follows using radius
- *timeline*: Provides functionality for generating the user's homepage timeline.

Each of the last three modules includes a preHandler hook. This hook is utilized to identify the user who made the request before proceeding with the respective operation.

Each plugin has almost the same structure:
- `index.js` This file serves as the binding for Fastify, setting up routes and handling requests.
- `service.js` Contains the core business logic of the plugin, handling operations related to its specific functionality.
- `model.js` Defines the data models and schemas used by the plugin for storing and retrieving data.

### User plugin

#### User Model
- `User` model represents the structure of user data stored in the database.
- It extends the `Model` class provided by Sequelize, defining attributes like `id`, `username`, `createdAt`, `password`, and `email`.
- The `initialize` method configures the model's schema and initializes it with Sequelize.

#### User Service
- `UserService` contains methods to interact with the `User` model and perform various user-related operations.
- It initializes the `User` model with the provided Sequelize instance in its constructor.
- `register(username, email, password)`: Registers a new user with the provided username, email, and password. Handles errors related to unique constraints on username.
- `findByUsername(username)`: Retrieves a user by their username, excluding the password from the returned data.
- `findByEmail(email)`: Retrieves a user by their email, excluding the password from the returned data.
- `login(usernameOrEmail, password)`: Authenticates a user by their username or email and password. Uses bcrypt to compare hashed passwords.
- `getProfile(id)`: Retrieves a user's profile by their ID, excluding the password from the returned data.
- `search(searchString)`: Searches for users matching a given search string in their username or email. Returns a limited number of results.
- `findUsersByUsername(usernames)`: Batch operation to find multiple users by their usernames, handling errors and returning found users, their IDs, and unfound usernames.

#### Error Handling
- Error handling in `UserService` includes catching Sequelize unique constraint errors for username duplication and rethrowing custom errors.
- The `errors` module contains predefined error messages used for consistent error handling.

### Tweet plugin

#### Tweet Model
- `Tweet` model represents the structure of tweet data stored in the database.
- It extends the `Model` class provided by Sequelize, defining attributes like `id`, `userId`, `content`, `createdAt`, and `tags`.
- The `initialize` method configures the model's schema and initializes it with Sequelize.

#### Tweet Service
- `TweetService` contains methods to interact with the `Tweet` model and perform various tweet-related operations.
- It initializes the `Tweet` model with the provided Sequelize instance in its constructor.
- `fetchTweets(userId)`: Retrieves tweets by user ID, ordered by creation date in descending order.
- `addTweet(user, content, tags)`: Adds a new tweet with the provided user ID, content, and tags.
- `fetchTweetsByTaggedUser(taggedUserId)`: Retrieves tweets tagged with a specific user ID, ordered by creation date in descending order.
- `fetchAllTweets()`: Retrieves all tweets ordered by creation date in descending order.

#### Sequelize Operators
- The `Op` object imported from Sequelize is used to construct complex query conditions, such as partial string matching (`Op.like`) in `fetchTweetsByTaggedUser`.

### Timeline plugin

#### Overview
- `TimelineService` is responsible for generating a user's timeline and retrieving public feed tweets.
- It interacts with the `FollowService` and `TweetService` to fetch relevant data.

#### Constructor
- The constructor initializes `followClient` and `tweetClient` instances, which are injected into the service.
- These clients provide access to follow-related functionalities and tweet-related functionalities, respectively.

#### Methods
1. `getTimeline(userId: string)`: Retrieves the timeline of a user based on their `userId`.
   - Retrieves the list of users that the specified user follows using `getFollowing` method from the `FollowService`.
   - Appends the specified user's own `userId` to the list of followers.
   - Fetches tweets from the followers and tagged tweets using `fetchTweets` and `fetchTweetsByTaggedUser` methods from the `TweetService`.
   - Combines and sorts all tweets based on their creation date in descending order.
   - Returns the sorted timeline.

2. `getPublicFeed()`: Retrieves the public feed containing all tweets.
   - Utilizes the `fetchAllTweets` method from the `TweetService` to fetch all tweets.
   - Returns the list of tweets representing the public feed.

### Follow plugin

#### Overview
- `FollowService` is responsible for managing user followers and following relationships using Redis.
- It provides methods for following, unfollowing, and retrieving followers and following users.

#### `execRedis` Function
- `execRedis` is a utility function used internally by `FollowService` to execute Redis commands asynchronously.
- It takes the Fastify instance, Redis method, and arguments as parameters and returns a Promise.
- Inside the Promise, it invokes the specified Redis method on the Fastify Redis instance with the provided arguments.

#### Constructor
- The constructor initializes the `fastify` instance, which is used to interact with Redis.

#### Methods
1. `follow(meId: string, otherId: string)`: Adds the `otherId` user to the list of users followed by the `meId` user and vice versa.
   - Utilizes `execRedis` to asynchronously execute Redis `zadd` commands for both the `following` and `followers` sets.

2. `unfollow(meId: string, otherId: string)`: Removes the `otherId` user from the list of users followed by the `meId` user and vice versa.
   - Utilizes `execRedis` to asynchronously execute Redis `zrem` commands for both the `following` and `followers` sets.

3. `getFollowing(meId: string)`: Retrieves the list of users followed by the specified user (`meId`).
   - Utilizes `execRedis` to asynchronously execute Redis `zrange` command on the `following` set.

4. `getFollowers(otherId: string)`: Retrieves the list of users who are followers of the specified user (`otherId`).
   - Utilizes `execRedis` to asynchronously execute Redis `zrange` command on the `followers` set.


## Technologies Used

- Node.js
- TypeScript
- Fastify
- Sequelize
- Redis
- 

## TODO

- [ ] Unit tests
