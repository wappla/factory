/* eslint-disable max-classes-per-file */
import { describe, expect, test } from '@jest/globals';
import { faker } from '@faker-js/faker'
import Factory from '../Factory'

type User = {
    id: string,
    name: string,
    email: string,
}

type Post = {
    id: string,
    title: string,
    content: string,
}

class Database {
    [key: string]: any

    constructor(collections) {
        collections.forEach((collection) => {
            this[collection] = new Map()
        })
    }

    insertMany(collection, records) {
        return records.map((record) => this.insert(collection, record))
    }

    insert(collection, record) {
        const id = faker.helpers.unique(faker.datatype.uuid)
        const recordToPersist = { id, ...record }
        this[collection].set(id, recordToPersist)
        const x = this[collection].get(id)
        return { ...x }
    }
}

test.skip('if factories return correct instances and persist correctly.', async () => {
    const postsCollection = 'posts'
    const usersCollection = 'users'
    const database = new Database([
        postsCollection,
        usersCollection
    ])

    class DbFactory extends Factory {
        static collection: string

        static persist(records) {
            return database.insertMany(this.collection, records)
        }
    }

    const userName = faker.name.firstName()
    const userEmail = faker.internet.exampleEmail()
    const postTitle = faker.name.middleName()
    const postContent = faker.lorem.words()

    class PostFactory extends DbFactory implements Post {
        static collection: string = postsCollection
        id: string
        title: string
        content: string

        static async make() {
            return {
                title: postTitle,
                content: postContent,
            }
        }
    }

    class UserFactory extends DbFactory implements User {
        static collection: string = usersCollection
        id: string
        name: string
        email: string

        static async make() {
            return {
                name: userName,
                email: userEmail,
            }
        }

        createPosts(records, states = [], data = {}) {
            return PostFactory.create(records, states, {
                ...data,
                user: this.id,
            })
        }
    }

    const [user] = await UserFactory.create(1)
    const [post] = await user.createPosts(1)
    console.log(user)
    expect(user.name).toEqual(userName)
    expect(user.email).toEqual(userEmail)
    expect(post.title).toEqual(postTitle)
    expect(post.content).toEqual(postContent)
    const dbUser = database.users.get(user.id)
    const dbPost = database.posts.get(post.id)
    expect(dbUser.name).toEqual(user.name)
    expect(dbUser.email).toEqual(user.email)
    expect(dbPost.title).toEqual(post.title)
    expect(dbPost.content).toEqual(post.content)
})

test('if factories throws error when make method is not implemented.', async () => {
    class MyFactory extends Factory {}
    await expect(MyFactory.create()).rejects.toThrow()
})

test('if factories throws error when persist method is not implemented.', async () => {
    class MyFactory extends Factory {
        static async make() {
            return {}
        }
    }
    await expect(MyFactory.create()).rejects.toThrow()
})
