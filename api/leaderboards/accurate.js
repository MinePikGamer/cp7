const {GoogleSpreadsheet} = require('google-spreadsheet');
const sheet = new GoogleSpreadsheet('1ADIJvAkL0XHGBDhO7PP9aQOuK3mPIKB2cVPbshuBBHc'); // accurate leaderboard spreadsheet

let lastIndex = {"stars": 0, "coins": 0, "demons": 0}
let caches = [{"stars": null, "coins": null, "demons": null}, {"stars": null, "coins": null, "demons": null}] // 0 for JSON, 1 for GD

module.exports = async (app, req, res, post) => {

      if (app.offline || !app.sheetsKey || app.endpoint != "http://boomlings.com/database/") return res.send([])
      let gdMode = post || req.query.hasOwnProperty("gd")
      let cache = caches[gdMode ? 1 : 0]

      let type = req.query.type ? req.query.type.toLowerCase() : 'stars'
      if (type == "usercoins") type = "coins"
      if (!["stars", "coins", "demons"].includes(type)) type = "stars"
      if (lastIndex[type] + 600000 > Date.now() && cache[type]) return res.send(gdMode ? cache[type] : JSON.parse(cache[type]))   // 10 min cache

      sheet.useApiKey(app.sheetsKey)
      sheet.loadInfo().then(async () => {
      let tab = sheet.sheetsById[1555821000]
      await tab.loadCells('A2:C2')
      let leaderboard = JSON.parse(tab.getCell(1, type == "demons" ? 2 : type == "coins" ? 1 : 0).value)

      let gdFormatting = ""
      leaderboard.forEach(x => gdFormatting += `1:${x.username}:2:${x.playerID}:13:${x.coins}:17:${x.usercoins}:6:${x.rank}:9:1:10:10:11:14:14:0:15:0:16:${x.accountID}:3:${x.stars}:8:${x.cp}:46:${x.diamonds}:4:${x.demons}|`)
      caches[0][type] = JSON.stringify(leaderboard)
      caches[1][type] = gdFormatting
      lastIndex[type] = Date.now()
      return res.send(gdMode ? gdFormatting : leaderboard)

  })
}