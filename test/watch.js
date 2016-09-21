const chokidar = require('chokidar');

// One-liner for current directory, ignores .dotfiles
chokidar.watch('/Users/auth/Downloads/**', {ignored: /[\/\\]\./, alwaysStat: true}).on('all', (event, path, stat) => {
  console.log(event, path, stat);
});