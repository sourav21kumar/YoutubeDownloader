const socket = io()
// here i am not specifying a url to connect to because socket.io-client by default tries to connect to the host server

const btn = document.getElementById('btn')
console.log(btn)
btn.addEventListener('click', (e) => {
    e.preventDefault() // removing the default behaviour of reloading the page
    // const rootNode = document.querySelector('.field')
    // const input = rootNode.children[1]
    let preloader = document.querySelector('.loader')
    // console.log(preloader)
    btn.style.visibility = 'hidden'
    preloader.style.display = 'block'
    preloader.style.visibility = 'visible'

    const input = document.getElementById('inp')
    console.log(input)
    const url = input.value
    console.log(url)
    let input_data = JSON.stringify({ url: `${url}`, eventType: 'Embed Url' })

    socket.emit('input', input_data)
    socket.on('output', (data) => {
        console.log(data)
        const div_embed = document.querySelector('.embed') // container fo embeding the iframe tag for YouTube Videos
        const iframe_div = div_embed.children[0]
        iframe = iframe_div.children[0]
        iframe.setAttribute('src', data)
        iframe_div.classList.add('iframeInfo')
        iframe_div.appendChild(iframe)
        // btn.style.visibility = 'hidden'
        preloader.style.display = 'none'
        preloader.style.visibility = 'hidden'

        // btn.style.display = 'none'
        div_embed.style.display = 'block'
        div_embed.style.visibility = 'visible'
        // iframe.style.visibility = 'visible'  
        const rescontainer = document.querySelector('.rescontainer')
        rescontainer.style.display = 'flex'
        const downloadBtn = document.getElementById('download')
        console.log(downloadBtn)
        downloadBtn.addEventListener('click', async(e) => {
            e.preventDefault()

            const div_embed = document.querySelector('.embed')
            const rescontainer = document.querySelector('.rescontainer')

            div_embed.style.display = 'none'
            rescontainer.style.display = 'none'

            let preloader = document.querySelector('.loader')
            preloader.innerHTML = 'Download in progress...'
            preloader.style.display = 'block'
            preloader.style.visibility = 'visible'
            preloader.style.fontSize = '14px'
            const res_input = document.getElementById('v')
            console.log(res_input)
            console.log(url)
            fetch('/application/id',{
                method:'GET',
                headers: { 'Content-Type': 'application/json' }
            })
            .then((response)=> response.json())
            .then((data)=>{
                let input_data_download = JSON.stringify({ url: `${url}`, eventType: 'Download', resolution: `${res_input.value}`, id:data.id })
                socket.emit('input_download', input_data_download)
            })
            socket.on('output_download', async (data) => {
                // this.vidDetails = {
                //     embedURL:'',
                //     title: '',
                //     resolution:''
                // }
                // let downloadData = {
                //     embedURL: data.embedURL,
                //     title: data.title,
                //     resolution : data.resolution
                // }
                console.log(data)
                console.log(data.embedURL)
                try{
                    const res = await fetch('/application/download',{
                        method:'POST',
                        body: JSON.stringify(data),
                        headers: { 'Content-Type': 'application/json' }
                    })
                    const saveddata = await res.json()
                    console.log(saveddata)
                    console.log(saveddata.filename)
                    let alert = document.querySelector('.alert')
                    // location.assign(`http://localhost:3000/application/download/${saveddata.filename}`)
                    // location.assign('/')
                    fetch(`/application/download/${saveddata.filename}`,{
                        method:'GET'
                    }).then(response=>{
                        console.log(response)
                        preloader.style.display = 'none'
                        preloader.style.visibility = 'hidden'
                        btn.style.visibility = 'visible'
                        alert.style.display = 'block'
                        alert.style.visibility = 'visible'
                    })
                }catch(error){
                    console.log(error)
                }
            })

        })

    })
    socket.on('error', (err) => {
        console.log(err)
    })
})

// FEATURES TO ADD
// 1. DOWNLOAD FEATURE
// 2. LOGIN SIGNUP PAGE    --- Completed
// 3. USER AUTHENTICATION
// 4. DASHBOARD FOR DOWNLOADED VIDEO HISTORY
// 5. FOOTER
// 6. BUY ME A COFFEE
// 7. REFER ME FACILITY
