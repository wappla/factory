# Dashdot Graphql Server

A simple factory implementation for any persistance.

## Usage

Inside your Node project directory, run the following:

```sh
npm i --save @dashdot/factory
```

Or with Yarn:

```sh
yarn add @dashdot/factory
```

### API

```javascript
import faker from 'faker'
import Factory from '@dashdot/factory'
import { Post, User } from './models'

class MongoFactory extends Factory {
    static async persist(records) {
        const docs = await this.Model.insertMany(records)
        return docs.map((doc) => doc.toObject({
            virtuals: true,
            getters: true
        }))
    }
}

class PostFactory extends MongoFactory {
    static get Model() {
        return Post
    }

    static make() {
        return {
            title: faker.name.title(),
            content: faker.lorem.paragraphs(),
        }
    }
}

class UserFactory extends MongoFactory {
    static get Model() {
        return User
    }

    static make() {
        return {
            name: faker.name.firstName(),
            email: faker.unique(faker.internet.email),
        }
    }

    createPosts(records, states, data) {
        return PostFactory.create(records, states, {
            ...data,
            user: this.id,
        })
    }
}

const [user] = await UserFactory.create(1)
const posts = await user.createPosts(4)
```