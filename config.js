module.exports = {
  players: {
    teddy: 'https://www.op.gg/summoner/userName=%EC%8B%9D%ED%98%9C%EC%B6%A9',
    tajan: 'https://www.op.gg/summoner/userName=%ED%83%80+%EC%9E%94',
    faker: 'https://www.op.gg/summoner/userName=Hide+on+bush'
  },
  replacer: {
    radsFrom: /set RADS_PATH="C:\\Riot Games\\League of Legends"/g,
    radsTo: `SET RADS_PATH=C:\\Riot Games\\League of Legends`,
    localeFrom: /for \/F "delims=" %%a in \('find " {8}locale: " LeagueClientSettings\.yaml'\) do set "locale=%%a"/g,
    localeTo: 'SET locale=        locale: "ko_KR"'
  }
}
