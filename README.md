# Dashdot Factory

[![build](https://github.com/wappla/factory/actions/workflows/on_push_main.yml/badge.svg?branch=main)](https://github.com/wappla/factory/actions/workflows/on_push_main.yml)
[![codecov](https://codecov.io/gh/wappla/factory/branch/main/graph/badge.svg?token=DRM4BZC40Z)](https://codecov.io/gh/wappla/factory)

A simple factory implementation for any persistence.

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