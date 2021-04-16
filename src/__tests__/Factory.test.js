/* eslint-disable max-classes-per-file */
import faker from 'faker'
import Factory from '../Factory'

class Database {
    constructor(collections) {
        collections.forEach((collection) => {
            this[collection] = new Map()
        })
    }

    insertMany(collection, records) {
        return records.map((record) => this.insert(collection, record))
    }

    insert(collection, record) {
        const id = faker.unique(faker.datatype.uuid)
        const recordToPersist = { id, ...record }
        this[collection].set(id, recordToPersist)
        return this[collection].get(id)
    }
}

test('if factories return correct instances and persist correctly.', async () => {
    const postsCollection = 'posts'
    const usersCollection = 'users'
    const database = new Database([
        postsCollection,
        usersCollection
    ])

    class MyFactory extends Factory {
        static persist(records) {
            return database.insertMany(this.collection, records)
        }
    }

    const userName = faker.name.firstName()
    const userEmail = faker.internet.exampleEmail()
    const postTitle = faker.name.title()
    const postContent = faker.lorem.words()

    class PostFactory extends MyFactory {
        static get collection() {
            return postsCollection
        }

        static make() {
            return {
                title: postTitle,
                content: postContent,
            }
        }
    }

    class UserFactory extends MyFactory {
        static get collection() {
            return usersCollection
        }

        static make() {
            return {
                name: userName,
                email: userEmail,
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
    const [post] = await user.createPosts(1)
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
