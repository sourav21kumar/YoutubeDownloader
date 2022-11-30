const socketIO = require('socket.io')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

class SocketService {
    constructor() {
        this.socket = null
        this.vidDetails = {
            embedURL: '',
            title: '',
            resolution: '',
            filePath: '',
            id: ''
        }
    }

    attachServer(server) {
        if (!server) {
            throw new Error("Server not found...");
        }

        const io = socketIO(server); // creating a server instance
        console.log("Created socket server. Waiting for client connection.");
        // "connection" event happens when any client connects to this io instance.
        io.on("connection", socket => {
            console.log("Client connected to socket.", socket.id);

            this.socket = socket;
            this.socket.on("disconnect", () => {
                console.log("Disconnected Socket: ", socket.id)
            });

            // this.socket.on('custom-event',(string)=>{
            //   console.log(string)
            console.log('Ready to respond...')
            this.socket.on('input', (input_data) => {
                // console.log(url)
                // console.log(`Responded to the input event ${url}`)
                var inpData = JSON.parse(input_data)
                // console.log(inpData.url)
                // console.log(inpData.eventType)
                this.getEmbedUrl(inpData.url, inpData.eventType)
                // console.log('Responded Successfully')
            })

            this.socket.on('input_download', (input_data_download) => {
                let inp_down_data = JSON.parse(input_data_download)
                this.scriptDownload(inp_down_data.url, inp_down_data.eventType, inp_down_data.resolution, inp_down_data.id)
            })

        })
    }

    getEmbedUrl(url, eventType) {
        const child = spawn('python', ['main.py', `${url}`, `${eventType}`])
        child.stdout.on('data', (data) => {
            console.log(data.toString())
            this.vidDetails.embedURL = data.toString()   //UPDATE THE EMBED URL
            this.socket.emit('output', data.toString())
        })
        child.stderr.on('data', (data) => {
            console.log(data.toString())
            // this.socket.emit('output',data.toString())
        })
        child.on('error', (err) => {
            console.log(err)
            // this.socket.emit('error',err.toString())
        })
        child.on('close', (code) => {
            console.log(`Get Embed Url Child-Process Exitted with ${code}`)
        })
    }

    scriptDownload(url, eventType, resolution, _id) {
        try{
            if(!fs.existsSync(path.join(__dirname,'temp')))
            {
                fs.mkdirSync(path.join(__dirname,'temp'))
            }
        }catch(error){
            console.log(error)
        }
        const download = spawn('python', ['main.py', `${url}`, `${eventType}`, `${resolution}`, `${_id}`])
        download.stdout.on('data', (data) => {
            console.log(data.toString())
            this.vidDetails.title = data.toString()  // UPDATE THE VIDEO TITLE
            this.vidDetails.resolution = resolution  // UPDATE THE RESOLUTION
            let extension = '' //  default extension
            if(resolution == 'audio-Only')
            {
                extension = '.mp3' // that means resolution = 'audio-only is selected
            }
            else{
                extension = '.mp4'
            }
            let filename = `${_id}` + `${extension}`
            this.vidDetails.filePath = path.join(__dirname, 'temp', `${filename}`)
            this.vidDetails.id = _id
            // this.socket.emit('output_download',data.toString())

           
            this.socket.emit('output_download', this.vidDetails)
          
        })
        download.stderr.on('data', (data) => {
            console.log(data.toString())

        })
        download.on('error', (err) => {
            console.log(err)
        })
        download.on('close', (code) => {
            console.log(`Download Child-Process Exitted with ${code}`)
        })
    }

}

module.exports = SocketService;