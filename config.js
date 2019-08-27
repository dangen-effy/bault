module.exports = {
  faker: 'https://www.op.gg/summoner/userName=Hide+on+bush',
  replacer: {
    radsFrom: /set RADS_PATH="C:\\Riot Games\\League of Legends"/g,
    radsTo: `SET RADS_PATH=C:\\Riot Games\\League of Legends`,
    localeFrom: /for \/F "delims=" %%a in \('find " {8}locale: " LeagueClientSettings\.yaml'\) do set "locale=%%a"/g,
    localeTo: 'SET locale=        locale: "ko_KR"'
  }
}
