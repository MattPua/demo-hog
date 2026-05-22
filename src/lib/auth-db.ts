import { getCatalogDatabase } from '~/lib/catalog-db'
import { readFromStore, writeInTransaction } from '~/lib/idb'

/** Demo-only: passwords stored in plain text in IndexedDB. Never use in production. */
export type User = {
  id: string
  email: string
  password: string
  name: string
  createdAt: string
}

const USERS_STORE = 'users'

const DEMO_USERS: Array<Pick<User, 'email' | 'password' | 'name'> & { id: string }> =
  [
    {
      id: 'user_demo-shopper',
      email: 'demo@quill.co',
      password: 'hedgehog',
      name: 'Demo Shopper',
    },
    {
      id: 'user_admin',
      email: 'admin@quill.co',
      password: 'admin123',
      name: 'Store Admin',
    },
  ]

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function ensureAuthSeeded(): Promise<void> {
  const db = await getCatalogDatabase()
  const count = await readFromStore(db, USERS_STORE, (store) => store.count())
  if (count > 0) return

  await writeInTransaction(db, USERS_STORE, (tx) => {
    const store = tx.objectStore(USERS_STORE)
    for (const user of DEMO_USERS) {
      store.put({
        ...user,
        email: normalizeEmail(user.email),
        createdAt: new Date().toISOString(),
      })
    }
  })
}

export async function findUserByEmail(
  email: string,
): Promise<User | undefined> {
  const db = await getCatalogDatabase()
  return readFromStore(db, USERS_STORE, (store) => {
    const index = store.index('email')
    return index.get(normalizeEmail(email))
  })
}

export async function getUserById(id: string): Promise<User | undefined> {
  const db = await getCatalogDatabase()
  return readFromStore(db, USERS_STORE, (store) => store.get(id))
}

export async function createUser(input: {
  email: string
  password: string
  name: string
}): Promise<User> {
  const email = normalizeEmail(input.email)
  const existing = await findUserByEmail(email)
  if (existing) {
    throw new Error('An account with this email already exists.')
  }

  const user: User = {
    id: `user_${crypto.randomUUID()}`,
    email,
    password: input.password,
    name: input.name.trim() || email.split('@')[0],
    createdAt: new Date().toISOString(),
  }

  const db = await getCatalogDatabase()
  await writeInTransaction(db, USERS_STORE, (tx) => {
    tx.objectStore(USERS_STORE).put(user)
  })

  return user
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<User | null> {
  const user = await findUserByEmail(email)
  if (!user || user.password !== password) return null
  return user
}

export async function updateUserProfile(
  id: string,
  updates: { name: string },
): Promise<User> {
  const user = await getUserById(id)
  if (!user) {
    throw new Error('User not found.')
  }

  const name = updates.name.trim()
  if (!name) {
    throw new Error('Name is required.')
  }

  const updated: User = { ...user, name }
  const db = await getCatalogDatabase()
  await writeInTransaction(db, USERS_STORE, (tx) => {
    tx.objectStore(USERS_STORE).put(updated)
  })

  return updated
}
