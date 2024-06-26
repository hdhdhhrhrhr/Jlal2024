import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import {
    webp2png
} from '../lib/webp2mp4.js'
import {
    Sticker,
    StickerTypes
} from 'wa-sticker-formatter'
import {
    sticker
} from '../lib/sticker.js'
import axios from "axios"
let handler = async (m, {
    conn,
    args,
    text,
    usedPrefix,
    command
}) => {
    var stiker
    var out
    var urls
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (/video/g.test(mime)) {
        if ((q.msg || q).seconds > 11) return m.reply('10 ثوان كحد أقصى!!')
    }
    if (!/webp|image|video|gif|viewOnce/g.test(mime)) return m.reply(`قم بالاشارة للصورة التي تريدها\n\n${usedPrefix + command} و اكتب شيئا`)
    m.reply(wait)
    let img = await q.download?.()
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let name = await conn.getName(who)
    
    let pp = await conn.profilePictureUrl(m.sender, "image").catch(_ => logo)
    let temas
    if (command == "s1") {
        temas = "terang"
    }
    if (command == "s2") {
        temas = "gelap"
    }
    if (command == "s3") {
        temas = "random"
    }
    if (/webp/g.test(mime)) {
        urls = await QuotlyImg(await webp2png(img), name, pp, text, temas)
        out = await createSticker(false, urls, packname, name, 60)
    } else if (/image/g.test(mime)) {
        urls = await QuotlyImg(await uploadImage(img), name, pp, text, temas)
        out = await createSticker(false, urls, packname, name, 60)
    } else if (/video/g.test(mime)) {
        urls = await QuotlyImg(await uploadFile(img), name, pp, text, temas)
        out = await sticker(false, urls, packname, name, 60)
    } else if (/gif/g.test(mime)) {
        urls = await QuotlyImg(await uploadFile(img), name, pp, text, temas)
        out = await createSticker(false, urls, packname, name, 60)
    } else if (/viewOnce/g.test(mime)) {
        urls = await QuotlyImg(await uploadFile(img), name, pp, text, temas)
        out = await createSticker(false, urls, packname, name, 60)
    }

    stiker = out

    if (stiker) {
        m.reply(stiker)
    } else {
        throw eror
    }

}
handler.help = ["s1", "s2", "s3"]
handler.tags = ['sticker']
handler.command = ["s1", "s2", "s3"]

export default handler

async function QuotlyImg(a, b, c, d, tema) {
    var obj
    if (tema == "gelap") {
        obj = {
            "type": "quote",
            "format": "png",
            "backgroundColor": "#1b1429",
            "width": 512,
            "height": 768,
            "scale": 2,
            "messages": [{
                "entities": [],
                "media": {
                    "url": a
                },
                "avatar": true,
                "from": {
                    "id": 1,
                    "name": b,
                    "photo": {
                        "url": c
                    }
                },
                "text": d,
                "replyMessage": {}
            }]
        }
    }
    if (tema == "random") {
        obj = {
            "type": "quote",
            "format": "png",
            "backgroundColor": getRandomHexColor().toString(),
            "width": 512,
            "height": 768,
            "scale": 2,
            "messages": [{
                "entities": [],
                "media": {
                    "url": a
                },
                "avatar": true,
                "from": {
                    "id": 1,
                    "name": b,
                    "photo": {
                        "url": c
                    }
                },
                "text": d,
                "replyMessage": {}
            }]
        }
    }
    if (tema == "terang") {
        obj = {
            "type": "quote",
            "format": "png",
            "backgroundColor": "#FFFFFF",
            "width": 512,
            "height": 768,
            "scale": 2,
            "messages": [{
                "entities": [],
                "media": {
                    "url": a
                },
                "avatar": true,
                "from": {
                    "id": 1,
                    "name": b,
                    "photo": {
                        "url": c
                    }
                },
                "text": d,
                "replyMessage": {}
            }]
        }
    }
    let json
    try {
     json = await axios.post("https://bot.lyo.su/quote/generate", obj, {
        headers: {
            "Content-Type": "application/json"
        }
    })
    } catch (e) {
     json = await axios.post("https://quote-api.up.railway.app/generate", obj, {
        headers: {
            "Content-Type": "application/json"
        }
    })
    }
    let results = json.data.result.image
    const buffer = Buffer.from(results, "base64")
    return buffer
}

const isUrl = (text) => {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))
}

async function createSticker(img, url, packName, authorName, quality) {
    let stickerMetadata = {
        type: StickerTypes.FULL,
        pack: packName,
        author: authorName,
        quality
    }
    return (new Sticker(img ? img : url, stickerMetadata)).toBuffer()
}

async function createStickerV(img, url, packName, authorName, quality) {
    let stickerMetadata = {
        type: StickerTypes.CROPPED,
        pack: packName,
        author: authorName,
        quality
    }
    return (new Sticker(img ? img : url, stickerMetadata)).toBuffer()
}

function getRandomHexColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}
