/**
 * IndexedDB utility for persisting file attachments
 * Files cannot be stored in localStorage, so we use IndexedDB instead
 */

const DB_NAME = 'FormFilesDB'
const DB_VERSION = 1
const STORE_NAME = 'files'

interface StoredFile {
  id: string
  formKey: string
  file: File
  timestamp: number
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('formKey', 'formKey', { unique: false })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })

  return dbPromise
}

/**
 * Save files for a specific form
 */
export async function saveFiles(formKey: string, files: File[]): Promise<void> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    // First, delete existing files for this form
    await clearFiles(formKey)

    // Then save new files
    const promises = files.map((file, index) => {
      const storedFile: StoredFile = {
        id: `${formKey}_${index}_${Date.now()}`,
        formKey,
        file,
        timestamp: Date.now()
      }
      return new Promise<void>((resolve, reject) => {
        const request = store.add(storedFile)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    })

    await Promise.all(promises)
  } catch (error) {
    console.error('Error saving files to IndexedDB:', error)
  }
}

/**
 * Retrieve files for a specific form
 */
export async function getFiles(formKey: string): Promise<File[]> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('formKey')

    return new Promise((resolve, reject) => {
      const request = index.getAll(formKey)
      
      request.onsuccess = () => {
        const storedFiles = request.result as StoredFile[]
        const files = storedFiles.map(sf => sf.file)
        resolve(files)
      }
      
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error retrieving files from IndexedDB:', error)
    return []
  }
}

/**
 * Clear files for a specific form
 */
export async function clearFiles(formKey: string): Promise<void> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('formKey')

    return new Promise((resolve, reject) => {
      const request = index.getAllKeys(formKey)
      
      request.onsuccess = () => {
        const keys = request.result
        const deletePromises = keys.map(key => {
          return new Promise<void>((res, rej) => {
            const deleteRequest = store.delete(key)
            deleteRequest.onsuccess = () => res()
            deleteRequest.onerror = () => rej(deleteRequest.error)
          })
        })
        
        Promise.all(deletePromises).then(() => resolve()).catch(reject)
      }
      
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error clearing files from IndexedDB:', error)
  }
}

/**
 * Clear old files (older than 7 days) to prevent database bloat
 */
export async function clearOldFiles(): Promise<void> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('timestamp')

    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)

    return new Promise((resolve, reject) => {
      const request = index.openCursor()
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const storedFile = cursor.value as StoredFile
          if (storedFile.timestamp < sevenDaysAgo) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          resolve()
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error clearing old files from IndexedDB:', error)
  }
}

// Clear old files on module load
if (typeof window !== 'undefined') {
  clearOldFiles().catch(console.error)
}
