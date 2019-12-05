const l = console.log
const stdout = process.stdout
const stdin = process.stdin
const stderr = process.stderr
const readline = require("readline")
const EventEmitters = require("events")

class Password /*extends EventEmitters*/ {

    constructor(opts = {
        ask: "password:",
        passLength: 7
    }) {
        //super()
        const { ask, passLength } = opts
        this.ask = ask
        this.resolve = null
        this.reject = null
        this.passLength = passLength
        this.input = ''
        this.stdin = stdin
        this.self = this
    }

    start() {
        return new Promise((resolve, reject) => {
            stdout.write(this.ask)
            this.stdin.setRawMode(true)
            this.stdin.resume()
            this.stdin.setEncoding('utf-8')
            this.reject = reject
            this.resolve = resolve
            this.stdin.on("data", this.pn(this))
        })
    }

    pn(me) {
        return (data, promise) => {
            const c = data
            const self = me
            switch (c) {
                case '\u0004': // Ctrl-d
                case '\r':
                case '\n':
                    return self.enter()
                case '\u0003': // Ctrl-c
                    return self.ctrlc()
                default:
                    // backspace
                    // l(c.charCodeAt(0))
                    // 127 was here
                    if (c.charCodeAt(0) === 8) return this.backspace()
                    else return self.newchar(c)
            }
        }
    }

    enter() {
        stdin.removeListener('data', this.pn)
        l("\nYour password is: " + this.input)
        stdin.setRawMode(false)
        stdin.pause()
        this.resolve(this.input)
        this.input = ""
    }

    ctrlc() {
        stdin.removeListener('data', this.pn)
        stdin.setRawMode(false)
        stdin.pause()
    }

    newchar(c) {
        if (this.input.length != this.passLength) {
            this.input += c
            stdout.write("*")
        }
    }

    backspace() {
        const pslen = this.ask.length
        readline.cursorTo(stdout, (pslen + this.input.length) - 1, 0)
        stdout.write(" ")
        readline.moveCursor(stdout, -1, 0)
        const ESC = "\u001B["
            //stdout.write(ESC + 1 + "D")
            //stdout.write(ESC + "2K")
            //readline.clearLine(stdout, )
            // l("backspace")
        this.input = this.input.slice(0, this.input.length - 1)
            // l(input)
    }

}

const pass = new Password({ ask: "emm your password: ", passLength: 10 })
pass.start().then(val => {
    l("Deal with it -> " + val)
})

//l("continue executing")