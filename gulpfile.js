'use strict';

var ACTIVE_APP_NAME = "stockaide"

var gulp = require('gulp');
var browserSync = require('browser-sync').create();

gulp.task('default', function () {
	browserSync.init({
        server: {
            baseDir: "./"+ACTIVE_APP_NAME
        }
    });
    gulp.watch([ACTIVE_APP_NAME+'/**'], ['sync']);
});

gulp.task('sync', function() {
    browserSync.reload();
});