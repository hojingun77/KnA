// codex/llm-prototype: main의 'kna-local-prototype' DB와 분리한다. 같은 브라우저에서 두 버전을 열어도 데이터가 섞이지 않는다.
const DATABASE_NAME = 'kna-llm-prototype';
const VERSION = 3;
const STORES = ['users', 'settings', 'questions', 'answers', 'attachments', 'pointLedger', 'pointSnapshots', 'blocks', 'notifications', 'translations'];

let databasePromise;

export function openDatabase() {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        for (const name of STORES) {
          if (!database.objectStoreNames.contains(name)) database.createObjectStore(name, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).catch((error) => {
      databasePromise = undefined;
      throw error;
    });
  }
  return databasePromise;
}

export async function inTransaction(storeNames, mode, callback) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeNames, mode);
    let result;
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error ?? new Error('Database transaction aborted'));
    try { result = callback(transaction); }
    catch (error) { transaction.abort(); reject(error); }
  });
}

export async function readRecord(store, id) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(store).objectStore(store).get(id);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function readAll(store) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(store).objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function writeRecord(store, record) {
  await inTransaction([store], 'readwrite', (tx) => tx.objectStore(store).put(record));
  return record;
}
