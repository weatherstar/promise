class Promise {
  constructor(executor) {
    this.status = 'pending'
    this.data = undefined
    this.onResolvedCallback = []
    this.onRejectedCallback = []

    const resolve = value => {
      this.data = value
      this.status = 'resolved'
      this.onResolvedCallback.forEach(callback => callback(data))
    }
  
    const reject = reason => {
      if(this.status === 'pending') {
        this.status = 'rejected'
        this.data = reason
        this.onRejectedCallback.forEach(callback => callback(reason))
      }
    }

    try{
      executor(resolve, reject)
    } catch(e) {
      reject(e)
    }
  }

  then(onResolved, onRejected) {
    onResolved = typeof onResolved === 'function' ? onResolved : function(v) { return v }
    onRejected = typeof onRejected === 'fucntion' ? onRejected : function(r) { return r }

    if(this.status === 'pending') {
      return new Promise((resolve, reject) => {
        this.onResolvedCallback.push(() => {
          try{
            const x = onResolved(this.data)
            if(x instanceof Promise){
              x.then(resolve, reject)
            } else{
              resolve(x)
            }
          }catch(e) {
            reject(e)
          }
        })
        this.onRejectedCallback.push(() => {
          try{
            const x = onRejected(this.data)
            if(x instanceof Promise){
              x.then(resolve, reject)
            } else{
              resolve(x)
            }
          }catch(e) {
            reject(e)
          }
        })
      })
    } else if(this.status === 'resolved') {
      return new Promise((resolve, reject) => {
        try{
          const x = onResolved(this.data)
          if(x instanceof Promise){
            x.then(resolve, reject)
          } else{
            resolve(x)
          }
        }catch(e) {
          reject(e)
        }
      })
    } else if(this.status === 'rejected') {
      return new Promise((resolve, reject) => {
        try{
          const x = onResolved(this.data)
          if(x instanceof Promise){
            x.then(resolve, reject)
          } else{
            resolve(x)
          }
        }catch(e) {
          reject(e)
        }
      })
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }
}