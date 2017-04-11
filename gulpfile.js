const gulp = require('gulp');
const spawn = require('child_process').spawn;
let node;

function server() {
    if (node) {
        node.kill();
    }

    node = spawn('node', ['src/server.js'], {stdio: 'inherit'});
    node.on('close', function (code) {
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
    });
}

gulp.task('server', function() {
    server();
});

gulp.task('watch', ['server'], function() {
    gulp.watch(['./src/**/*.js'], function() {
        console.log('Change Detected. Restarting .......')
        server();
    });
});

gulp.task('default', ['watch']);

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) {
        node.kill();
    }
});