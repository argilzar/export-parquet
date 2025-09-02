export const readPipe: () => Promise<string | undefined> = () => new Promise(resolve => {
    const stdin = process.openStdin()
    stdin.setEncoding("utf8")

    let data = ''
    stdin.on('data', chunk => {
      data += chunk
    })

    stdin.on('end', () => {
      resolve(data)
    })

    if (stdin.isTTY) {
      resolve('')
    }
  });