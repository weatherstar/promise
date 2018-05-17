function resolvePromise(promise, x, resolve, reject) {
  let then
  let thenCalledOrThrow = false

  if(promise === x) {
    return reject(new TypeError('Chaining cycle detected for promise!'))
  }

  if(x instanceof Promise) {
    if(x.status === 'pending') {
      x.then(function(value){
        resolvePromise(promise, value, resolve, reject)
      }, reject)
    } else {
      x.then(resolve, reject)
    }
  }

  if((x !== null) &&(typeof x === 'object' || typeof x === 'function')) {
    try {
      then = x.then
      if(typeof then === 'function') {
        then.call(x, function rs(y) {
          if(thenCalledOrThrow) return
          thenCalledOrThrow = true
          return resolvePromise(promise, y, resolve, reject)
        }, function rj(r) {
          if(thenCalledOrThrow) return
          thenCalledOrThrow = true
          return reject(r)
        })
      } else {
        resolve(x)
      }
    } catch(e) {
      if(thenCalledOrThrow) return
      thenCalledOrThrow = true
      return reject(e)
    }
  } else {
    resolve(x)
  }
}

class Promise {
  constructor(executor) {
    this.status = 'pending'
    this.data = undefined
    this.onResolvedCallback = []
    this.onRejectedCallback = []

    const reject = reason => {
      setTimeout(() => {
        if(this.status === 'pending') {
          this.status = 'rejected'
          this.data = reason
          this.onRejectedCallback.forEach(callback => callback(reason))
        }
      })
    }

    const resolve = value => {
      if(value instanceof Promise) {
        return value.then(resolve, reject)
      }
      setTimeout(() => {
        if(this.status === 'pending') {
          this.data = value
          this.status = 'resolved'
          this.onResolvedCallback.forEach(callback => callback(data))
        }
      })
    }

    try{
      executor(resolve, reject)
    } catch(e) {
      reject(e)
    }
  }

  then(onResolved, onRejected) {
    let promise

    onResolved = typeof onResolved === 'function' ? onResolved : function(v) { return v }
    onRejected = typeof onRejected === 'fucntion' ? onRejected : function(r) { return r }

    if(this.status === 'pending') {
      return promise = new Promise((resolve, reject) => {
        this.onResolvedCallback.push(() => {
          try{
            const x = onResolved(this.data)
            resolvePromise(promise, x, resolve, reject)
          }catch(e) {
            reject(e)
          }
        })
        this.onRejectedCallback.push(() => {
          try{
            const x = onRejected(this.data)
            resolvePromise(promise, x, resolve, reject)
          }catch(e) {
            reject(e)
          }
        })
      })
    } else if(this.status === 'resolved') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try{
            const x = onResolved(this.data)
            resolvePromise(promise, x, resolve, reject)
          }catch(e) {
            reject(e)
          }
        })
      })
    } else if(this.status === 'rejected') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try{
            const x = onResolved(this.data)
            resolvePromise(promise, x, resolve, reject)
          }catch(e) {
            reject(e)
          }
        })
      })
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }
}

export default Promise