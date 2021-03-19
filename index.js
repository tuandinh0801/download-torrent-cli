import minimist from 'minimist'
import WebTorrent from 'webtorrent'
import chalk from 'chalk'
import prettierBytes from 'prettier-bytes'
import moment from 'moment'

const argv = minimist(process.argv)
console.log("🚀 ~ file: index.js ~ line 8 ~ argv", argv)
const torrents = argv._.slice(2)
console.log("🚀 ~ file: index.js ~ line 10 ~ torrents", torrents)

let client, serving, drawInterval, server
const started = Date.now()

function drawTorrent(torrent) {
    process.stdout.write(Buffer.from('G1tIG1sySg==', 'base64')) // clear for drawing
    drawInterval = setInterval(draw, 1000)
    drawInterval.unref()

    function draw() {
        const unchoked = torrent.wires
            .filter(wire => !wire.peerChoking)

        const speed = torrent.downloadSpeed
        const estimate = torrent.timeRemaining
            ? moment.duration(torrent.timeRemaining / 1000, 'seconds').humanize()
            : 'N/A'

        const runtimeSeconds = Math.floor((Date.now() - started) / 1000)
        const runtime = runtimeSeconds > 300
            ? moment.duration(Math.floor((Date.now() - started) / 1000), 'seconds').humanize()
            : `${runtimeSeconds} seconds`
        const seeding = torrent.done

        console.clear()

        console.log(chalk`{green ${seeding ? 'Seeding' : 'Downloading'}: } {bold ${torrent.name}}`)

        if (seeding) console.log(chalk`{green Info hash: }${torrent.infoHash}`)

        console.log(chalk`{green Speed: }{bold ${prettierBytes(speed)
            }/s} {green Downloaded:} {bold ${prettierBytes(torrent.downloaded)
            }}/{bold ${prettierBytes(torrent.length)}} {green Uploaded:} {bold ${prettierBytes(torrent.uploaded)
            }}`)

        console.log(chalk`{green Running time:} {bold ${runtime
            }}  {green Time remaining:} {bold ${estimate
            }}  {green Peers:} {bold ${unchoked.length
            }/${torrent.numPeers
            }}`)
    }
}


const runDownload = (torrentId) => {
    client = new WebTorrent()

    client.on('error', console.error)

    client.add(torrentId, { path: process.cwd() },(torrent) => {
        drawTorrent(torrent)

        torrent.on('error', console.error)
        
        torrent.on('done', () => {
            torrent.destroy()
        })
    })

}

runDownload(torrents[0])